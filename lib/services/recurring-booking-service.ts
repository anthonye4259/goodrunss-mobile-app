/**
 * Recurring Booking Service
 * Allows players to set up weekly or biweekly standing reservations
 */

import { db } from "../firebase-config"
import { courtBookingService } from "./court-booking-service"

const RECURRING_BOOKINGS_COLLECTION = "recurring_bookings"

export type RecurringFrequency = "weekly" | "biweekly"

export interface RecurringBooking {
    id: string

    // What's being booked
    courtId: string
    facilityId: string
    venueId: string
    courtName?: string
    venueName?: string

    // Who
    userId: string
    userName: string
    userEmail?: string

    // Schedule
    dayOfWeek: number // 0-6 (Sunday-Saturday)
    time: string // "09:00"
    durationMinutes: number
    frequency: RecurringFrequency

    // Pricing
    hourlyRate: number // Stored from first booking

    // Status
    status: "active" | "paused" | "cancelled"
    totalBookingsCreated: number

    // Date range
    startDate: string // First occurrence
    endDate?: string // Optional end date

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

export const recurringBookingService = {
    /**
     * Create a recurring booking
     */
    async createRecurring(data: {
        courtId: string
        facilityId: string
        venueId: string
        courtName?: string
        venueName?: string
        userId: string
        userName: string
        userEmail?: string
        dayOfWeek: number
        time: string
        durationMinutes: number
        frequency: RecurringFrequency
        hourlyRate: number
        startDate: string
        weeksToBook?: number // Default 4 weeks
    }): Promise<string | null> {
        if (!db) return null

        try {
            const recurringData: Omit<RecurringBooking, "id"> = {
                courtId: data.courtId,
                facilityId: data.facilityId,
                venueId: data.venueId,
                courtName: data.courtName,
                venueName: data.venueName,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                dayOfWeek: data.dayOfWeek,
                time: data.time,
                durationMinutes: data.durationMinutes,
                frequency: data.frequency,
                hourlyRate: data.hourlyRate,
                status: "active",
                totalBookingsCreated: 0,
                startDate: data.startDate,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(RECURRING_BOOKINGS_COLLECTION).add(recurringData)

            // Create the first batch of bookings
            const weeksToBook = data.weeksToBook || 4
            await this.generateBookings(docRef.id, weeksToBook)

            return docRef.id
        } catch (error) {
            console.error("Error creating recurring booking:", error)
            return null
        }
    },

    /**
     * Generate individual bookings from recurring template
     */
    async generateBookings(recurringId: string, weeks: number): Promise<number> {
        if (!db) return 0

        try {
            const doc = await db.collection(RECURRING_BOOKINGS_COLLECTION).doc(recurringId).get()
            if (!doc.exists) return 0

            const recurring = doc.data() as RecurringBooking
            if (recurring.status !== "active") return 0

            const startDate = new Date(recurring.startDate)
            const bookingsCreated: string[] = []
            const interval = recurring.frequency === "weekly" ? 7 : 14

            for (let i = 0; i < weeks; i++) {
                const bookingDate = new Date(startDate)
                bookingDate.setDate(bookingDate.getDate() + (i * interval))

                // Skip if end date is set and we've passed it
                if (recurring.endDate && bookingDate.toISOString().split("T")[0] > recurring.endDate) {
                    break
                }

                const dateStr = bookingDate.toISOString().split("T")[0]
                const endHour = parseInt(recurring.time.split(":")[0]) + Math.ceil(recurring.durationMinutes / 60)
                const endTime = `${endHour.toString().padStart(2, "0")}:00`

                // Calculate pricing
                const pricing = courtBookingService.calculatePricing(
                    recurring.hourlyRate,
                    recurring.durationMinutes
                )

                // Create booking (will fail silently if slot not available)
                const bookingId = await courtBookingService.createBooking({
                    courtId: recurring.courtId,
                    facilityId: recurring.facilityId,
                    venueId: recurring.venueId,
                    userId: recurring.userId,
                    userName: recurring.userName,
                    userEmail: recurring.userEmail,
                    date: dateStr,
                    startTime: recurring.time,
                    endTime,
                    durationMinutes: recurring.durationMinutes,
                    courtRate: pricing.courtRate,
                    playerFee: pricing.playerFee,
                    facilityTakeRate: pricing.facilityTakeAmount / pricing.courtRate,
                    facilityPayout: pricing.facilityPayout,
                    totalCharged: pricing.totalCharged,
                })

                if (bookingId) {
                    bookingsCreated.push(bookingId)
                }
            }

            // Update recurring with new count
            await doc.ref.update({
                totalBookingsCreated: (recurring.totalBookingsCreated || 0) + bookingsCreated.length,
                updatedAt: new Date(),
            })

            return bookingsCreated.length
        } catch (error) {
            console.error("Error generating recurring bookings:", error)
            return 0
        }
    },

    /**
     * Get user's recurring bookings
     */
    async getUserRecurringBookings(userId: string): Promise<RecurringBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(RECURRING_BOOKINGS_COLLECTION)
                .where("userId", "==", userId)
                .where("status", "in", ["active", "paused"])
                .orderBy("createdAt", "desc")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as RecurringBooking[]
        } catch (error) {
            console.error("Error getting recurring bookings:", error)
            return []
        }
    },

    /**
     * Pause recurring booking
     */
    async pauseRecurring(recurringId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(RECURRING_BOOKINGS_COLLECTION).doc(recurringId)
            const doc = await docRef.get()

            if (!doc.exists || doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "paused",
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error pausing recurring:", error)
            return false
        }
    },

    /**
     * Resume recurring booking
     */
    async resumeRecurring(recurringId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(RECURRING_BOOKINGS_COLLECTION).doc(recurringId)
            const doc = await docRef.get()

            if (!doc.exists || doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "active",
                updatedAt: new Date(),
            })

            // Generate next 4 weeks of bookings
            await this.generateBookings(recurringId, 4)

            return true
        } catch (error) {
            console.error("Error resuming recurring:", error)
            return false
        }
    },

    /**
     * Cancel recurring booking
     */
    async cancelRecurring(recurringId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(RECURRING_BOOKINGS_COLLECTION).doc(recurringId)
            const doc = await docRef.get()

            if (!doc.exists || doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "cancelled",
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error cancelling recurring:", error)
            return false
        }
    },

    /**
     * Get day name from number
     */
    getDayName(dayOfWeek: number): string {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return days[dayOfWeek] || ""
    },

    /**
     * Format frequency display
     */
    formatFrequency(frequency: RecurringFrequency): string {
        return frequency === "weekly" ? "Every week" : "Every 2 weeks"
    },
}

export default recurringBookingService
