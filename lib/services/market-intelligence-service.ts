/**
 * Market Intelligence Service
 * Provides local market data for personalized facility onboarding
 */

import { db } from "../firebase-config"

export interface MarketIntelligence {
    city: string
    sport: string
    nearbyVenueCount: number
    playerCountNearby: number
    averageHourlyRate: number
    peakTimes: PeakTime[]
    demandLevel: "low" | "medium" | "high"
    competitorRanking: number // What position they'd be
    topCompetitors: CompetitorInfo[]
}

export interface PeakTime {
    day: string
    time: string
    demandScore: number // 1-10
}

export interface CompetitorInfo {
    name: string
    hourlyRate: number
    utilization: number // 0-100 estimated
    distance: number // miles
}

export interface RevenueEstimate {
    conservative: number
    realistic: number
    optimistic: number
    utilizationRate: number
    bookingsPerDay: number
    monthlyRevenue: number
}

// Cached market data (in production, this would come from DB aggregations)
const MARKET_DATA: { [key: string]: Partial<MarketIntelligence> } = {
    "Atlanta-Tennis": {
        nearbyVenueCount: 12,
        playerCountNearby: 4200,
        averageHourlyRate: 47,
        demandLevel: "high",
        peakTimes: [
            { day: "Tuesday", time: "6pm-8pm", demandScore: 9 },
            { day: "Thursday", time: "6pm-8pm", demandScore: 9 },
            { day: "Saturday", time: "9am-11am", demandScore: 10 },
            { day: "Sunday", time: "10am-12pm", demandScore: 8 },
        ],
        topCompetitors: [
            { name: "Atlanta Tennis Club", hourlyRate: 55, utilization: 78, distance: 2.1 },
            { name: "Piedmont Park Courts", hourlyRate: 40, utilization: 95, distance: 3.4 },
            { name: "Decatur Racquet Club", hourlyRate: 50, utilization: 94, distance: 1.8 },
        ],
    },
    "Atlanta-Pickleball": {
        nearbyVenueCount: 8,
        playerCountNearby: 2800,
        averageHourlyRate: 35,
        demandLevel: "high",
        peakTimes: [
            { day: "Monday", time: "9am-11am", demandScore: 8 },
            { day: "Wednesday", time: "9am-11am", demandScore: 8 },
            { day: "Saturday", time: "8am-10am", demandScore: 10 },
        ],
        topCompetitors: [
            { name: "Pickleball ATL", hourlyRate: 40, utilization: 88, distance: 2.5 },
            { name: "Chastain Pickleball", hourlyRate: 30, utilization: 92, distance: 4.1 },
        ],
    },
    "Atlanta-Yoga": {
        nearbyVenueCount: 24,
        playerCountNearby: 6500,
        averageHourlyRate: 30,
        demandLevel: "medium",
        peakTimes: [
            { day: "Tuesday", time: "6am-7am", demandScore: 9 },
            { day: "Thursday", time: "6am-7am", demandScore: 9 },
            { day: "Saturday", time: "9am-10am", demandScore: 10 },
        ],
        topCompetitors: [
            { name: "CorePower Yoga", hourlyRate: 35, utilization: 65, distance: 1.2 },
            { name: "Lifetime Yoga Studio", hourlyRate: 40, utilization: 58, distance: 2.8 },
        ],
    },
    "Decatur-Tennis": {
        nearbyVenueCount: 6,
        playerCountNearby: 1800,
        averageHourlyRate: 45,
        demandLevel: "high",
        peakTimes: [
            { day: "Tuesday", time: "6pm-8pm", demandScore: 9 },
            { day: "Saturday", time: "9am-11am", demandScore: 10 },
        ],
        topCompetitors: [
            { name: "Decatur Racquet Club", hourlyRate: 50, utilization: 94, distance: 0.5 },
            { name: "Scott Park Tennis", hourlyRate: 35, utilization: 85, distance: 1.2 },
        ],
    },
}

// Default data for unknown markets
const DEFAULT_MARKET_DATA: MarketIntelligence = {
    city: "Unknown",
    sport: "Tennis",
    nearbyVenueCount: 5,
    playerCountNearby: 1000,
    averageHourlyRate: 40,
    demandLevel: "medium",
    competitorRanking: 3,
    peakTimes: [
        { day: "Saturday", time: "9am-11am", demandScore: 8 },
        { day: "Sunday", time: "10am-12pm", demandScore: 7 },
    ],
    topCompetitors: [],
}

