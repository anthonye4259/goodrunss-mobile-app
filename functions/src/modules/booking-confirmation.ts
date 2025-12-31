/**
 * Smart Booking Confirmation System
 * 
 * Prevents double-bookings with a 5-minute hold + facility confirmation flow:
 * 1. Player books → Pending booking created (5-min TTL)
 * 2. Facility gets instant push notification
 * 3. Facility confirms or declines
 * 4. If no response in 5 min → Auto-confirm
 */

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

const CONFIRMATION_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

// ============================================
// TYPES
// ============================================

interface PendingBooking {
    id: string
    playerId: string
    playerName: string
    playerEmail: string
    facilityId: string
    facilityOwnerId: string
    courtId: string
    courtName: string
    date: string                  // YYYY-MM-DD
    startTime: string             // HH:MM
    endTime: string               // HH:MM
    price: number                 // in cents
    status: "pending" | "confirmed" | "declined" | "expired" | "auto_confirmed"
    createdAt: admin.firestore.Timestamp
    expiresAt: admin.firestore.Timestamp
    confirmedAt?: admin.firestore.Timestamp
    declinedAt?: admin.firestore.Timestamp
    declineReason?: string
    notificationSent: boolean
}

// ============================================
// CREATE PENDING BOOKING
// ============================================

export const createPendingBooking = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in")
    }

    const {
        facilityId,
        courtId,
        courtName,
        date,
        startTime,
        endTime,
        price,
    } = data

    const playerId = context.auth.uid

    // Get player info
    const playerDoc = await admin.firestore().collection("users").doc(playerId).get()
    const playerData = playerDoc.data() || {}

    // Get facility owner and settings
    const facilityDoc = await admin.firestore().collection("claimed_facilities").doc(facilityId).get()
    const facilityData = facilityDoc.data()

    if (!facilityData) {
        throw new functions.https.HttpsError("not-found", "Facility not found")
    }

    const facilityOwnerId = facilityData.ownerId
    const autoAcceptBookings = facilityData.autoAcceptBookings ?? true // Default to autopilot

    // Check for existing pending booking on same slot
    const existingPending = await admin.firestore()
        .collection("pendingBookings")
        .where("facilityId", "==", facilityId)
        .where("courtId", "==", courtId)
        .where("date", "==", date)
        .where("startTime", "==", startTime)
        .where("status", "==", "pending")
        .get()

    if (!existingPending.empty) {
        throw new functions.https.HttpsError(
            "already-exists",
            "Someone else is booking this slot. Try again in a few minutes."
        )
    }

    // Check for confirmed booking
    const existingConfirmed = await admin.firestore()
        .collection("court_bookings")
        .where("facilityId", "==", facilityId)
        .where("courtId", "==", courtId)
        .where("date", "==", date)
        .where("startTime", "==", startTime)
        .where("status", "in", ["confirmed", "pending"])
        .get()

    if (!existingConfirmed.empty) {
        throw new functions.https.HttpsError(
            "already-exists",
            "This slot is no longer available"
        )
    }

    const playerName = playerData.name || playerData.displayName || "Guest"
    const playerEmail = playerData.email || ""

    // ============================================
    // AUTOPILOT MODE: Skip pending flow, confirm immediately
    // ============================================
    if (autoAcceptBookings) {
        const bookingData = {
            playerId,
            playerName,
            playerEmail,
            facilityId,
            facilityOwnerId,
            courtId,
            courtName,
            date,
            startTime,
            endTime,
            price,
            status: "confirmed",
            source: "goodrunss",
            autoConfirmed: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        const bookingRef = await admin.firestore().collection("court_bookings").add(bookingData)

        // Notify player
        await sendPlayerNotification(playerId, {
            type: "booking_confirmed",
            title: "Booking Confirmed!",
            body: `Your ${courtName} booking for ${date} at ${startTime} is confirmed!`,
            bookingId: bookingRef.id,
        })

        // Notify facility owner (info only)
        await sendBookingNotification(facilityOwnerId, {
            bookingId: bookingRef.id,
            courtName,
            date,
            startTime,
            playerName,
        })

        functions.logger.info("Booking auto-confirmed (autopilot mode)", {
            bookingId: bookingRef.id,
            facilityId,
            playerId,
        })

        return {
            bookingId: bookingRef.id,
            status: "confirmed",
            autoConfirmed: true,
        }
    }

    // ============================================
    // MANUAL MODE: Create pending booking with 5-min TTL
    // ============================================
    const now = admin.firestore.Timestamp.now()
    const expiresAt = admin.firestore.Timestamp.fromMillis(now.toMillis() + CONFIRMATION_TIMEOUT_MS)

    const pendingBooking: Omit<PendingBooking, "id"> = {
        playerId,
        playerName,
        playerEmail,
        facilityId,
        facilityOwnerId,
        courtId,
        courtName,
        date,
        startTime,
        endTime,
        price,
        status: "pending",
        createdAt: now,
        expiresAt,
        notificationSent: false,
    }

    const docRef = await admin.firestore().collection("pendingBookings").add(pendingBooking)

    // Send push notification to facility owner
    await sendBookingNotification(facilityOwnerId, {
        bookingId: docRef.id,
        courtName,
        date,
        startTime,
        playerName: pendingBooking.playerName,
    })

    // Update notification sent flag
    await docRef.update({ notificationSent: true })

    functions.logger.info("Pending booking created", {
        bookingId: docRef.id,
        facilityId,
        playerId,
    })

    return {
        bookingId: docRef.id,
        expiresAt: expiresAt.toDate().toISOString(),
        status: "pending",
    }
})


