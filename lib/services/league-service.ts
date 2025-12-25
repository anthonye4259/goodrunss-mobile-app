/**
 * League Finder Service
 * Discover and join leagues for each sport in launch cities
 * 
 * "Find pickleball leagues in Atlanta"
 * "Join a beginner tennis league"
 * "Weekend tennis doubles"
 */

import { db } from "../firebase-config"
import { LAUNCH_CITIES, LaunchCityId, BOOKABLE_SPORTS, BookableSport } from "../launch-cities"

const LEAGUES_COLLECTION = "leagues"
const LEAGUE_MEMBERS_COLLECTION = "members"

export type LeagueFormat = "singles" | "doubles" | "mixed_doubles" | "team"
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "open"
export type LeagueStatus = "forming" | "active" | "completed" | "cancelled"

export interface League {
    id: string

    // Basic info
    name: string
    sport: BookableSport
    city: LaunchCityId
    description: string
    imageUrl?: string

    // Format
    format: LeagueFormat
    skillLevel: SkillLevel

    // Schedule
    dayOfWeek: string // "Saturday" | "Sunday" | "Weeknights"
    startTime: string // "18:00"
    duration: string // "2 hours"
    seasonStart: Date
    seasonEnd: Date
    matchesPerSeason: number

    // Location
    venueId?: string
    venueName?: string
    venueAddress?: string

    // Capacity
    maxTeams?: number
    maxPlayers: number
    currentPlayers: number
    waitlistCount: number

    // Cost
    pricePerSeason: number // In cents
    includesCourtFees: boolean

    // Organizer
    organizerId: string
    organizerName: string

    // Status
    status: LeagueStatus

    // Metadata
    createdAt: Date
    updatedAt: Date
}

export interface LeagueMember {
    id: string
    leagueId: string
    userId: string
    userName: string
    userPhoto?: string

    // Team (if applicable)
    teamId?: string
    teamName?: string

    // Status
    status: "registered" | "waitlist" | "dropped"
    registeredAt: Date

    // Payment
    paid: boolean
    paymentId?: string
}

// Sample leagues for launch cities
const SAMPLE_LEAGUES: Partial<League>[] = [
    // Atlanta
    {
        name: "Atlanta Pickleball Weekly",
        sport: "Pickleball",
        city: "atlanta",
        format: "doubles",
        skillLevel: "intermediate",
        dayOfWeek: "Saturday",
        startTime: "09:00",
        duration: "3 hours",
        matchesPerSeason: 8,
        pricePerSeason: 12000, // $120
        maxPlayers: 32,
    },
    {
        name: "Midtown Tennis League",
        sport: "Tennis",
        city: "atlanta",
        format: "singles",
        skillLevel: "advanced",
        dayOfWeek: "Weeknights",
        startTime: "18:00",
        duration: "2 hours",
        matchesPerSeason: 10,
        pricePerSeason: 15000,
        maxPlayers: 24,
    },
    // NYC
    {
        name: "NYC Padel League",
        sport: "Padel",
        city: "new-york",
        format: "doubles",
        skillLevel: "open",
        dayOfWeek: "Sunday",
        startTime: "10:00",
        duration: "3 hours",
        matchesPerSeason: 6,
        pricePerSeason: 20000,
        maxPlayers: 16,
    },
    // Miami
    {
        name: "South Beach Tennis Doubles",
        sport: "Tennis",
        city: "miami",
        format: "mixed_doubles",
        skillLevel: "intermediate",
        dayOfWeek: "Saturday",
        startTime: "08:00",
        duration: "2 hours",
        matchesPerSeason: 8,
        pricePerSeason: 10000,
        maxPlayers: 24,
    },
    // SF
    {
        name: "Bay Area Pickleball Open",
        sport: "Pickleball",
        city: "san-francisco",
        format: "doubles",
        skillLevel: "beginner",
        dayOfWeek: "Sunday",
        startTime: "09:00",
        duration: "3 hours",
        matchesPerSeason: 6,
        pricePerSeason: 8000,
        maxPlayers: 40,
    },
    // Austin
    {
        name: "Keep Austin Playing Tennis",
        sport: "Tennis",
        city: "austin",
        format: "singles",
        skillLevel: "open",
        dayOfWeek: "Saturday",
        startTime: "07:00",
        duration: "2 hours",
        matchesPerSeason: 10,
        pricePerSeason: 12000,
        maxPlayers: 32,
    },
    // Phoenix
    {
        name: "Desert Pickleball League",
        sport: "Pickleball",
        city: "phoenix",
        format: "doubles",
        skillLevel: "intermediate",
        dayOfWeek: "Saturday",
        startTime: "07:00",
        duration: "3 hours",
        matchesPerSeason: 8,
        pricePerSeason: 10000,
        maxPlayers: 48,
    },
    // Myrtle Beach
    {
        name: "Grand Strand Tennis",
        sport: "Tennis",
        city: "myrtle-beach",
        format: "doubles",
        skillLevel: "open",
        dayOfWeek: "Sunday",
        startTime: "09:00",
        duration: "2 hours",
        matchesPerSeason: 8,
        pricePerSeason: 8000,
        maxPlayers: 24,
    },
]

