/**
 * Smart Discovery Service
 * AI-curated personalized feed based on user activity
 * 
 * "Because you played pickleball last week..."
 * "Trending in Atlanta: Padel courts"
 * "New trainer near you: Coach Sarah ⭐4.9"
 */

import { db } from "../firebase-config"
import { LAUNCH_CITIES, LaunchCityId, BOOKABLE_SPORTS } from "../launch-cities"

export type DiscoveryItemType =
    | "recommended_venue"
    | "trending_sport"
    | "new_trainer"
    | "new_venue"
    | "popular_league"
    | "weather_suggestion"
    | "time_based"
    | "social"

export interface DiscoveryItem {
    id: string
    type: DiscoveryItemType
    title: string
    subtitle: string
    reason: string // "Because you played tennis last week"
    imageUrl?: string

    // Action
    actionType: "view_venue" | "view_trainer" | "view_league" | "book_now"
    actionData: {
        venueId?: string
        trainerId?: string
        leagueId?: string
        sport?: string
    }

    // Metadata
    priority: number // Higher = show first
    city: LaunchCityId
    sport?: string
    expiresAt?: Date
}

export interface UserActivityProfile {
    userId: string
    favoriteSports: string[]
    recentVenues: string[]
    recentBookings: { sport: string; date: Date }[]
    preferredTimes: string[] // "evening", "morning", "weekend"
    homeCity?: string
}

// Trending data by city (would be real-time in production)
const TRENDING_BY_CITY: { [key: string]: { sport: string; growth: number }[] } = {
    atlanta: [
        { sport: "Pickleball", growth: 45 },
        { sport: "Tennis", growth: 12 },
        { sport: "Padel", growth: 78 },
    ],
    "myrtle-beach": [
        { sport: "Pickleball", growth: 62 },
        { sport: "Tennis", growth: 8 },
    ],
    "san-francisco": [
        { sport: "Yoga", growth: 23 },
        { sport: "Pickleball", growth: 89 },
        { sport: "Tennis", growth: 15 },
    ],
    "new-york": [
        { sport: "Padel", growth: 120 },
        { sport: "Yoga", growth: 18 },
        { sport: "Pilates", growth: 25 },
    ],
    austin: [
        { sport: "Pickleball", growth: 95 },
        { sport: "Tennis", growth: 22 },
    ],
    phoenix: [
        { sport: "Tennis", growth: 30 },
        { sport: "Pickleball", growth: 55 },
    ],
    miami: [
        { sport: "Padel", growth: 85 },
        { sport: "Tennis", growth: 40 },
        { sport: "Yoga", growth: 15 },
    ],
}

