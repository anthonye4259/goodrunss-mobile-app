/**
 * Smart Trainer Discovery Service
 * 
 * Provides intelligent trainer matching based on:
 * - User's preferred activities
 * - Location/distance
 * - Trainer rating
 * - Price compatibility
 * - Availability
 */

import { db } from "../firebase-config"
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore"

// ============================================
// TYPES
// ============================================

export interface TrainerProfile {
    id: string
    name: string
    sport: string[]
    rating: number
    reviews: number
    price: number
    bio?: string
    specialties?: string[]
    availability?: string[]
    languages?: string[]
    certifications?: string[]
    yearsExperience?: number
    profilePhotoUrl?: string
    location?: {
        lat: number
        lng: number
        city?: string
        state?: string
    }
    stripeAccountId?: string
}

export interface TrainerMatch {
    trainer: TrainerProfile
    matchScore: number      // 0-100
    matchReasons: string[]  // ["Teaches Tennis", "2 mi away", "Top Rated"]
    distance?: number       // in km
    isPerfectMatch: boolean // 90%+
}

export interface UserMatchPreferences {
    activities: string[]
    location?: {
        latitude: number
        longitude: number
    }
    maxDistance?: number    // in km, default 50
    maxPrice?: number       // max hourly rate
    preferredDays?: string[]
    preferredLanguage?: string
}

// ============================================
// WEIGHT CONSTANTS
// ============================================

const WEIGHTS = {
    SPORT_MATCH: 0.40,      // 40% - Most important
    LOCATION: 0.25,         // 25% - Distance matters
    RATING: 0.15,           // 15% - Quality indicator
    PRICE: 0.10,            // 10% - Budget fit
    AVAILABILITY: 0.10,     // 10% - Schedule fit
}

const PERFECT_MATCH_THRESHOLD = 90

// ============================================
// TRAINER DISCOVERY SERVICE
// ============================================

class TrainerDiscoveryService {
    private static instance: TrainerDiscoveryService

    static getInstance(): TrainerDiscoveryService {
        if (!TrainerDiscoveryService.instance) {
            TrainerDiscoveryService.instance = new TrainerDiscoveryService()
        }
        return TrainerDiscoveryService.instance
    }

    // ============================================
    // MAIN DISCOVERY FUNCTIONS
    // ============================================

    /**
     * Get recommended trainers based on user preferences
     * Returns trainers sorted by match score
     */
    async getRecommendedTrainers(
        prefs: UserMatchPreferences,
        limitCount: number = 20
    ): Promise<TrainerMatch[]> {
        if (!db) return []

        try {
            // First, get trainers that match at least one activity
            const trainers = await this.fetchTrainersByActivities(prefs.activities, limitCount * 2)

            // Calculate match scores for each
            const matches: TrainerMatch[] = trainers.map(trainer =>
                this.calculateMatch(trainer, prefs)
            )

            // Sort by match score (highest first)
            matches.sort((a, b) => b.matchScore - a.matchScore)

            // Return top N
            return matches.slice(0, limitCount)
        } catch (error) {
            console.error("[TrainerDiscovery] Error getting recommendations:", error)
            return []
        }
    }

    /**
     * Get trainers within a radius of user's location
     */
    async getTrainersNearby(
        lat: number,
        lng: number,
        radiusKm: number = 50,
        limitCount: number = 20
    ): Promise<TrainerMatch[]> {
        if (!db) return []

        try {
            const trainers = await this.fetchAllTrainers(100)

            // Filter by distance and add distance to each
            const nearbyTrainers = trainers
                .map(trainer => ({
                    trainer,
                    distance: trainer.location
                        ? this.calculateDistance(lat, lng, trainer.location.lat, trainer.location.lng)
                        : 999
                }))
                .filter(t => t.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limitCount)

            // Convert to TrainerMatch format
            return nearbyTrainers.map(({ trainer, distance }) => ({
                trainer,
                matchScore: this.calculateLocationScore(distance) * 100,
                matchReasons: this.getDistanceReason(distance),
                distance,
                isPerfectMatch: false,
            }))
        } catch (error) {
            console.error("[TrainerDiscovery] Error getting nearby trainers:", error)
            return []
        }
    }

