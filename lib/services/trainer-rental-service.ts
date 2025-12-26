/**
 * Trainer Rental Service
 * 
 * Manages trainer-related space/court rentals.
 * Used by players to book trainer spaces or for trainers to list rentals.
 */

import { db } from "@/lib/firebase-config"
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

// ============================================
// CONSTANTS
// ============================================

export const TRAINER_BOOKING_FEE = 500 // $5.00 in cents

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRenterType(sport: string): "trainer" | "instructor" {
    const studioSports = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
    return studioSports.includes(sport) ? "instructor" : "trainer"
}

export function getRentalType(sport: string): "court" | "studio" {
    const studioSports = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
    return studioSports.includes(sport) ? "studio" : "court"
}

// ============================================
// TYPES
// ============================================

export interface TrainerRental {
    id: string
    trainerId?: string
    trainerName?: string
    trainerEmail?: string
    playerId?: string
    renterType?: "trainer" | "instructor"
    facilityId?: string
    venueId?: string
    venueName?: string
    rentalType?: "court" | "studio"
    type: "equipment" | "space" | "court" | "studio"
    name: string
    description?: string
    hourlyRate?: number // in cents
    dailyRate?: number
    bookingFee?: number
    available?: boolean
    location?: string
    imageUrl?: string
    // For bookings (player's view)
    date?: string
    startTime?: string
    endTime?: string
    duration?: number
    courtOrStudioId?: string
    courtOrStudioName?: string
    status?: "confirmed" | "cancelled" | "pending" | "completed"
    paymentStatus?: "pending" | "paid" | "refunded"
    purpose?: string
    totalCharged?: number
    createdAt?: string
}

export interface CreateRentalParams {
    trainerId: string
    trainerName: string
    trainerEmail?: string
    renterType: "trainer" | "instructor"
    facilityId: string
    venueId: string
    venueName: string
    rentalType: "court" | "studio"
    courtOrStudioId: string
    courtOrStudioName: string
    date: string
    startTime: string
    endTime: string
    duration: number
    hourlyRate: number
    bookingFee: number
    paymentStatus: "pending" | "paid" | "refunded"
    status: "confirmed" | "cancelled" | "pending" | "completed"
    purpose?: string
}

export interface PricingResult {
    totalAmount: number
    bookingFee: number
    totalCharged: number
}

// ============================================
// SERVICE
// ============================================

class TrainerRentalService {
    private getCurrentUserId(): string | null {
        const auth = getAuth()
        return auth.currentUser?.uid || null
    }

    /**
     * Calculate pricing for a rental
     */
    calculatePricing(hourlyRate: number, durationMinutes: number): PricingResult {
        const hours = durationMinutes / 60
        const totalAmount = Math.round(hourlyRate * hours)
        const bookingFee = TRAINER_BOOKING_FEE
        const totalCharged = totalAmount + bookingFee

        return {
            totalAmount,
            bookingFee,
            totalCharged,
        }
    }

    /**
     * Create a new rental booking
     */
    async createRental(params: CreateRentalParams): Promise<string | null> {
        if (!db) return null

        try {
            const pricing = this.calculatePricing(params.hourlyRate, params.duration)

            const rentalData = {
                ...params,
                type: params.rentalType,
                name: params.courtOrStudioName,
                totalCharged: pricing.totalCharged,
                createdAt: Timestamp.now(),
            }

            const docRef = await addDoc(collection(db, "trainer_rentals"), rentalData)
            return docRef.id
        } catch (error) {
            console.error("Error creating rental:", error)
            return null
        }
    }

    /**
     * Get all rentals for the current trainer
     */
    async getTrainerRentals(): Promise<TrainerRental[]> {
        const trainerId = this.getCurrentUserId()
        if (!trainerId || !db) return []

        try {
            const q = query(
                collection(db, "trainer_rentals"),
                where("trainerId", "==", trainerId),
                orderBy("name")
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as TrainerRental[]
        } catch (error) {
            console.error("Error getting trainer rentals:", error)
            return []
        }
    }

    /**
     * Get all rentals for a player (by playerId)
     */
    async getTrainerAllRentals(playerId: string): Promise<TrainerRental[]> {
        if (!playerId || !db) return []

        try {
            const q = query(
                collection(db, "trainer_rentals"),
                where("playerId", "==", playerId),
                orderBy("date", "desc")
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as TrainerRental[]
        } catch (error) {
            console.error("Error getting player rentals:", error)
            return []
        }
    }

    /**
     * Get rental by ID
     */
    async getRental(rentalId: string): Promise<TrainerRental | null> {
        if (!db) return null

        try {
            const docRef = doc(db, "trainer_rentals", rentalId)
            const snapshot = await getDoc(docRef)
            if (!snapshot.exists()) return null
            return { id: snapshot.id, ...snapshot.data() } as TrainerRental
        } catch (error) {
            console.error("Error getting rental:", error)
            return null
        }
    }

    /**
     * Cancel a rental
     */
    async cancelRental(rentalId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = doc(db, "trainer_rentals", rentalId)
            await updateDoc(docRef, {
                status: "cancelled",
                cancelledAt: Timestamp.now(),
            })
            return true
        } catch (error) {
            console.error("Error cancelling rental:", error)
            return false
        }
    }

    /**
     * Search available rentals
     */
    async searchRentals(options: {
        type?: "equipment" | "space"
        location?: string
    }): Promise<TrainerRental[]> {
        if (!db) return []

        try {
            let q = query(
                collection(db, "trainer_rentals"),
                where("available", "==", true),
                orderBy("name")
            )

            const snapshot = await getDocs(q)
            let rentals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as TrainerRental[]

            // Filter by type if specified
            if (options.type) {
                rentals = rentals.filter(r => r.type === options.type)
            }

            return rentals
        } catch (error) {
            console.error("Error searching rentals:", error)
            return []
        }
    }
}

export const trainerRentalService = new TrainerRentalService()

