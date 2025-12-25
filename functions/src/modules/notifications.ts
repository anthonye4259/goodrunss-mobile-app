import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import { Resend } from "resend"

// Initialize Resend
const config = functions.config()
const resend = config.resend?.api_key ? new Resend(config.resend.api_key) : null

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

        const db = admin.firestore()
        const userDoc = await db.collection("users").doc(userId).get()
        const userData = userDoc.data()

        if (!userData || !userData.pushToken) {
            return { success: false, error: "User has no push token" }
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: notificationData || {},
            token: userData.pushToken,
        }

        const response = await admin.messaging().send(message)

        return {
            success: true,
            messageId: response,
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

        const { token } = data
        if (!token) {
            throw new functions.https.HttpsError("invalid-argument", "Missing token")
        }

        const db = admin.firestore()
        await db.collection("users").doc(context.auth.uid).update({
            pushToken: token,
            lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp(),
        })

        return { success: true }
    } catch (error: any) {
        functions.logger.error("Error registering FCM token", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})

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
 * Send Booking Confirmation Email using Resend
 */
export const sendBookingConfirmationEmail = async (
    booking: any,
    userId: string,
    trainerId: string
) => {
    if (!resend) {
        functions.logger.warn("Resend not configured, skipping email")
        return
    }

    try {
        const db = admin.firestore()
        const [userDoc, trainerDoc] = await Promise.all([
            db.collection("users").doc(userId).get(),
            db.collection("users").doc(trainerId).get(),
        ])

        const user = userDoc.data()
        const trainer = trainerDoc.data()

        if (!user?.email) return

        const calendarInvite = generateCalendarInvite(booking, trainer)
        const trainerName = trainer?.displayName || trainer?.name || "Trainer"

        await resend.emails.send({
            from: "GoodRunss <bookings@goodrunss.com>",
            to: user.email,
            subject: `Booking Confirmed with ${trainerName}`,
            html: `
        <h1>Booking Confirmed!</h1>
        <p>Hi ${user.displayName || "there"},</p>
        <p>You are booked with ${trainerName}</p>
        <p>Date: ${booking.date}</p>
        <p>Time: ${booking.time}</p>
        <p>Price: $${booking.price}</p>
        <p>A calendar invite has been attached to this email.</p>
      `,
            attachments: [
                {
                    filename: "booking.ics",
                    content: Buffer.from(calendarInvite).toString("base64"),
                },
            ],
        })
    } catch (error) {
        functions.logger.error("Error sending booking email", error)
    }
}

/**
 * Send Booking Confirmation Push
 */
export const sendBookingConfirmationPush = async (booking: any, userId: string) => {
    try {
        const db = admin.firestore()
        const userDoc = await db.collection("users").doc(userId).get()
        const token = userDoc.data()?.pushToken

        if (!token) return

        await admin.messaging().send({
            token,
            notification: {
                title: "Booking Confirmed! ✅",
                body: `Your session is confirmed for ${booking.time}`,
            },
            data: {
                type: "booking_confirmed",
                bookingId: booking.id || "",
            },
        })
    } catch (error) {
        functions.logger.error("Error sending booking push", error)
    }
}
