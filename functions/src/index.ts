import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import Stripe from "stripe"
import { Resend } from "resend"

// Initialize Firebase Admin
admin.initializeApp()

// Get config safely
const config = functions.config()

// Initialize Stripe
const stripeKey = config.stripe?.secret_key || process.env.STRIPE_SECRET_KEY || ""
const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
}) : null

// Initialize Resend
const resendApiKey = config.resend?.api_key || process.env.RESEND_API_KEY || ""
const resend = resendApiKey ? new Resend(resendApiKey) : null

/**
 * Create Payment Intent for Trainer Booking
 * 
 * POST /createPaymentIntent
 * Body: {
 *   amount: number (in dollars),
 *   currency: string,
 *   trainerId: string,
 *   userId: string,
 *   bookingId: string,
 *   duration: number
 * }
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        // Verify Stripe is configured
        if (!stripe) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Stripe is not configured. Please set stripe.secret_key in Firebase config."
            )
        }

        // Verify user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User must be authenticated to create payment intent"
            )
        }

        const {
            amount,
            currency = "usd",
            trainerId,
            userId,
            bookingId,
            duration,
        } = data

        // Validate required fields
        if (!amount || !trainerId || !userId || !bookingId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing required fields: amount, trainerId, userId, bookingId"
            )
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                trainerId,
                userId,
                bookingId,
                duration: duration?.toString() || "60",
                type: "trainer_booking",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        })

        functions.logger.info("Payment intent created", {
            paymentIntentId: paymentIntent.id,
            bookingId,
            amount,
        })

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        }
    } catch (error: any) {
        functions.logger.error("Error creating payment intent", error)
        throw new functions.https.HttpsError(
            "internal",
            error.message || "Failed to create payment intent"
        )
    }
})

/**
 * Stripe Webhook Handler
 * Handles payment success, failure, subscription events
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    if (!stripe) {
        res.status(500).send("Stripe not configured")
        return
    }

    const sig = req.headers["stripe-signature"] as string
    const webhookSecret = config.stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || ""

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret)
    } catch (err: any) {
        functions.logger.error("Webhook signature verification failed", err)
        res.status(400).send(`Webhook Error: ${err.message}`)
        return
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            await handlePaymentSuccess(paymentIntent)
            break
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            await handlePaymentFailure(paymentIntent)
            break
        }
        // Subscription events
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session
            if (session.mode === "subscription") {
                await handleSubscriptionCheckoutCompleted(session)
            }
            break
        }
        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription
            await handleSubscriptionUpdated(subscription)
            break
        }
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription
            await handleSubscriptionCanceled(subscription)
            break
        }
        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice
            await handleSubscriptionPaymentFailed(invoice)
            break
        }
        default:
            functions.logger.info(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
})

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId, userId, trainerId } = paymentIntent.metadata

    try {
        // Update booking status in Firestore
        await admin.firestore().collection("bookings").doc(bookingId).update({
            status: "confirmed",
            paymentStatus: "paid",
            paymentIntentId: paymentIntent.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        // Get booking details
        const bookingDoc = await admin.firestore().collection("bookings").doc(bookingId).get()
        const booking = bookingDoc.data()

        if (!booking) {
            throw new Error("Booking not found")
        }

        // Send confirmation email
        await sendBookingConfirmationEmail(booking, userId, trainerId)

        // Send push notification
        await sendBookingConfirmationPush(booking, userId)

        functions.logger.info("Payment success handled", { bookingId, paymentIntentId: paymentIntent.id })
    } catch (error) {
        functions.logger.error("Error handling payment success", error)
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId } = paymentIntent.metadata

    try {
        await admin.firestore().collection("bookings").doc(bookingId).update({
            status: "payment_failed",
            paymentStatus: "failed",
            paymentIntentId: paymentIntent.id,
        })

        functions.logger.info("Payment failure handled", { bookingId })
    } catch (error) {
        functions.logger.error("Error handling payment failure", error)
    }
}

async function sendBookingConfirmationEmail(
    booking: any,
    userId: string,
    trainerId: string
) {
    if (!resend) {
        functions.logger.warn("Resend not configured, skipping email")
        return
    }

    try {
        // Get user and trainer details
        const userDoc = await admin.firestore().collection("users").doc(userId).get()
        const trainerDoc = await admin.firestore().collection("trainers").doc(trainerId).get()

        const user = userDoc.data()
        const trainer = trainerDoc.data()

        if (!user?.email) {
            functions.logger.warn("User email not found", { userId })
            return
        }

        // Generate calendar invite (.ics file)
        const calendarInvite = generateCalendarInvite(booking, trainer)

        // Send email with Resend
        await resend.emails.send({
            from: "GoodRunss <bookings@goodrunss.com>",
            to: user.email,
            subject: `Booking Confirmed: ${trainer?.name || "Trainer"} - ${booking.date}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7ED957;">Booking Confirmed! 🎉</h1>
          
          <p>Hi ${user.displayName || "there"},</p>
          
          <p>Your training session has been confirmed!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Booking Details</h2>
            <p><strong>Trainer:</strong> ${trainer?.name || "N/A"}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Duration:</strong> ${booking.duration || 60} minutes</p>
            <p><strong>Location:</strong> ${booking.location || "TBD"}</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
          </div>
          
          <p>A calendar invite has been attached to this email.</p>
          
          <p>See you there!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Questions? Reply to this email or contact us at support@goodrunss.com
          </p>
        </div>
      `,
            attachments: [
                {
                    filename: "booking.ics",
                    content: Buffer.from(calendarInvite).toString("base64"),
                },
            ],
        })

        functions.logger.info("Confirmation email sent", { userId, bookingId: booking.id })
    } catch (error) {
        functions.logger.error("Error sending confirmation email", error)
    }
}

/**
 * Generate iCalendar (.ics) file for booking
 */
