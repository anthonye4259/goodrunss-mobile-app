import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import Stripe from "stripe"

const config = functions.config()
const stripe = config.stripe?.secret_key ? new Stripe(config.stripe.secret_key, { apiVersion: "2023-10-16" }) : null

// Price ID for Alaii Growth subscription
const GROWTH_PRICE_ID = "price_1TFfyQ06I3eFkRUmtYNsD29o"

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

        const { successUrl, cancelUrl } = data
        const userId = context.auth.uid

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

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: GROWTH_PRICE_ID, quantity: 1 }],
            mode: "subscription",
            payment_method_types: ["card"],
            metadata: { firebaseUserId: userId },
            subscription_data: {
                metadata: { firebaseUserId: userId },
            },
            success_url: successUrl || "https://alaii.app/subscription/success",
            cancel_url: cancelUrl || "https://alaii.app/subscription/canceled",
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

    const db = admin.firestore()
    const subRef = db.collection("subscriptions").doc(userId)

    // Check if this is a NEW activation (not a renewal/update)
    const existingSub = await subRef.get()
    const wasAlreadyActive = existingSub.exists && existingSub.data()?.status === "active"

    await subRef.set({
        stripeSubscriptionId: subscription.id,
        status,
        currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    await sendSubscriptionPush(userId, "Subscription Updated", "Your Alaii Growth subscription has been updated.")

    // === REFERRAL CHECK: Award $5 to BOTH sides on first Alaii Growth activation ===
    if (status === "active" && !wasAlreadyActive) {
        await handleSubscriptionReferralCheck(userId, db)
    }
}

/**
 * Check if a newly subscribed user was referred, and award $5 to both sides.
 * Triggers only on first Alaii Growth subscription activation.
 */
async function handleSubscriptionReferralCheck(userId: string, db: FirebaseFirestore.Firestore) {
    const REWARD_AMOUNT = 500 // $5.00 in cents

    try {
        functions.logger.info(`Checking referral for new subscriber ${userId}`)

        // Search for pending referrals where this user is the friend
        let referralSnap = await db.collectionGroup("referrals")
            .where("friendId", "==", userId)
            .where("status", "==", "pending")
            .limit(1)
            .get()

        if (referralSnap.empty) {
            functions.logger.info(`No pending referral found for subscriber ${userId}`)
            return
        }

        const referralDoc = referralSnap.docs[0]
        const referralData = referralDoc.data()
        const referrerId = referralDoc.ref.parent.parent?.id
        const studioId = referralData.studioId || "platform"

        if (!referrerId) {
            functions.logger.warn("Could not determine referrer ID from referral doc path")
            return
        }

        functions.logger.info(
            `Completing referral: ${referrerId} referred ${userId}. Awarding $5 to BOTH.`
        )

        // 1. Mark referral as completed
        await referralDoc.ref.update({
            status: "completed",
            reward: REWARD_AMOUNT,
            rewardType: "cash_credit",
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            completedBy: "alaii_growth_subscription",
        })

        // 2. Award $5 credit to REFERRER (Firestore + Stripe)
        const referrerWalletRef = db
            .collection("imprint_users")
            .doc(referrerId)
            .collection("wallet")
            .doc("referral_credits")

        await db.runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(referrerWalletRef)
            const currentCredits = walletDoc.exists ? (walletDoc.data()?.credits || 0) : 0

            transaction.set(referrerWalletRef, {
                credits: currentCredits + REWARD_AMOUNT,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true })
        })

        // Apply $5 as REAL Stripe account credit (auto-applied to next invoice)
        await applyStripeCredit(referrerId, REWARD_AMOUNT, `Referral reward: ${referralData.friendName || "friend"} subscribed`)

        // 3. Award $5 credit to the NEW SUBSCRIBER (Firestore + Stripe)
        const friendWalletRef = db
            .collection("imprint_users")
            .doc(userId)
            .collection("wallet")
            .doc("referral_credits")

        await db.runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(friendWalletRef)
            const currentCredits = walletDoc.exists ? (walletDoc.data()?.credits || 0) : 0

            transaction.set(friendWalletRef, {
                credits: currentCredits + REWARD_AMOUNT,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true })
        })

        await applyStripeCredit(userId, REWARD_AMOUNT, "Welcome referral bonus")

        // 4. Increment referralCount on the studio document
        if (studioId !== "platform") {
            await db.collection("imprint_studios").doc(studioId).update({
                referralCount: admin.firestore.FieldValue.increment(1),
            }).catch((err) => functions.logger.warn("Failed to increment referralCount:", err))
        }

        // 5. Send push notification to referrer
        const referrerUserDoc = await db.collection("users").doc(referrerId).get()
        const pushToken = referrerUserDoc.data()?.pushToken

        if (pushToken) {
            const friendName = referralData.friendName || "Someone you referred"
            // Use Expo push (same as booking notifications)
            try {
                const fetch = require("node-fetch")
                await fetch("https://exp.host/--/api/v2/push/send", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: pushToken,
                        title: "💰 $5 Referral Reward!",
                        body: `${friendName} just subscribed to Alaii Growth! You both earned $5. • via Alaii`,
                        data: { type: "referral_completed" },
                        sound: "default",
                    }),
                })
            } catch (pushErr) {
                functions.logger.warn("Failed to send referral push:", pushErr)
            }
        }

        // 6. Store in-app notifications for BOTH users
        const notifPayload = {
            type: "referral_completed",
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        await db.collection("users").doc(referrerId).collection("notifications").add({
            ...notifPayload,
            title: "💰 $5 Referral Reward!",
            body: `${referralData.friendName || "Your referral"} subscribed to Alaii Growth. You both earned $5!`,
        })

        await db.collection("users").doc(userId).collection("notifications").add({
            ...notifPayload,
            title: "🎉 Welcome Bonus!",
            body: `You earned $5 for joining Alaii Growth through a referral!`,
        })

        functions.logger.info(`Referral completed: $5 awarded to both ${referrerId} and ${userId}`)

    } catch (error) {
        functions.logger.error(`Error in subscription referral check for ${userId}:`, error)
    }
}

