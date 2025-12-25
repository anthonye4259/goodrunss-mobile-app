import { db, auth } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// TRAINER PROFILE TYPES
// ============================================

export interface TrainerListing {
    id: string
    name: string
    email?: string
    phone?: string
    photoUrl?: string
    bio?: string
    tagline?: string

    // Marketplace Fields
    hourlyRate: number // in cents (e.g., 7500 = $75)
    activities: string[] // e.g., ["Basketball", "Tennis"]
    modalities?: string[] // For instructors: ["yoga", "pilates"]

    // Location
    city?: string
    state?: string
    latitude?: number
    longitude?: number
    travelRadius?: number // in miles

    // Status
    isListed: boolean // Visible on marketplace?
    isVerified?: boolean

    // Stats
    rating?: number
    reviewCount?: number
    totalSessions?: number

    // Timestamps
    createdAt: string
    updatedAt?: string
    listedAt?: string
}

// ============================================
// TRAINER PROFILE SERVICE
// ============================================

class TrainerProfileService {
    private static instance: TrainerProfileService

    private constructor() { }

    static getInstance(): TrainerProfileService {
        if (!TrainerProfileService.instance) {
            TrainerProfileService.instance = new TrainerProfileService()
        }
        return TrainerProfileService.instance
    }

    private async getCurrentUserId(): Promise<string | null> {
        return auth?.currentUser?.uid || await AsyncStorage.getItem("userId")
    }

    // ============================================
    // CREATE / UPDATE LISTING
    // ============================================

    async createListing(data: Omit<TrainerListing, "id" | "createdAt">): Promise<TrainerListing> {
        const userId = await this.getCurrentUserId()
        if (!userId) throw new Error("User not authenticated")

        const listing: TrainerListing = {
            ...data,
            id: userId,
            createdAt: new Date().toISOString(),
            listedAt: data.isListed ? new Date().toISOString() : undefined,
        }

        if (!db) {
            // Local fallback
            await AsyncStorage.setItem(`@trainer_listing_${userId}`, JSON.stringify(listing))
            return listing
        }

        try {
            const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")
            await setDoc(doc(db, "trainers", userId), {
                ...listing,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            })
            console.log("[TrainerProfile] Listing created:", userId)
            return listing
        } catch (error) {
            console.error("Error creating listing:", error)
            throw error
        }
    }

    async updateListing(updates: Partial<TrainerListing>): Promise<void> {
        const userId = await this.getCurrentUserId()
        if (!userId) throw new Error("User not authenticated")

        if (!db) {
            const existing = await this.getListing()
            if (existing) {
                await AsyncStorage.setItem(`@trainer_listing_${userId}`, JSON.stringify({
                    ...existing,
                    ...updates,
                }))
            }
            return
        }

        try {
            const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")
            await updateDoc(doc(db, "trainers", userId), {
                ...updates,
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating listing:", error)
            throw error
        }
    }

    async goLive(): Promise<void> {
        await this.updateListing({
            isListed: true,
            listedAt: new Date().toISOString(),
        })
    }

    async goOffline(): Promise<void> {
        await this.updateListing({ isListed: false })
    }

    // ============================================
    // READ LISTING
    // ============================================

    async getListing(): Promise<TrainerListing | null> {
        const userId = await this.getCurrentUserId()
        if (!userId) return null

        if (!db) {
            const stored = await AsyncStorage.getItem(`@trainer_listing_${userId}`)
            return stored ? JSON.parse(stored) : null
        }

        try {
            const { doc, getDoc } = await import("firebase/firestore")
            const docSnap = await getDoc(doc(db, "trainers", userId))
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as TrainerListing
            }
            return null
        } catch (error) {
            console.error("Error fetching listing:", error)
            return null
        }
    }

    // ============================================
    // SEARCH TRAINERS (for Player Browse)
    // ============================================

    async searchTrainers(filters?: {
        activity?: string
        city?: string
        maxRate?: number
        limit?: number
    }): Promise<TrainerListing[]> {
        if (!db) {
            // Return empty for local mode
            return []
        }

        try {
            const firestoreModule = await import("firebase/firestore")
            const { collection, getDocs, query, where, orderBy } = firestoreModule
            const firestoreLimit = firestoreModule.limit

            let q = query(
                collection(db, "trainers"),
                where("isListed", "==", true),
                orderBy("rating", "desc"),
                firestoreLimit(filters?.limit || 20)
            )

            // Note: Firestore doesn't support multiple inequality filters
            // For complex filtering, we'd need a compound index or client-side filter

            const snapshot = await getDocs(q)
            let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainerListing))

            // Client-side filtering for now
            if (filters?.activity) {
                results = results.filter(t => t.activities?.includes(filters.activity!))
            }
            if (filters?.city) {
                results = results.filter(t => t.city?.toLowerCase() === filters.city!.toLowerCase())
            }
            if (filters?.maxRate) {
                results = results.filter(t => t.hourlyRate <= filters.maxRate!)
            }

            return results
        } catch (error) {
            console.error("Error searching trainers:", error)
            return []
        }
    }

    async getTrainerById(trainerId: string): Promise<TrainerListing | null> {
        if (!db) return null

        try {
            const { doc, getDoc } = await import("firebase/firestore")
            const docSnap = await getDoc(doc(db, "trainers", trainerId))
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as TrainerListing
            }
            return null
        } catch (error) {
            console.error("Error fetching trainer:", error)
            return null
        }
    }
}

// Export singleton
export const trainerProfileService = TrainerProfileService.getInstance()
