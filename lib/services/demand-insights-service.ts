/**
 * Demand Insights Service (Premium Feature)
 * AI-powered analytics to help facilities understand demand patterns
 */

import { db } from "../firebase-config"

const SEARCH_ANALYTICS_COLLECTION = "search_analytics"
const BOOKING_ANALYTICS_COLLECTION = "booking_analytics"

export interface SearchEvent {
    id?: string
    venueId: string
    facilityId?: string
    date: string
    hour: number // 0-23
    dayOfWeek: number // 0-6
    sport?: string
    userId?: string
    didBook: boolean
    timestamp: Date
}

export interface DemandHeatmapData {
    hour: number
    dayOfWeek: number
    searchCount: number
    bookingCount: number
    conversionRate: number
}

export interface SlotInsight {
    day: string
    time: string
    issue: "underbooked" | "high-demand" | "price-opportunity"
    message: string
    suggestion: string
}

export const demandInsightsService = {
    /**
     * Track a search event (called when player searches for availability)
     */
    async trackSearch(event: Omit<SearchEvent, "id" | "timestamp">): Promise<void> {
        if (!db) return

        try {
            await db.collection(SEARCH_ANALYTICS_COLLECTION).add({
                ...event,
                timestamp: new Date(),
            })
        } catch (error) {
            console.error("Error tracking search:", error)
        }
    },

    /**
     * Update search as converted to booking
     */
    async markSearchConverted(venueId: string, userId: string): Promise<void> {
        if (!db) return

        try {
            // Find recent search from this user for this venue
            const oneHourAgo = new Date()
            oneHourAgo.setHours(oneHourAgo.getHours() - 1)

            const query = db.collection(SEARCH_ANALYTICS_COLLECTION)
                .where("venueId", "==", venueId)
                .where("userId", "==", userId)
                .where("didBook", "==", false)
                .where("timestamp", ">=", oneHourAgo)
                .orderBy("timestamp", "desc")
                .limit(1)

            const snapshot = await query.get()
            if (!snapshot.empty) {
                await snapshot.docs[0].ref.update({ didBook: true })
            }
        } catch (error) {
            console.error("Error marking search converted:", error)
        }
    },

    /**
     * Get demand heatmap data for a facility (last 30 days)
     * Shows which hours/days have most searches
     */
    async getDemandHeatmap(facilityId: string): Promise<DemandHeatmapData[]> {
        if (!db) return []

        try {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const query = db.collection(SEARCH_ANALYTICS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("timestamp", ">=", thirtyDaysAgo)

            const snapshot = await query.get()

            // Aggregate by hour and day
            const heatmap: { [key: string]: { searches: number; bookings: number } } = {}

            // Initialize all hour/day combinations
            for (let day = 0; day < 7; day++) {
                for (let hour = 6; hour < 22; hour++) {
                    heatmap[`${day}-${hour}`] = { searches: 0, bookings: 0 }
                }
            }

            // Count searches and bookings
            snapshot.docs.forEach(doc => {
                const data = doc.data()
                const key = `${data.dayOfWeek}-${data.hour}`
                if (heatmap[key]) {
                    heatmap[key].searches++
                    if (data.didBook) heatmap[key].bookings++
                }
            })

            // Convert to array
            return Object.entries(heatmap).map(([key, value]) => {
                const [day, hour] = key.split("-").map(Number)
                return {
                    hour,
                    dayOfWeek: day,
                    searchCount: value.searches,
                    bookingCount: value.bookings,
                    conversionRate: value.searches > 0
                        ? Math.round((value.bookings / value.searches) * 100)
                        : 0,
                }
            })
        } catch (error) {
            console.error("Error getting demand heatmap:", error)
            return []
        }
    },

    /**
     * Get AI-generated slot insights
     * Identifies underperforming slots and opportunities
     */
    async getSlotInsights(facilityId: string): Promise<SlotInsight[]> {
        if (!db) return []

        try {
            const heatmap = await this.getDemandHeatmap(facilityId)
            const insights: SlotInsight[] = []

            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

            // Find patterns
            heatmap.forEach(slot => {
                const dayName = dayNames[slot.dayOfWeek]
                const timeStr = `${slot.hour}:00`

                // High demand but low conversion = pricing opportunity
                if (slot.searchCount > 10 && slot.conversionRate < 30) {
                    insights.push({
                        day: dayName,
                        time: timeStr,
                        issue: "high-demand",
                        message: `${slot.searchCount} searches but only ${slot.conversionRate}% booked`,
                        suggestion: "Consider raising price or adding more courts",
                    })
                }

                // Very low searches = needs promotion
                if (slot.searchCount < 3 && slot.hour >= 9 && slot.hour <= 17) {
                    insights.push({
                        day: dayName,
                        time: timeStr,
                        issue: "underbooked",
                        message: "Very few players looking at this time",
                        suggestion: "Try a 20% discount to attract bookings",
                    })
                }

                // High conversion = room to increase price
                if (slot.searchCount > 5 && slot.conversionRate > 80) {
                    insights.push({
                        day: dayName,
                        time: timeStr,
                        issue: "price-opportunity",
                        message: `${slot.conversionRate}% of searches book instantly`,
                        suggestion: "You could increase price by $5-10/hr",
                    })
                }
            })

            // Sort by importance (high demand first, then underbooked)
            return insights
                .sort((a, b) => {
                    const priority = { "high-demand": 0, "price-opportunity": 1, "underbooked": 2 }
                    return priority[a.issue] - priority[b.issue]
                })
                .slice(0, 5) // Top 5 insights
        } catch (error) {
            console.error("Error getting slot insights:", error)
            return []
        }
    },

    /**
     * Get weekly revenue data for chart
     */
    async getWeeklyRevenue(facilityId: string, weeks: number = 4): Promise<{
        week: string
        revenue: number
        bookings: number
    }[]> {
        if (!db) return []

        try {
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - (weeks * 7))
            const startDateStr = startDate.toISOString().split("T")[0]

            // Get court bookings
            const bookingsQuery = db.collection("court_bookings")
                .where("facilityId", "==", facilityId)
                .where("date", ">=", startDateStr)
                .where("paymentStatus", "==", "paid")

            const snapshot = await bookingsQuery.get()

            // Group by week
            const weeklyData: { [week: string]: { revenue: number; bookings: number } } = {}

            snapshot.docs.forEach(doc => {
                const data = doc.data()
                const bookingDate = new Date(data.date)
                const weekStart = new Date(bookingDate)
                weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                const weekStr = weekStart.toISOString().split("T")[0]

                if (!weeklyData[weekStr]) {
                    weeklyData[weekStr] = { revenue: 0, bookings: 0 }
                }
                weeklyData[weekStr].revenue += (data.facilityPayout || 0) / 100 // Convert cents to dollars
                weeklyData[weekStr].bookings++
            })

            return Object.entries(weeklyData)
                .map(([week, data]) => ({
                    week,
                    revenue: Math.round(data.revenue),
                    bookings: data.bookings,
                }))
                .sort((a, b) => a.week.localeCompare(b.week))
        } catch (error) {
            console.error("Error getting weekly revenue:", error)
            return []
        }
    },

    /**
     * Get summary stats
     */
    async getFacilityStats(facilityId: string): Promise<{
        totalRevenue: number
        totalBookings: number
        avgBookingsPerDay: number
        topHour: string
        conversionRate: number
    }> {
        if (!db) return {
            totalRevenue: 0,
            totalBookings: 0,
            avgBookingsPerDay: 0,
            topHour: "N/A",
            conversionRate: 0,
        }

        try {
            // Get last 30 days of bookings
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const startDate = thirtyDaysAgo.toISOString().split("T")[0]

            const bookingsQuery = db.collection("court_bookings")
                .where("facilityId", "==", facilityId)
                .where("date", ">=", startDate)
                .where("paymentStatus", "==", "paid")

            const snapshot = await bookingsQuery.get()

            let totalRevenue = 0
            const hourCounts: { [hour: string]: number } = {}

            snapshot.docs.forEach(doc => {
                const data = doc.data()
                totalRevenue += (data.facilityPayout || 0) / 100

                const hour = data.startTime?.split(":")[0] || "00"
                hourCounts[hour] = (hourCounts[hour] || 0) + 1
            })

            const topHour = Object.entries(hourCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

            // Get heatmap for conversion rate
            const heatmap = await this.getDemandHeatmap(facilityId)
            const totalSearches = heatmap.reduce((sum, s) => sum + s.searchCount, 0)
            const totalBooked = heatmap.reduce((sum, s) => sum + s.bookingCount, 0)

            return {
                totalRevenue: Math.round(totalRevenue),
                totalBookings: snapshot.size,
                avgBookingsPerDay: Math.round(snapshot.size / 30 * 10) / 10,
                topHour: topHour !== "N/A" ? `${topHour}:00` : "N/A",
                conversionRate: totalSearches > 0
                    ? Math.round((totalBooked / totalSearches) * 100)
                    : 0,
            }
        } catch (error) {
            console.error("Error getting facility stats:", error)
            return {
                totalRevenue: 0,
                totalBookings: 0,
                avgBookingsPerDay: 0,
                topHour: "N/A",
                conversionRate: 0,
            }
        }
    },
}

export default demandInsightsService
