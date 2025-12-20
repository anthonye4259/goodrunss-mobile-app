/**
 * Private Session Booking Service
 * 
 * Complete booking system for 1-on-1 sessions:
 * - Dynamic platform fees based on client relationship (0%, 5%, or 15%)
 * - Booking fees ($1 for existing/repeat, $3 for marketplace)
 * - Stripe Connect for instructor payouts
 * - Availability management
 * - Booking creation and confirmation
 * - Cancellation with refund policies
 */

import { db } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { PrivateBooking, AvailabilitySlot, Instructor } from "@/lib/types/wellness-instructor"
import { calculateBookingFees, FeeCalculation } from "./fee-calculation-service"
import { recordMarketplaceBooking, markAsRepeatClient, BookingFeeType } from "./client-relationship-service"

// Legacy constants (kept for backwards compatibility)
export const PLATFORM_FEE_PERCENT = 6
export const INSTRUCTOR_PAYOUT_PERCENT = 94

// Cancellation policy
export const CANCELLATION_POLICIES = {
    flexible: {
        name: "Flexible",
        description: "Full refund up to 24 hours before",
        hoursBeforeForFullRefund: 24,
        hoursBeforeForPartialRefund: 12,
        partialRefundPercent: 50,
    },
    moderate: {
        name: "Moderate",
        description: "Full refund up to 48 hours before",
        hoursBeforeForFullRefund: 48,
        hoursBeforeForPartialRefund: 24,
        partialRefundPercent: 50,
    },
    strict: {
        name: "Strict",
        description: "Full refund up to 7 days before",
        hoursBeforeForFullRefund: 168, // 7 days
        hoursBeforeForPartialRefund: 72, // 3 days
        partialRefundPercent: 50,
    },
}

export type CancellationPolicy = keyof typeof CANCELLATION_POLICIES

// ============================================
// BOOKING TYPES
// ============================================

export interface CreateBookingParams {
    instructorId: string
    clientId: string
    clientName: string
    clientEmail: string
    slotId: string // Which availability slot
    startTime: Date
    duration: number // minutes
    locationType: "client_location" | "instructor_location" | "virtual"
    locationAddress?: string
    notes?: string
    price: number // in cents
    // Optional: pre-calculated fees (if not provided, will be calculated)
    preCalculatedFees?: FeeCalculation
}

export interface BookingResult {
    success: boolean
    bookingId?: string
    paymentIntentClientSecret?: string
    message: string
    feeCalculation?: FeeCalculation // Return fee info to UI
}

// ============================================
// AVAILABILITY MANAGEMENT
// ============================================

/**
 * Get instructor's available slots
 */
export async function getInstructorAvailability(
    instructorId: string,
    startDate: Date,
    endDate: Date
): Promise<AvailabilitySlot[]> {
    if (!db) return []

    try {
        const { collection, query, where, getDocs, Timestamp } = await import("firebase/firestore")

        const q = query(
            collection(db, "instructorAvailability"),
            where("instructorId", "==", instructorId),
            where("date", ">=", Timestamp.fromDate(startDate)),
            where("date", "<=", Timestamp.fromDate(endDate)),
            where("isBooked", "==", false)
        )

        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date(),
        } as AvailabilitySlot))
    } catch (error) {
        console.error("[PrivateBookingService] getInstructorAvailability error:", error)
        return []
    }
}

/**
 * Set instructor availability
 */
export async function setInstructorAvailability(
    instructorId: string,
    slots: Omit<AvailabilitySlot, "id">[]
): Promise<boolean> {
    if (!db) return false

    try {
        const { collection, addDoc, Timestamp, writeBatch, doc } = await import("firebase/firestore")
        const batch = writeBatch(db)

        for (const slot of slots) {
            const newDoc = doc(collection(db, "instructorAvailability"))
            batch.set(newDoc, {
                ...slot,
                instructorId,
                date: Timestamp.fromDate(slot.date),
                isBooked: false,
                createdAt: Timestamp.now(),
            })
        }

        await batch.commit()
        console.log(`[PrivateBookingService] Set ${slots.length} availability slots`)
        return true
    } catch (error) {
        console.error("[PrivateBookingService] setInstructorAvailability error:", error)
        return false
    }
}

/**
 * Remove availability slot
 */