    /**
     * Get trainers similar to a given trainer
     * (same sports, similar rating, similar price range)
     */
    async getSimilarTrainers(
        trainerId: string,
        limitCount: number = 5
    ): Promise<TrainerProfile[]> {
        if (!db) return []

        try {
            // Get the reference trainer
            const trainers = await this.fetchAllTrainers(50)
            const refTrainer = trainers.find(t => t.id === trainerId)

            if (!refTrainer) return []

            // Find similar trainers
            const similar = trainers
                .filter(t => t.id !== trainerId)
                .map(t => ({
                    trainer: t,
                    similarity: this.calculateSimilarity(refTrainer, t)
                }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limitCount)
                .map(({ trainer }) => trainer)

            return similar
        } catch (error) {
            console.error("[TrainerDiscovery] Error getting similar trainers:", error)
            return []
        }
    }

    /**
     * Quick search by sport with basic sorting
     */
    async searchTrainers(
        sport: string,
        userLocation?: { lat: number; lng: number },
        sortBy: "distance" | "rating" | "price" = "rating"
    ): Promise<TrainerMatch[]> {
        if (!db) return []

        try {
            const trainers = await this.fetchTrainersByActivities([sport], 50)

            const matches: TrainerMatch[] = trainers.map(trainer => {
                const distance = userLocation && trainer.location
                    ? this.calculateDistance(
                        userLocation.lat, userLocation.lng,
                        trainer.location.lat, trainer.location.lng
                    )
                    : undefined

                return {
                    trainer,
                    matchScore: trainer.rating * 20, // Simple score based on rating
                    matchReasons: [`Teaches ${sport}`],
                    distance,
                    isPerfectMatch: false,
                }
            })

            // Sort based on preference
            switch (sortBy) {
                case "distance":
                    matches.sort((a, b) => (a.distance || 999) - (b.distance || 999))
                    break
                case "price":
                    matches.sort((a, b) => a.trainer.price - b.trainer.price)
                    break
                case "rating":
                default:
                    matches.sort((a, b) => b.trainer.rating - a.trainer.rating)
            }

            return matches
        } catch (error) {
            console.error("[TrainerDiscovery] Error searching trainers:", error)
            return []
        }
    }

    // ============================================
    // MATCH CALCULATION
    // ============================================

    /**
     * Calculate comprehensive match score
     */
    calculateMatch(trainer: TrainerProfile, prefs: UserMatchPreferences): TrainerMatch {
        const scores = {
            sport: this.calculateSportScore(trainer.sport, prefs.activities),
            location: prefs.location && trainer.location
                ? this.calculateLocationScore(
                    this.calculateDistance(
                        prefs.location.latitude, prefs.location.longitude,
                        trainer.location.lat, trainer.location.lng
                    ),
                    prefs.maxDistance
                )
                : 0.5, // Neutral if no location
            rating: this.calculateRatingScore(trainer.rating),
            price: prefs.maxPrice
                ? this.calculatePriceScore(trainer.price, prefs.maxPrice)
                : 0.7, // Neutral if no budget set
            availability: 0.7, // TODO: Implement availability matching
        }

        // Weighted average
        const matchScore = Math.round(
            scores.sport * WEIGHTS.SPORT_MATCH * 100 +
            scores.location * WEIGHTS.LOCATION * 100 +
            scores.rating * WEIGHTS.RATING * 100 +
            scores.price * WEIGHTS.PRICE * 100 +
            scores.availability * WEIGHTS.AVAILABILITY * 100
        )

        // Generate match reasons
        const matchReasons = this.generateMatchReasons(trainer, prefs, scores)

        // Calculate distance if available
        const distance = prefs.location && trainer.location
            ? this.calculateDistance(
                prefs.location.latitude, prefs.location.longitude,
                trainer.location.lat, trainer.location.lng
            )
            : undefined

        return {
            trainer,
            matchScore,
            matchReasons,
            distance,
            isPerfectMatch: matchScore >= PERFECT_MATCH_THRESHOLD,
        }
    }

    // ============================================
    // INDIVIDUAL SCORE CALCULATIONS
    // ============================================

    private calculateSportScore(trainerSports: string[], userActivities: string[]): number {
        if (!trainerSports || !userActivities || userActivities.length === 0) return 0

        const matches = trainerSports.filter(s =>
            userActivities.some(a => a.toLowerCase() === s.toLowerCase())
        )

        // At least one match = good, more matches = better
        if (matches.length === 0) return 0
        if (matches.length === 1) return 0.8
        return 1.0 // Multiple matches = perfect
    }

    private calculateLocationScore(distanceKm: number, maxDistance: number = 50): number {
        if (distanceKm <= 2) return 1.0      // Very close
        if (distanceKm <= 5) return 0.9      // Close
        if (distanceKm <= 10) return 0.8     // Reasonable
        if (distanceKm <= 20) return 0.6     // Moderate
        if (distanceKm <= maxDistance) return 0.4
        return 0.1 // Far
    }

    private calculateRatingScore(rating: number): number {
        if (rating >= 4.8) return 1.0
        if (rating >= 4.5) return 0.9
        if (rating >= 4.0) return 0.7
        if (rating >= 3.5) return 0.5
        return 0.3
    }

    private calculatePriceScore(trainerPrice: number, maxBudget: number): number {
        if (trainerPrice <= maxBudget * 0.7) return 1.0   // Well under budget
        if (trainerPrice <= maxBudget) return 0.8         // Within budget
        if (trainerPrice <= maxBudget * 1.2) return 0.5   // Slightly over
        return 0.2 // Over budget
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    private generateMatchReasons(
        trainer: TrainerProfile,
        prefs: UserMatchPreferences,
        scores: Record<string, number>
    ): string[] {
        const reasons: string[] = []

        // Sport match
        const matchingSports = trainer.sport.filter(s =>
            prefs.activities.some(a => a.toLowerCase() === s.toLowerCase())
        )
        if (matchingSports.length > 0) {
            reasons.push(`Teaches ${matchingSports[0]}`)
        }

        // Distance
        if (prefs.location && trainer.location) {
            const dist = this.calculateDistance(
                prefs.location.latitude, prefs.location.longitude,
                trainer.location.lat, trainer.location.lng
            )
            reasons.push(...this.getDistanceReason(dist))
        }

        // Rating
        if (trainer.rating >= 4.8) {
            reasons.push("⭐ Top Rated")
        } else if (trainer.rating >= 4.5) {
            reasons.push("Highly Rated")
        }

        // Reviews
        if (trainer.reviews >= 50) {
            reasons.push("Popular Choice")
        }

        // Specialties
        if (trainer.specialties && trainer.specialties.length > 0) {
            reasons.push(trainer.specialties[0])
        }

        return reasons.slice(0, 4) // Max 4 reasons
    }

    private getDistanceReason(distanceKm: number): string[] {
        const distanceMiles = distanceKm * 0.621371

        if (distanceKm <= 1) {
            return ["📍 Very Close"]
        } else if (distanceKm <= 5) {
            return [`📍 ${distanceMiles.toFixed(1)} mi away`]
        } else if (distanceKm <= 15) {
            return [`${distanceMiles.toFixed(0)} mi away`]
        }
        return []
    }

    private calculateSimilarity(ref: TrainerProfile, other: TrainerProfile): number {
        let score = 0

        // Same sports (weighted heavily)
        const sportOverlap = ref.sport.filter(s => other.sport.includes(s)).length
        score += sportOverlap * 30

        // Similar rating (within 0.5)
        if (Math.abs(ref.rating - other.rating) <= 0.5) {
            score += 20
        }

        // Similar price (within 20%)
        if (Math.abs(ref.price - other.price) / ref.price <= 0.2) {
            score += 15
        }

        // Same location/city
        if (ref.location?.city && ref.location.city === other.location?.city) {
            score += 15
        }

        return score
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371 // Earth's radius in km
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

    // ============================================
    // DATA FETCHING
    // ============================================

    private async fetchTrainersByActivities(
        activities: string[],
        limitCount: number
    ): Promise<TrainerProfile[]> {
        if (!db || activities.length === 0) return []

        try {
            // Query trainers that match any of the activities
            const q = query(
                collection(db, "trainers"),
                where("sport", "array-contains-any", activities.slice(0, 10)), // Firestore limit
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TrainerProfile))
        } catch (error) {
            console.error("[TrainerDiscovery] Error fetching trainers:", error)
            return []
        }
    }

    private async fetchAllTrainers(limitCount: number): Promise<TrainerProfile[]> {
        if (!db) return []

        try {
            const q = query(
                collection(db, "trainers"),
                orderBy("rating", "desc"),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TrainerProfile))
        } catch (error) {
            console.error("[TrainerDiscovery] Error fetching all trainers:", error)
            return []
        }
    }
}

// ============================================
// EXPORTS
// ============================================

export const trainerDiscoveryService = TrainerDiscoveryService.getInstance()

// Convenience functions
export const getRecommendedTrainers = (prefs: UserMatchPreferences, limit?: number) =>
    trainerDiscoveryService.getRecommendedTrainers(prefs, limit)

export const getTrainersNearby = (lat: number, lng: number, radiusKm?: number) =>
    trainerDiscoveryService.getTrainersNearby(lat, lng, radiusKm)

export const getSimilarTrainers = (trainerId: string) =>
    trainerDiscoveryService.getSimilarTrainers(trainerId)

export const searchTrainers = (
    sport: string,
    userLocation?: { lat: number; lng: number },
    sortBy?: "distance" | "rating" | "price"
) => trainerDiscoveryService.searchTrainers(sport, userLocation, sortBy)
