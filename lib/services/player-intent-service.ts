/**
 * Player Intent Service
 * 
 * Tracks player interest signals to generate warm leads for facilities/trainers:
 * - Profile views
 * - Availability checks
 * - Search queries
 * - Favorites
 * - Abandoned bookings
 */

import { db } from "../firebase-config"

// Intent signal types with weights for lead scoring
export const INTENT_SIGNALS = {
    PROFILE_VIEW: { type: "profile_view", weight: 1, label: "Viewed profile" },
    AVAILABILITY_CHECK: { type: "availability_check", weight: 3, label: "Checked availability" },
    PRICE_VIEW: { type: "price_view", weight: 2, label: "Viewed pricing" },
    FAVORITE: { type: "favorite", weight: 4, label: "Added to favorites" },
    SEARCH_NEAR: { type: "search_near", weight: 1, label: "Searched nearby" },
    BOOKING_ABANDONED: { type: "booking_abandoned", weight: 5, label: "Started booking" },
} as const

export type IntentSignalType = keyof typeof INTENT_SIGNALS

export interface PlayerIntent {
    id?: string
    playerId: string
    playerName?: string
    playerAvatar?: string
    playerSport?: string
    playerRating?: number
    targetId: string
    targetType: "facility" | "trainer"
    signal: IntentSignalType
    timestamp: Date
    metadata?: {
        searchQuery?: string
        sport?: string
        courtId?: string
        sessionTime?: string
    }
}

export interface WarmLead {
    playerId: string
    playerName: string
    playerAvatar?: string
    playerSport: string
    playerRating?: number
    distance?: number
    signals: PlayerIntent[]
    totalScore: number
    lastActivity: Date
    isHot: boolean // Multiple signals = hot lead
}

export const playerIntentService = {
    /**
     * Track a player intent signal
     */
    async trackIntent(intent: Omit<PlayerIntent, "id" | "timestamp">): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection("player_intents").add({
                ...intent,
                timestamp: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error tracking intent:", error)
            return false
        }
    },

    /**
     * Track profile view (call when player views facility/trainer profile)
     */
    async trackProfileView(
        playerId: string,
        targetId: string,
        targetType: "facility" | "trainer",
        playerData?: { name?: string; sport?: string; rating?: number }
    ): Promise<boolean> {
        return this.trackIntent({
            playerId,
            targetId,
            targetType,
            signal: "PROFILE_VIEW",
            playerName: playerData?.name,
            playerSport: playerData?.sport,
            playerRating: playerData?.rating,
        })
    },

    /**
     * Track availability check (player looked at available slots)
     */
    async trackAvailabilityCheck(
        playerId: string,
        targetId: string,
        targetType: "facility" | "trainer",
        metadata?: { courtId?: string; sessionTime?: string }
    ): Promise<boolean> {
        return this.trackIntent({
            playerId,
            targetId,
            targetType,
            signal: "AVAILABILITY_CHECK",
            metadata,
        })
    },

    /**
     * Track favorite added
     */
    async trackFavorite(
        playerId: string,
        targetId: string,
        targetType: "facility" | "trainer"
    ): Promise<boolean> {
        return this.trackIntent({
            playerId,
            targetId,
            targetType,
            signal: "FAVORITE",
        })
    },

    /**
     * Track abandoned booking
     */
    async trackBookingAbandoned(
        playerId: string,
        targetId: string,
        targetType: "facility" | "trainer",
        metadata?: { courtId?: string; sessionTime?: string }
    ): Promise<boolean> {
        return this.trackIntent({
            playerId,
            targetId,
            targetType,
            signal: "BOOKING_ABANDONED",
            metadata,
        })
    },

    /**
     * Get warm leads for a facility or trainer
     * Returns players with interest signals, sorted by lead score
     */
    async getWarmLeads(
        targetId: string,
        targetType: "facility" | "trainer",
        options?: {
            limit?: number
            daysBack?: number
        }
    ): Promise<WarmLead[]> {
        if (!db) return []

        const limit = options?.limit || 20
        const daysBack = options?.daysBack || 7
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysBack)

        try {
            // Get all intents for this target in time range
            const snapshot = await db.collection("player_intents")
                .where("targetId", "==", targetId)
                .where("targetType", "==", targetType)
                .where("timestamp", ">=", cutoffDate)
                .orderBy("timestamp", "desc")
                .limit(200) // Get more to aggregate
                .get()

            if (snapshot.empty) return []

            // Group by player
            const playerMap = new Map<string, PlayerIntent[]>()

            snapshot.docs.forEach(doc => {
                const data = doc.data()
                const intent: PlayerIntent = {
                    id: doc.id,
                    playerId: data.playerId,
                    playerName: data.playerName,
                    playerAvatar: data.playerAvatar,
                    playerSport: data.playerSport,
                    playerRating: data.playerRating,
                    targetId: data.targetId,
                    targetType: data.targetType,
                    signal: data.signal,
                    timestamp: data.timestamp?.toDate?.() || new Date(),
                    metadata: data.metadata,
                }

                const existing = playerMap.get(intent.playerId) || []
                existing.push(intent)
                playerMap.set(intent.playerId, existing)
            })

            // Convert to warm leads with scores
            const warmLeads: WarmLead[] = []

            playerMap.forEach((intents, playerId) => {
                // Calculate total score
                const totalScore = intents.reduce((sum, intent) => {
                    const signal = INTENT_SIGNALS[intent.signal]
                    return sum + (signal?.weight || 1)
                }, 0)

                // Get latest intent for player info
                const latestIntent = intents[0]
                const lastActivity = intents.reduce((latest, intent) => {
                    return intent.timestamp > latest ? intent.timestamp : latest
                }, intents[0].timestamp)

                warmLeads.push({
                    playerId,
                    playerName: latestIntent.playerName || "Player",
                    playerAvatar: latestIntent.playerAvatar,
                    playerSport: latestIntent.playerSport || "Tennis",
                    playerRating: latestIntent.playerRating,
                    signals: intents,
                    totalScore,
                    lastActivity,
                    isHot: intents.length >= 2 || totalScore >= 5,
                })
            })

            // Sort by score descending
            warmLeads.sort((a, b) => b.totalScore - a.totalScore)

            return warmLeads.slice(0, limit)
        } catch (error) {
            console.error("Error getting warm leads:", error)
            return []
        }
    },

    /**
     * Get intent signal label
     */
    getSignalLabel(signal: IntentSignalType): string {
        return INTENT_SIGNALS[signal]?.label || "Showed interest"
    },

    /**
     * Get hot leads count (for badge display)
     */
    async getHotLeadsCount(
        targetId: string,
        targetType: "facility" | "trainer"
    ): Promise<number> {
        const leads = await this.getWarmLeads(targetId, targetType, { limit: 50 })
        return leads.filter(l => l.isHot).length
    },
}

export default playerIntentService