// ============================================
// FACILITY CONFIRMS BOOKING
// ============================================

export const confirmBooking = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in")
    }

    const { bookingId } = data
    const userId = context.auth.uid

    const pendingRef = admin.firestore().collection("pendingBookings").doc(bookingId)
    const pendingDoc = await pendingRef.get()

    if (!pendingDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Booking not found")
    }

    const pending = pendingDoc.data() as PendingBooking

    // Verify caller is the facility owner
    if (pending.facilityOwnerId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Not authorized")
    }

    if (pending.status !== "pending") {
        throw new functions.https.HttpsError(
            "failed-precondition",
            `Booking already ${pending.status}`
        )
    }

    // Update pending booking
    await pendingRef.update({
        status: "confirmed",
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Create actual booking
    const bookingData = {
        playerId: pending.playerId,
        playerName: pending.playerName,
        facilityId: pending.facilityId,
        courtId: pending.courtId,
        courtName: pending.courtName,
        date: pending.date,
        startTime: pending.startTime,
        endTime: pending.endTime,
        price: pending.price,
        status: "confirmed",
        source: "goodrunss",
        pendingBookingId: bookingId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const bookingRef = await admin.firestore().collection("court_bookings").add(bookingData)

    // Notify player
    await sendPlayerNotification(pending.playerId, {
        type: "booking_confirmed",
        title: "Booking Confirmed!",
        body: `Your ${pending.courtName} booking for ${pending.date} at ${pending.startTime} is confirmed!`,
        bookingId: bookingRef.id,
    })

    functions.logger.info("Booking confirmed by facility", {
        bookingId,
        facilityOwnerId: userId,
    })

    return { success: true, bookingId: bookingRef.id }
})

// ============================================
// FACILITY DECLINES BOOKING
// ============================================

export const declineBooking = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in")
    }

    const { bookingId, reason } = data
    const userId = context.auth.uid

    const pendingRef = admin.firestore().collection("pendingBookings").doc(bookingId)
    const pendingDoc = await pendingRef.get()

    if (!pendingDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Booking not found")
    }

    const pending = pendingDoc.data() as PendingBooking

    // Verify caller is the facility owner
    if (pending.facilityOwnerId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Not authorized")
    }

    if (pending.status !== "pending") {
        throw new functions.https.HttpsError(
            "failed-precondition",
            `Booking already ${pending.status}`
        )
    }

    // Update pending booking
    await pendingRef.update({
        status: "declined",
        declinedAt: admin.firestore.FieldValue.serverTimestamp(),
        declineReason: reason || "Slot no longer available",
    })

    // Notify player
    await sendPlayerNotification(pending.playerId, {
        type: "booking_declined",
        title: "Booking Unavailable",
        body: `Sorry, ${pending.courtName} at ${pending.startTime} is no longer available. ${reason || "Please try another time."}`,
    })

    functions.logger.info("Booking declined by facility", {
        bookingId,
        reason,
    })

    return { success: true }
})

