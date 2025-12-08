import AsyncStorage from "@react-native-async-storage/async-storage"

// Feature IDs that can be tracked
export type FeatureId =
    | "movement_score"
    | "nearest_venue"
    | "favorites"
    | "report_court"
    | "live_map"
    | "upcoming_sessions"
    | "quick_actions"
    | "leagues"
    | "invite"
    | "trainers"
    | "gia"
    | "messages"
    | "bookings"
    | "recovery"

interface FeatureUsage {
    featureId: FeatureId
    tapCount: number
    lastUsed: number // timestamp
    totalTimeSpent: number // seconds
}

interface PersonalizationData {
    featureUsage: Record<FeatureId, FeatureUsage>
    lastUpdated: number
    homeScreenOrder: FeatureId[]
    preferredTimeSlots: {
        morning: FeatureId[] // 6am-11am
        afternoon: FeatureId[] // 11am-5pm
        evening: FeatureId[] // 5pm-9pm
        night: FeatureId[] // 9pm-6am
    }
}

const STORAGE_KEY = "@goodrunss_personalization"

// Default home screen order
const DEFAULT_ORDER: FeatureId[] = [
    "movement_score",
    "nearest_venue",
    "favorites",
    "report_court",
    "live_map",
    "upcoming_sessions",
    "quick_actions",
    "leagues",
]

// Weight factors for scoring
const WEIGHTS = {
    recentUsage: 0.4, // How recently used
    frequency: 0.35, // How often used
    timeSpent: 0.25, // Time spent on feature
}

class PersonalizationEngine {
    private data: PersonalizationData | null = null
    private initialized = false