function generateCalendarInvite(booking: any, trainer: any): string {
    const startDate = new Date(`${booking.date} ${booking.time}`)
    const endDate = new Date(startDate.getTime() + (booking.duration || 60) * 60000)

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GoodRunss//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@goodrunss.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Training Session with ${trainer?.name || "Trainer"}
DESCRIPTION:Your training session with ${trainer?.name || "Trainer"}${booking.notes ? `\\n\\nNotes: ${booking.notes}` : ""}
LOCATION:${booking.location || "TBD"}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Training session starts in 15 minutes
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`
}

/**
 * Send Push Notification for Booking Confirmation
 */
async function sendBookingConfirmationPush(booking: any, userId: string) {
    try {
        // Get user's FCM tokens
        const tokensSnapshot = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("deviceTokens")
            .get()

        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token).filter(Boolean)

        if (tokens.length === 0) {
            functions.logger.info("No FCM tokens found for user", { userId })
            return
        }

        // Send notification to all user devices
        const message = {
            notification: {
                title: "Booking Confirmed! 🎉",
                body: `Your training session on ${booking.date} at ${booking.time} is confirmed.`,
            },
            data: {
                type: "booking_confirmed",
                bookingId: booking.id,
                date: booking.date,
                time: booking.time,
            },
            tokens,
        }

        const response = await admin.messaging().sendEachForMulticast(message)

        functions.logger.info("Push notifications sent", {
            userId,
            successCount: response.successCount,
            failureCount: response.failureCount,
        })

        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const batch = admin.firestore().batch()
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const tokenDoc = tokensSnapshot.docs[idx]
                    if (tokenDoc) {
                        batch.delete(tokenDoc.ref)
                    }
                }
            })
            await batch.commit()
        }
    } catch (error) {
        functions.logger.error("Error sending push notification", error)
    }
}

/**
 * Send Push Notification (Callable Function)
 * Allows sending custom push notifications from the app
 */
export const sendPushNotification = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
        }

        const { userId, title, body, data: notificationData } = data

        if (!userId || !title || !body) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing required fields: userId, title, body"
            )
        }

        // Get user's FCM tokens
        const tokensSnapshot = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("deviceTokens")
            .get()

        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token).filter(Boolean)

        if (tokens.length === 0) {
            return { success: false, message: "No device tokens found" }
        }

        // Send notification
        const message = {
            notification: { title, body },
            data: notificationData || {},
            tokens,
        }

        const response = await admin.messaging().sendEachForMulticast(message)

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        }
    } catch (error: any) {
        functions.logger.error("Error sending push notification", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Register FCM Token
 * Stores user's device token for push notifications
 */
export const registerFCMToken = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
        }

        const { token, deviceId } = data

        if (!token) {
            throw new functions.https.HttpsError("invalid-argument", "Token is required")
        }

        const userId = context.auth.uid

        // Store token in Firestore
        await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("deviceTokens")
            .doc(deviceId || token)
            .set({
                token,
                deviceId: deviceId || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            })

        functions.logger.info("FCM token registered", { userId, deviceId })

        return { success: true }
    } catch (error: any) {
        functions.logger.error("Error registering FCM token", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

// ============================================
// PRO SUBSCRIPTION FUNCTIONS
// ============================================

// Price IDs for Pro Dashboard subscription
// UPDATE THESE with your actual Stripe price IDs
const SUBSCRIPTION_PRICES = {
    monthly: "price_1Sbzhb06I3eFkRUmi5i8z4V8",
    "3months": "price_1SSrP106I3eFkRUm9qZHlG8K",
    "6months": "price_1SSrQ706I3eFkRUmALT3M9tM",
}

/**
 * Create Subscription Checkout Session
 * Creates a Stripe Checkout session for Pro Dashboard subscription
 */
export const createSubscriptionCheckout = functions.https.onCall(async (data, context) => {
    try {
        if (!stripe) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Stripe is not configured"
            )
        }

        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User must be authenticated"
            )
        }

        const { period, successUrl, cancelUrl } = data
        const userId = context.auth.uid

        // Validate period
        if (!period || !["monthly", "3months", "6months"].includes(period)) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Invalid subscription period"
            )
        }

        // Get or create Stripe customer
        const userDoc = await admin.firestore().collection("users").doc(userId).get()
        const userData = userDoc.data()

        let customerId = userData?.stripeCustomerId

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: userData?.email || context.auth.token.email,
                metadata: { firebaseUserId: userId },
            })
            customerId = customer.id

            // Save customer ID to user doc
            await admin.firestore().collection("users").doc(userId).update({
                stripeCustomerId: customerId,
            })
        }

        // Get price ID for the selected period
        const priceId = SUBSCRIPTION_PRICES[period as keyof typeof SUBSCRIPTION_PRICES]

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 7, // 7-day free trial
                metadata: {
                    firebaseUserId: userId,
                    period,
                },
            },
            success_url: successUrl || "https://dashboard.goodrunss.com/subscription/success",
            cancel_url: cancelUrl || "https://dashboard.goodrunss.com/subscription/canceled",
            metadata: {
                firebaseUserId: userId,
                period,
            },
        })

        functions.logger.info("Subscription checkout created", {
            userId,
            sessionId: session.id,
            period
        })

        return {
            sessionId: session.id,
            url: session.url,
        }
    } catch (error: any) {
        functions.logger.error("Error creating subscription checkout", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Handle Subscription Checkout Completed
 * Called when a user completes the subscription checkout
 */
async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.firebaseUserId
    const period = session.metadata?.period as "monthly" | "3months" | "6months"

    if (!userId) {
        functions.logger.error("No userId in session metadata")
        return
    }

    try {
        // Calculate end date based on period
        const startDate = new Date()
        const endDate = new Date()

        switch (period) {
            case "monthly":
                endDate.setMonth(endDate.getMonth() + 1)
                break
            case "3months":
                endDate.setMonth(endDate.getMonth() + 3)
                break
            case "6months":
                endDate.setMonth(endDate.getMonth() + 6)
                break
            default:
                endDate.setMonth(endDate.getMonth() + 1)
        }

        // Update subscription doc in Firestore
        await admin.firestore().collection("subscriptions").doc(userId).set({
            tier: "pro",
            status: "active",
            period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        // Also update user doc
        await admin.firestore().collection("users").doc(userId).update({
            isPro: true,
            subscriptionStatus: "active",
        })

        // Send welcome notification
        await sendSubscriptionPushNotification(userId, "🎉 Welcome to Pro!", "All premium features are now unlocked!")

        functions.logger.info("Subscription activated", { userId, period })
    } catch (error) {
        functions.logger.error("Error handling subscription checkout", error)
    }
}

/**
 * Handle Subscription Updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.firebaseUserId

    if (!userId) {
        functions.logger.error("No userId in subscription metadata")
        return
    }

    try {
        const status = subscription.status === "active" || subscription.status === "trialing"
            ? "active"
            : subscription.status === "canceled"
                ? "canceled"
                : "expired"

        await admin.firestore().collection("subscriptions").doc(userId).update({
            status,
            stripeSubscriptionId: subscription.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        await admin.firestore().collection("users").doc(userId).update({
            isPro: status === "active",
            subscriptionStatus: status,
        })

        functions.logger.info("Subscription updated", { userId, status })
    } catch (error) {
        functions.logger.error("Error handling subscription update", error)
    }
}

/**
 * Handle Subscription Canceled
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.firebaseUserId

    if (!userId) {
        functions.logger.error("No userId in subscription metadata")
        return
    }

    try {
        await admin.firestore().collection("subscriptions").doc(userId).update({
            tier: "free",
            status: "canceled",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        await admin.firestore().collection("users").doc(userId).update({
            isPro: false,
            subscriptionStatus: "canceled",
        })

        await sendSubscriptionPushNotification(
            userId,
            "Subscription Canceled",
            "Your Pro subscription has been canceled. You can resubscribe anytime!"
        )

        functions.logger.info("Subscription canceled", { userId })
    } catch (error) {
        functions.logger.error("Error handling subscription cancellation", error)
    }
}

/**
 * Handle Subscription Payment Failed
 */
async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string

    try {
        // Find user by customer ID
        const usersSnapshot = await admin.firestore()
            .collection("users")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get()

        if (usersSnapshot.empty) {
            functions.logger.error("User not found for customer", { customerId })
            return
        }

        const userId = usersSnapshot.docs[0].id

        await admin.firestore().collection("subscriptions").doc(userId).update({
            status: "payment_failed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        await sendSubscriptionPushNotification(
            userId,
            "Payment Failed",
            "We couldn't process your subscription payment. Please update your payment method."
        )

        functions.logger.info("Subscription payment failed", { userId })
    } catch (error) {
        functions.logger.error("Error handling subscription payment failure", error)
    }
}

/**
 * Helper: Send subscription-related push notification
 */
async function sendSubscriptionPushNotification(userId: string, title: string, body: string) {
    try {
        const tokensSnapshot = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("deviceTokens")
            .get()

        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token).filter(Boolean)

        if (tokens.length === 0) return

        await admin.messaging().sendEachForMulticast({
            notification: { title, body },
            data: { type: "subscription" },
            tokens,
        })
    } catch (error) {
        functions.logger.error("Error sending subscription push", error)
    }
}

/**
 * Get Subscription Status
 * Returns current subscription status for the user
 */
export const getSubscriptionStatus = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
        }

        const userId = context.auth.uid
        const subDoc = await admin.firestore().collection("subscriptions").doc(userId).get()

        if (!subDoc.exists) {
            return {
                tier: "free",
                status: "active",
                isPro: false,
            }
        }

        const subscription = subDoc.data()

        return {
            tier: subscription?.tier || "free",
            status: subscription?.status || "active",
            period: subscription?.period,
            endDate: subscription?.endDate,
            isPro: subscription?.tier === "pro" && subscription?.status === "active",
        }
    } catch (error: any) {
        functions.logger.error("Error getting subscription status", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Cancel Subscription
 * User-initiated subscription cancellation
 */
export const cancelSubscription = functions.https.onCall(async (data, context) => {
    try {
        if (!stripe) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe not configured")
        }

        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
        }

        const userId = context.auth.uid
        const subDoc = await admin.firestore().collection("subscriptions").doc(userId).get()

        if (!subDoc.exists) {
            throw new functions.https.HttpsError("not-found", "No subscription found")
        }

        const subscription = subDoc.data()

        if (!subscription?.stripeSubscriptionId) {
            throw new functions.https.HttpsError("not-found", "No Stripe subscription found")
        }

        // Cancel at period end (user keeps access until the end of billing period)
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
        })

        await admin.firestore().collection("subscriptions").doc(userId).update({
            cancelAtPeriodEnd: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        functions.logger.info("Subscription set to cancel at period end", { userId })

        return { success: true, message: "Subscription will be canceled at the end of the billing period" }
    } catch (error: any) {
        functions.logger.error("Error canceling subscription", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

// ============================================
// 24/7 TRAFFIC PREDICTION ENGINE
// Runs every 30 minutes, pre-computes predictions for all venues
// Results stored in Firestore - app reads instantly, no calculation needed
// ============================================

// GLOBAL CITY DATABASE - 50+ major cities worldwide with population density
const GLOBAL_CITIES: Record<string, { name: string; density: number; population: number; country: string }> = {
    // USA - Major metros
    "40.7,-74.0": { name: "New York", density: 27016, population: 8400000, country: "US" },
    "34.1,-118.2": { name: "Los Angeles", density: 8092, population: 3900000, country: "US" },
    "41.9,-87.6": { name: "Chicago", density: 11841, population: 2700000, country: "US" },
    "29.8,-95.4": { name: "Houston", density: 3613, population: 2300000, country: "US" },
    "33.4,-112.1": { name: "Phoenix", density: 3120, population: 1680000, country: "US" },
    "39.9,-75.2": { name: "Philadelphia", density: 11379, population: 1580000, country: "US" },
    "37.8,-122.4": { name: "San Francisco", density: 18569, population: 870000, country: "US" },
    "47.6,-122.3": { name: "Seattle", density: 8775, population: 750000, country: "US" },
    "25.8,-80.2": { name: "Miami", density: 12139, population: 470000, country: "US" },
    "42.4,-71.1": { name: "Boston", density: 14165, population: 690000, country: "US" },
    "33.8,-84.4": { name: "Atlanta", density: 3667, population: 500000, country: "US" },
    "32.8,-96.8": { name: "Dallas", density: 3866, population: 1340000, country: "US" },
    "36.2,-115.1": { name: "Las Vegas", density: 4527, population: 640000, country: "US" },
    "39.7,-104.9": { name: "Denver", density: 4520, population: 730000, country: "US" },
    "30.3,-97.7": { name: "Austin", density: 3006, population: 980000, country: "US" },

    // Europe
    "51.5,-0.1": { name: "London", density: 5900, population: 8900000, country: "GB" },
    "48.9,2.3": { name: "Paris", density: 21000, population: 2100000, country: "FR" },
    "52.5,13.4": { name: "Berlin", density: 4200, population: 3600000, country: "DE" },
    "40.4,-3.7": { name: "Madrid", density: 5400, population: 3300000, country: "ES" },
    "41.4,2.2": { name: "Barcelona", density: 16000, population: 1600000, country: "ES" },
    "41.9,12.5": { name: "Rome", density: 2200, population: 2900000, country: "IT" },
    "45.5,9.2": { name: "Milan", density: 7500, population: 1400000, country: "IT" },
    "52.4,4.9": { name: "Amsterdam", density: 5200, population: 870000, country: "NL" },
    "50.8,4.4": { name: "Brussels", density: 7400, population: 180000, country: "BE" },
    "59.3,18.1": { name: "Stockholm", density: 5200, population: 980000, country: "SE" },
    "55.7,12.6": { name: "Copenhagen", density: 7100, population: 630000, country: "DK" },
    "48.2,16.4": { name: "Vienna", density: 4600, population: 1900000, country: "AT" },
    "47.4,8.5": { name: "Zurich", density: 4700, population: 430000, country: "CH" },
    "53.3,-6.3": { name: "Dublin", density: 4600, population: 550000, country: "IE" },
    "55.8,37.6": { name: "Moscow", density: 4900, population: 12500000, country: "RU" },

    // Asia
    "35.7,139.7": { name: "Tokyo", density: 6400, population: 13900000, country: "JP" },
    "37.6,127.0": { name: "Seoul", density: 16000, population: 9700000, country: "KR" },
    "31.2,121.5": { name: "Shanghai", density: 3800, population: 24200000, country: "CN" },
    "39.9,116.4": { name: "Beijing", density: 1300, population: 21500000, country: "CN" },
    "22.3,114.2": { name: "Hong Kong", density: 6800, population: 7500000, country: "HK" },
    "1.3,103.8": { name: "Singapore", density: 8300, population: 5700000, country: "SG" },
    "25.0,121.5": { name: "Taipei", density: 9600, population: 2600000, country: "TW" },
    "13.8,100.5": { name: "Bangkok", density: 5300, population: 10500000, country: "TH" },
    "28.6,77.2": { name: "Delhi", density: 11300, population: 16700000, country: "IN" },
    "19.1,72.9": { name: "Mumbai", density: 20000, population: 12500000, country: "IN" },

    // Middle East
    "25.0,55.3": { name: "Dubai", density: 860, population: 3400000, country: "AE" },
    "31.8,35.2": { name: "Jerusalem", density: 7600, population: 950000, country: "IL" },
    "32.1,34.8": { name: "Tel Aviv", density: 8300, population: 460000, country: "IL" },

    // Oceania
    "-33.9,151.2": { name: "Sydney", density: 2100, population: 5300000, country: "AU" },
    "-37.8,145.0": { name: "Melbourne", density: 1700, population: 5000000, country: "AU" },
    "-36.8,174.8": { name: "Auckland", density: 1400, population: 1660000, country: "NZ" },

    // South America
    "-23.5,-46.6": { name: "São Paulo", density: 7400, population: 12300000, country: "BR" },
    "-22.9,-43.2": { name: "Rio de Janeiro", density: 5400, population: 6700000, country: "BR" },
    "-34.6,-58.4": { name: "Buenos Aires", density: 14500, population: 3100000, country: "AR" },
    "-33.4,-70.6": { name: "Santiago", density: 8800, population: 5600000, country: "CL" },
    "4.7,-74.1": { name: "Bogotá", density: 4500, population: 7900000, country: "CO" },

    // North America (non-US)
    "43.7,-79.4": { name: "Toronto", density: 4300, population: 2900000, country: "CA" },
    "45.5,-73.6": { name: "Montreal", density: 4900, population: 1800000, country: "CA" },
    "49.3,-123.1": { name: "Vancouver", density: 5500, population: 680000, country: "CA" },
    "19.4,-99.1": { name: "Mexico City", density: 6000, population: 21900000, country: "MX" },

    // Africa
    "-33.9,18.4": { name: "Cape Town", density: 1500, population: 4600000, country: "ZA" },
    "-26.2,28.0": { name: "Johannesburg", density: 2900, population: 5800000, country: "ZA" },
    "30.0,31.2": { name: "Cairo", density: 19400, population: 10200000, country: "EG" },
    "-1.3,36.8": { name: "Nairobi", density: 4500, population: 4700000, country: "KE" },
}

// Note: Holiday detection is handled in client-side global-prediction-enhancers.ts
// For now, we use school session which is synchronous

function isSchoolInSession(countryCode: string): boolean {
    const now = new Date()
    const month = now.getMonth()

    // Southern hemisphere countries (Feb-Nov school year)
    const southernCountries = ["AU", "NZ", "AR", "CL", "ZA", "BR"]
    if (southernCountries.includes(countryCode)) {
        return month >= 1 && month <= 10
    }

    // Northern hemisphere (Sept-June)
    if (month >= 8 || month <= 4) return true
    if (month === 5 && now.getDate() <= 15) return true
    return false
}

function getCityKey(lat: number, lon: number): string {
    return `${lat.toFixed(1)},${lon.toFixed(1)}`
}

interface TrafficResult {
    level: "low" | "moderate" | "busy"
    emoji: string
    color: string
    label: string
    waitTime: string | null
    weatherImpact: string | null
    populationImpact: string | null
    geoTrafficImpact: string | null
    updatedAt: admin.firestore.FieldValue
}

function calculateTrafficPrediction(
    venueId: string,
    lat: number,
    lon: number,
    venueType: string,
    currentTime: Date
): TrafficResult {
    const hour = currentTime.getHours()
    const dayOfWeek = currentTime.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let trafficScore = 0
    let weatherImpact: string | null = null
    let populationImpact: string | null = null
    let geoTrafficImpact: string | null = null

    // Time of day scoring
    if (isWeekend) {
        if (hour >= 9 && hour <= 18) trafficScore += 40
        else if (hour >= 7 && hour <= 20) trafficScore += 20
    } else {
        if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) trafficScore += 50
        else if (hour >= 12 && hour <= 14) trafficScore += 30
        else if (hour >= 10 && hour <= 16) trafficScore += 15
    }

    if (isWeekend) trafficScore += 20

    // Population density scoring - NOW GLOBAL!
    const cityKey = getCityKey(lat, lon)
    const cityData = GLOBAL_CITIES[cityKey]
    if (cityData) {
        if (cityData.density > 15000) {
            trafficScore += 25
            populationImpact = `${cityData.name} - Very dense (${Math.round(cityData.population / 1000000)}M pop)`
        } else if (cityData.density > 8000) {
            trafficScore += 20
            populationImpact = `${cityData.name} - Major metro`
        } else if (cityData.density > 4000) {
            trafficScore += 15
            populationImpact = `${cityData.name} - Urban area`
        } else if (cityData.population > 500000) {
            trafficScore += 10
            populationImpact = `${cityData.name}`
        }
    }

    // Road traffic (rush hour)
    if (!isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))) {
        trafficScore -= 10 // Hard to get there
        geoTrafficImpact = "Rush hour traffic"
    }

    // Venue type modifiers
    if (venueType === "pool" && hour >= 11 && hour <= 16) {
        trafficScore += 15 // Pools busy midday
    }
    if (venueType === "indoor_gym" && ((hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 20))) {
        trafficScore += 20 // Gyms busy before/after work
    }

    // School session impact (after-school rush at sports venues)
    const countryCode = cityData?.country || "US"
    if (isSchoolInSession(countryCode) && hour >= 15 && hour <= 18) {
        trafficScore += 10 // After-school rush
    }

    // Add some variance
    trafficScore += Math.floor(Math.random() * 10) - 5
    trafficScore = Math.max(0, Math.min(100, trafficScore))

    // Determine level
    let level: "low" | "moderate" | "busy"
    let emoji: string
    let color: string
    let label: string
    let waitTime: string | null

    if (trafficScore < 35) {
        level = "low"
        emoji = "🟢"
        color = "#7ED957"
        label = "Low Traffic"
        waitTime = null
    } else if (trafficScore < 65) {
        level = "moderate"
        emoji = "🟡"
        color = "#FFA500"
        label = "Moderate Traffic"
        waitTime = "5-10 min wait"
    } else {
        level = "busy"
        emoji = "🔴"
        color = "#FF6B6B"
        label = "Busy"
        waitTime = "15-20 min wait"
    }

    return {
        level,
        emoji,
        color,
        label,
        waitTime,
        weatherImpact,
        populationImpact,
        geoTrafficImpact,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }
}

/**
 * Scheduled function: Runs every 30 minutes
 * Pre-computes traffic predictions for all venues
 */
export const updateVenueTraffic = functions.pubsub
    .schedule("every 30 minutes")
    .onRun(async (context) => {
        functions.logger.info("Starting 30-minute traffic prediction update")
        const db = admin.firestore()
        const now = new Date()

        try {
            // Get all venues from Firestore
            const venuesSnapshot = await db.collection("venues").get()

            if (venuesSnapshot.empty) {
                functions.logger.info("No venues found")
                return null
            }

            const batch = db.batch()
            let updateCount = 0

            for (const doc of venuesSnapshot.docs) {
                const venue = doc.data()
                const venueId = doc.id
                const lat = venue.location?.lat || venue.latitude || 0
                const lon = venue.location?.lon || venue.longitude || 0
                const venueType = venue.type || "general"

                if (lat === 0 && lon === 0) continue

                // Calculate prediction
                const prediction = calculateTrafficPrediction(
                    venueId,
                    lat,
                    lon,
                    venueType,
                    now
                )

                // Update venue's traffic field
                const venueRef = db.collection("venues").doc(venueId)
                batch.update(venueRef, {
                    traffic: prediction,
                })

                updateCount++

                // Firestore batch limit is 500
                if (updateCount % 450 === 0) {
                    await batch.commit()
                    functions.logger.info(`Committed batch of ${updateCount} venues`)
                }
            }

            // Commit remaining
            if (updateCount % 450 !== 0) {
                await batch.commit()
            }

            functions.logger.info(`Traffic prediction update complete: ${updateCount} venues updated`)

            // Also update the last run timestamp
            await db.collection("system").doc("trafficPrediction").set({
                lastRun: admin.firestore.FieldValue.serverTimestamp(),
                venuesUpdated: updateCount,
            }, { merge: true })

            return null
        } catch (error) {
            functions.logger.error("Error updating traffic predictions", error)
            throw error
        }
    })

/**
 * Manual trigger for traffic updates (for testing or immediate refresh)
 */
export const triggerTrafficUpdate = functions.https.onCall(async (data, context) => {
    // Only allow authenticated users (or admins)
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated")
    }

    functions.logger.info("Manual traffic update triggered by:", context.auth.uid)

    // Run the same logic as the scheduled function
    const db = admin.firestore()
    const now = new Date()
    const venuesSnapshot = await db.collection("venues").get()

    let updateCount = 0
    const batch = db.batch()

    for (const doc of venuesSnapshot.docs) {
        const venue = doc.data()
        const lat = venue.location?.lat || venue.latitude || 0
        const lon = venue.location?.lon || venue.longitude || 0

        if (lat === 0 && lon === 0) continue

        const prediction = calculateTrafficPrediction(
            doc.id,
            lat,
            lon,
            venue.type || "general",
            now
        )

        batch.update(db.collection("venues").doc(doc.id), { traffic: prediction })
        updateCount++

        if (updateCount % 450 === 0) {
            await batch.commit()
        }
    }

    if (updateCount % 450 !== 0) {
        await batch.commit()
    }

    return { success: true, venuesUpdated: updateCount }
})

// ============================================
// SMART PUSH NOTIFICATIONS
// Notify users when conditions are optimal at their favorite venues
// Runs every hour to check for good play times
// ============================================

interface UserNotificationPrefs {
    favoriteVenues: string[]
    notifyOnEmpty: boolean
    notifyOnGoodCrowd: boolean
    quietHoursStart?: number // 22 = 10 PM
    quietHoursEnd?: number   // 8 = 8 AM
    fcmToken?: string
}

/**
 * Scheduled function: Runs every hour
 * Checks favorite venues and sends push notifications for optimal conditions
 */
export const sendOptimalTimeNotifications = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async (context) => {
        functions.logger.info("Checking for optimal play time notifications")
        const db = admin.firestore()
        const now = new Date()
        const currentHour = now.getHours()

        try {
            // Get all users with notification preferences
            const usersSnapshot = await db.collection("users")
                .where("notificationsEnabled", "==", true)
                .get()

            if (usersSnapshot.empty) {
                functions.logger.info("No users with notifications enabled")
                return null
            }

            let notificationsSent = 0

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data()
                const prefs = userData.notificationPrefs as UserNotificationPrefs | undefined

                // Skip if no FCM token
                if (!prefs?.fcmToken) continue

                // Skip quiet hours
                const quietStart = prefs.quietHoursStart ?? 22
                const quietEnd = prefs.quietHoursEnd ?? 8
                if (currentHour >= quietStart || currentHour < quietEnd) continue

                // Check favorite venues
                const favorites = prefs.favoriteVenues || []
                for (const venueId of favorites.slice(0, 3)) { // Max 3 venues
                    const venueDoc = await db.collection("venues").doc(venueId).get()
                    if (!venueDoc.exists) continue

                    const venue = venueDoc.data()
                    const traffic = venue?.traffic
                    if (!traffic) continue

                    let shouldNotify = false
                    let message = ""

                    // Check conditions
                    if (traffic.level === "low" || traffic.level === "empty") {
                        if (prefs.notifyOnEmpty !== false) {
                            shouldNotify = true
                            message = `🎯 ${venue.name} is ${traffic.level} right now - perfect time to play!`
                        }
                    } else if (traffic.level === "moderate") {
                        if (prefs.notifyOnGoodCrowd === true) {
                            shouldNotify = true
                            message = `👥 ${venue.name} has a good crowd for games right now!`
                        }
                    }

                    if (shouldNotify) {
                        try {
                            await admin.messaging().send({
                                token: prefs.fcmToken,
                                notification: {
                                    title: "Perfect Time to Play! 🏃",
                                    body: message,
                                },
                                data: {
                                    type: "optimal_time",
                                    venueId: venueId,
                                    venueName: venue.name || "",
                                },
                                android: {
                                    priority: "high",
                                },
                                apns: {
                                    payload: {
                                        aps: {
                                            sound: "default",
                                            badge: 1,
                                        },
                                    },
                                },
                            })
                            notificationsSent++
                            functions.logger.info(`Sent notification to ${userDoc.id} for ${venue.name}`)
                        } catch (error) {
                            functions.logger.error("FCM send error:", error)
                        }
                    }
                }
            }

            functions.logger.info(`Optimal time notifications complete: ${notificationsSent} sent`)
            return null
        } catch (error) {
            functions.logger.error("Error sending optimal time notifications:", error)
            throw error
        }
    })

/**
 * Trigger notification when venue activity changes significantly
 * Called when check-in data is updated
 */
export const onVenueActivityChange = functions.firestore
    .document("venueActivity/{venueId}")
    .onUpdate(async (change, context) => {
        const venueId = context.params.venueId
        const before = change.before.data()
        const after = change.after.data()

        const previousCount = before.activeCheckIns || 0
        const currentCount = after.activeCheckIns || 0

        // Significant change: venue just got empty or just got busy
        if (previousCount > 3 && currentCount <= 1) {
            functions.logger.info(`Venue ${venueId} just emptied out - sending notifications`)
            // Could trigger immediate notifications here
        }

        if (previousCount <= 2 && currentCount >= 5) {
            functions.logger.info(`Venue ${venueId} just got active - good for pickup games`)
        }

        return null
    })

/**
 * Use check-in data to calibrate traffic predictions
 * Called periodically to improve ML accuracy
 */
export const calibrateTrafficPredictions = functions.pubsub
    .schedule("every 6 hours")
    .onRun(async (context) => {
        functions.logger.info("Calibrating traffic predictions with check-in data")
        const db = admin.firestore()

        try {
            // Get recent check-ins (last 7 days)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            const checkInsSnapshot = await db.collection("checkIns")
                .where("timestamp", ">", weekAgo)
                .get()

            if (checkInsSnapshot.empty) {
                functions.logger.info("No recent check-ins for calibration")
                return null
            }

            // Aggregate by venue and hour
            const venueHourData: Record<string, Record<number, number[]>> = {}

            checkInsSnapshot.forEach(doc => {
                const data = doc.data()
                const venueId = data.venueId
                const timestamp = data.timestamp?.toDate() || new Date()
                const hour = timestamp.getHours()

                if (!venueHourData[venueId]) venueHourData[venueId] = {}
                if (!venueHourData[venueId][hour]) venueHourData[venueId][hour] = []

                // Convert crowd estimate to number
                const crowdNum = data.crowdEstimate === "packed" ? 5 :
                    data.crowdEstimate === "busy" ? 4 :
                        data.crowdEstimate === "moderate" ? 3 :
                            data.crowdEstimate === "light" ? 2 : 1
                venueHourData[venueId][hour].push(crowdNum)
            })

            // Update venue calibration data
            const batch = db.batch()
            let updateCount = 0

            for (const venueId of Object.keys(venueHourData)) {
                const hourlyAverages: Record<number, number> = {}
                for (const hour of Object.keys(venueHourData[venueId])) {
                    const values = venueHourData[venueId][parseInt(hour)]
                    hourlyAverages[parseInt(hour)] = values.reduce((a, b) => a + b, 0) / values.length
                }

                const venueRef = db.collection("venues").doc(venueId)
                batch.update(venueRef, {
                    trafficCalibration: hourlyAverages,
                    calibrationUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    checkInDataPoints: checkInsSnapshot.size,
                })
                updateCount++

                if (updateCount % 450 === 0) {
                    await batch.commit()
                }
            }

            if (updateCount > 0) {
                await batch.commit()
            }

            functions.logger.info(`Calibration complete: ${updateCount} venues updated`)
            return null
        } catch (error) {
            functions.logger.error("Error calibrating predictions:", error)
            throw error
        }
    })


