import { db, auth } from "@/lib/firebase-config"
import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, orderBy, limit as firestoreLimit, serverTimestamp } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// TRAINER CORE TYPES
// ============================================

export interface TrainerProfile {
    id: string
    name: string
    email?: string
    phone?: string
    photoUrl?: string
    bio?: string
    tagline?: string
    
    // Professional Details
    hourlyRate: number // in cents
    sport: string[] // Primary sports (e.g. ["Tennis", "Pickleball"])
    modalities?: string[] // Specialized (e.g. ["Yogas", "Pilates"])
    languages?: string[]
    certifications?: string[]
    yearsExperience?: number
    
    // Location
    location?: {
        lat: number
        lng: number
        city?: string
        state?: string
    }
    city?: string
    state?: string
    travelRadius?: number // miles
    
    // Status
    isListed: boolean
    isVerified?: boolean
    rating: number
    reviewCount: number
    totalSessions: number
    
    // Timestamps
    createdAt: string
    updatedAt?: string
    listedAt?: string
}

export interface TrainerMatch {
    trainer: TrainerProfile
    matchScore: number
    matchReasons: string[]
    distance?: number
    isPerfectMatch: boolean
}

export interface SearchFilters {
    sport?: string
    city?: string
    maxRate?: number
    limit?: number
    minRating?: number
}

// ============================================
// TRAINER CORE SERVICE
// (Profile Management & Discovery)
// ============================================

class TrainerCoreService {
    private static instance: TrainerCoreService

    private constructor() { }

    static getInstance(): TrainerCoreService {
        if (!TrainerCoreService.instance) {
            TrainerCoreService.instance = new TrainerCoreService()
        }
        return TrainerCoreService.instance
    }

    private async getCurrentUserId(): Promise<string | null> {
        return auth?.currentUser?.uid || await AsyncStorage.getItem("userId")
    }

    // ============================================
    // PROFILE MANAGEMENT (CRUD)
    // ============================================

    async createProfile(data: Omit<TrainerProfile, "id" | "createdAt" | "rating" | "reviewCount" | "totalSessions">): Promise<TrainerProfile> {
        const userId = await this.getCurrentUserId()
        if (!userId) throw new Error("User not authenticated")

        const profile: TrainerProfile = {
            ...data,
            id: userId,
            rating: 5.0, // New trainers start with 5.0
            reviewCount: 0,
            totalSessions: 0,
            createdAt: new Date().toISOString(),
            listedAt: data.isListed ? new Date().toISOString() : undefined,
        }

        if (!db) {
            await AsyncStorage.setItem(`@trainer_profile_${userId}`, JSON.stringify(profile))
            return profile
        }

        await setDoc(doc(db, "trainers", userId), {
            ...profile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })

        return profile
    }

    async updateProfile(updates: Partial<TrainerProfile>): Promise<void> {
        const userId = await this.getCurrentUserId()
        if (!userId) throw new Error("User not authenticated")

        if (db) {
            await updateDoc(doc(db, "trainers", userId), {
                ...updates,
                updatedAt: serverTimestamp(),
            })
        }
    }

    async getProfile(userId?: string): Promise<TrainerProfile | null> {
        const targetId = userId || await this.getCurrentUserId()
        if (!targetId) return null

        if (!db) return null // Handle offline/mock later

        const snap = await getDoc(doc(db, "trainers", targetId))
        if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as TrainerProfile
        }
        return null
    }

    // ============================================
    // DISCOVERY & SEARCH
    // ============================================

    async searchTrainers(filters: SearchFilters): Promise<TrainerProfile[]> {
        if (!db) return []

        try {
            const constraints = [
                where("isListed", "==", true),
                orderBy("rating", "desc"),
                firestoreLimit(filters.limit || 20)
            ]

            if (filters.sport) {
                constraints.push(where("sport", "array-contains", filters.sport))
            }
            
            // Note: Use client-side filtering for city to avoid composite index explosion
            // or use specific queries if indexes are set up
            
            const q = query(collection(db, "trainers"), ...constraints)
            const snapshot = await getDocs(q)
            
            let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainerProfile))

            // Client-side filtering
            if (filters.city) {
                results = results.filter(t => t.city?.toLowerCase() === filters.city!.toLowerCase())
            }
            if (filters.maxRate) {
                results = results.filter(t => t.hourlyRate <= filters.maxRate!)
            }
            if (filters.minRating) {
                results = results.filter(t => t.rating >= filters.minRating!)
            }

            return results
        } catch (error) {
            console.error("Error searching trainers:", error)
            return []
        }
    }

    async getRecommendedTrainers(userPrefs: { 
        sports: string[], 
        location?: { lat: number, lng: number }, 
        maxDistance?: number 
    }): Promise<TrainerMatch[]> {
        // Fetch broad list
        const candidates = await this.searchTrainers({ limit: 50 })
        
        return candidates.map(trainer => {
            const match = this.calculateMatchScore(trainer, userPrefs)
            return match
        }).sort((a, b) => b.matchScore - a.matchScore)
    }

    // ============================================
    // INTERNAL MATCHING LOGIC
    // ============================================

    private calculateMatchScore(trainer: TrainerProfile, prefs: any): TrainerMatch {
        let score = 50 // Base score
        const reasons: string[] = []

        // Sport Match (High Priority)
        const commonSports = trainer.sport.filter(s => prefs.sports.includes(s))
        if (commonSports.length > 0) {
            score += 30
            reasons.push(`Teaches ${commonSports[0]}`)
        }

        // Distance Penalty
        let distance = 0
        if (prefs.location && trainer.location) {
             distance = this.calculateDistance(
                prefs.location.lat, prefs.location.lng,
                trainer.location.lat, trainer.location.lng
            )
            
            if (distance < 5) {
                score += 15
                reasons.push("Nearby (< 5 miles)")
            } else if (distance > (prefs.maxDistance || 30)) {
                score -= 30 
            }
        }

        // Rating Boost
        if (trainer.rating >= 4.9) {
            score += 10
            reasons.push("Top Rated")
        }

        return {
            trainer,
            matchScore: Math.min(score, 100),
            matchReasons: reasons,
            distance,
            isPerfectMatch: score >= 90
        }
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 3959 // Radius of Earth in miles
        const dLat = this.deg2rad(lat2 - lat1)
        const dLon = this.deg2rad(lon2 - lon1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180)
    }
}

export const trainerCoreService = TrainerCoreService.getInstance()
