import { Venue } from '@/lib/venue-data'

interface CheckIn {
    userId: string
    timestamp: Date
    sport: string
}

export class ActivitySimulator {
    private static instance: ActivitySimulator

    static getInstance(): ActivitySimulator {
        if (!ActivitySimulator.instance) {
            ActivitySimulator.instance = new ActivitySimulator()
        }
        return ActivitySimulator.instance
    }

    /**
     * Generate realistic player count for a venue based on time, location, and sport
     */
    generatePlayerCount(venue: Venue, currentTime: Date = new Date()): number {
        const hour = currentTime.getHours()
        const day = currentTime.getDay() // 0 = Sunday, 6 = Saturday

        // Base activity by time of day
        let baseActivity = 0
        if (hour >= 6 && hour <= 9) {
            baseActivity = 8 // Morning workout crowd
        } else if (hour >= 17 && hour <= 20) {
            baseActivity = 15 // After work peak
        } else if (hour >= 12 && hour <= 14) {
            baseActivity = 5 // Lunch time
        } else if (hour >= 21 && hour <= 23) {
            baseActivity = 3 // Night owls
        } else if (hour >= 10 && hour <= 11) {
            baseActivity = 4 // Mid-morning
        } else if (hour >= 14 && hour <= 16) {
            baseActivity = 6 // Afternoon
        } else {
            baseActivity = 0 // Late night/early morning
        }

        // Weekend multiplier (more activity on weekends)
        const weekendMultiplier = (day === 0 || day === 6) ? 1.5 : 1.0

        // City size multiplier
        const cityMultiplier = this.getCityMultiplier(venue.city)

        // Sport popularity multiplier
        const sportMultiplier = this.getSportMultiplier(venue.sport)

        // Venue rating multiplier (better venues = more players)
        const ratingMultiplier = venue.rating ? (venue.rating / 5) * 0.5 + 0.75 : 1.0

        // Add randomness (±30%)
        const randomFactor = 0.7 + Math.random() * 0.6

        const count = Math.round(
            baseActivity *
            weekendMultiplier *
            cityMultiplier *
            sportMultiplier *
            ratingMultiplier *
            randomFactor
        )

        return Math.max(0, count)
    }

    /**
     * Get city size multiplier
     */
    private getCityMultiplier(city?: string): number {
        if (!city) return 1.0

        const cityLower = city.toLowerCase()

        // Major cities
        if (cityLower.includes('new york') || cityLower.includes('los angeles') ||
            cityLower.includes('chicago') || cityLower.includes('houston')) {
            return 2.0
        }

        // Large cities
        if (cityLower.includes('miami') || cityLower.includes('atlanta') ||
            cityLower.includes('boston') || cityLower.includes('seattle')) {
            return 1.5
        }

        // Medium cities
        return 1.0
    }

    /**
     * Get sport popularity multiplier
     */
    private getSportMultiplier(sport: string): number {
        const sportLower = sport.toLowerCase()

        if (sportLower.includes('basketball')) return 1.5
        if (sportLower.includes('soccer') || sportLower.includes('football')) return 1.3
        if (sportLower.includes('tennis')) return 1.2
        if (sportLower.includes('volleyball')) return 1.1
        if (sportLower.includes('pickleball')) return 1.0
        if (sportLower.includes('yoga') || sportLower.includes('pilates')) return 0.9

        return 1.0
    }

    /**
     * Generate realistic check-in timestamps
     */
    generateCheckIns(venue: Venue, count: number): CheckIn[] {
        const checkIns: CheckIn[] = []
        const now = Date.now()

        for (let i = 0; i < count; i++) {
            // Random time within last hour (weighted toward recent)
            const minutesAgo = Math.pow(Math.random(), 2) * 60 // Weighted toward recent
            const timestamp = new Date(now - minutesAgo * 60 * 1000)

            checkIns.push({
                userId: this.generateUserId(),
                timestamp,
                sport: venue.sport,
            })
        }

        // Sort by timestamp (newest first)
        return checkIns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    /**
     * Generate a realistic user ID
     */
    private generateUserId(): string {
        return `sim_${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Generate realistic user name
     */
    generateUserName(): string {
        const firstNames = [
            'Mike', 'Sarah', 'James', 'Emily', 'Chris', 'Alex',
            'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie'
        ]
        const sports = [
            'Hoops', 'Baller', 'Player', 'Pro', 'King', 'Queen',
            'Star', 'Ace', 'MVP', 'Champ'
        ]

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const sport = sports[Math.floor(Math.random() * sports.length)]
        const number = Math.floor(Math.random() * 99) + 1

        return `${firstName}_${sport}${number}`
    }

    /**
     * Calculate global stats (for home screen)
     */
    calculateGlobalStats(venues: Venue[]): {
        totalActivePlayers: number
        activeVenues: number
        gamesHappening: number
    } {
        const now = new Date()
        let totalActivePlayers = 0
        let activeVenues = 0

        venues.forEach(venue => {
            const count = this.generatePlayerCount(venue, now)
            totalActivePlayers += count
            if (count > 0) activeVenues++
        })

        // Estimate games (assume 4-10 players per game)
        const gamesHappening = Math.floor(totalActivePlayers / 6)

        return {
            totalActivePlayers,
            activeVenues,
            gamesHappening,
        }
    }

    /**
     * Get crowd level description
     */
    getCrowdLevel(playerCount: number): 'Low' | 'Medium' | 'High' | 'Very High' {
        if (playerCount >= 20) return 'Very High'
        if (playerCount >= 10) return 'High'
        if (playerCount >= 5) return 'Medium'
        return 'Low'
    }

    /**
     * Generate "Need Players" alert
     */
    generateNeedPlayersAlert(venue: Venue): {
        userName: string
        playersNeeded: number
        skillLevel: string
        minutesAgo: number
    } | null {
        // Only generate during peak hours
        const hour = new Date().getHours()
        if (hour < 6 || hour > 22) return null

        // 30% chance of having an alert
        if (Math.random() > 0.3) return null

        const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Any']

        return {
            userName: this.generateUserName(),
            playersNeeded: Math.floor(Math.random() * 3) + 1, // 1-3 players
            skillLevel: skillLevels[Math.floor(Math.random() * skillLevels.length)],
            minutesAgo: Math.floor(Math.random() * 45) + 5, // 5-50 minutes ago
        }
    }
}
