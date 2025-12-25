import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import Stripe from "stripe"

const config = functions.config()
const stripe = config.stripe?.secret_key ? new Stripe(config.stripe.secret_key, { apiVersion: "2023-10-16" }) : null

// Price IDs for Pro Dashboard subscription
const SUBSCRIPTION_PRICES = {
    monthly: "price_1Sbzhb06I3eFkRUmi5i8z4V8",
    "3months": "price_1SSrP106I3eFkRUm9qZHlG8K",
    "6months": "price_1SSrQ706I3eFkRUmALT3M9tM",
}

/**
 * Create Subscription Checkout Session
 */
export const createSubscriptionCheckout = functions.https.onCall(async (data, context) => {
    try {
        if (!stripe) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe is not configured")
        }

        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
        }

        const { period, successUrl, cancelUrl } = data
        const userId = context.auth.uid

        if (!period || !["monthly", "3months", "6months"].includes(period)) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid subscription period")
        }

        const userDoc = await admin.firestore().collection("users").doc(userId).get()
        const userData = userDoc.data()
        let customerId = userData?.stripeCustomerId

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userData?.email || context.auth.token.email,
                metadata: { firebaseUserId: userId },
            })
            customerId = customer.id
            await admin.firestore().collection("users").doc(userId).update({ stripeCustomerId: customerId })
        }

        const priceId = SUBSCRIPTION_PRICES[period as keyof typeof SUBSCRIPTION_PRICES]

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            payment_method_types: ["card"],
            metadata: { firebaseUserId: userId, period },
            subscription_data: {
                trial_period_days: 7,
                metadata: { firebaseUserId: userId },
            },
            success_url: successUrl || "https://dashboard.goodrunss.com/subscription/success",
            cancel_url: cancelUrl || "https://dashboard.goodrunss.com/subscription/canceled",
        })

        return { url: session.url }
    } catch (error: any) {
        functions.logger.error("Error creating subscription checkout", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Create Customer Portal Session
 */
export const createCustomerPortal = functions.https.onCall(async (data, context) => {
    try {
        if (!stripe) return { error: "Stripe not configured" }
        if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required")

        const userId = context.auth.uid
        const userDoc = await admin.firestore().collection("users").doc(userId).get()
        const customerId = userDoc.data()?.stripeCustomerId

        if (!customerId) throw new functions.https.HttpsError("failed-precondition", "No subscription found")

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: data.returnUrl || "https://dashboard.goodrunss.com",
        })

        return { url: session.url }
    } catch (error: any) {
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Get Subscription Status
 */
export const getSubscriptionStatus = functions.https.onCall(async (_, context) => {
    try {
        if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required")

        const userId = context.auth.uid
        const subDoc = await admin.firestore().collection("subscriptions").doc(userId).get()
        const subscription = subDoc.data()

        return {
            isPro: subscription?.status === "active" || subscription?.status === "trialing",
            tier: subscription?.tier || "free",
            status: subscription?.status || "inactive",
            period: subscription?.period,
            expiresAt: subscription?.currentPeriodEnd?.toDate().toISOString(),
        }
    } catch (error: any) {
        throw new functions.https.HttpsError("internal", error.message)
    }
})

// ============================================
// WEBHOOK HANDLERS (Exported for payments.ts)
// ============================================

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.firebaseUserId
    if (!userId) return

    const status = subscription.status === "active" || subscription.status === "trialing"
        ? "active"
        : subscription.status === "canceled"
            ? "canceled"
            : "past_due"

    await admin.firestore().collection("subscriptions").doc(userId).set({
        stripeSubscriptionId: subscription.id,
        status,
        currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    await sendSubscriptionPush(userId, "Subscription Updated", "Your Pro subscription has been updated.")
}

export async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.firebaseUserId
    if (!userId) return

    await admin.firestore().collection("subscriptions").doc(userId).update({
        status: "canceled",
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    await sendSubscriptionPush(userId, "Subscription Canceled", "Your Pro subscription has been canceled.")
}

export async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
    const userId = invoice.subscription_details?.metadata?.firebaseUserId
    if (!userId) return

    await admin.firestore().collection("subscriptions").doc(userId).update({
        status: "past_due",
        lastPaymentError: "Payment failed",
    })

    await sendSubscriptionPush(userId, "Payment Failed", "We couldn't process your subscription payment.")
}

async function sendSubscriptionPush(userId: string, title: string, body: string) {
    try {
        const userDoc = await admin.firestore().collection("users").doc(userId).get()
        const token = userDoc.data()?.pushToken
        if (!token) return

        await admin.messaging().send({
            token,
            notification: { title, body },
            data: { type: "subscription" },
        })
    } catch (error) {
        functions.logger.error("Error sending subscription push", error)
    }
}
