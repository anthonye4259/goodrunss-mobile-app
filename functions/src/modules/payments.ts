import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import Stripe from "stripe"
import { sendBookingConfirmationEmail, sendBookingConfirmationPush } from "./notifications"
import {
    handleSubscriptionUpdated,
    handleSubscriptionCanceled,
    handleSubscriptionPaymentFailed
} from "./subscriptions"

const config = functions.config()
const stripe = config.stripe?.secret_key ? new Stripe(config.stripe.secret_key, { apiVersion: "2023-10-16" }) : null

/**
 * Create Payment Intent for Trainer Booking
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        if (!stripe) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Stripe is not configured"
            )
        }

        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
        }

        const { amount, currency = "usd", trainerId, userId, bookingId } = data

        if (!amount || !trainerId || !userId || !bookingId) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing required fields"
            )
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: {
                trainerId,
                userId,
                bookingId,
                type: "trainer_booking",
            },
            automatic_payment_methods: {
                enabled: true,
            },
        })

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        }
    } catch (error: any) {
        functions.logger.error("Error creating payment intent", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId, userId, trainerId } = paymentIntent.metadata

    try {
        await admin.firestore().collection("bookings").doc(bookingId).update({
            status: "confirmed",
            paymentStatus: "paid",
            paymentIntentId: paymentIntent.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        const bookingDoc = await admin.firestore().collection("bookings").doc(bookingId).get()
        const booking = bookingDoc.data()

        if (booking) {
            await sendBookingConfirmationEmail(booking, userId, trainerId)
            await sendBookingConfirmationPush(booking, userId)
        }
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
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
    } catch (error) {
        functions.logger.error("Error handling payment failure", error)
    }
}

/**
 * Stripe Webhook Handler
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    if (!stripe) {
        res.status(500).send("Stripe not configured")
        return
    }

    const sig = req.headers["stripe-signature"] as string
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            config.stripe.webhook_secret
        )
    } catch (err: any) {
        functions.logger.error("Webhook signature verification failed", err)
        res.status(400).send(`Webhook Error: ${err.message}`)
        return
    }

    switch (event.type) {
        case "payment_intent.succeeded":
            await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
            break
        case "payment_intent.payment_failed":
            await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
            break
        case "customer.subscription.updated":
            await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
            break
        case "customer.subscription.deleted":
            await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
            break
        case "invoice.payment_failed":
            const invoice = event.data.object as Stripe.Invoice
            if (invoice.subscription) {
                await handleSubscriptionPaymentFailed(invoice)
            }
            break
        default:
            functions.logger.info(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
})