export const marketIntelligenceService = {
    /**
     * Get market intelligence for a specific city and sport
     */
    async getMarketIntelligence(city: string, sport: string): Promise<MarketIntelligence> {
        const key = `${city}-${sport}`
        const cached = MARKET_DATA[key]

        if (cached) {
            return {
                city,
                sport,
                nearbyVenueCount: cached.nearbyVenueCount || 5,
                playerCountNearby: cached.playerCountNearby || 1000,
                averageHourlyRate: cached.averageHourlyRate || 40,
                demandLevel: cached.demandLevel || "medium",
                competitorRanking: (cached.nearbyVenueCount || 5) > 2 ? 3 : 2,
                peakTimes: cached.peakTimes || [],
                topCompetitors: cached.topCompetitors || [],
            }
        }

        // Try to get real data from Firestore (in production)
        try {
            if (db) {
                // Get venue count
                const venuesQuery = db.collection("venues")
                    .where("city", "==", city)
                    .where("sport", "==", sport)
                const venuesSnapshot = await venuesQuery.get()
                const venueCount = venuesSnapshot.size

                // Get average rate from courts
                const courtsSnapshot = await db.collection("courts").get()
                let totalRate = 0
                let courtCount = 0
                courtsSnapshot.forEach(doc => {
                    const rate = doc.data().hourlyRate
                    if (rate) {
                        totalRate += rate / 100 // Convert from cents
                        courtCount++
                    }
                })
                const avgRate = courtCount > 0 ? Math.round(totalRate / courtCount) : 40

                return {
                    city,
                    sport,
                    nearbyVenueCount: venueCount || 5,
                    playerCountNearby: venueCount * 200, // Estimate
                    averageHourlyRate: avgRate,
                    demandLevel: venueCount > 10 ? "high" : venueCount > 5 ? "medium" : "low",
                    competitorRanking: venueCount > 2 ? 3 : 2,
                    peakTimes: DEFAULT_MARKET_DATA.peakTimes,
                    topCompetitors: [],
                }
            }
        } catch (error) {
            console.error("Error fetching market data:", error)
        }

        return { ...DEFAULT_MARKET_DATA, city, sport }
    },

    /**
     * Calculate revenue estimates with different scenarios
     */
    getRevenueEstimate(
        courtCount: number,
        hourlyRate: number,
        utilizationPercent: number = 70
    ): RevenueEstimate {
        // Operating hours: assume 12 hours/day (6am-6pm or similar)
        const hoursPerDay = 12
        // Operating days per month
        const daysPerMonth = 26 // Roughly 6 days/week

        const maxBookingsPerDay = hoursPerDay * courtCount
        const utilization = utilizationPercent / 100

        const bookingsPerDay = Math.round(maxBookingsPerDay * utilization)
        const monthlyRevenue = bookingsPerDay * hourlyRate * daysPerMonth

        return {
            conservative: Math.round(monthlyRevenue * 0.6),
            realistic: Math.round(monthlyRevenue),
            optimistic: Math.round(monthlyRevenue * 1.4),
            utilizationRate: utilizationPercent,
            bookingsPerDay,
            monthlyRevenue,
        }
    },

    /**
     * Get suggested pricing based on competitors
     */
    getSuggestedPricing(marketData: MarketIntelligence): {
        suggested: number
        reason: string
        position: "budget" | "mid" | "premium"
    } {
        const avgRate = marketData.averageHourlyRate
        const competitors = marketData.topCompetitors

        if (competitors.length === 0) {
            return {
                suggested: avgRate,
                reason: "Based on market average",
                position: "mid",
            }
        }

        // Find the sweet spot - slightly below the most popular competitor
        const topCompetitor = competitors.sort((a, b) => b.utilization - a.utilization)[0]
        const suggestedRate = Math.round(topCompetitor.hourlyRate * 0.9)

        if (suggestedRate < avgRate * 0.8) {
            return {
                suggested: avgRate,
                reason: "Match market average for competitive positioning",
                position: "mid",
            }
        }

        return {
            suggested: suggestedRate,
            reason: `Undercut ${topCompetitor.name} (${topCompetitor.utilization}% utilization) while maintaining premium feel`,
            position: suggestedRate > avgRate ? "premium" : "mid",
        }
    },

    /**
     * Get demand insights for the market
     */
    getDemandInsights(marketData: MarketIntelligence): {
        headline: string
        body: string
        urgency: "low" | "medium" | "high"
    } {
        const highUtilization = marketData.topCompetitors.filter(c => c.utilization > 85)

        if (highUtilization.length >= 2) {
            return {
                headline: "🔥 HIGH DEMAND ALERT",
                body: `${highUtilization.length} nearby facilities are 85%+ booked. Players are actively searching for alternatives!`,
                urgency: "high",
            }
        }

        if (marketData.demandLevel === "high") {
            return {
                headline: "📈 Growing Market",
                body: `${marketData.playerCountNearby.toLocaleString()} active players in your area. Demand is outpacing supply.`,
                urgency: "medium",
            }
        }

        return {
            headline: "🎯 Opportunity Zone",
            body: `Only ${marketData.nearbyVenueCount} venues serving ${marketData.playerCountNearby.toLocaleString()} players. Room for a quality option.`,
            urgency: "low",
        }
    },

    /**
     * Get social proof stats
     */
    getSocialProof(): {
        facilitiesJoinedThisMonth: number
        averageFirstMonthRevenue: number
        trainersLookingNearby: number
    } {
        // In production, these would be real aggregated stats
        return {
            facilitiesJoinedThisMonth: 12,
            averageFirstMonthRevenue: 2400,
            trainersLookingNearby: 3,
        }
    },
}

export default marketIntelligenceService
