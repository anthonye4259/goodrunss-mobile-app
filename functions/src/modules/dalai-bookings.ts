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
        const { bookingId } = context.params
        const booking = snapshot.data()

        if (!booking) return

        const userId = booking.userId
        const studioId = booking.studioId

        if (!userId || !studioId) {
            functions.logger.info("Booking missing userId or studioId, skipping referral check")
            return
        }

        functions.logger.info(`Checking referral for user ${userId} in studio ${studioId}`)

        try {
            // Check if this is the user's first booking at this studio
            const existingBookings = await db
                .collection("imprint_bookings")
                .where("userId", "==", userId)
                .where("studioId", "==", studioId)
                .where("status", "==", "confirmed")
                .limit(2)
                .get()

            // If this isn't their first booking, skip (the just-created one counts as 1)
            if (existingBookings.size > 1) {
                functions.logger.info(`User ${userId} already has bookings at studio ${studioId}, skipping`)
                return
            }

            // This is their first booking! Check if they were referred.
            // Search for pending referrals where this user is the friend
            const usersSnapshot = await db.collectionGroup("referrals")
                .where("friendId", "==", userId)
                .where("studioId", "==", studioId)
                .where("status", "==", "pending")
                .limit(1)
                .get()

            if (usersSnapshot.empty) {
                functions.logger.info(`No pending referral found for user ${userId}`)
                return
            }

            // Found a pending referral — complete it!
            const referralDoc = usersSnapshot.docs[0]
            const referralData = referralDoc.data()
            const referrerId = referralDoc.ref.parent.parent?.id

            if (!referrerId) {
                functions.logger.warn("Could not determine referrer ID from referral doc path")
                return
            }

            const REWARD_CREDITS = 10

            functions.logger.info(
                `Completing referral: ${referrerId} referred ${userId}. Awarding ${REWARD_CREDITS} credits.`
            )

            // 1. Update referral status to completed
            await referralDoc.ref.update({
                status: "completed",
                reward: REWARD_CREDITS,
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
                completedBy: bookingId,
            })

            // 2. Award credits to referrer's wallet
            const walletRef = db
                .collection("users")
                .doc(referrerId)
                .collection("wallet")
                .doc(studioId)

            await db.runTransaction(async (transaction) => {
                const walletDoc = await transaction.get(walletRef)
                const currentCredits = walletDoc.exists ? (walletDoc.data()?.credits || 0) : 0

                transaction.set(walletRef, {
                    credits: currentCredits + REWARD_CREDITS,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true })
            })

            // 3. Check for bonus milestones (5 referrals = +25, 10 referrals = +50)
            const allReferrals = await db
                .collection("users")
                .doc(referrerId)
                .collection("referrals")
                .where("status", "==", "completed")
                .get()

            const completedCount = allReferrals.size
            let bonusCredits = 0

            if (completedCount === 5) bonusCredits = 25
            else if (completedCount === 10) bonusCredits = 50

            if (bonusCredits > 0) {
                functions.logger.info(`Milestone bonus! ${completedCount} referrals → +${bonusCredits} credits`)

                await db.runTransaction(async (transaction) => {
                    const walletDoc = await transaction.get(walletRef)
                    const currentCredits = walletDoc.exists ? (walletDoc.data()?.credits || 0) : 0

                    transaction.set(walletRef, {
                        credits: currentCredits + bonusCredits,
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true })
                })
            }

            // 4. Send push notification to referrer
            const referrerDoc = await db.collection("users").doc(referrerId).get()
            const referrerData = referrerDoc.data()
            const pushToken = referrerData?.pushToken

            if (pushToken) {
                const friendName = referralData.friendName || "Your friend"
                await sendExpoPushNotification(
                    pushToken,
                    "🎉 Referral Reward!",
                    `${friendName} booked their first session! You earned ${REWARD_CREDITS} credits.`,
                    {
                        type: "referral_completed",
                        studioId: studioId,
                    }
                )
            }

            // 5. Store in-app notification for the referrer
            await db.collection("users").doc(referrerId).collection("notifications").add({
                type: "referral_completed",
                title: "Referral Reward!",
                body: `${referralData.friendName || "Your friend"} completed their first booking. You earned ${REWARD_CREDITS} credits!`,
                studioId: studioId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            functions.logger.info(`Referral auto-completed successfully for referrer ${referrerId}`)

        } catch (error) {
            functions.logger.error(`Error in referral auto-complete for booking ${bookingId}:`, error)
        }
    })
