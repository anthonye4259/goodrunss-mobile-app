/**
 * Trainer Rental Service
 * Allows trainers/instructors to rent facilities for client sessions
 * 
 * Racquet Trainers → Rent courts (hourly) for tennis/pickleball lessons
 * Wellness Instructors → Rent studios (hourly) for private yoga/pilates
 */

import { db } from "../firebase-config"
import { getBookableCategory } from "../launch-cities"

const RENTALS_COLLECTION = "trainer_rentals"

// Same fee structure as regular bookings
export const TRAINER_BOOKING_FEE = 300 // $3.00
export const TRAINER_TAKE_RATE = 0.08 // 8%

/**
 * Types of professional renters
 */
export type RenterType = "trainer" | "instructor"

/**
 * What they're renting
 */
export type RentalType = "court" | "studio"

/**
 * Trainer/Instructor facility rental
 */
export interface TrainerRental {
    id: string

    // Who is renting
    trainerId: string
    trainerName: string
    trainerEmail?: string
    renterType: RenterType // "trainer" for racquet, "instructor" for wellness

    // What they're renting
    facilityId: string
    venueId: string
    venueName: string
    rentalType: RentalType // "court" for racquet, "studio" for wellness
    courtOrStudioId: string
    courtOrStudioName: string

    // When
    date: string // "2025-12-25"
    startTime: string // "09:00"
    endTime: string // "10:00"
    duration: number // minutes

    // Pricing (in cents)
    hourlyRate: number // facility's hourly rate
    totalAmount: number // hourlyRate * hours
    bookingFee: number // $3 GoodRunss fee
    totalCharged: number // totalAmount + bookingFee
    takeAmount: number // 8% of totalAmount
    facilityPayout: number // 92% of totalAmount

    // Payment
    stripePaymentIntentId?: string
    paymentStatus: "pending" | "paid" | "failed" | "refunded"

    // Status
    status: "confirmed" | "cancelled" | "completed" | "no-show"

    // Purpose (optional note about what they're using it for)
    purpose?: string

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

/**
 * Get renter type based on sport category
 */
export function getRenterType(sport?: string): RenterType {
    const category = getBookableCategory(sport)
    return category === "wellness" ? "instructor" : "trainer"
}

/**
 * Get rental type based on sport category
 */
export function getRentalType(sport?: string): RentalType {
    const category = getBookableCategory(sport)
    return category === "wellness" ? "studio" : "court"
}

export const trainerRentalService = {
    /**
     * Calculate pricing for trainer rental
     */
    calculatePricing(hourlyRate: number, durationMinutes: number): {
        hourlyRate: number
        totalAmount: number
        bookingFee: number
        takeAmount: number
        facilityPayout: number
        totalCharged: number
    } {
        const hours = durationMinutes / 60
        const totalAmount = Math.round(hourlyRate * hours)
        const bookingFee = TRAINER_BOOKING_FEE
        const takeAmount = Math.round(totalAmount * TRAINER_TAKE_RATE)
        const facilityPayout = totalAmount - takeAmount
        const totalCharged = totalAmount + bookingFee

        return {
            hourlyRate,
            totalAmount,
            bookingFee,
            takeAmount,
            facilityPayout,
            totalCharged,
        }
    },

    /**
     * Create a trainer rental
     */
    async createRental(
        rentalData: Omit<TrainerRental, "id" | "totalAmount" | "takeAmount" | "facilityPayout" | "totalCharged" | "createdAt" | "updatedAt">
    ): Promise<string | null> {
        if (!db) return null

        try {
            // Check for conflicts
            const conflictQuery = db.collection(RENTALS_COLLECTION)
                .where("courtOrStudioId", "==", rentalData.courtOrStudioId)
                .where("date", "==", rentalData.date)
                .where("status", "in", ["confirmed", "completed"])

            const conflicts = await conflictQuery.get()

            // Check time overlap
            for (const doc of conflicts.docs) {
                const existing = doc.data()
                const newStart = parseInt(rentalData.startTime.replace(":", ""))
                const newEnd = parseInt(rentalData.endTime.replace(":", ""))
                const existingStart = parseInt(existing.startTime.replace(":", ""))
                const existingEnd = parseInt(existing.endTime.replace(":", ""))

                if (newStart < existingEnd && newEnd > existingStart) {
                    console.warn("Time slot conflict")
                    return null
                }
            }

            // Calculate pricing
            const pricing = this.calculatePricing(rentalData.hourlyRate, rentalData.duration)

            const rental: Omit<TrainerRental, "id"> = {
                ...rentalData,
                totalAmount: pricing.totalAmount,
                takeAmount: pricing.takeAmount,
                facilityPayout: pricing.facilityPayout,
                totalCharged: pricing.totalCharged,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(RENTALS_COLLECTION).add(rental)
            return docRef.id
        } catch (error) {
            console.error("Error creating trainer rental:", error)
            return null
        }
    },

    /**
     * Get trainer's upcoming rentals
     */
    async getTrainerRentals(trainerId: string): Promise<TrainerRental[]> {
        if (!db) return []

        try {
            const today = new Date().toISOString().split("T")[0]

            const query = db.collection(RENTALS_COLLECTION)
                .where("trainerId", "==", trainerId)
                .where("date", ">=", today)
                .orderBy("date")
                .orderBy("startTime")
                .limit(50)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as TrainerRental[]
        } catch (error) {
            console.error("Error getting trainer rentals:", error)
            return []
        }
    },

    /**
     * Get trainer's all rentals (including past)
     */
    async getTrainerAllRentals(trainerId: string): Promise<TrainerRental[]> {
        if (!db) return []

        try {
            const query = db.collection(RENTALS_COLLECTION)
                .where("trainerId", "==", trainerId)
                .orderBy("date", "desc")
                .limit(100)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as TrainerRental[]
        } catch (error) {
            console.error("Error getting all trainer rentals:", error)
            return []
        }
    },

    /**
     * Get facility's trainer rentals
     */
    async getFacilityTrainerRentals(facilityId: string): Promise<TrainerRental[]> {
        if (!db) return []

        try {
            const query = db.collection(RENTALS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .orderBy("date", "desc")
                .limit(100)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as TrainerRental[]
        } catch (error) {
            console.error("Error getting facility trainer rentals:", error)
            return []
        }
    },

    /**
     * Cancel a rental
     */
    async cancelRental(rentalId: string, trainerId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(RENTALS_COLLECTION).doc(rentalId)
            const doc = await docRef.get()

            if (!doc.exists) return false
            if (doc.data()?.trainerId !== trainerId) return false

            await docRef.update({
                status: "cancelled",
                paymentStatus: "refunded",
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error cancelling rental:", error)
            return false
        }
    },

    /**
     * Mark rental as completed
     */
    async completeRental(rentalId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(RENTALS_COLLECTION).doc(rentalId).update({
                status: "completed",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error completing rental:", error)
            return false
        }
    },

    /**
     * Get rentals for a specific court/studio on a date (for availability checking)
     */
    async getRentalsForDate(courtOrStudioId: string, date: string): Promise<TrainerRental[]> {
        if (!db) return []

        try {
            const query = db.collection(RENTALS_COLLECTION)
                .where("courtOrStudioId", "==", courtOrStudioId)
                .where("date", "==", date)
                .where("status", "in", ["confirmed", "completed"])

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as TrainerRental[]
        } catch (error) {
            console.error("Error getting rentals for date:", error)
            return []
        }
    },
}

export default trainerRentalService