export async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.firebaseUserId
    if (!userId) return

    await admin.firestore().collection("subscriptions").doc(userId).update({
        status: "canceled",
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    await sendSubscriptionPush(userId, "Subscription Canceled", "Your Alaii Growth subscription has been canceled.")
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

/**
 * Apply a real Stripe account credit to a user's subscription.
 * Uses Stripe Customer Balance Transactions — the credit automatically
 * reduces the amount charged on their next invoice.
 *
 * @param userId Firebase user ID
 * @param amountCents Amount in cents (e.g. 500 = $5.00)
 * @param description Human-readable reason for the credit
 */
async function applyStripeCredit(userId: string, amountCents: number, description: string) {
    if (!stripe) {
        functions.logger.warn("Stripe not configured, skipping credit")
        return
    }

    try {
        // Look up Stripe customer ID from subscriptions collection
        const subDoc = await admin.firestore().collection("subscriptions").doc(userId).get()
        let stripeCustomerId = subDoc.data()?.stripeCustomerId

        // Fallback: check users collection
        if (!stripeCustomerId) {
            const userDoc = await admin.firestore().collection("users").doc(userId).get()
            stripeCustomerId = userDoc.data()?.stripeCustomerId
        }

        // Fallback: check stripe_customers collection
        if (!stripeCustomerId) {
            const custDoc = await admin.firestore().collection("stripe_customers").doc(userId).get()
            stripeCustomerId = custDoc.data()?.stripeCustomerId
        }

        if (!stripeCustomerId) {
            functions.logger.info(`No Stripe customer found for ${userId}, credit stored in Firestore only`)
            return
        }

        // Apply negative balance = credit on next invoice
        // Stripe convention: negative amount = credit to customer
        await stripe.customers.createBalanceTransaction(stripeCustomerId, {
            amount: -amountCents,
            currency: "usd",
            description,
        })

        functions.logger.info(`Applied -$${(amountCents / 100).toFixed(2)} Stripe credit to ${stripeCustomerId} (${userId})`)
    } catch (error) {
        functions.logger.error(`Failed to apply Stripe credit for ${userId}:`, error)
        // Non-fatal — Firestore wallet credit is still recorded
    }
}
