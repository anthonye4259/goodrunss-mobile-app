import { Venue } from '@/lib/venue-data'

export class ActivityPredictor {
    private static instance: ActivityPredictor

    static getInstance(): ActivityPredictor {
        if (!ActivityPredictor.instance) {
            ActivityPredictor.instance = new ActivityPredictor()
        }
        return ActivityPredictor.instance
    }

    /**
     * Predict crowd level for a venue at a specific time
     */
    predictCrowdLevel(venue: Venue, targetTime: Date = new Date()): {
        level: 'Low' | 'Medium' | 'High' | 'Very High'
        playerCount: number
        confidence: number
    } {
        const hour = targetTime.getHours()
        const day = targetTime.getDay()

        // Simulate historical average
        const historicalAvg = this.getHistoricalAverage(venue, hour, day)

        let level: 'Low' | 'Medium' | 'High' | 'Very High' = 'Low'
        if (historicalAvg >= 20) level = 'Very High'
        else if (historicalAvg >= 10) level = 'High'
        else if (historicalAvg >= 5) level = 'Medium'

        return {
            level,
            playerCount: historicalAvg,
            confidence: 0.82 + Math.random() * 0.15, // 82-97% confidence
        }
    }

    /**
     * Get simulated historical average
     */
    private getHistoricalAverage(venue: Venue, hour: number, day: number): number {
        let base = 0

        // Time-based patterns
        if (hour >= 6 && hour <= 9) base = 8
        else if (hour >= 17 && hour <= 20) base = 15
        else if (hour >= 12 && hour <= 14) base = 5
        else if (hour >= 21 && hour <= 23) base = 3
        else if (hour >= 10 && hour <= 11) base = 4
        else if (hour >= 14 && hour <= 16) base = 6

        // Weekend adjustment
        if (day === 0 || day === 6) base *= 1.5

        // Venue rating adjustment
        const ratingMultiplier = venue.rating ? (venue.rating / 5) * 0.5 + 0.75 : 1.0

        return Math.round(base * ratingMultiplier)
    }

    /**
     * Get best time to visit recommendation
     */
    getBestTimeToVisit(venue: Venue): string {
        // Low crowd hours
        const lowHours = [
            { start: 10, end: 12, label: '10:00 AM - 12:00 PM' },
            { start: 14, end: 16, label: '2:00 PM - 4:00 PM' },
        ]

        const randomSlot = lowHours[Math.floor(Math.random() * lowHours.length)]
        return `${randomSlot.label} (Low crowd)`
    }

    /**
     * Get peak hours for a venue
     */
    getPeakHours(venue: Venue): string[] {
        return [
            '6:00 AM - 9:00 AM (Morning rush)',
            '5:00 PM - 8:00 PM (After work)',
        ]
    }

    /**
     * Get activity trend
     */
    getActivityTrend(venue: Venue): {
        direction: 'up' | 'down' | 'stable'
        percentage: number
        description: string
    } {
        const rand = Math.random()

        if (rand < 0.3) {
            // Trending up
            const percentage = Math.floor(Math.random() * 30) + 10 // 10-40%
            return {
                direction: 'up',
                percentage,
                description: `Activity up ${percentage}% this week`,
            }
        } else if (rand < 0.5) {
            // Trending down
            const percentage = Math.floor(Math.random() * 20) + 5 // 5-25%
            return {
                direction: 'down',
                percentage,
                description: `Activity down ${percentage}% this week`,
            }
        } else {
            // Stable
            return {
                direction: 'stable',
                percentage: 0,
                description: 'Activity stable this week',
            }
        }
    }
}
