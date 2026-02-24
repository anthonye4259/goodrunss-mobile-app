/**
 * Stripe Connect Payments & Wallet Management
 *
 * Routes payments through business Connect accounts with 2.5% platform fee.
 * Manages Stripe Customers for wallet (saved payment methods).
 *
 * Client flow:
 *   1. Client taps Pay in any bizapp
 *   2. App calls createConnectPaymentIntent
 *   3. PaymentSheet opens with saved cards + Apple Pay
 *   4. Money flows: Client → Stripe → Business (minus 2.5% to Alaii)
 */

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import Stripe from "stripe"

const config = functions.config()
const stripe = config.stripe?.secret_key
    ? new Stripe(config.stripe.secret_key, { apiVersion: "2023-10-16" })
    : null

const db = admin.firestore()

// Platform fee: 2.5%
const PLATFORM_FEE_PERCENT = 0.025

// ==================== HELPERS ====================

/**
 * Get or create a Stripe Customer for a user.
 * Stores the mapping in Firestore `stripe_customers/{userId}`.
 */
async function getOrCreateStripeCustomer(
    userId: string,
    email?: string,
    name?: string
): Promise<string> {
    if (!stripe) throw new Error("Stripe not configured")

    // Check if customer already exists
    const customerDoc = await db.collection("stripe_customers").doc(userId).get()
    if (customerDoc.exists) {
        const customerId = customerDoc.data()?.stripeCustomerId
        if (customerId) return customerId
    }

    // Create new Stripe Customer
    const customer = await stripe.customers.create({
        email: email || undefined,
        name: name || undefined,
        metadata: { firebaseUserId: userId },
    })

    // Save mapping
    await db.collection("stripe_customers").doc(userId).set({
        stripeCustomerId: customer.id,
        email: email || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return customer.id
}

/**
 * Look up the business's Connected Account ID from Firestore.
 */
async function getBusinessConnectAccountId(studioId: string): Promise<string | null> {
    // Check imprint_stripe_connect collection first
    const connectDoc = await db.collection("imprint_stripe_connect").doc(studioId).get()
    if (connectDoc.exists) {
        const data = connectDoc.data()
        if (data?.stripeAccountId && data?.chargesEnabled) {
            return data.stripeAccountId
        }
    }

    // Fallback: check studio document for stripeConnected field
    const studioDoc = await db.collection("imprint_studios").doc(studioId).get()
    if (studioDoc.exists) {
        const data = studioDoc.data()
        if (data?.stripeAccountId) {
            return data.stripeAccountId
        }
    }

    return null
}

// ==================== CONNECT PAYMENT INTENT ====================

/**
 * Create a PaymentIntent routed through a business's Stripe Connect account.
 *
 * Money flow:
 *   Client pays $100 → Stripe takes ~2.9% + $0.30 → Alaii gets 2.5% ($2.50)
 *   → Business receives the rest (~$94.60)
 *
 * Returns clientSecret, ephemeralKey, customerId for PaymentSheet.
 */
export const createConnectPaymentIntent = functions.https.onCall(
    async (data, context) => {
        if (!stripe) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Stripe is not configured"
            )
        }

        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "Please sign in to make a payment"
            )
        }

        const {
            studioId,
            amount,         // in cents
            currency = "usd",
            itemName,       // e.g. "Haircut", "Rent - Unit 4B", "Yoga Class"
            itemType,       // "service" | "rent" | "class" | "package"
            itemId,         // optional: classId, leaseId, etc.
        } = data

        if (!studioId || !amount) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "studioId and amount are required"
            )
        }

        if (amount < 50) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Minimum payment amount is $0.50"
            )
        }

        try {
            const userId = context.auth.uid

            // 1. Get user info for customer creation
            const userDoc = await db.collection("users").doc(userId).get()
            const userData = userDoc.data()

            // 2. Get or create Stripe Customer
            const customerId = await getOrCreateStripeCustomer(
                userId,
                userData?.email || context.auth.token.email,
                userData?.displayName || context.auth.token.name
            )

            // 3. Get business's Connected Account
            const connectedAccountId = await getBusinessConnectAccountId(studioId)

            // 4. Create ephemeral key for PaymentSheet
            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: customerId },
                { apiVersion: "2023-10-16" }
            )

            // 5. Calculate platform fee (2.5%)
            const applicationFee = Math.round(amount * PLATFORM_FEE_PERCENT)

            // 6. Build PaymentIntent params
            const intentParams: Stripe.PaymentIntentCreateParams = {
                amount: Math.round(amount),
                currency,
                customer: customerId,
                automatic_payment_methods: { enabled: true },
                metadata: {
                    userId,
                    studioId,
                    itemName: itemName || "Payment",
                    itemType: itemType || "payment",
                    itemId: itemId || "",
                    platform: "alaii",
                },
            }

            // If business has Connect account, route payment to them
            if (connectedAccountId) {
                intentParams.application_fee_amount = applicationFee
                intentParams.transfer_data = {
                    destination: connectedAccountId,
                }
            }

            // 7. Create PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create(intentParams)

            functions.logger.info(
                `Connect PaymentIntent created: ${paymentIntent.id}`,
                {
                    userId,
                    studioId,
                    amount,
                    connectedAccountId: connectedAccountId || "platform-direct",
                    applicationFee,
                }
            )

            // 8. Record the payment intent in Firestore for tracking
            await db.collection("alaii_payments").add({
                paymentIntentId: paymentIntent.id,
                userId,
                studioId,
                amount,
                applicationFee,
                connectedAccountId: connectedAccountId || null,
                itemName: itemName || "Payment",
                itemType: itemType || "payment",
                itemId: itemId || null,
                status: "pending",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            return {
                clientSecret: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customerId,
                paymentIntentId: paymentIntent.id,
            }
        } catch (error: any) {
            functions.logger.error("Connect payment intent error:", error)
            throw new functions.https.HttpsError(
                "internal",
                error.message || "Failed to create payment"
            )
        }
    }
)