export async function removeAvailabilitySlot(slotId: string): Promise<boolean> {
    if (!db) return false

    try {
        const { doc, deleteDoc, getDoc } = await import("firebase/firestore")

        const slotRef = doc(db, "instructorAvailability", slotId)
        const slotDoc = await getDoc(slotRef)

        if (!slotDoc.exists() || slotDoc.data().isBooked) {
            return false // Can't delete booked slots
        }

        await deleteDoc(slotRef)
        return true
    } catch (error) {
        console.error("[PrivateBookingService] removeAvailabilitySlot error:", error)
        return false
    }
}

// ============================================
// BOOKING CREATION
// ============================================

/**
 * Create a private session booking
 * Returns payment intent for client to complete payment
 */
export async function createPrivateBooking(
    params: CreateBookingParams
): Promise<BookingResult> {
    if (!db) {
        return { success: false, message: "Database not available" }
    }

    try {
        const { collection, addDoc, doc, getDoc, updateDoc, Timestamp } = await import("firebase/firestore")

        // Verify the slot is still available
        const slotRef = doc(db, "instructorAvailability", params.slotId)
        const slotDoc = await getDoc(slotRef)

        if (!slotDoc.exists()) {
            return { success: false, message: "This time slot is no longer available" }
        }

        if (slotDoc.data().isBooked) {
            return { success: false, message: "This slot has already been booked" }
        }

        // Get instructor for Stripe account
        const instructorRef = doc(db, "instructors", params.instructorId)
        const instructorDoc = await getDoc(instructorRef)

        if (!instructorDoc.exists()) {
            return { success: false, message: "Instructor not found" }
        }

        const instructor = instructorDoc.data() as Instructor

        if (!instructor.stripeAccountId) {
            return { success: false, message: "Instructor hasn't set up payments yet" }
        }

        // Calculate fees dynamically based on client-trainer relationship
        const feeCalc = params.preCalculatedFees || await calculateBookingFees(
            params.instructorId,
            params.clientId,
            params.price
        )

        const platformFee = feeCalc.platformFeeAmount
        const bookingFee = feeCalc.playerBookingFee
        const instructorPayout = feeCalc.trainerPayout
        const totalCharge = feeCalc.totalCharge

        // Create payment intent with Stripe Connect
        const { getFunctions, httpsCallable } = await import("firebase/functions")
        const { app } = await import("@/lib/firebase-config")

        if (!app) {
            return { success: false, message: "Firebase not configured" }
        }

        const functions = getFunctions(app)
        const createPaymentForPrivateSession = httpsCallable(functions, "createPaymentForPrivateSession")

        const paymentResult = await createPaymentForPrivateSession({
            amount: totalCharge,  // Total including booking fee
            sessionPrice: params.price,
            bookingFee: bookingFee,
            instructorStripeAccountId: instructor.stripeAccountId,
            platformFee,
            metadata: {
                instructorId: params.instructorId,
                clientId: params.clientId,
                duration: params.duration,
                feeType: feeCalc.feeType,
                platformFeePercent: feeCalc.platformFeePercent,
            },
        })

        const { clientSecret, paymentIntentId } = paymentResult.data as {
            clientSecret: string
            paymentIntentId: string
        }

        // Create pending booking
        const bookingRef = await addDoc(collection(db, "privateBookings"), {
            instructorId: params.instructorId,
            clientId: params.clientId,
            clientName: params.clientName,
            clientEmail: params.clientEmail,

            startTime: Timestamp.fromDate(params.startTime),
            duration: params.duration,

            locationType: params.locationType,
            locationAddress: params.locationAddress || null,
            notes: params.notes || null,

            // Pricing - session price (what trainer charges)
            sessionPrice: params.price,

            // Fees - dynamic based on client relationship
            clientSource: feeCalc.feeType,  // "existing" | "marketplace" | "repeat"
            platformFeePercent: feeCalc.platformFeePercent,
            platformFee,
            playerBookingFee: bookingFee,

            // Payouts
            totalCharge,  // What player pays
            instructorPayout,  // What trainer receives

            paymentIntentId,
            paymentStatus: "pending",

            status: "pending_payment",
            createdAt: Timestamp.now(),
        })

        // Record the client relationship for future bookings
        if (feeCalc.feeType === "marketplace") {
            await recordMarketplaceBooking(
                params.instructorId,
                params.clientId,
                bookingRef.id,
                params.clientEmail,
                params.clientName
            )
        }

        // Mark slot as booked (pending)
        await updateDoc(slotRef, {
            isBooked: true,
            bookingId: bookingRef.id,
        })

        console.log(`[PrivateBookingService] Created booking ${bookingRef.id}`)

        return {
            success: true,
            bookingId: bookingRef.id,
            paymentIntentClientSecret: clientSecret,
            message: "Booking created! Complete payment to confirm.",
            feeCalculation: feeCalc,
        }
    } catch (error: any) {
        console.error("[PrivateBookingService] createPrivateBooking error:", error)
        return { success: false, message: error.message || "Failed to create booking" }
    }
}