// ============================================
// AUTO-CONFIRM EXPIRED BOOKINGS
// ============================================

export const autoConfirmExpiredBookings = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async () => {
        const now = admin.firestore.Timestamp.now()

        // Find pending bookings that have expired
        const expiredBookings = await admin.firestore()
            .collection("pendingBookings")
            .where("status", "==", "pending")
            .where("expiresAt", "<=", now)
            .get()

        if (expiredBookings.empty) {
            return
        }

        functions.logger.info(`Auto-confirming ${expiredBookings.size} expired bookings`)

        for (const doc of expiredBookings.docs) {
            const pending = doc.data() as PendingBooking

            try {
                // Update pending booking
                await doc.ref.update({
                    status: "auto_confirmed",
                    confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
                })

                // Create actual booking
                const bookingData = {
                    playerId: pending.playerId,
                    playerName: pending.playerName,
                    facilityId: pending.facilityId,
                    courtId: pending.courtId,
                    courtName: pending.courtName,
                    date: pending.date,
                    startTime: pending.startTime,
                    endTime: pending.endTime,
                    price: pending.price,
                    status: "confirmed",
                    source: "goodrunss",
                    autoConfirmed: true,
                    pendingBookingId: doc.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
                }

                const bookingRef = await admin.firestore().collection("court_bookings").add(bookingData)

                // Notify player
                await sendPlayerNotification(pending.playerId, {
                    type: "booking_confirmed",
                    title: "Booking Confirmed!",
                    body: `Your ${pending.courtName} booking for ${pending.date} at ${pending.startTime} is confirmed!`,
                    bookingId: bookingRef.id,
                })

                // Notify facility owner
                await sendFacilityAutoConfirmNotification(pending.facilityOwnerId, {
                    courtName: pending.courtName,
                    date: pending.date,
                    startTime: pending.startTime,
                    playerName: pending.playerName,
                    bookingId: bookingRef.id,
                })

                functions.logger.info("Booking auto-confirmed", { bookingId: doc.id })
            } catch (error: any) {
                functions.logger.error("Error auto-confirming booking", {
                    bookingId: doc.id,
                    error: error.message,
                })
            }
        }
    })

// ============================================
// QUICK BLOCK SLOT
// ============================================

export const quickBlockSlot = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in")
    }

    const { facilityId, courtId, courtName, date, startTime, endTime, reason } = data
    const userId = context.auth.uid

    // Verify ownership
    const facilityDoc = await admin.firestore().collection("claimedFacilities").doc(facilityId).get()
    if (!facilityDoc.exists || facilityDoc.data()?.ownerId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Not authorized")
    }

    // Create blocked slot
    const blockedSlot = {
        facilityId,
        courtId,
        courtName,
        date,
        startTime,
        endTime,
        reason: reason || "Blocked by facility",
        blockedBy: userId,
        blockedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "blocked",
    }

    await admin.firestore().collection("blocked_slots").add(blockedSlot)

    // Cancel any pending bookings for this slot
    const pendingBookings = await admin.firestore()
        .collection("pendingBookings")
        .where("facilityId", "==", facilityId)
        .where("courtId", "==", courtId)
        .where("date", "==", date)
        .where("startTime", "==", startTime)
        .where("status", "==", "pending")
        .get()

    for (const doc of pendingBookings.docs) {
        const pending = doc.data() as PendingBooking
        await doc.ref.update({
            status: "declined",
            declinedAt: admin.firestore.FieldValue.serverTimestamp(),
            declineReason: "Slot blocked by facility",
        })

        await sendPlayerNotification(pending.playerId, {
            type: "booking_declined",
            title: "Booking Unavailable",
            body: `Sorry, ${pending.courtName} at ${pending.startTime} is no longer available.`,
        })
    }

    functions.logger.info("Slot blocked", { facilityId, courtId, date, startTime })

    return { success: true }
})

