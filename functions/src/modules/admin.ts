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

/**
 * Process Spot Opening - Pro Waitlist Auto-Booking
 * 
 * When a booking is cancelled, this function:
 * 1. Finds waitlist entries for that slot
 * 2. Prioritizes Pro users
 * 3. Auto-books for Pro users (instant)
 * 4. Notifies free users that spot is available
 */
export const processSpotOpening = functions.firestore
    .document("court_bookings/{bookingId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data()
        const after = change.after.data()

        // Only trigger when status changes to "cancelled"
        if (before.status !== "cancelled" && after.status === "cancelled") {
            const { venueId, courtId, date, startTime, endTime } = after

            try {
                // Find waitlist entries for this slot
                const waitlistQuery = admin.firestore()
                    .collection("court_waitlist")
                    .where("venueId", "==", venueId)
                    .where("date", "==", date)
                    .where("status", "==", "waiting")
                    .orderBy("createdAt", "asc")
                    .limit(20)

                const waitlistSnapshot = await waitlistQuery.get()

                if (waitlistSnapshot.empty) {
                    functions.logger.info("No waitlist entries for cancelled slot")
                    return
                }

                // Separate Pro and Free users
                const proEntries: any[] = []
                const freeEntries: any[] = []

                for (const doc of waitlistSnapshot.docs) {
                    const data = doc.data()
                    const entry = { id: doc.id, userId: data.userId as string, userName: data.userName as string || "" }

                    // Check if user is Pro
                    const userDoc = await admin.firestore()
                        .collection("users")
                        .doc(entry.userId)
                        .get()

                    const userData = userDoc.data()
                    const isPro = userData?.subscriptionStatus === "active" ||
                        userData?.subscriptionTier === "pro"

                    if (isPro) {
                        proEntries.push(entry)
                    } else {
                        freeEntries.push(entry)
                    }
                }

                functions.logger.info("Processing waitlist", {
                    proCount: proEntries.length,
                    freeCount: freeEntries.length,
                })

                // Auto-book for first Pro user
                if (proEntries.length > 0) {
                    const winner = proEntries[0]

                    // Create new booking
                    const newBooking = await admin.firestore()
                        .collection("court_bookings")
                        .add({
                            venueId,
                            courtId,
                            date,
                            startTime,
                            endTime,
                            userId: winner.userId,
                            userName: winner.userName || "Pro Member",
                            status: "confirmed",
                            paymentStatus: "pending", // Will charge their card on file
                            source: "waitlist_auto",
                            originalWaitlistId: winner.id,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        })

                    // Update waitlist entry
                    await admin.firestore()
                        .collection("court_waitlist")
                        .doc(winner.id)
                        .update({
                            status: "booked",
                            bookingId: newBooking.id,
                            bookedAt: admin.firestore.FieldValue.serverTimestamp(),
                        })

                    // Notify Pro user
                    const tokensSnapshot = await admin.firestore()
                        .collection("users")
                        .doc(winner.userId)
                        .collection("deviceTokens")
                        .get()

                    const tokens = tokensSnapshot.docs.map(d => d.data().token).filter(Boolean)

                    if (tokens.length > 0) {
                        await admin.messaging().sendEachForMulticast({
                            notification: {
                                title: "🎉 You Got the Spot!",
                                body: `Pro Priority: Auto-booked for ${date} at ${startTime}`,
                            },
                            data: {
                                type: "waitlist_booked",
                                bookingId: newBooking.id,
                            },
                            tokens,
                        })
                    }

                    functions.logger.info("Pro user auto-booked from waitlist", {
                        userId: winner.userId,
                        bookingId: newBooking.id,
                    })
                }

                // Notify remaining free users that spot opened
                for (const entry of freeEntries) {
                    const tokensSnapshot = await admin.firestore()
                        .collection("users")
                        .doc(entry.userId)
                        .collection("deviceTokens")
                        .get()

                    const tokens = tokensSnapshot.docs.map(d => d.data().token).filter(Boolean)

                    if (tokens.length > 0) {
                        await admin.messaging().sendEachForMulticast({
                            notification: {
                                title: "⚡ Spot Just Opened!",
                                body: `A court is now available for ${date} at ${startTime}. Book now!`,
                            },
                            data: {
                                type: "spot_available",
                                venueId,
                                date,
                                startTime,
                            },
                            tokens,
                        })
                    }
                }

            } catch (error) {
                functions.logger.error("Error processing spot opening:", error)
            }
        }
    })