/**
 * Confirm booking after payment success
 */
export async function confirmBookingPayment(bookingId: string): Promise<boolean> {
    if (!db) return false

    try {
        const { doc, updateDoc, Timestamp, getDoc } = await import("firebase/firestore")

        const bookingRef = doc(db, "privateBookings", bookingId)
        await updateDoc(bookingRef, {
            paymentStatus: "paid",
            status: "confirmed",
            confirmedAt: Timestamp.now(),
        })

        // Get booking to send notifications
        const bookingDoc = await getDoc(bookingRef)
        if (bookingDoc.exists()) {
            const booking = bookingDoc.data()

            // Notify instructor
            await sendBookingNotification(booking.instructorId, "instructor", bookingId)

            // Notify client
            await sendBookingNotification(booking.clientId, "client", bookingId)

            // If this was a marketplace booking, mark client as repeat for future bookings
            // This enables the 5% rate instead of 15% for subsequent bookings
            if (booking.clientSource === "marketplace") {
                await markAsRepeatClient(booking.instructorId, booking.clientId)
                console.log(`[PrivateBookingService] Marked ${booking.clientId} as repeat client for ${booking.instructorId}`)
            }
        }

        console.log(`[PrivateBookingService] Confirmed booking ${bookingId}`)
        return true
    } catch (error) {
        console.error("[PrivateBookingService] confirmBookingPayment error:", error)
        return false
    }
}

// ============================================
// CANCELLATION
// ============================================

/**
 * Cancel a booking
 */
export async function cancelBooking(
    bookingId: string,
    cancelledBy: "client" | "instructor",
    reason?: string
): Promise<{ success: boolean; refundAmount?: number; message: string }> {
    if (!db) {
        return { success: false, message: "Database not available" }
    }

    try {
        const { doc, getDoc, updateDoc, Timestamp } = await import("firebase/firestore")

        const bookingRef = doc(db, "privateBookings", bookingId)
        const bookingDoc = await getDoc(bookingRef)

        if (!bookingDoc.exists()) {
            return { success: false, message: "Booking not found" }
        }

        const booking = bookingDoc.data() as PrivateBooking

        if (booking.status === "cancelled") {
            return { success: false, message: "Booking already cancelled" }
        }

        if (booking.status === "completed") {
            return { success: false, message: "Cannot cancel completed booking" }
        }

        // Calculate refund based on cancellation policy
        const startTime = booking.startTime instanceof Date
            ? booking.startTime
            : (booking.startTime as any)?.toDate?.()

        const hoursUntilSession = (startTime.getTime() - Date.now()) / (1000 * 60 * 60)

        // For now, use simple refund logic
        // Could enhance with instructor's cancellation policy
        let refundPercent = 0
        let refundAmount = 0

        if (cancelledBy === "instructor") {
            // Instructor cancels = full refund to client
            refundPercent = 100
        } else if (hoursUntilSession >= 24) {
            // Client cancels 24+ hours before = full refund
            refundPercent = 100
        } else if (hoursUntilSession >= 12) {
            // Client cancels 12-24 hours before = 50% refund
            refundPercent = 50
        } else {
            // Client cancels <12 hours before = no refund
            refundPercent = 0
        }

        refundAmount = Math.round(booking.price * (refundPercent / 100))

        // Process refund via Stripe (Cloud Function)
        if (refundAmount > 0 && booking.paymentIntentId) {
            const { getFunctions, httpsCallable } = await import("firebase/functions")
            const { app } = await import("@/lib/firebase-config")

            if (app) {
                const functions = getFunctions(app)
                const processRefund = httpsCallable(functions, "processPrivateSessionRefund")
                await processRefund({
                    paymentIntentId: booking.paymentIntentId,
                    refundAmount,
                })
            }
        }

        // Update booking
        await updateDoc(bookingRef, {
            status: "cancelled",
            cancelledAt: Timestamp.now(),
            cancelledBy,
            cancellationReason: reason || null,
            refundAmount,
            refundPercent,
        })

        // Free up the availability slot
        const { collection, query, where, getDocs } = await import("firebase/firestore")
        const slotQuery = query(
            collection(db, "instructorAvailability"),
            where("bookingId", "==", bookingId)
        )
        const slotSnapshot = await getDocs(slotQuery)

        for (const slotDoc of slotSnapshot.docs) {
            await updateDoc(slotDoc.ref, {
                isBooked: false,
                bookingId: null,
            })
        }

        console.log(`[PrivateBookingService] Cancelled booking ${bookingId}, refund: ${refundAmount}`)

        return {
            success: true,
            refundAmount,
            message: refundAmount > 0
                ? `Cancelled. $${(refundAmount / 100).toFixed(2)} will be refunded.`
                : "Cancelled. No refund due to late cancellation.",
        }
    } catch (error: any) {
        console.error("[PrivateBookingService] cancelBooking error:", error)
        return { success: false, message: error.message || "Failed to cancel" }
    }
}