// ============================================
// GET PENDING BOOKINGS FOR FACILITY
// ============================================

export const getPendingBookings = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in")
    }

    const { facilityId } = data
    const userId = context.auth.uid

    // Verify ownership
    const facilityDoc = await admin.firestore().collection("claimedFacilities").doc(facilityId).get()
    if (!facilityDoc.exists || facilityDoc.data()?.ownerId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Not authorized")
    }

    const pendingBookings = await admin.firestore()
        .collection("pendingBookings")
        .where("facilityId", "==", facilityId)
        .where("status", "==", "pending")
        .orderBy("createdAt", "desc")
        .get()

    return pendingBookings.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
        expiresAt: doc.data().expiresAt?.toDate?.()?.toISOString(),
    }))
})

// ============================================
// HELPER: SEND BOOKING NOTIFICATION TO FACILITY
// ============================================

async function sendBookingNotification(facilityOwnerId: string, booking: {
    bookingId: string
    courtName: string
    date: string
    startTime: string
    playerName: string
}) {
    // Get facility owner's device tokens
    const tokensSnapshot = await admin.firestore()
        .collection("users")
        .doc(facilityOwnerId)
        .collection("deviceTokens")
        .get()

    const tokens = tokensSnapshot.docs.map(d => d.data().token).filter(Boolean)

    if (tokens.length === 0) {
        functions.logger.warn("No device tokens for facility owner", { facilityOwnerId })
        return
    }

    const message = {
        notification: {
            title: "🎾 New Booking Request!",
            body: `${booking.playerName} wants ${booking.courtName} on ${booking.date} at ${booking.startTime}`,
        },
        data: {
            type: "pending_booking",
            bookingId: booking.bookingId,
            action: "confirm_decline",
        },
        tokens,
    }

    try {
        const response = await admin.messaging().sendEachForMulticast(message)
        functions.logger.info("Booking notification sent", {
            successCount: response.successCount,
            failureCount: response.failureCount,
        })
    } catch (error: any) {
        functions.logger.error("Error sending booking notification", { error: error.message })
    }
}

// ============================================
// HELPER: SEND NOTIFICATION TO PLAYER
// ============================================

async function sendPlayerNotification(playerId: string, notification: {
    type: string
    title: string
    body: string
    bookingId?: string
}) {
    const tokensSnapshot = await admin.firestore()
        .collection("users")
        .doc(playerId)
        .collection("deviceTokens")
        .get()

    const tokens = tokensSnapshot.docs.map(d => d.data().token).filter(Boolean)

    if (tokens.length === 0) {
        return
    }

    const message = {
        notification: {
            title: notification.title,
            body: notification.body,
        },
        data: {
            type: notification.type,
            bookingId: notification.bookingId || "",
        },
        tokens,
    }

    try {
        await admin.messaging().sendEachForMulticast(message)
    } catch (error: any) {
        functions.logger.error("Error sending player notification", { error: error.message })
    }
}

// ============================================
// HELPER: NOTIFY FACILITY OF AUTO-CONFIRM
// ============================================

async function sendFacilityAutoConfirmNotification(facilityOwnerId: string, booking: {
    courtName: string
    date: string
    startTime: string
    playerName: string
    bookingId: string
}) {
    const tokensSnapshot = await admin.firestore()
        .collection("users")
        .doc(facilityOwnerId)
        .collection("deviceTokens")
        .get()

    const tokens = tokensSnapshot.docs.map(d => d.data().token).filter(Boolean)

    if (tokens.length === 0) {
        return
    }

    const message = {
        notification: {
            title: "Booking Auto-Confirmed ✅",
            body: `${booking.playerName}'s booking for ${booking.courtName} on ${booking.date} at ${booking.startTime} was auto-confirmed (no response).`,
        },
        data: {
            type: "auto_confirmed",
            bookingId: booking.bookingId,
        },
        tokens,
    }

    try {
        await admin.messaging().sendEachForMulticast(message)
    } catch (error: any) {
        functions.logger.error("Error sending auto-confirm notification", { error: error.message })
    }
}
