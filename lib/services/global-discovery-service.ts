/**
 * Global Venue Discovery Service
 * 
 * Works ANYWHERE in the world from day 1.
 * Uses OpenStreetMap + Google Places for global coverage.
 * 
 * The goal: "No one leaves the house to play a sport 
 * without checking GoodRunss first"
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// TYPES
// ============================================

export interface DiscoveredVenue {
    id: string
    name: string
    sport: string
    type: VenueType

    // Location
    lat: number
    lng: number
    address: string
    city: string
    country: string
    countryCode: string

    // Source
    source: "osm" | "google" | "user" | "goodrunss"
    externalId?: string

    // Basic info
    isPublic: boolean
    isFree: boolean
    isOutdoor: boolean

    // Distance (calculated at runtime)
    distance?: number

    // Metadata
    lastVerified?: Date
    confidence: number // 0-100
}

export type VenueType =
    | "basketball_court"
    | "tennis_court"
    | "pickleball_court"
    | "volleyball_court"
    | "soccer_field"
    | "swimming_pool"
    | "golf_course"
    | "gym"
    | "recreation_center"
    | "park"
    | "beach"
    | "other"

// OSM tags for each sport
const OSM_SPORT_TAGS: Record<string, { key: string; value: string }[]> = {
    basketball: [
        { key: "sport", value: "basketball" },
        { key: "leisure", value: "pitch" },
    ],
    tennis: [
        { key: "sport", value: "tennis" },
        { key: "leisure", value: "pitch" },
    ],
    pickleball: [
        { key: "sport", value: "pickleball" },
        { key: "sport", value: "tennis" }, // Often on tennis courts
    ],
    volleyball: [
        { key: "sport", value: "volleyball" },
        { key: "sport", value: "beachvolleyball" },
    ],
    soccer: [
        { key: "sport", value: "soccer" },
        { key: "sport", value: "football" },
    ],
    swimming: [
        { key: "sport", value: "swimming" },
        { key: "leisure", value: "swimming_pool" },
    ],
    golf: [
        { key: "sport", value: "golf" },
        { key: "leisure", value: "golf_course" },
    ],
}

// ============================================
// CACHE SETTINGS
// ============================================

const CACHE_KEY = "discovered_venues_"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ============================================
// MAIN SERVICE
// ============================================

class GlobalVenueDiscoveryService {
    private static instance: GlobalVenueDiscoveryService

    static getInstance(): GlobalVenueDiscoveryService {
        if (!GlobalVenueDiscoveryService.instance) {
            GlobalVenueDiscoveryService.instance = new GlobalVenueDiscoveryService()
        }
        return GlobalVenueDiscoveryService.instance
    }

    // ============================================
    // DISCOVER VENUES (Main API)
    // ============================================

    async discoverVenues(
        lat: number,
        lng: number,
        sport: string,
        radiusKm: number = 10
    ): Promise<DiscoveredVenue[]> {
        const cacheKey = `${CACHE_KEY}${lat.toFixed(2)}_${lng.toFixed(2)}_${sport}`

        // Check cache
        const cached = await this.getFromCache(cacheKey)
        if (cached) return cached

        // Fetch from OpenStreetMap
        const osmVenues = await this.fetchFromOSM(lat, lng, sport, radiusKm)

        // Calculate distances
        const venues = osmVenues.map(v => ({
            ...v,
            distance: this.calculateDistance(lat, lng, v.lat, v.lng),
        }))

        // Sort by distance
        venues.sort((a, b) => (a.distance || 0) - (b.distance || 0))

        // Cache results
        await this.setCache(cacheKey, venues)

        return venues
    }

    // ============================================
    // OPENSTREETMAP INTEGRATION
    // ============================================

    private async fetchFromOSM(
        lat: number,
        lng: number,
        sport: string,
        radiusKm: number
    ): Promise<DiscoveredVenue[]> {
        const tags = OSM_SPORT_TAGS[sport.toLowerCase()] || []
        if (tags.length === 0) return []

        // Build Overpass query
        const bbox = this.getBoundingBox(lat, lng, radiusKm)
        const sportFilter = tags.map(t => `["${t.key}"="${t.value}"]`).join("")

        const query = `
            [out:json][timeout:25];
            (
                node${sportFilter}(${bbox});
                way${sportFilter}(${bbox});
                relation${sportFilter}(${bbox});
            );
            out body center;
        `

        try {
            const response = await fetch(
                "https://overpass-api.de/api/interpreter",
                {
                    method: "POST",
                    body: `data=${encodeURIComponent(query)}`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            )

            if (!response.ok) {
                console.error("[GlobalDiscovery] OSM request failed:", response.status)
                return []
            }

            const data = await response.json()
            return this.parseOSMResults(data.elements, sport)
        } catch (error) {
            console.error("[GlobalDiscovery] OSM error:", error)
            return []
        }
    }

    private parseOSMResults(elements: any[], sport: string): DiscoveredVenue[] {
        const venues: DiscoveredVenue[] = []

        for (const el of elements) {
            // Get coordinates
            let lat = el.lat
            let lng = el.lon

            // For ways and relations, use center
            if (el.center) {
                lat = el.center.lat
                lng = el.center.lon
            }

            if (!lat || !lng) continue

            // Parse tags
            const tags = el.tags || {}
            const name = tags.name || tags["name:en"] || this.generateName(sport, tags)
            const address = this.parseAddress(tags)

            venues.push({
                id: `osm_${el.id}`,
                name,
                sport: sport.charAt(0).toUpperCase() + sport.slice(1),
                type: this.inferVenueType(sport, tags),
                lat,
                lng,
                address: address.full,
                city: address.city,
                country: address.country,
                countryCode: address.countryCode,
                source: "osm",
                externalId: String(el.id),
                isPublic: this.isPublicVenue(tags),
                isFree: this.isFreeVenue(tags),
                isOutdoor: this.isOutdoor(tags),
                confidence: this.calculateConfidence(tags),
            })
        }

        return venues
    }

    // ============================================
    // HELPERS
    // ============================================

    private getBoundingBox(lat: number, lng: number, radiusKm: number): string {
        // Rough conversion: 1 degree ≈ 111km
        const delta = radiusKm / 111
        const south = lat - delta
        const north = lat + delta
        const west = lng - delta
        const east = lng + delta
        return `${south},${west},${north},${east}`
    }

    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371 // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1)
        const dLng = this.toRad(lng2 - lng1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const km = R * c
        return km * 0.621371 // Convert to miles
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180)
    }

    private generateName(sport: string, tags: any): string {
        const sportNames: Record<string, string> = {
            basketball: "Basketball Court",
            tennis: "Tennis Courts",
            pickleball: "Pickleball Courts",
            volleyball: "Volleyball Court",
            soccer: "Soccer Field",
            swimming: "Swimming Pool",
            golf: "Golf Course",
        }

        if (tags.operator) {
            return `${tags.operator} ${sportNames[sport] || "Sports Facility"}`
        }

        return sportNames[sport] || "Sports Facility"
    }

    private parseAddress(tags: any): { full: string; city: string; country: string; countryCode: string } {
        const parts: string[] = []

        if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"])
        if (tags["addr:street"]) parts.push(tags["addr:street"])
        if (tags["addr:city"]) parts.push(tags["addr:city"])
        if (tags["addr:state"]) parts.push(tags["addr:state"])

        return {
            full: parts.join(", ") || "Address not available",
            city: tags["addr:city"] || "",
            country: tags["addr:country"] || "",
            countryCode: tags["ISO3166-1:alpha2"] || "",
        }
    }

    private inferVenueType(sport: string, tags: any): VenueType {
        if (tags.leisure === "swimming_pool") return "swimming_pool"
        if (tags.leisure === "golf_course") return "golf_course"
        if (tags.leisure === "recreation_ground") return "recreation_center"
        if (tags.leisure === "park") return "park"
        if (tags.natural === "beach") return "beach"

        const typeMap: Record<string, VenueType> = {
            basketball: "basketball_court",
            tennis: "tennis_court",
            pickleball: "pickleball_court",
            volleyball: "volleyball_court",
            soccer: "soccer_field",
            swimming: "swimming_pool",
            golf: "golf_course",
        }

        return typeMap[sport] || "other"
    }

    private isPublicVenue(tags: any): boolean {
        if (tags.access === "private") return false
        if (tags.access === "members") return false
        if (tags.fee === "yes") return true // Fee venues are usually public
        return true // Default to public
    }

    private isFreeVenue(tags: any): boolean {
        if (tags.fee === "yes") return false
        if (tags.access === "members") return false
        return true
    }

    private isOutdoor(tags: any): boolean {
        if (tags.covered === "yes") return false
        if (tags.building === "yes") return false
        if (tags.indoor === "yes") return false
        return true
    }

    private calculateConfidence(tags: any): number {
        let confidence = 50 // Base confidence

        // Boost for name
        if (tags.name) confidence += 15

        // Boost for address
        if (tags["addr:street"]) confidence += 10

        // Boost for opening hours
        if (tags.opening_hours) confidence += 10

        // Boost for verified/official sources
        if (tags.source) confidence += 5

        // Boost for operator info
        if (tags.operator) confidence += 10

        return Math.min(100, confidence)
    }

    // ============================================
    // CACHE
    // ============================================

    private async getFromCache(key: string): Promise<DiscoveredVenue[] | null> {
        try {
            const stored = await AsyncStorage.getItem(key)
            if (!stored) return null

            const { data, timestamp } = JSON.parse(stored)
            if (Date.now() - timestamp > CACHE_TTL) {
                await AsyncStorage.removeItem(key)
                return null
            }

            return data
        } catch {
            return null
        }
    }

    private async setCache(key: string, data: DiscoveredVenue[]): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now(),
            }))
        } catch (error) {
            console.error("[GlobalDiscovery] Cache error:", error)
        }
    }

    // ============================================
    // TIMEZONE & REGIONAL AWARENESS
    // ============================================

    async getLocalTime(lat: number, lng: number): Promise<{ hour: number; isWeekend: boolean }> {
        // Use timezone lookup based on coordinates
        // For now, use approximation based on longitude
        const utcNow = new Date()
        const hourOffset = Math.round(lng / 15) // Rough timezone estimate
        const localHour = (utcNow.getUTCHours() + hourOffset + 24) % 24
        const localDay = utcNow.getUTCDay()

        return {
            hour: localHour,
            isWeekend: localDay === 0 || localDay === 6,
        }
    }

    // ============================================
    // REGIONAL SPORT POPULARITY
    // ============================================

    getPopularSportsInRegion(countryCode: string): string[] {
        // Sports that are popular in different regions
        const regionalSports: Record<string, string[]> = {
            US: ["basketball", "pickleball", "tennis", "golf"],
            CN: ["basketball", "badminton", "table_tennis", "swimming"],
            JP: ["tennis", "baseball", "swimming", "golf"],
            KR: ["baseball", "golf", "tennis", "basketball"],
            BR: ["soccer", "volleyball", "basketball", "tennis"],
            DE: ["soccer", "tennis", "swimming", "golf"],
            ES: ["soccer", "padel", "tennis", "basketball"],
            FR: ["tennis", "soccer", "swimming", "basketball"],
            GB: ["tennis", "soccer", "golf", "swimming"],
            AU: ["tennis", "swimming", "golf", "cricket"],
            IN: ["cricket", "badminton", "tennis", "swimming"],
            MX: ["soccer", "basketball", "tennis", "swimming"],
        }

        return regionalSports[countryCode] || ["basketball", "tennis", "soccer", "swimming"]
    }
}

// ============================================
// EXPORTS
// ============================================

export const globalVenueDiscoveryService = GlobalVenueDiscoveryService.getInstance()

export const discoverVenues = (lat: number, lng: number, sport: string, radiusKm?: number) =>
    globalVenueDiscoveryService.discoverVenues(lat, lng, sport, radiusKm)

export const getPopularSportsInRegion = (countryCode: string) =>
    globalVenueDiscoveryService.getPopularSportsInRegion(countryCode)

export const getLocalTime = (lat: number, lng: number) =>
    globalVenueDiscoveryService.getLocalTime(lat, lng)