// ==================== WALLET: SAVED PAYMENT METHODS ====================

/**
 * Get saved payment methods for a user's wallet.
 */
export const getWalletPaymentMethods = functions.https.onCall(
    async (_data, context) => {
        if (!stripe) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe not configured")
        }
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Sign in required")
        }

        try {
            const userId = context.auth.uid
            const customerDoc = await db.collection("stripe_customers").doc(userId).get()

            if (!customerDoc.exists) {
                return { paymentMethods: [], customerId: null }
            }

            const customerId = customerDoc.data()?.stripeCustomerId
            if (!customerId) {
                return { paymentMethods: [], customerId: null }
            }

            const methods = await stripe.paymentMethods.list({
                customer: customerId,
                type: "card",
            })

            // Get default payment method
            const customer = await stripe.customers.retrieve(customerId)
            const defaultPmId = (customer as Stripe.Customer).invoice_settings
                ?.default_payment_method

            const paymentMethods = methods.data.map((pm) => ({
                id: pm.id,
                type: pm.card?.brand || "card",
                last4: pm.card?.last4 || "****",
                expMonth: pm.card?.exp_month,
                expYear: pm.card?.exp_year,
                isDefault: pm.id === defaultPmId,
            }))

            return { paymentMethods, customerId }
        } catch (error: any) {
            functions.logger.error("Get wallet methods error:", error)
            throw new functions.https.HttpsError("internal", error.message)
        }
    }
)

/**
 * Create a SetupIntent for adding a new card to the wallet.
 * Returns clientSecret for Stripe PaymentSheet setup mode.
 */
export const createWalletSetupIntent = functions.https.onCall(
    async (_data, context) => {
        if (!stripe) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe not configured")
        }
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Sign in required")
        }

        try {
            const userId = context.auth.uid
            const userDoc = await db.collection("users").doc(userId).get()
            const userData = userDoc.data()

            const customerId = await getOrCreateStripeCustomer(
                userId,
                userData?.email || context.auth.token.email,
                userData?.displayName || context.auth.token.name
            )

            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: customerId },
                { apiVersion: "2023-10-16" }
            )

            const setupIntent = await stripe.setupIntents.create({
                customer: customerId,
                automatic_payment_methods: { enabled: true },
            })

            return {
                clientSecret: setupIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customerId,
            }
        } catch (error: any) {
            functions.logger.error("Setup intent error:", error)
            throw new functions.https.HttpsError("internal", error.message)
        }
    }
)

/**
 * Remove a saved payment method from the wallet.
 */
export const removeWalletPaymentMethod = functions.https.onCall(
    async (data, context) => {
        if (!stripe) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe not configured")
        }
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Sign in required")
        }

        const { paymentMethodId } = data
        if (!paymentMethodId) {
            throw new functions.https.HttpsError("invalid-argument", "paymentMethodId required")
        }

        try {
            // Verify the payment method belongs to this user
            const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
            const userId = context.auth.uid
            const customerDoc = await db.collection("stripe_customers").doc(userId).get()
            const customerId = customerDoc.data()?.stripeCustomerId

            if (pm.customer !== customerId) {
                throw new functions.https.HttpsError(
                    "permission-denied",
                    "This payment method doesn't belong to you"
                )
            }

            await stripe.paymentMethods.detach(paymentMethodId)
            return { success: true }
        } catch (error: any) {
            functions.logger.error("Remove payment method error:", error)
            throw new functions.https.HttpsError("internal", error.message)
        }
    }
)

/**
 * Set a default payment method for the wallet.
 */
export const setWalletDefaultPaymentMethod = functions.https.onCall(
    async (data, context) => {
        if (!stripe) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe not configured")
        }
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Sign in required")
        }

        const { paymentMethodId } = data
        if (!paymentMethodId) {
            throw new functions.https.HttpsError("invalid-argument", "paymentMethodId required")
        }

        try {
            const userId = context.auth.uid
            const customerDoc = await db.collection("stripe_customers").doc(userId).get()
            const customerId = customerDoc.data()?.stripeCustomerId

            if (!customerId) {
                throw new functions.https.HttpsError("not-found", "No wallet found")
            }

            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            })

            return { success: true }
        } catch (error: any) {
            functions.logger.error("Set default method error:", error)
            throw new functions.https.HttpsError("internal", error.message)
        }
    }
)
