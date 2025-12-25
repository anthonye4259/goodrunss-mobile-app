/**
 * Trainer Profile Service
 * 
 * Manages trainer marketplace listings - the public profile
 * that players see when searching for trainers.
 */

import { db } from "@/lib/firebase-config"
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    GeoPoint,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"

// ============================================
// TYPES
// ============================================

export interface TrainerListing {
    id: string
    userId: string
    name: string
    bio?: string
    tagline?: string
    photoUrl?: string
    hourlyRate: number // in cents
    activities: string[]
    city: string
    state: string
    latitude?: number
    longitude?: number
    travelRadius: number // in miles
    isListed: boolean
    rating: number
    reviewCount: number
    totalSessions: number
    certifications?: string[]
    availability?: {
        days: string[]
        startTime: string
        endTime: string
    }
    createdAt?: string
    updatedAt?: string
}

// ============================================
// SERVICE
// ============================================

class TrainerProfileService {
    private getCurrentUserId(): string | null {
        const auth = getAuth()
        return auth.currentUser?.uid || null
    }

    /**
     * Get current user's trainer listing
     */
    async getListing(): Promise<TrainerListing | null> {
        const userId = this.getCurrentUserId()
        if (!userId || !db) return null

        try {
            const docRef = doc(db, "trainer_listings", userId)
            const snapshot = await getDoc(docRef)
            if (!snapshot.exists()) return null
            return { id: snapshot.id, ...snapshot.data() } as TrainerListing
        } catch (error) {
            console.error("Error getting trainer listing:", error)
            return null
        }
    }

    /**
     * Create a new trainer listing
     */
    async createListing(data: Omit<TrainerListing, "id" | "userId">): Promise<boolean> {
        const userId = this.getCurrentUserId()
        if (!userId || !db) return false

        try {
            const docRef = doc(db, "trainer_listings", userId)
            await setDoc(docRef, {
                ...data,
                userId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            })
            return true
        } catch (error) {
            console.error("Error creating trainer listing:", error)
            return false
        }
    }

    /**
     * Update existing trainer listing
     */
    async updateListing(updates: Partial<TrainerListing>): Promise<boolean> {
        const userId = this.getCurrentUserId()
        if (!userId || !db) return false

        try {
            const docRef = doc(db, "trainer_listings", userId)
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            })
            return true
        } catch (error) {
            console.error("Error updating trainer listing:", error)
            return false
        }
    }

    /**
     * Toggle listing visibility
     */
    async toggleListed(isListed: boolean): Promise<boolean> {
        return this.updateListing({ isListed })
    }

    /**
     * Search trainers by location and activity
     */
    async searchTrainers(options: {
        activity?: string
        city?: string
        maxDistance?: number
        limit?: number
    }): Promise<TrainerListing[]> {
        if (!db) return []

        try {
            let q = query(
                collection(db, "trainer_listings"),
                where("isListed", "==", true),
                orderBy("rating", "desc"),
                limit(options.limit || 20)
            )

            const snapshot = await getDocs(q)
            let trainers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as TrainerListing[]

            // Filter by activity if specified
            if (options.activity) {
                trainers = trainers.filter(t =>
                    t.activities.some(a =>
                        a.toLowerCase().includes(options.activity!.toLowerCase())
                    )
                )
            }

            // Filter by city if specified
            if (options.city) {
                trainers = trainers.filter(t =>
                    t.city.toLowerCase().includes(options.city!.toLowerCase())
                )
            }

            return trainers
        } catch (error) {
            console.error("Error searching trainers:", error)
            return []
        }
    }

    /**
     * Get a specific trainer's public profile
     */
    async getTrainerProfile(trainerId: string): Promise<TrainerListing | null> {
        if (!db) return null

        try {
            const docRef = doc(db, "trainer_listings", trainerId)
            const snapshot = await getDoc(docRef)
            if (!snapshot.exists()) return null
            return { id: snapshot.id, ...snapshot.data() } as TrainerListing
        } catch (error) {
            console.error("Error getting trainer profile:", error)
            return null
        }
    }

    /**
     * Get top-rated trainers for discovery
     */
    async getTopTrainers(count: number = 10): Promise<TrainerListing[]> {
        if (!db) return []

        try {
            const q = query(
                collection(db, "trainer_listings"),
                where("isListed", "==", true),
                orderBy("rating", "desc"),
                limit(count)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as TrainerListing[]
        } catch (error) {
            console.error("Error getting top trainers:", error)
            return []
        }
    }
}

export const trainerProfileService = new TrainerProfileService()
