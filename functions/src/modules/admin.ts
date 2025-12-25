import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

/**
 * Cleanup: Expire old waitlist entries (runs daily)
 */
export const cleanupExpiredWaitlist = functions.pubsub
    .schedule("0 2 * * *")
    .timeZone("America/New_York")
    .onRun(async () => {
        try {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split("T")[0]

            const query = admin.firestore()
                .collection("court_waitlist")
                .where("status", "==", "waiting")
                .where("date", "<", yesterdayStr)
                .limit(500)

            const snapshot = await query.get()

            const batch = admin.firestore().batch()
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    status: "expired",
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            })
            await batch.commit()

            functions.logger.info("Expired waitlist entries cleaned up", {
                count: snapshot.size,
            })
        } catch (error) {
            functions.logger.error("Error cleaning up waitlist:", error)
        }
    })

/**
 * Scheduled function: Daily demand insights summary for premium facilities
 * Runs every day at 8am
 */
export const sendDailyDemandInsights = functions.pubsub
    .schedule("0 8 * * *")
    .timeZone("America/New_York")
    .onRun(async () => {
        try {
            // Get all premium facilities with daily summary enabled
            const facilitiesQuery = admin.firestore()
                .collection("claimed_facilities")
                .where("subscriptionTier", "==", "premium")
                .where("dailySummary", "==", true)

            const facilitiesSnapshot = await facilitiesQuery.get()

            for (const facilityDoc of facilitiesSnapshot.docs) {
                const facility = facilityDoc.data()

                // Get yesterday's stats
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayStr = yesterday.toISOString().split("T")[0]

                const bookingsQuery = admin.firestore()
                    .collection("court_bookings")
                    .where("facilityId", "==", facilityDoc.id)
                    .where("date", "==", yesterdayStr)
                    .where("paymentStatus", "==", "paid")

                const bookingsSnapshot = await bookingsQuery.get()

                let totalRevenue = 0
                bookingsSnapshot.docs.forEach(doc => {
                    totalRevenue += (doc.data().facilityPayout || 0) / 100
                })

                // Get owner's push tokens
                if (facility.ownerId) {
                    const tokensSnapshot = await admin.firestore()
                        .collection("users")
                        .doc(facility.ownerId)
                        .collection("deviceTokens")
                        .get()

                    const tokens = tokensSnapshot.docs
                        .map(d => d.data().token)
                        .filter(Boolean)

                    if (tokens.length > 0 && bookingsSnapshot.size > 0) {
                        await admin.messaging().sendEachForMulticast({
                            notification: {
                                title: "📊 Yesterday's Summary",
                                body: `${bookingsSnapshot.size} bookings, $${totalRevenue.toFixed(0)} earned`,
                            },
                            data: {
                                type: "daily_summary",
                                facilityId: facilityDoc.id,
                            },
                            tokens,
                        })
                    }
                }
            }

            functions.logger.info("Daily demand insights sent", {
                facilitiesCount: facilitiesSnapshot.size,
            })
        } catch (error) {
            functions.logger.error("Error sending daily insights:", error)
        }
    })
