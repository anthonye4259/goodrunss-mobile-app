/**
 * Dal AI Booking Notifications
 * 
 * Firestore trigger that sends push notifications to studio owners
 * when a new booking is created via the web app.
 */

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require("node-fetch")

const db = admin.firestore()

/**
 * Send push notification via Expo Push API
 */
async function sendExpoPushNotification(
    token: string,
    title: string,
    body: string,
    data: Record<string, string>
): Promise<boolean> {
    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: token,
                title,
                body,
                data,
                sound: "default",
                badge: 1,
                channelId: "bookings",
            }),
        })

        const result = await response.json() as { data?: { status?: string } }
        functions.logger.info("Expo push response:", result)
        return result?.data?.status === "ok"
    } catch (error) {
        functions.logger.error("Expo push error:", error)
        return false
    }
}

/**
 * Trigger: New Booking Created in imprint_studios/{studioId}/imprint_bookings
 * Sends push notification to the studio owner
 */
export const onNewBookingCreated = functions.firestore
    .document("imprint_studios/{studioId}/imprint_bookings/{bookingId}")
    .onCreate(async (snapshot, context) => {
        const { studioId, bookingId } = context.params
        const booking = snapshot.data()

        functions.logger.info(`New booking ${bookingId} in studio ${studioId}`, booking)

        try {
            // 1. Get the studio to find the owner
            const studioDoc = await db.collection("imprint_studios").doc(studioId).get()
            if (!studioDoc.exists) {
                functions.logger.warn(`Studio ${studioId} not found`)
                return
            }

            const studio = studioDoc.data()
            const ownerId = studio?.ownerId

            if (!ownerId) {
                functions.logger.warn(`Studio ${studioId} has no ownerId`)
                return
            }

            // 2. Get the owner's push token
            const ownerDoc = await db.collection("users").doc(ownerId).get()
            const ownerData = ownerDoc.data()
            const pushToken = ownerData?.pushToken || ownerData?.fcmToken

            if (!pushToken) {
                functions.logger.info(`Owner ${ownerId} has no push token, skipping notification`)
                return
            }

            // 3. Build notification payload
            const guestName = booking.guestName || booking.userName || "Someone"
            const actionName = booking.actionName || booking.className || "a session"
            const scheduledTime = booking.scheduledTime || booking.startTime || ""
            const scheduledDate = booking.scheduledDate || booking.date || ""

            const dateTimeStr = scheduledDate && scheduledTime
                ? `for ${scheduledDate} at ${scheduledTime}`
                : scheduledTime
                    ? `at ${scheduledTime}`
                    : ""

            // 4. Send push notification via Expo
            const sent = await sendExpoPushNotification(
                pushToken,
                "📅 New Booking!",
                `${guestName} booked ${actionName} ${dateTimeStr}`.trim(),
                {
                    type: "new_booking",
                    bookingId: bookingId,
                    studioId: studioId,
                }
            )

            if (sent) {
                functions.logger.info(`Push notification sent to owner ${ownerId}`)
            }

            // 5. Also store in-app notification for the owner
            await db.collection("users").doc(ownerId).collection("notifications").add({
                type: "new_booking",
                title: "New Booking",
                body: `${guestName} booked ${actionName}`,
                bookingId: bookingId,
                studioId: studioId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            functions.logger.info(`In-app notification created for owner ${ownerId}`)

        } catch (error) {
            functions.logger.error(`Error sending booking notification for ${bookingId}:`, error)
        }
    })

/**
 * Trigger: Booking Cancelled
 * Notifies studio owner when a booking is cancelled
 */
export const onBookingUpdated = functions.firestore
    .document("imprint_studios/{studioId}/imprint_bookings/{bookingId}")
    .onUpdate(async (change, context) => {
        const { studioId, bookingId } = context.params
        const before = change.before.data()
        const after = change.after.data()

        // Only notify on status change to cancelled
        if (before.status !== "cancelled" && after.status === "cancelled") {
            functions.logger.info(`Booking ${bookingId} cancelled`)

            try {
                const studioDoc = await db.collection("imprint_studios").doc(studioId).get()
                const ownerId = studioDoc.data()?.ownerId

                if (!ownerId) return

                const ownerDoc = await db.collection("users").doc(ownerId).get()
                const pushToken = ownerDoc.data()?.pushToken || ownerDoc.data()?.fcmToken

                if (!pushToken) return

                const guestName = after.guestName || after.userName || "A client"

                await sendExpoPushNotification(
                    pushToken,
                    "❌ Booking Cancelled",
                    `${guestName} cancelled their booking`,
                    {
                        type: "booking_cancelled",
                        bookingId: bookingId,
                        studioId: studioId,
                    }
                )
            } catch (error) {
                functions.logger.error(`Error sending cancellation notification:`, error)
            }
        }
    })
