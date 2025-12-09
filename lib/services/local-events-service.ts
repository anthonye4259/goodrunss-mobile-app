/**
 * Local Events Detection Service
 * 
 * Detects nearby events that affect venue traffic:
 * - Sports games (stadium fills up, then empties)
 * - Concerts (surrounding venues get busier)
 * - Festivals (all day increased traffic)
 * - Conferences (business hour spikes)
 * 
 * Uses Ticketmaster API for real events data
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// TYPES
// ============================================

export interface LocalEvent {
    id: string
    name: string
    type: "sports" | "concert" | "festival" | "conference" | "theater" | "other"
    venue: string
    location: { lat: number; lon: number }
    startTime: Date
    endTime?: Date
    expectedAttendance?: number
    distance?: number // km from user
    trafficImpact: "low" | "moderate" | "high" | "extreme"
}

export interface EventImpact {
    events: LocalEvent[]
    totalImpact: number // 0-100 additional traffic score
    warnings: string[]
    peakTimes: { start: string; end: string }[]
}

// Cache duration
const EVENTS_CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours
const CACHE_KEY = "@local_events"

// Ticketmaster API (free tier: 5000 calls/day)
const TICKETMASTER_API_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY || ""
const TICKETMASTER_URL = "https://app.ticketmaster.com/discovery/v2/events.json"

// ============================================
// MAIN API
// ============================================

/**
 * Get local events near a location that could affect traffic
 */
export async function getLocalEvents(
    lat: number,
    lon: number,
    radiusKm: number = 10
): Promise<EventImpact> {
    // Check cache first
    const cached = await getCachedEvents(lat, lon)
    if (cached) return cached

    // Try Ticketmaster API
    if (TICKETMASTER_API_KEY) {
        try {
            const events = await fetchTicketmasterEvents(lat, lon, radiusKm)
            const impact = calculateEventImpact(events)
            await cacheEvents(lat, lon, impact)
            return impact
        } catch (error) {
            console.error("[Events] Ticketmaster error:", error)
        }
    }

    // Fallback: Check for known recurring events
    const fallbackEvents = getKnownEvents(lat, lon)
    const impact = calculateEventImpact(fallbackEvents)

    return impact
}

// ============================================
// TICKETMASTER INTEGRATION
// ============================================

async function fetchTicketmasterEvents(
    lat: number,
    lon: number,
    radiusKm: number
): Promise<LocalEvent[]> {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const params = new URLSearchParams({
        apikey: TICKETMASTER_API_KEY,
        latlong: `${lat},${lon}`,
        radius: String(radiusKm),
        unit: "km",
        startDateTime: `${today}T00:00:00Z`,
        endDateTime: `${tomorrow}T23:59:59Z`,
        size: "20",
        sort: "date,asc",
    })

    const response = await fetch(`${TICKETMASTER_URL}?${params}`)
    if (!response.ok) throw new Error(`Ticketmaster API error: ${response.status}`)

    const data = await response.json()
    const events: LocalEvent[] = []

    for (const event of data._embedded?.events || []) {
        const venue = event._embedded?.venues?.[0]
        const classification = event.classifications?.[0]

        events.push({
            id: event.id,
            name: event.name,
            type: mapClassification(classification?.segment?.name),
            venue: venue?.name || "Unknown Venue",
            location: {
                lat: parseFloat(venue?.location?.latitude) || lat,
                lon: parseFloat(venue?.location?.longitude) || lon,
            },
            startTime: new Date(event.dates?.start?.dateTime || event.dates?.start?.localDate),
            expectedAttendance: estimateAttendance(classification?.segment?.name, venue?.capacity),
            trafficImpact: estimateTrafficImpact(classification?.segment?.name, venue?.capacity),
        })
    }

    return events
}

function mapClassification(segment?: string): LocalEvent["type"] {
    switch (segment?.toLowerCase()) {
        case "sports": return "sports"
        case "music": return "concert"
        case "arts & theatre": return "theater"
        case "miscellaneous": return "festival"
        default: return "other"
    }
}

function estimateAttendance(segment?: string, capacity?: number): number {
    if (capacity) return Math.round(capacity * 0.8) // 80% fill rate

    // Fallback estimates
    switch (segment?.toLowerCase()) {
        case "sports": return 30000
        case "music": return 15000
        case "arts & theatre": return 2000
        default: return 5000
    }
}

function estimateTrafficImpact(segment?: string, capacity?: number): LocalEvent["trafficImpact"] {
    const attendance = capacity || estimateAttendance(segment)

    if (attendance > 50000) return "extreme"
    if (attendance > 20000) return "high"
    if (attendance > 5000) return "moderate"
    return "low"
}

// ============================================
// IMPACT CALCULATION
// ============================================

