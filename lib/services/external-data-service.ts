/**
 * External Data Service - Global Intelligence Enrichment
 * 
 * Enriches predictions with external data sources:
 * - Google Popular Times (venue busyness history)
 * - Local events (sports games, concerts)
 * - School schedules
 * - Weather forecasts
 * - Hyperlocal context (college towns, beach tides, etc.)
 * 
 * This is what makes GoodRunss predictions world-class.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// TYPES
// ============================================

export interface ExternalEnrichment {
    // Google Popular Times style data
    popularTimes?: {
        hourly: number[]              // 0-100 busyness per hour
        currentlyBusy?: number        // Current live busyness
        usuallyBusy?: number          // Typical for this time
        source: "google" | "estimated"
    }

    // Local events
    nearbyEvents: LocalEvent[]
    eventImpact: number               // 0-50 adjustment

    // School/academic schedule
    schoolContext: {
        inSession: boolean
        isBreak: boolean
        breakType?: "summer" | "winter" | "spring" | "weekend"
    }

    // Weather forecast
    weatherForecast?: HourlyWeather[]

    // Hyperlocal factors
    hyperlocal: HyperlocalContext

    // Overall adjustment to apply
    totalAdjustment: number           // -50 to +50
    factors: string[]                 // Human readable factors
}

export interface LocalEvent {
    id: string
    name: string
    type: "sports" | "concert" | "festival" | "marathon" | "other"
    venue: string
    date: Date
    expectedAttendance?: number
    distance?: number                 // km from venue
    impact: "low" | "medium" | "high"
}

export interface HourlyWeather {
    hour: number
    temp: number
    conditions: string
    precipChance: number
    windSpeed: number
}

export interface HyperlocalContext {
    venueType: VenueContextType
    factors: HyperlocalFactor[]
    adjustment: number
}

export type VenueContextType =
    | "college_town"
    | "beach"
    | "downtown"
    | "suburban"
    | "rural"
    | "resort"

export interface HyperlocalFactor {
    id: string
    name: string
    impact: number
    description: string
}

// ============================================
// CACHE SETTINGS
// ============================================

const CACHE_KEYS = {
    POPULAR_TIMES: "external_popular_times_",
    EVENTS: "external_events_",
    SCHOOL: "external_school_",
    HYPERLOCAL: "external_hyperlocal_",
}

const CACHE_TTL = {
    POPULAR_TIMES: 24 * 60 * 60 * 1000,  // 24 hours
    EVENTS: 1 * 60 * 60 * 1000,          // 1 hour
    SCHOOL: 7 * 24 * 60 * 60 * 1000,     // 1 week
    HYPERLOCAL: 30 * 24 * 60 * 60 * 1000, // 30 days
}

// ============================================
// MAIN SERVICE
// ============================================

class ExternalDataService {
    private static instance: ExternalDataService

    static getInstance(): ExternalDataService {
        if (!ExternalDataService.instance) {
            ExternalDataService.instance = new ExternalDataService()
        }
        return ExternalDataService.instance
    }

    // ============================================
    // GET ALL ENRICHMENT (Main API)
    // ============================================

    async getEnrichment(
        venueId: string,
        lat: number,
        lng: number,
        venueType: string = "general"
    ): Promise<ExternalEnrichment> {
        const [
            popularTimes,
            nearbyEvents,
            schoolContext,
            hyperlocal,
        ] = await Promise.all([
            this.getPopularTimes(venueId, lat, lng),
            this.getNearbyEvents(lat, lng),
            this.getSchoolContext(lat, lng),
            this.getHyperlocalContext(lat, lng, venueType),
        ])

        // Calculate event impact
        const eventImpact = this.calculateEventImpact(nearbyEvents)

        // Calculate total adjustment
        const totalAdjustment = this.calculateTotalAdjustment(
            popularTimes,
            eventImpact,
            schoolContext,
            hyperlocal
        )

        // Generate human-readable factors
        const factors = this.generateFactors(
            popularTimes,
            nearbyEvents,
            schoolContext,
            hyperlocal
        )

        return {
            popularTimes,
            nearbyEvents,
            eventImpact,
            schoolContext,
            hyperlocal,
            totalAdjustment,
            factors,
        }
    }

    // ============================================
    // POPULAR TIMES (Google-style)
    // ============================================

    private async getPopularTimes(
        venueId: string,
        lat: number,
        lng: number
    ): Promise<ExternalEnrichment["popularTimes"]> {
        // Check cache
        const cached = await this.getFromCache<ExternalEnrichment["popularTimes"]>(
            CACHE_KEYS.POPULAR_TIMES + venueId
        )
        if (cached) return cached

        // In production, this would call Google Places API
        // For now, generate realistic estimates based on venue location

        const now = new Date()
        const currentHour = now.getHours()
        const isWeekend = now.getDay() === 0 || now.getDay() === 6

        // Generate hourly pattern based on typical rec facility patterns
        const hourly = this.generateEstimatedPattern(isWeekend)

        const result = {
            hourly,
            currentlyBusy: hourly[currentHour],
            usuallyBusy: hourly[currentHour],
            source: "estimated" as const,
        }

        // Cache
        await this.setCache(CACHE_KEYS.POPULAR_TIMES + venueId, result)

        return result
    }

    private generateEstimatedPattern(isWeekend: boolean): number[] {
        if (isWeekend) {
            return [
                5, 3, 2, 2, 3, 5,      // 12am-5am
                10, 20, 35, 55, 70, 75, // 6am-11am
                80, 75, 70, 65, 60, 55, // 12pm-5pm
                50, 45, 40, 30, 20, 10  // 6pm-11pm
            ]
        } else {
            return [
                5, 3, 2, 2, 5, 15,      // 12am-5am
                30, 40, 30, 20, 20, 25, // 6am-11am
                35, 40, 30, 25, 35, 55, // 12pm-5pm
                75, 85, 80, 60, 40, 20  // 6pm-11pm
            ]
        }
    }

    // ============================================
    // NEARBY EVENTS
    // ============================================

    private async getNearbyEvents(
        lat: number,
        lng: number
    ): Promise<LocalEvent[]> {
        const cacheKey = `${CACHE_KEYS.EVENTS}${lat.toFixed(2)}_${lng.toFixed(2)}`

        const cached = await this.getFromCache<LocalEvent[]>(cacheKey)
        if (cached) return cached

        // In production, this would call:
        // - Ticketmaster API
        // - Eventbrite API
        // - Local sports league APIs
        // - City event calendars

        // For now, return empty (no known events)
        const events: LocalEvent[] = []

        await this.setCache(cacheKey, events)
        return events
    }

    private calculateEventImpact(events: LocalEvent[]): number {
        let impact = 0

        for (const event of events) {
            if (event.distance && event.distance > 10) continue // Too far

            switch (event.impact) {
                case "high":
                    impact += 25
                    break
                case "medium":
                    impact += 15
                    break
                case "low":
                    impact += 5
                    break
            }
        }

        return Math.min(50, impact) // Cap at 50
    }

    // ============================================
    // SCHOOL CONTEXT
    // ============================================

    private async getSchoolContext(
        lat: number,
        lng: number
    ): Promise<ExternalEnrichment["schoolContext"]> {
        const now = new Date()
        const month = now.getMonth()
        const dayOfWeek = now.getDay()

        // Basic school schedule logic
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const isSummer = month >= 5 && month <= 7 // June-August
        const isWinterBreak = month === 11 || (month === 0 && now.getDate() < 7)
        const isSpringBreak = month === 2 && now.getDate() >= 10 && now.getDate() <= 20

        let inSession = true
        let isBreak = false
        let breakType: "summer" | "winter" | "spring" | "weekend" | undefined

        if (isWeekend) {
            isBreak = true
            breakType = "weekend"
        } else if (isSummer) {
            inSession = false
            isBreak = true
            breakType = "summer"
        } else if (isWinterBreak) {
            inSession = false
            isBreak = true
            breakType = "winter"
        } else if (isSpringBreak) {
            inSession = false
            isBreak = true
            breakType = "spring"
        }

        return { inSession, isBreak, breakType }
    }

    // ============================================
    // HYPERLOCAL CONTEXT
    // ============================================

    private async getHyperlocalContext(
        lat: number,
        lng: number,
        venueType: string
    ): Promise<HyperlocalContext> {
        const cacheKey = `${CACHE_KEYS.HYPERLOCAL}${lat.toFixed(2)}_${lng.toFixed(2)}`

        const cached = await this.getFromCache<HyperlocalContext>(cacheKey)
        if (cached) return cached

        // Determine context type based on location
        // In production, this would use:
        // - Census data
        // - POI proximity
        // - Geographic features

        const contextType = this.inferContextType(lat, lng)
        const factors = this.getContextFactors(contextType, venueType)
        const adjustment = factors.reduce((sum, f) => sum + f.impact, 0)

        const result: HyperlocalContext = {
            venueType: contextType,
            factors,
            adjustment,
        }

        await this.setCache(cacheKey, result)
        return result
    }

    private inferContextType(lat: number, lng: number): VenueContextType {
        // Simple heuristics - in production, use real data

        // Beach areas (coastal latitudes with specific longitudes)
        const isCoastal = Math.abs(lng) > 74 && Math.abs(lng) < 125

        // Major metro areas (dense urban)
        const isUrban = (lat > 40 && lat < 42) || // NYC area
            (lat > 33 && lat < 35) || // LA area
            (lat > 41 && lat < 42)    // Chicago area

        if (isCoastal && lat > 25 && lat < 35) {
            return "beach"
        }
        if (isUrban) {
            return "downtown"
        }

        return "suburban" // Default
    }

    private getContextFactors(
        contextType: VenueContextType,
        venueType: string
    ): HyperlocalFactor[] {
        const factors: HyperlocalFactor[] = []
        const now = new Date()
        const hour = now.getHours()
        const month = now.getMonth()

        switch (contextType) {
            case "college_town":
                if (month >= 8 || month <= 4) { // School year
                    factors.push({
                        id: "college_in_session",
                        name: "College in session",
                        impact: 15,
                        description: "Student population increases activity"
                    })
                } else {
                    factors.push({
                        id: "college_summer",
                        name: "College summer break",
                        impact: -20,
                        description: "Students away for summer"
                    })
                }
                break

            case "beach":
                if (month >= 5 && month <= 8) { // Summer
                    factors.push({
                        id: "beach_season",
                        name: "Beach season",
                        impact: 25,
                        description: "Peak beach activity"
                    })
                }
                if (hour >= 10 && hour <= 16) { // Beach hours
                    factors.push({
                        id: "beach_hours",
                        name: "Prime beach hours",
                        impact: 10,
                        description: "Peak sun hours"
                    })
                }
                break

            case "downtown":
                if (hour >= 12 && hour <= 14) { // Lunch
                    factors.push({
                        id: "lunch_rush",
                        name: "Lunch hour",
                        impact: 15,
                        description: "Office workers on break"
                    })
                }
                if (hour >= 17 && hour <= 19) { // After work
                    factors.push({
                        id: "after_work",
                        name: "After-work rush",
                        impact: 20,
                        description: "Peak commuter activity"
                    })
                }
                break

            case "suburban":
                if (hour >= 15 && hour <= 18) { // After school
                    factors.push({
                        id: "after_school",
                        name: "After school",
                        impact: 15,
                        description: "Youth sports and activities"
                    })
                }
                break

            case "resort":
                if (month >= 11 || month <= 2) { // Winter season
                    factors.push({
                        id: "resort_season",
                        name: "Resort season",
                        impact: 30,
                        description: "Peak tourist season"
                    })
                }
                break
        }

        return factors
    }

    // ============================================
    // CALCULATE TOTAL ADJUSTMENT
    // ============================================

    private calculateTotalAdjustment(
        popularTimes: ExternalEnrichment["popularTimes"],
        eventImpact: number,
        schoolContext: ExternalEnrichment["schoolContext"],
        hyperlocal: HyperlocalContext
    ): number {
        let adjustment = 0

        // Popular times contribution
        if (popularTimes) {
            const currentHour = new Date().getHours()
            const busyness = popularTimes.currentlyBusy || popularTimes.hourly[currentHour] || 50
            // Normalize to -25 to +25
            adjustment += (busyness - 50) / 2
        }

        // Event impact
        adjustment += eventImpact

        // School context
        if (schoolContext.isBreak) {
            if (schoolContext.breakType === "summer") {
                adjustment += 10 // Busier during summer
            } else if (schoolContext.breakType === "weekend") {
                adjustment += 15 // Busier on weekends
            }
        }

        // Hyperlocal
        adjustment += hyperlocal.adjustment

        // Clamp to -50 to +50
        return Math.max(-50, Math.min(50, adjustment))
    }

    // ============================================
    // GENERATE FACTORS
    // ============================================

    private generateFactors(
        popularTimes: ExternalEnrichment["popularTimes"],
        events: LocalEvent[],
        schoolContext: ExternalEnrichment["schoolContext"],
        hyperlocal: HyperlocalContext
    ): string[] {
        const factors: string[] = []

        // Popular times
        if (popularTimes) {
            const currentHour = new Date().getHours()
            const busyness = popularTimes.currentlyBusy || popularTimes.hourly[currentHour] || 50

            if (busyness > 70) {
                factors.push("Typically busy right now")
            } else if (busyness < 30) {
                factors.push("Usually quiet at this time")
            }
        }

        // Events
        if (events.length > 0) {
            const highImpact = events.find(e => e.impact === "high")
            if (highImpact) {
                factors.push(`${highImpact.name} nearby today`)
            }
        }

        // School
        if (schoolContext.breakType === "summer") {
            factors.push("Summer - more daytime activity")
        } else if (schoolContext.breakType === "weekend") {
            factors.push("Weekend vibes")
        }

        // Hyperlocal
        for (const factor of hyperlocal.factors) {
            factors.push(factor.name)
        }

        return factors.slice(0, 3) // Max 3 factors
    }

    // ============================================
    // CACHE HELPERS
    // ============================================

    private async getFromCache<T>(key: string): Promise<T | null> {
        try {
            const stored = await AsyncStorage.getItem(key)
            if (!stored) return null

            const { data, timestamp } = JSON.parse(stored)
            const ttl = this.getTTL(key)

            if (Date.now() - timestamp > ttl) {
                await AsyncStorage.removeItem(key)
                return null
            }

            return data
        } catch {
            return null
        }
    }

    private async setCache<T>(key: string, data: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now(),
            }))
        } catch (error) {
            console.error("[ExternalData] Cache error:", error)
        }
    }

    private getTTL(key: string): number {
        if (key.includes("popular_times")) return CACHE_TTL.POPULAR_TIMES
        if (key.includes("events")) return CACHE_TTL.EVENTS
        if (key.includes("school")) return CACHE_TTL.SCHOOL
        if (key.includes("hyperlocal")) return CACHE_TTL.HYPERLOCAL
        return 60 * 60 * 1000 // 1 hour default
    }
}

// ============================================
// EXPORTS
// ============================================

export const externalDataService = ExternalDataService.getInstance()

export const getExternalEnrichment = (
    venueId: string,
    lat: number,
    lng: number,
    venueType?: string
) => externalDataService.getEnrichment(venueId, lat, lng, venueType)
