/**
 * Court Booking Service
 * Handles court reservations, payments, and availability
 */

import { db } from "../firebase-config"

// Booking fee charged to players (in cents)
export const PLAYER_BOOKING_FEE = 300 // $3.00

// Default facility take rate
export const DEFAULT_FACILITY_TAKE_RATE = 0.08 // 8%

const BOOKINGS_COLLECTION = "court_bookings"
const AVAILABILITY_COLLECTION = "court_availability"

export interface CourtBooking {
    id: string

    // References
    courtId: string
    facilityId: string
    venueId: string
    userId: string

    // Booking details
    date: string // "2025-12-25"
    startTime: string // "09:00"
    endTime: string // "10:00"
    durationMinutes: number

    // User info
    userName: string
    userEmail?: string
    userPhone?: string

    // Pricing (all in cents)
    courtRate: number // Facility's hourly rate
    playerFee: number // $3 booking fee
    facilityTakeRate: number // % we keep from court rate
    facilityPayout: number // What facility receives
    totalCharged: number // What player paid

    // Payment
    stripePaymentIntentId?: string
    paymentStatus: "pending" | "paid" | "failed" | "refunded"

    // Status
    status: "confirmed" | "cancelled" | "completed" | "no-show"

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

export interface AvailableSlot {
    courtId: string
    courtName: string
    startTime: string
    endTime: string
    hourlyRate: number // In cents
    isAvailable: boolean
}

export const courtBookingService = {
    /**
     * Calculate pricing breakdown for a booking
     */
    calculatePricing(
        hourlyRate: number, // In cents
        durationMinutes: number,
        takeRatePercent: number = DEFAULT_FACILITY_TAKE_RATE
    ): {
        courtRate: number
        playerFee: number
        facilityTakeAmount: number
        facilityPayout: number
        totalCharged: number
    } {
        const hours = durationMinutes / 60
        const courtRate = Math.round(hourlyRate * hours)
        const playerFee = PLAYER_BOOKING_FEE
        const facilityTakeAmount = Math.round(courtRate * takeRatePercent)
        const facilityPayout = courtRate - facilityTakeAmount
        const totalCharged = courtRate + playerFee

        return {
            courtRate,
            playerFee,
            facilityTakeAmount,
            facilityPayout,
            totalCharged,
        }
    },

    /**
     * Get available time slots for a court on a date
     * Respects operating hours and blocked dates
     */
    async getAvailableSlots(
        courtId: string,
        date: string,
        options?: {
            operatingHours?: {
                [day: string]: { open: string; close: string; closed: boolean }
            }
            blockedDates?: string[]
            hourlyRate?: number
            courtName?: string
        }
    ): Promise<AvailableSlot[]> {
        if (!db) return []

        try {
            // Check if date is blocked
            if (options?.blockedDates?.includes(date)) {
                return [] // Facility closed this day
            }

            // Get day of week for operating hours
            const dateObj = new Date(date + "T12:00:00")
            const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
            const dayOfWeek = dayNames[dateObj.getDay()]

            // Check if facility is open this day
            const dayHours = options?.operatingHours?.[dayOfWeek]
            if (dayHours?.closed) {
                return [] // Facility closed this day
            }

            // Determine start and end hours
            let startHour = 6  // Default 6am
            let endHour = 22   // Default 10pm

            if (dayHours) {
                startHour = parseInt(dayHours.open.split(":")[0])
                endHour = parseInt(dayHours.close.split(":")[0])
            }

            // Get existing bookings for this court on this date
            const bookingsQuery = db.collection(BOOKINGS_COLLECTION)
                .where("courtId", "==", courtId)
                .where("date", "==", date)
                .where("status", "in", ["confirmed", "completed"])

            const bookingsSnapshot = await bookingsQuery.get()
            const bookedSlots = bookingsSnapshot.docs.map(doc => ({
                startTime: doc.data().startTime,
                endTime: doc.data().endTime,
            }))

            // Also check trainer rentals
            const rentalsSnapshot = await db.collection("trainer_rentals")
                .where("courtOrStudioId", "==", courtId)
                .where("date", "==", date)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            rentalsSnapshot.docs.forEach(doc => {
                bookedSlots.push({
                    startTime: doc.data().startTime,
                    endTime: doc.data().endTime,
                })
            })

            // Generate hourly slots only during operating hours
            const slots: AvailableSlot[] = []
            for (let hour = startHour; hour < endHour; hour++) {
                const startTime = `${hour.toString().padStart(2, "0")}:00`
                const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`

                // Check if this slot overlaps with any booking
                const isBooked = bookedSlots.some(slot => {
                    const slotStart = parseInt(slot.startTime.replace(":", ""))
                    const slotEnd = parseInt(slot.endTime.replace(":", ""))
                    const checkStart = hour * 100
                    const checkEnd = (hour + 1) * 100
                    return checkStart < slotEnd && checkEnd > slotStart
                })

                slots.push({
                    courtId,
                    courtName: options?.courtName || "",
                    startTime,
                    endTime,
                    hourlyRate: options?.hourlyRate || 0,
                    isAvailable: !isBooked,
                })
            }

            return slots
        } catch (error) {
            console.error("Error getting available slots:", error)
            return []
        }
    },

    /**
     * Create a court booking
     */
    async createBooking(
        bookingData: {
            courtId: string
            facilityId: string
            venueId: string
            userId: string
            userName: string
            userEmail?: string
            userPhone?: string
            date: string
            startTime: string
            endTime: string
            durationMinutes: number
            courtRate: number
            playerFee: number
            facilityTakeRate: number
            facilityPayout: number
            totalCharged: number
            stripePaymentIntentId?: string
        }
    ): Promise<string | null> {
        if (!db) return null

        try {
            // Check for double booking
            const existingQuery = db.collection(BOOKINGS_COLLECTION)
                .where("courtId", "==", bookingData.courtId)
                .where("date", "==", bookingData.date)
                .where("startTime", "==", bookingData.startTime)
                .where("status", "==", "confirmed")
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) {
                console.warn("Slot already booked")
                return null
            }

            const booking: Omit<CourtBooking, "id"> = {
                ...bookingData,
                paymentStatus: bookingData.stripePaymentIntentId ? "paid" : "pending",
                status: "confirmed",
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(BOOKINGS_COLLECTION).add(booking)
            return docRef.id
        } catch (error) {
            console.error("Error creating booking:", error)
            return null
        }
    },

    /**
     * Get bookings for a player
     */
    async getPlayerBookings(userId: string): Promise<CourtBooking[]> {
        if (!db) return []

        try {
            // First try with orderBy (requires composite index)
            let snapshot
            try {
                const query = db.collection(BOOKINGS_COLLECTION)
                    .where("userId", "==", userId)
                    .orderBy("date", "desc")
                    .limit(50)
                snapshot = await query.get()
            } catch (indexError: any) {
                // Fallback if index doesn't exist - query without ordering
                console.log("Falling back to unordered query:", indexError.message)
                const fallbackQuery = db.collection(BOOKINGS_COLLECTION)
                    .where("userId", "==", userId)
                    .limit(50)
                snapshot = await fallbackQuery.get()
            }

            const bookings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as CourtBooking[]

            // Sort in memory if we used fallback
            return bookings.sort((a, b) => b.date.localeCompare(a.date))
        } catch (error) {
            console.error("Error getting player bookings:", error)
            return []
        }
    },

    /**
     * Get bookings for a facility
     */
    async getFacilityBookings(facilityId: string): Promise<CourtBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .orderBy("date", "desc")
                .limit(100)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as CourtBooking[]
        } catch (error) {
            console.error("Error getting facility bookings:", error)
            return []
        }
    },

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(BOOKINGS_COLLECTION).doc(bookingId)
            const doc = await docRef.get()

            if (!doc.exists) return false
            if (doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "cancelled",
                paymentStatus: "refunded", // Would trigger actual refund in production
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error cancelling booking:", error)
            return false
        }
    },

    /**
     * Mark booking as completed
     */
    async completeBooking(bookingId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(BOOKINGS_COLLECTION).doc(bookingId).update({
                status: "completed",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error completing booking:", error)
            return false
        }
    },

    /**
     * Get upcoming bookings for a court on a date
     */
    async getCourtBookings(courtId: string, date: string): Promise<CourtBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(BOOKINGS_COLLECTION)
                .where("courtId", "==", courtId)
                .where("date", "==", date)
                .where("status", "==", "confirmed")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as CourtBooking[]
        } catch (error) {
            console.error("Error getting court bookings:", error)
            return []
        }
    },

    /**
     * Mark a booking as no-show (for facility owners)
     */
    async markNoShow(bookingId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(BOOKINGS_COLLECTION).doc(bookingId).update({
                status: "no-show",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error marking no-show:", error)
            return false
        }
    },

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<CourtBooking | null> {
        if (!db) return null

        try {
            const doc = await db.collection(BOOKINGS_COLLECTION).doc(bookingId).get()
            if (!doc.exists) return null

            return {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data()?.createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data()?.updatedAt?.toDate?.() || new Date(),
            } as CourtBooking
        } catch (error) {
            console.error("Error getting booking:", error)
            return null
        }
    },

    /**
     * Get all bookings for a player
     */
    async getPlayerBookings(userId: string): Promise<CourtBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(BOOKINGS_COLLECTION)
                .where("userId", "==", userId)
                .orderBy("date", "desc")
                .limit(100)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as CourtBooking[]
        } catch (error) {
            console.error("Error getting player bookings:", error)
            return []
        }
    },

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(BOOKINGS_COLLECTION).doc(bookingId)
            const doc = await docRef.get()

            if (!doc.exists) return false
            if (doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "cancelled",
                paymentStatus: "refunded",
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error cancelling booking:", error)
            return false
        }
    },
}

export default courtBookingService