function calculateEventImpact(events: LocalEvent[]): EventImpact {
    if (events.length === 0) {
        return {
            events: [],
            totalImpact: 0,
            warnings: [],
            peakTimes: [],
        }
    }

    let totalImpact = 0
    const warnings: string[] = []
    const peakTimes: { start: string; end: string }[] = []

    for (const event of events) {
        // Calculate distance-adjusted impact
        const distanceFactor = event.distance
            ? Math.max(0, 1 - event.distance / 10) // 0-10km range
            : 0.5

        const impactScores = {
            low: 5,
            moderate: 15,
            high: 30,
            extreme: 50,
        }

        totalImpact += impactScores[event.trafficImpact] * distanceFactor

        // Generate warnings
        if (event.trafficImpact === "extreme") {
            warnings.push(`⚠️ Major event: ${event.name} - Expect heavy traffic`)
        } else if (event.trafficImpact === "high") {
            warnings.push(`🚗 ${event.type === "sports" ? "Game" : "Event"} nearby: ${event.name}`)
        }

        // Track peak times (1 hour before to 2 hours after)
        const startTime = new Date(event.startTime)
        const peakStart = new Date(startTime.getTime() - 60 * 60 * 1000)
        const peakEnd = new Date(startTime.getTime() + 3 * 60 * 60 * 1000)

        peakTimes.push({
            start: peakStart.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            end: peakEnd.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        })
    }

    return {
        events,
        totalImpact: Math.min(100, totalImpact),
        warnings,
        peakTimes,
    }
}

// ============================================
// KNOWN RECURRING EVENTS
// ============================================

function getKnownEvents(lat: number, lon: number): LocalEvent[] {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const month = now.getMonth()
    const events: LocalEvent[] = []

    // Sports seasons
    const isNFLSeason = month >= 8 || month <= 1 // Sept-Feb
    const isNBASeason = month >= 9 || month <= 5 // Oct-June
    const isMLBSeason = month >= 3 && month <= 9 // April-Oct

    // NFL Sundays
    if (dayOfWeek === 0 && isNFLSeason) {
        events.push({
            id: "nfl_sunday",
            name: "NFL Sunday",
            type: "sports",
            venue: "Local Stadium",
            location: { lat, lon },
            startTime: new Date(now.setHours(13, 0, 0, 0)),
            expectedAttendance: 70000,
            trafficImpact: "extreme",
        })
    }

    // Monday Night Football
    if (dayOfWeek === 1 && isNFLSeason) {
        events.push({
            id: "mnf",
            name: "Monday Night Football",
            type: "sports",
            venue: "Local Stadium",
            location: { lat, lon },
            startTime: new Date(now.setHours(20, 0, 0, 0)),
            expectedAttendance: 70000,
            trafficImpact: "extreme",
        })
    }

    // NBA games (most weeknights)
    if (isNBASeason && dayOfWeek >= 1 && dayOfWeek <= 5) {
        events.push({
            id: "nba_game",
            name: "NBA Game",
            type: "sports",
            venue: "Local Arena",
            location: { lat, lon },
            startTime: new Date(now.setHours(19, 30, 0, 0)),
            expectedAttendance: 18000,
            trafficImpact: "moderate",
        })
    }

    // Weekend concerts (Friday/Saturday nights)
    if ((dayOfWeek === 5 || dayOfWeek === 6) && now.getHours() >= 18) {
        events.push({
            id: "weekend_concert",
            name: "Weekend Concert",
            type: "concert",
            venue: "Local Venue",
            location: { lat, lon },
            startTime: new Date(now.setHours(20, 0, 0, 0)),
            expectedAttendance: 5000,
            trafficImpact: "moderate",
        })
    }

    return events
}

// ============================================
// CACHING
// ============================================

async function getCachedEvents(lat: number, lon: number): Promise<EventImpact | null> {
    try {
        const key = `${CACHE_KEY}_${lat.toFixed(1)}_${lon.toFixed(1)}`
        const cached = await AsyncStorage.getItem(key)
        if (!cached) return null

        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp > EVENTS_CACHE_DURATION) return null

        return data
    } catch {
        return null
    }
}

async function cacheEvents(lat: number, lon: number, impact: EventImpact): Promise<void> {
    try {
        const key = `${CACHE_KEY}_${lat.toFixed(1)}_${lon.toFixed(1)}`
        await AsyncStorage.setItem(key, JSON.stringify({
            data: impact,
            timestamp: Date.now(),
        }))
    } catch (error) {
        console.error("[Events] Cache error:", error)
    }
}

// ============================================
// HELPER FOR UI
// ============================================

/**
 * Get a user-friendly summary of event impacts
 */
export function getEventSummary(impact: EventImpact): string | null {
    if (impact.events.length === 0) return null

    const bigEvents = impact.events.filter(e =>
        e.trafficImpact === "high" || e.trafficImpact === "extreme"
    )

    if (bigEvents.length > 0) {
        return `🎟️ ${bigEvents[0].name} today - expect ${impact.totalImpact > 30 ? "heavy" : "increased"} traffic`
    }

    if (impact.events.length > 0) {
        return `📅 ${impact.events.length} event${impact.events.length > 1 ? "s" : ""} nearby`
    }

    return null
}