    async initialize(): Promise<void> {
        if (this.initialized) return

        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY)
            if (stored) {
                this.data = JSON.parse(stored)
            } else {
                this.data = this.getDefaultData()
                await this.save()
            }
            this.initialized = true
        } catch (error) {
            console.error("Error initializing personalization:", error)
            this.data = this.getDefaultData()
        }
    }

    private getDefaultData(): PersonalizationData {
        const featureUsage: Record<FeatureId, FeatureUsage> = {} as any
        DEFAULT_ORDER.forEach((id) => {
            featureUsage[id] = {
                featureId: id,
                tapCount: 0,
                lastUsed: 0,
                totalTimeSpent: 0,
            }
        })

        return {
            featureUsage,
            lastUpdated: Date.now(),
            homeScreenOrder: [...DEFAULT_ORDER],
            preferredTimeSlots: {
                morning: ["movement_score", "nearest_venue", "quick_actions"],
                afternoon: ["nearest_venue", "live_map", "quick_actions"],
                evening: ["live_map", "nearest_venue", "favorites"],
                night: ["upcoming_sessions", "favorites", "movement_score"],
            },
        }
    }

    private async save(): Promise<void> {
        if (!this.data) return
        try {
            this.data.lastUpdated = Date.now()
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
        } catch (error) {
            console.error("Error saving personalization:", error)
        }
    }

    // Track when a feature is tapped
    async trackFeatureTap(featureId: FeatureId): Promise<void> {
        await this.initialize()
        if (!this.data) return

        if (!this.data.featureUsage[featureId]) {
            this.data.featureUsage[featureId] = {
                featureId,
                tapCount: 0,
                lastUsed: 0,
                totalTimeSpent: 0,
            }
        }

        this.data.featureUsage[featureId].tapCount++
        this.data.featureUsage[featureId].lastUsed = Date.now()

        await this.recalculateOrder()
        await this.save()
    }

    // Track time spent on a feature
    async trackTimeSpent(featureId: FeatureId, seconds: number): Promise<void> {
        await this.initialize()
        if (!this.data || !this.data.featureUsage[featureId]) return

        this.data.featureUsage[featureId].totalTimeSpent += seconds
        await this.save()
    }

    // Calculate priority score for a feature
    private calculateScore(usage: FeatureUsage): number {
        const now = Date.now()
        const hourAgo = now - 60 * 60 * 1000
        const dayAgo = now - 24 * 60 * 60 * 1000
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000

        // Recency score (0-100)
        let recencyScore = 0
        if (usage.lastUsed > hourAgo) recencyScore = 100
        else if (usage.lastUsed > dayAgo) recencyScore = 70
        else if (usage.lastUsed > weekAgo) recencyScore = 40
        else recencyScore = 10

        // Frequency score (0-100, max at 50 taps)
        const frequencyScore = Math.min(100, (usage.tapCount / 50) * 100)

        // Time score (0-100, max at 30 min total)
        const timeScore = Math.min(100, (usage.totalTimeSpent / 1800) * 100)

        return (
            recencyScore * WEIGHTS.recentUsage +
            frequencyScore * WEIGHTS.frequency +
            timeScore * WEIGHTS.timeSpent
        )
    }

    // Recalculate home screen order based on usage
    private async recalculateOrder(): Promise<void> {
        if (!this.data) return

        const scored = Object.values(this.data.featureUsage)
            .map((usage) => ({
                id: usage.featureId,
                score: this.calculateScore(usage),
            }))
            .sort((a, b) => b.score - a.score)

        // Keep top 3 most used, then fill with defaults
        const topFeatures = scored.slice(0, 3).map((s) => s.id)
        const remaining = DEFAULT_ORDER.filter((id) => !topFeatures.includes(id))

        this.data.homeScreenOrder = [...topFeatures, ...remaining]
    }

    // Get current time slot
    private getCurrentTimeSlot(): "morning" | "afternoon" | "evening" | "night" {
        const hour = new Date().getHours()
        if (hour >= 6 && hour < 11) return "morning"
        if (hour >= 11 && hour < 17) return "afternoon"
        if (hour >= 17 && hour < 21) return "evening"
        return "night"
    }

    // Get personalized home screen order
    async getHomeScreenOrder(): Promise<FeatureId[]> {
        await this.initialize()
        if (!this.data) return DEFAULT_ORDER

        // Blend time-based preferences with usage-based order
        const timeSlot = this.getCurrentTimeSlot()
        const timePreferences = this.data.preferredTimeSlots[timeSlot]
        const usageOrder = this.data.homeScreenOrder

        // Time preferences get slight boost for top positions
        const boostedOrder: FeatureId[] = []

        // Add time-relevant features first (if they have usage)
        timePreferences.forEach((id) => {
            if (
                this.data!.featureUsage[id]?.tapCount > 0 &&
                !boostedOrder.includes(id)
            ) {
                boostedOrder.push(id)
            }
        })

        // Then add by usage order
        usageOrder.forEach((id) => {
            if (!boostedOrder.includes(id)) {
                boostedOrder.push(id)
            }
        })

        return boostedOrder
    }

    // Get time-based greeting
    getTimeBasedGreeting(): { greeting: string; suggestion: string } {
        const hour = new Date().getHours()

        if (hour >= 5 && hour < 12) {
            return {
                greeting: "Good morning!",
                suggestion: "Start your day with a quick workout?",
            }
        } else if (hour >= 12 && hour < 17) {
            return {
                greeting: "Good afternoon!",
                suggestion: "Perfect time for a quick session",
            }
        } else if (hour >= 17 && hour < 21) {
            return {
                greeting: "Good evening!",
                suggestion: "Courts are filling up - find a game!",
            }
        } else {
            return {
                greeting: "Hey there!",
                suggestion: "Plan tomorrow's workout",
            }
        }
    }

    // Get feature usage stats (for debugging/display)
    async getUsageStats(): Promise<Record<FeatureId, FeatureUsage> | null> {
        await this.initialize()
        return this.data?.featureUsage || null
    }

    // Reset personalization data
    async reset(): Promise<void> {
        this.data = this.getDefaultData()
        await this.save()
    }
}

// Singleton instance
export const personalizationEngine = new PersonalizationEngine()

// Hook for React components
import { useEffect, useState } from "react"

export function usePersonalization() {
    const [order, setOrder] = useState<FeatureId[]>(DEFAULT_ORDER)
    const [greeting, setGreeting] = useState({ greeting: "", suggestion: "" })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const screenOrder = await personalizationEngine.getHomeScreenOrder()
            setOrder(screenOrder)
            setGreeting(personalizationEngine.getTimeBasedGreeting())
            setIsLoading(false)
        }
        load()
    }, [])

    const trackTap = async (featureId: FeatureId) => {
        await personalizationEngine.trackFeatureTap(featureId)
        const newOrder = await personalizationEngine.getHomeScreenOrder()
        setOrder(newOrder)
    }

    const trackTime = async (featureId: FeatureId, seconds: number) => {
        await personalizationEngine.trackTimeSpent(featureId, seconds)
    }

    return {
        order,
        greeting,
        isLoading,
        trackTap,
        trackTime,
    }
}
