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
 * Handles payment success, failure, and other events
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
