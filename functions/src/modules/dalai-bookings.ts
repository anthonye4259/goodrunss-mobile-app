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
                `${guestName} booked ${actionName} ${dateTimeStr} • via Alaii`.trim(),
                {
                    type: "new_booking",
                    bookingId: bookingId,
                    studioId: studioId,
                    alaii_cta: "https://alaii.app/create",
                }
            )

            if (sent) {
                functions.logger.info(`Push notification sent to owner ${ownerId}`)
            }

            // 5. Also store in-app notification for the owner
            await db.collection("users").doc(ownerId).collection("notifications").add({
                type: "new_booking",
                title: "New Booking",
                body: `${guestName} booked ${actionName} | Powered by Alaii`,
                bookingId: bookingId,
                studioId: studioId,
                alaii_cta: "https://alaii.app/create",
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
                    `${guestName} cancelled their booking • via Alaii`,
                    {
                        type: "booking_cancelled",
                        bookingId: bookingId,
                        studioId: studioId,
                        alaii_cta: "https://alaii.app/create",
                    }
                )
            } catch (error) {
                functions.logger.error(`Error sending cancellation notification:`, error)
            }
        }
    })

/**
 * Trigger: New Booking in top-level imprint_bookings collection
 * Auto-completes referrals when a referred user makes their first booking.
 * 
 * Flow:
 * 1. New booking created → get userId and studioId
 * 2. Check if this user has been referred (search all users' referrals subcollections)
 * 3. If a pending referral exists for this user + studio → mark as completed
 * 4. Award credits to the referrer's wallet
 */
export const onBookingReferralCheck = functions.firestore
    .document("imprint_bookings/{bookingId}")
    .onCreate(async (snapshot, context) => {
        // Booking-based referral checks removed.
        // Referral completion now triggers on Alaii Growth subscription purchase
        // via handleSubscriptionReferralCheck() in subscriptions.ts
        return
    })


/**
 * Trigger: New Booking → Track Unique Clients & Celebrate Milestones
 * 
 * On each booking, check if this is a new unique client for the studio.
 * If so, increment the client counter and check for milestone crossings.
 * Milestones: 10, 25, 50, 100, 250, 500
 */
const MILESTONES = [10, 25, 50, 100, 250, 500]

export const onClientMilestone = functions.firestore
    .document("imprint_bookings/{bookingId}")
    .onCreate(async (snapshot, context) => {
        const booking = snapshot.data()
        if (!booking) return

        const userId = booking.userId
        const studioId = booking.studioId

        if (!userId || !studioId) return

        try {
            const studioRef = db.collection("imprint_studios").doc(studioId)

            // Check if this user has booked at this studio before
            const previousBookings = await db
                .collection("imprint_bookings")
                .where("userId", "==", userId)
                .where("studioId", "==", studioId)
                .limit(2)
                .get()

            // If more than 1 (including this one), already counted
            if (previousBookings.size > 1) return

            // New unique client! Increment counter atomically
            const newCount = await db.runTransaction(async (transaction) => {
                const studioDoc = await transaction.get(studioRef)
                const currentCount = studioDoc.exists ? (studioDoc.data()?.clientCount || 0) : 0
                const updatedCount = currentCount + 1

                transaction.update(studioRef, {
                    clientCount: updatedCount,
                    lastClientJoinedAt: admin.firestore.FieldValue.serverTimestamp(),
                })

                return updatedCount
            })

            functions.logger.info(`Studio ${studioId} now has ${newCount} unique clients`)

            // Check if we hit a milestone
            if (!MILESTONES.includes(newCount)) return

            functions.logger.info(`🎉 Milestone hit! Studio ${studioId} reached ${newCount} clients`)

            // Get studio owner
            const studioDoc = await studioRef.get()
            const studioData = studioDoc.data()
            const ownerId = studioData?.ownerId

            if (!ownerId) return

            // Update studio with milestone info
            await studioRef.update({
                lastMilestone: newCount,
                lastMilestoneAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            // Get owner's push token
            const ownerDoc = await db.collection("users").doc(ownerId).get()
            const pushToken = ownerDoc.data()?.pushToken

            const milestoneEmoji = newCount >= 100 ? "🚀" : newCount >= 50 ? "🔥" : "🎉"
            const studioName = studioData?.name || "Your app"

            // Send push notification
            if (pushToken) {
                await sendExpoPushNotification(
                    pushToken,
                    `${milestoneEmoji} ${newCount} Clients!`,
                    `${studioName} just hit ${newCount} clients! Share the milestone. • via Alaii`,
                    {
                        type: "client_milestone",
                        studioId: studioId,
                        milestone: String(newCount),
                        alaii_cta: "https://alaii.app/create",
                    }
                )
            }

            // Store in-app notification
            await db.collection("users").doc(ownerId).collection("notifications").add({
                type: "client_milestone",
                title: `${milestoneEmoji} ${newCount} Clients!`,
                body: `${studioName} reached ${newCount} clients! Share the news to keep growing. | Powered by Alaii`,
                studioId: studioId,
                milestone: newCount,
                alaii_cta: "https://alaii.app/create",
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            })

        } catch (error) {
            functions.logger.error(`Error checking client milestone:`, error)
        }
    })