export const leagueService = {
    /**
     * Get leagues by city
     */
    async getLeaguesByCity(
        city: LaunchCityId,
        options?: {
            sport?: BookableSport
            skillLevel?: SkillLevel
            status?: LeagueStatus
            limit?: number
        }
    ): Promise<League[]> {
        if (!db) {
            // Return sample leagues for the city
            return this.getSampleLeagues(city, options)
        }

        try {
            const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore")

            const constraints: any[] = [
                where("city", "==", city),
                where("status", "in", ["forming", "active"]),
            ]

            if (options?.sport) {
                constraints.push(where("sport", "==", options.sport))
            }
            if (options?.skillLevel) {
                constraints.push(where("skillLevel", "==", options.skillLevel))
            }

            constraints.push(orderBy("createdAt", "desc"))

            if (options?.limit) {
                constraints.push(limit(options.limit))
            }

            const q = query(collection(db, LEAGUES_COLLECTION), ...constraints)
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                return this.getSampleLeagues(city, options)
            }

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                seasonStart: doc.data().seasonStart?.toDate?.() || new Date(),
                seasonEnd: doc.data().seasonEnd?.toDate?.() || new Date(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as League[]
        } catch (error) {
            console.error("Error getting leagues:", error)
            return this.getSampleLeagues(city, options)
        }
    },

    /**
     * Get sample leagues (when DB is empty)
     */
    getSampleLeagues(
        city: LaunchCityId,
        options?: {
            sport?: BookableSport
            skillLevel?: SkillLevel
            limit?: number
        }
    ): League[] {
        let leagues = SAMPLE_LEAGUES.filter(l => l.city === city)

        if (options?.sport) {
            leagues = leagues.filter(l => l.sport === options.sport)
        }
        if (options?.skillLevel) {
            leagues = leagues.filter(l => l.skillLevel === options.skillLevel)
        }
        if (options?.limit) {
            leagues = leagues.slice(0, options.limit)
        }

        return leagues.map((l, i) => ({
            ...l,
            id: `sample-${city}-${i}`,
            description: `Join the most popular ${l.sport} league in ${this.getCityName(l.city as LaunchCityId)}!`,
            currentPlayers: Math.floor(Math.random() * (l.maxPlayers || 24)),
            waitlistCount: Math.floor(Math.random() * 5),
            status: "forming" as LeagueStatus,
            includesCourtFees: true,
            organizerId: "goodrunss",
            organizerName: "GoodRunss Leagues",
            seasonStart: this.getNextSeasonStart(),
            seasonEnd: this.getSeasonEnd(this.getNextSeasonStart()),
            createdAt: new Date(),
            updatedAt: new Date(),
        })) as League[]
    },

    /**
     * Get leagues by sport across all cities
     */
    async getLeaguesBySport(sport: BookableSport): Promise<League[]> {
        const allLeagues: League[] = []

        for (const city of LAUNCH_CITIES) {
            const cityLeagues = await this.getLeaguesByCity(city.id as LaunchCityId, { sport })
            allLeagues.push(...cityLeagues)
        }

        return allLeagues
    },

    /**
     * Join a league
     */
    async joinLeague(
        leagueId: string,
        userId: string,
        userName: string,
        userPhoto?: string
    ): Promise<{ success: boolean; status: "registered" | "waitlist"; message: string }> {
        if (!db) {
            return {
                success: true,
                status: "registered",
                message: "Successfully registered for the league!",
            }
        }

        try {
            const { doc, getDoc, collection, addDoc, updateDoc, increment } = await import("firebase/firestore")

            // Check league capacity
            const leagueDoc = await getDoc(doc(db, LEAGUES_COLLECTION, leagueId))
            if (!leagueDoc.exists()) {
                return { success: false, status: "registered", message: "League not found" }
            }

            const league = leagueDoc.data() as League
            const isFull = league.currentPlayers >= league.maxPlayers

            // Add member
            await addDoc(collection(db, LEAGUES_COLLECTION, leagueId, LEAGUE_MEMBERS_COLLECTION), {
                leagueId,
                userId,
                userName,
                userPhoto,
                status: isFull ? "waitlist" : "registered",
                registeredAt: new Date(),
                paid: false,
            })

            // Update counts
            if (isFull) {
                await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
                    waitlistCount: increment(1),
                    updatedAt: new Date(),
                })
            } else {
                await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
                    currentPlayers: increment(1),
                    updatedAt: new Date(),
                })
            }

            return {
                success: true,
                status: isFull ? "waitlist" : "registered",
                message: isFull
                    ? "Added to waitlist! We'll notify you when a spot opens."
                    : "Successfully registered for the league!",
            }
        } catch (error) {
            console.error("Error joining league:", error)
            return { success: false, status: "registered", message: "Failed to join league" }
        }
    },

    /**
     * Get user's leagues
     */
    async getUserLeagues(userId: string): Promise<League[]> {
        if (!db) return []

        try {
            const { collectionGroup, query, where, getDocs, doc, getDoc } = await import("firebase/firestore")

            const membersQuery = query(
                collectionGroup(db, LEAGUE_MEMBERS_COLLECTION),
                where("userId", "==", userId),
                where("status", "in", ["registered", "waitlist"])
            )

            const snapshot = await getDocs(membersQuery)
            const leagueIds = snapshot.docs.map(d => d.data().leagueId)

            const leagues: League[] = []
            for (const leagueId of leagueIds) {
                const leagueDoc = await getDoc(doc(db, LEAGUES_COLLECTION, leagueId))
                if (leagueDoc.exists()) {
                    leagues.push({
                        id: leagueDoc.id,
                        ...leagueDoc.data(),
                    } as League)
                }
            }

            return leagues
        } catch (error) {
            console.error("Error getting user leagues:", error)
            return []
        }
    },

    /**
     * Get next season start date (first of next month)
     */
    getNextSeasonStart(): Date {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth() + 1, 1)
    },

    /**
     * Get season end date (8 weeks from start)
     */
    getSeasonEnd(start: Date): Date {
        const end = new Date(start)
        end.setDate(end.getDate() + 56) // 8 weeks
        return end
    },

    /**
     * Get city display name
     */
    getCityName(cityId: LaunchCityId): string {
        return LAUNCH_CITIES.find(c => c.id === cityId)?.name || cityId
    },

    /**
     * Format skill level for display
     */
    formatSkillLevel(level: SkillLevel): string {
        const labels: { [key in SkillLevel]: string } = {
            beginner: "🟢 Beginner",
            intermediate: "🟡 Intermediate",
            advanced: "🔴 Advanced",
            open: "⚪ All Levels",
        }
        return labels[level]
    },

    /**
     * Format format for display
     */
    formatLeagueFormat(format: LeagueFormat): string {
        const labels: { [key in LeagueFormat]: string } = {
            singles: "Singles",
            doubles: "Doubles",
            mixed_doubles: "Mixed Doubles",
            team: "Team",
        }
        return labels[format]
    },

    /**
     * Get league openings
     */
    getOpenings(league: League): { hasOpenings: boolean; spotsLeft: number } {
        const spotsLeft = league.maxPlayers - league.currentPlayers
        return {
            hasOpenings: spotsLeft > 0,
            spotsLeft,
        }
    },
}

export default leagueService