// ============================================
// QUERIES
// ============================================

/**
 * Get client's bookings
 */
export async function getClientBookings(
    clientId: string,
    status?: PrivateBooking["status"]
): Promise<PrivateBooking[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

        const constraints: any[] = [
            where("clientId", "==", clientId),
            orderBy("startTime", "desc"),
        ]

        if (status) {
            constraints.push(where("status", "==", status))
        }

        const q = query(collection(db, "privateBookings"), ...constraints)
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as PrivateBooking))
    } catch (error) {
        console.error("[PrivateBookingService] getClientBookings error:", error)
        return []
    }
}

/**
 * Get instructor's bookings
 */
export async function getInstructorBookings(
    instructorId: string,
    status?: PrivateBooking["status"]
): Promise<PrivateBooking[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

        const constraints: any[] = [
            where("instructorId", "==", instructorId),
            orderBy("startTime", "desc"),
        ]

        if (status) {
            constraints.push(where("status", "==", status))
        }

        const q = query(collection(db, "privateBookings"), ...constraints)
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as PrivateBooking))
    } catch (error) {
        console.error("[PrivateBookingService] getInstructorBookings error:", error)
        return []
    }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<PrivateBooking | null> {
    if (!db) return null

    try {
        const { doc, getDoc } = await import("firebase/firestore")

        const bookingDoc = await getDoc(doc(db, "privateBookings", bookingId))

        if (!bookingDoc.exists()) return null

        return {
            id: bookingDoc.id,
            ...bookingDoc.data(),
            startTime: bookingDoc.data().startTime?.toDate() || new Date(),
            createdAt: bookingDoc.data().createdAt?.toDate() || new Date(),
        } as PrivateBooking
    } catch (error) {
        console.error("[PrivateBookingService] getBookingById error:", error)
        return null
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

async function sendBookingNotification(
    userId: string,
    userType: "client" | "instructor",
    bookingId: string
): Promise<void> {
    try {
        const { NotificationService } = await import("@/lib/notification-service")
        const notificationService = NotificationService.getInstance()

        const title = userType === "instructor"
            ? "New Booking! 🎉"
            : "Booking Confirmed! ✓"

        const body = userType === "instructor"
            ? "You have a new private session booking!"
            : "Your private session is confirmed."

        await notificationService.sendLocalNotification({
            type: "booking_confirmed",
            title,
            body,
        })
    } catch (error) {
        console.error("[PrivateBookingService] sendBookingNotification error:", error)
    }
}

// ============================================
// INSTRUCTOR EARNINGS
// ============================================

/**
 * Get instructor's earnings summary
 */
export async function getInstructorEarnings(instructorId: string): Promise<{
    totalEarnings: number
    pendingPayouts: number
    completedPayouts: number
    bookingsCount: number
}> {
    if (!db) {
        return { totalEarnings: 0, pendingPayouts: 0, completedPayouts: 0, bookingsCount: 0 }
    }

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "privateBookings"),
            where("instructorId", "==", instructorId),
            where("paymentStatus", "==", "paid")
        )

        const snapshot = await getDocs(q)

        let totalEarnings = 0
        let pendingPayouts = 0
        let completedPayouts = 0

        snapshot.docs.forEach(doc => {
            const booking = doc.data()
            totalEarnings += booking.instructorPayout || 0

            if (booking.payoutStatus === "paid") {
                completedPayouts += booking.instructorPayout || 0
            } else {
                pendingPayouts += booking.instructorPayout || 0
            }
        })

        return {
            totalEarnings,
            pendingPayouts,
            completedPayouts,
            bookingsCount: snapshot.size,
        }
    } catch (error) {
        console.error("[PrivateBookingService] getInstructorEarnings error:", error)
        return { totalEarnings: 0, pendingPayouts: 0, completedPayouts: 0, bookingsCount: 0 }
    }
}