export const smartDiscoveryService = {
    /**
     * Get user's activity profile for personalization
     */
    async getUserProfile(userId: string): Promise<UserActivityProfile> {
        if (!db) {
            return {
                userId,
                favoriteSports: [],
                recentVenues: [],
                recentBookings: [],
                preferredTimes: [],
            }
        }

        try {
            const { collection, query, where, orderBy, limit, getDocs, doc, getDoc } = await import("firebase/firestore")

            // Get user doc for home city
            const userDoc = await getDoc(doc(db, "users", userId))
            const userData = userDoc.data()

            // Get recent court bookings
            const bookingsQuery = query(
                collection(db, "court_bookings"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc"),
                limit(20)
            )
            const bookingsSnapshot = await getDocs(bookingsQuery)

            // Analyze bookings
            const sportCounts: { [key: string]: number } = {}
            const venues: string[] = []
            const timeBuckets: { [key: string]: number } = { morning: 0, afternoon: 0, evening: 0, weekend: 0 }

            bookingsSnapshot.docs.forEach(d => {
                const data = d.data()

                // Count sports (assuming we track sport in booking)
                if (data.sport) {
                    sportCounts[data.sport] = (sportCounts[data.sport] || 0) + 1
                }

                // Track venues
                if (data.venueId && !venues.includes(data.venueId)) {
                    venues.push(data.venueId)
                }

                // Analyze times
                const hour = parseInt(data.startTime?.split(":")[0] || "12")
                const date = new Date(data.date)
                const isWeekend = date.getDay() === 0 || date.getDay() === 6

                if (hour < 12) timeBuckets.morning++
                else if (hour < 17) timeBuckets.afternoon++
                else timeBuckets.evening++
                if (isWeekend) timeBuckets.weekend++
            })

            // Sort sports by frequency
            const favoriteSports = Object.entries(sportCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([sport]) => sport)

            // Get preferred times
            const preferredTimes = Object.entries(timeBuckets)
                .filter(([, count]) => count > 2)
                .map(([time]) => time)

            return {
                userId,
                favoriteSports,
                recentVenues: venues.slice(0, 5),
                recentBookings: bookingsSnapshot.docs.slice(0, 5).map(d => ({
                    sport: d.data().sport || "Unknown",
                    date: d.data().createdAt?.toDate?.() || new Date(),
                })),
                preferredTimes,
                homeCity: userData?.city,
            }
        } catch (error) {
            console.error("Error getting user profile:", error)
            return {
                userId,
                favoriteSports: [],
                recentVenues: [],
                recentBookings: [],
                preferredTimes: [],
            }
        }
    },

    /**
     * Generate personalized discovery feed
     */
    async getDiscoveryFeed(
        userId: string,
        city: LaunchCityId,
        limit: number = 10
    ): Promise<DiscoveryItem[]> {
        const profile = await this.getUserProfile(userId)
        const items: DiscoveryItem[] = []

        // 1. Personalized recommendations based on history
        if (profile.favoriteSports.length > 0) {
            const faveSport = profile.favoriteSports[0]
            items.push({
                id: `rec-${faveSport}-${Date.now()}`,
                type: "recommended_venue",
                title: `Top ${faveSport} Courts Near You`,
                subtitle: "Based on ratings and availability",
                reason: `Because you play ${faveSport}`,
                priority: 100,
                city,
                sport: faveSport,
                actionType: "view_venue",
                actionData: { sport: faveSport },
            })
        }

        // 2. Trending in your city
        const trending = TRENDING_BY_CITY[city] || []
        if (trending.length > 0) {
            const topTrending = trending[0]
            items.push({
                id: `trending-${topTrending.sport}-${Date.now()}`,
                type: "trending_sport",
                title: `${topTrending.sport} is 🔥 in ${this.getCityName(city)}`,
                subtitle: `+${topTrending.growth}% more bookings this month`,
                reason: "Trending now",
                priority: 90,
                city,
                sport: topTrending.sport,
                actionType: "view_venue",
                actionData: { sport: topTrending.sport },
            })
        }

        // 3. Time-based suggestions
        const hour = new Date().getHours()
        const dayOfWeek = new Date().getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

        if (hour >= 17 && hour < 21) {
            items.push({
                id: `time-evening-${Date.now()}`,
                type: "time_based",
                title: "Courts Available Tonight",
                subtitle: "Book now before they fill up",
                reason: "Evening slots going fast",
                priority: 85,
                city,
                actionType: "book_now",
                actionData: {},
            })
        }

        if (isWeekend && hour < 12) {
            items.push({
                id: `time-weekend-${Date.now()}`,
                type: "time_based",
                title: "Weekend Wellness Classes",
                subtitle: "Start your weekend right",
                reason: "Perfect weather for outdoor yoga",
                priority: 80,
                city,
                actionType: "view_venue",
                actionData: { sport: "Yoga" },
            })
        }

        // 4. Try something new (if they always play one sport)
        if (profile.favoriteSports.length === 1) {
            const currentSport = profile.favoriteSports[0]
            const suggestion = currentSport === "Tennis" ? "Pickleball" :
                currentSport === "Pickleball" ? "Padel" :
                    currentSport === "Yoga" ? "Pilates" : "Tennis"

            items.push({
                id: `try-${suggestion}-${Date.now()}`,
                type: "recommended_venue",
                title: `Have You Tried ${suggestion}?`,
                subtitle: `Popular with ${currentSport} players`,
                reason: "Players like you love it",
                priority: 70,
                city,
                sport: suggestion,
                actionType: "view_venue",
                actionData: { sport: suggestion },
            })
        }

        // 5. League suggestions
        if (profile.favoriteSports.length > 0) {
            items.push({
                id: `league-${profile.favoriteSports[0]}-${Date.now()}`,
                type: "popular_league",
                title: `${profile.favoriteSports[0]} Leagues Forming`,
                subtitle: "Join a team and compete",
                reason: "Match your skill level",
                priority: 65,
                city,
                sport: profile.favoriteSports[0],
                actionType: "view_league",
                actionData: { sport: profile.favoriteSports[0] },
            })
        }

        // Sort by priority and limit
        return items
            .sort((a, b) => b.priority - a.priority)
            .slice(0, limit)
    },

    /**
     * Get trending sports for a city
     */
    getTrendingSports(city: LaunchCityId): { sport: string; growth: number }[] {
        return TRENDING_BY_CITY[city] || []
    },

    /**
     * Get city display name
     */
    getCityName(cityId: LaunchCityId): string {
        return LAUNCH_CITIES.find(c => c.id === cityId)?.name || cityId
    },

    /**
     * Record user interaction for better recommendations
     */
    async recordInteraction(
        userId: string,
        itemId: string,
        interactionType: "view" | "click" | "book" | "dismiss"
    ): Promise<void> {
        if (!db) return

        try {
            const { collection, addDoc } = await import("firebase/firestore")

            await addDoc(collection(db, "discovery_interactions"), {
                userId,
                itemId,
                interactionType,
                timestamp: new Date(),
            })
        } catch (error) {
            console.error("Error recording interaction:", error)
        }
    },

    /**
     * Get "For You" section items
     */
    async getForYouItems(userId: string, city: LaunchCityId): Promise<DiscoveryItem[]> {
        const feed = await this.getDiscoveryFeed(userId, city)
        return feed.filter(item =>
            item.type === "recommended_venue" ||
            item.type === "time_based"
        )
    },

    /**
     * Get "Trending" section items
     */
    async getTrendingItems(city: LaunchCityId): Promise<DiscoveryItem[]> {
        const trending = this.getTrendingSports(city)

        return trending.map((t, i) => ({
            id: `trending-${t.sport}-${i}`,
            type: "trending_sport" as const,
            title: `${t.sport}`,
            subtitle: `+${t.growth}% this month`,
            reason: "Trending",
            priority: 100 - i,
            city,
            sport: t.sport,
            actionType: "view_venue" as const,
            actionData: { sport: t.sport },
        }))
    },
}

export default smartDiscoveryService
