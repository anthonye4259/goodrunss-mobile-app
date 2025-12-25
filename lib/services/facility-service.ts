/**
 * Facility Service
 * Handles facility claiming, management, and court availability
 */

import { db } from "../firebase-config"

// Firestore collection names
const FACILITIES_COLLECTION = "claimed_facilities"
const COURTS_COLLECTION = "courts"

export interface ClaimedFacility {
    id: string
    venueId: string // Reference to original venue
    ownerId: string // User who claimed it
    businessName: string
    businessPhone: string
    businessEmail: string
    verified: boolean
    verificationMethod?: "phone" | "email" | "document"
    stripeAccountId?: string // For Stripe Connect payouts
    takeRatePercent: number // 5-10%
    createdAt: Date
    updatedAt: Date
}

export interface Court {
    id: string
    facilityId: string
    name: string // "Court 1", "Court A", etc.
    type: string // "Indoor", "Outdoor"
    surface?: string // "Hard", "Clay", "Grass"
    hourlyRate: number // In cents
    isActive: boolean
}

export interface TimeSlot {
    startTime: string // "09:00"
    endTime: string // "10:00"
    isAvailable: boolean
    bookingId?: string
}

export interface CourtAvailability {
    courtId: string
    date: string // "2025-12-25"
    slots: TimeSlot[]
}

export const facilityService = {
    /**
     * Claim a facility (owner registration)
     */
    async claimFacility(
        venueId: string,
        userId: string,
        businessInfo: {
            businessName: string
            businessPhone: string
            businessEmail: string
        }
    ): Promise<string | null> {
        if (!db) return null

        try {
            // Check if already claimed
            const existingQuery = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) {
                console.warn("Facility already claimed:", venueId)
                return null
            }

            const facilityData: Omit<ClaimedFacility, "id"> = {
                venueId,
                ownerId: userId,
                businessName: businessInfo.businessName,
                businessPhone: businessInfo.businessPhone,
                businessEmail: businessInfo.businessEmail,
                verified: false,
                takeRatePercent: 8, // Default 8%
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(FACILITIES_COLLECTION).add(facilityData)
            return docRef.id
        } catch (error) {
            console.error("Error claiming facility:", error)
            return null
        }
    },

    /**
     * Get facilities owned by a user
     */
    async getFacilitiesByOwner(userId: string): Promise<ClaimedFacility[]> {
        if (!db) return []

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("ownerId", "==", userId)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as ClaimedFacility[]
        } catch (error) {
            console.error("Error getting facilities:", error)
            return []
        }
    },

    /**
     * Check if a venue has been claimed
     */
    async isVenueClaimed(venueId: string): Promise<boolean> {
        if (!db) return false

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .where("verified", "==", true)
                .limit(1)

            const snapshot = await query.get()
            return !snapshot.empty
        } catch (error) {
            console.error("Error checking claim:", error)
            return false
        }
    },

    /**
     * Get claimed facility by venue ID
     */
    async getClaimedFacility(venueId: string): Promise<ClaimedFacility | null> {
        if (!db) return null

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .limit(1)

            const snapshot = await query.get()
            if (snapshot.empty) return null

            const doc = snapshot.docs[0]
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            } as ClaimedFacility
        } catch (error) {
            console.error("Error getting facility:", error)
            return null
        }
    },

    /**
     * Verify facility (after phone verification)
     */
    async verifyFacility(facilityId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                verified: true,
                verificationMethod: "phone",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error verifying facility:", error)
            return false
        }
    },

    /**
     * Add a court to a facility
     */
    async addCourt(
        facilityId: string,
        courtInfo: {
            name: string
            type: string
            surface?: string
            hourlyRate: number
        }
    ): Promise<string | null> {
        if (!db) return null

        try {
            const courtData: Omit<Court, "id"> = {
                facilityId,
                name: courtInfo.name,
                type: courtInfo.type,
                surface: courtInfo.surface,
                hourlyRate: courtInfo.hourlyRate,
                isActive: true,
            }

            const docRef = await db.collection(COURTS_COLLECTION).add(courtData)
            return docRef.id
        } catch (error) {
            console.error("Error adding court:", error)
            return null
        }
    },

    /**
     * Get courts for a facility
     */
    async getCourts(facilityId: string): Promise<Court[]> {
        if (!db) return []

        try {
            const query = db.collection(COURTS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("isActive", "==", true)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Court[]
        } catch (error) {
            console.error("Error getting courts:", error)
            return []
        }
    },

    /**
     * Update Stripe Connect account ID
     */
    async setStripeAccount(facilityId: string, stripeAccountId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(FACILITIES_COLLECTION).doc(facilityId).update({
                stripeAccountId,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error setting Stripe account:", error)
            return false
        }
    },

    /**
     * Update a court's details
     */
    async updateCourt(
        courtId: string,
        updates: {
            name?: string
            type?: string
            surface?: string
            hourlyRate?: number
        }
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(COURTS_COLLECTION).doc(courtId).update(updates)
            return true
        } catch (error) {
            console.error("Error updating court:", error)
            return false
        }
    },

    /**
     * Delete (deactivate) a court
     */
    async deleteCourt(courtId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(COURTS_COLLECTION).doc(courtId).update({
                isActive: false,
            })
            return true
        } catch (error) {
            console.error("Error deleting court:", error)
            return false
        }
    },

    /**
     * Check if a venue is claimed and by whom
     */
    async getClaimStatus(venueId: string): Promise<{
        isClaimed: boolean
        isOwnedByUser: boolean
        facilityId?: string
    }> {
        if (!db) return { isClaimed: false, isOwnedByUser: false }

        try {
            const query = db.collection(FACILITIES_COLLECTION)
                .where("venueId", "==", venueId)
                .limit(1)

            const snapshot = await query.get()
            if (snapshot.empty) {
                return { isClaimed: false, isOwnedByUser: false }
            }

            const doc = snapshot.docs[0]
            return {
                isClaimed: true,
                isOwnedByUser: false, // Caller needs to check this with their userId
                facilityId: doc.id,
            }
        } catch (error) {
            console.error("Error getting claim status:", error)
            return { isClaimed: false, isOwnedByUser: false }
        }
    },
}

export default facilityService
