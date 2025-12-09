/**
 * Global Prediction Enhancers
 * 
 * Adds GLOBAL data to make predictions best-in-class:
 * - Population density (worldwide via GeoNames)
 * - Holidays (200+ countries via Nager.Date)
 * - Local events (sports, concerts)
 * - School schedules (affects youth sports)
 * 
 * These factors feed into traffic predictions for accuracy
 * no other app on the market has.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

// ============================================
// CACHE CONFIGURATION
// ============================================

const CACHE_DURATION = {
    population: 30 * 24 * 60 * 60 * 1000, // 30 days
    holidays: 7 * 24 * 60 * 60 * 1000,    // 7 days
    events: 1 * 60 * 60 * 1000,           // 1 hour
}

// ============================================
// TYPES
// ============================================

export interface PopulationData {
    city: string
    country: string
    countryCode: string
    population: number
    density?: number // per sq km
    timezone: string
}

export interface Holiday {
    date: string
    name: string
    localName: string
    countryCode: string
    type: "public" | "bank" | "optional" | "observance"
}

export interface LocalEvent {
    id: string
    name: string
    type: "sports" | "concert" | "festival" | "conference" | "other"
    venue: string
    date: string
    expectedAttendance?: number
    distance?: number // km from user
}

export interface PredictionEnhancements {
    population: PopulationData | null
    holidays: Holiday[]
    isHoliday: boolean
    holidayImpact: number // -20 to +30 (% traffic change)
    events: LocalEvent[]
    eventImpact: number // 0 to +50 (% traffic increase nearby)
    schoolInSession: boolean
    weekendVibes: boolean
}

// ============================================
// GEONAMES API - GLOBAL POPULATION DATA
// Free: 1000 credits/hour for registered users
// ============================================

const GEONAMES_USERNAME = "goodrunss" // Register free at geonames.org

async function fetchGlobalPopulation(lat: number, lon: number): Promise<PopulationData | null> {
    const cacheKey = `@population_${lat.toFixed(2)}_${lon.toFixed(2)}`

    // Check cache
    try {
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_DURATION.population) {
                return data
            }
        }
    } catch (e) { /* continue */ }

    try {
        // GeoNames findNearbyPlaceName - returns nearest city with population
        const url = `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&cities=cities5000&username=${GEONAMES_USERNAME}`

        const response = await fetch(url)
        if (!response.ok) {
            console.warn("[GlobalEnhancer] GeoNames API failed")
            return estimatePopulationFromCoords(lat, lon)
        }

        const data = await response.json()
        const place = data.geonames?.[0]

        if (!place) {
            return estimatePopulationFromCoords(lat, lon)
        }

        const result: PopulationData = {
            city: place.name,
            country: place.countryName,
            countryCode: place.countryCode,
            population: parseInt(place.population) || 50000,
            timezone: place.timezone?.timeZoneId || "UTC",
        }

        // Cache result
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: result,
            timestamp: Date.now(),
        }))

        return result
    } catch (error) {
        console.error("[GlobalEnhancer] Population fetch error:", error)
        return estimatePopulationFromCoords(lat, lon)
    }
}

function estimatePopulationFromCoords(lat: number, lon: number): PopulationData {
    // Fallback: estimate based on known major metros
    const majorCities = [
        { lat: 40.7, lon: -74.0, city: "New York", country: "USA", pop: 8400000 },
        { lat: 51.5, lon: -0.1, city: "London", country: "UK", pop: 8900000 },
        { lat: 35.7, lon: 139.7, city: "Tokyo", country: "Japan", pop: 13900000 },
        { lat: 48.9, lon: 2.3, city: "Paris", country: "France", pop: 2100000 },
        { lat: 52.5, lon: 13.4, city: "Berlin", country: "Germany", pop: 3600000 },
        { lat: -33.9, lon: 151.2, city: "Sydney", country: "Australia", pop: 5300000 },
        { lat: 19.4, lon: -99.1, city: "Mexico City", country: "Mexico", pop: 21900000 },
        { lat: -23.5, lon: -46.6, city: "São Paulo", country: "Brazil", pop: 12300000 },
        { lat: 55.8, lon: 37.6, city: "Moscow", country: "Russia", pop: 12500000 },
        { lat: 31.2, lon: 121.5, city: "Shanghai", country: "China", pop: 24200000 },
        { lat: 28.6, lon: 77.2, city: "Delhi", country: "India", pop: 16700000 },
        { lat: 1.3, lon: 103.8, city: "Singapore", country: "Singapore", pop: 5700000 },
        { lat: -34.6, lon: -58.4, city: "Buenos Aires", country: "Argentina", pop: 3100000 },
        { lat: 25.0, lon: 55.3, city: "Dubai", country: "UAE", pop: 3400000 },
        { lat: 37.6, lon: 127.0, city: "Seoul", country: "South Korea", pop: 9700000 },
    ]

    // Find nearest major city
    let nearest = majorCities[0]
    let minDist = Infinity

    for (const city of majorCities) {
        const dist = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2))
        if (dist < minDist) {
            minDist = dist
            nearest = city
        }
    }

    // If far from any major city, estimate suburban population
    const estimatedPop = minDist < 1 ? nearest.pop :
        minDist < 3 ? Math.round(nearest.pop * 0.3) : 50000

    return {
        city: minDist < 3 ? nearest.city : "Unknown",
        country: nearest.country,
        countryCode: "",
        population: estimatedPop,
        timezone: "UTC",
    }
}

// ============================================
// NAGER.DATE API - GLOBAL HOLIDAYS (200+ COUNTRIES)
// Completely free, no API key needed
// ============================================

async function fetchGlobalHolidays(countryCode: string): Promise<Holiday[]> {
    const year = new Date().getFullYear()
    const cacheKey = `@holidays_${countryCode}_${year}`

    // Check cache
    try {
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_DURATION.holidays) {
                return data
            }
        }
    } catch (e) { /* continue */ }

    try {
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
        const response = await fetch(url)

        if (!response.ok) {
            console.warn("[GlobalEnhancer] Holidays API failed for", countryCode)
            return []
        }

        const data = await response.json()

        const holidays: Holiday[] = data.map((h: any) => ({
            date: h.date,
            name: h.name,
            localName: h.localName,
            countryCode: h.countryCode,
            type: h.global ? "public" : "observance",
        }))

        // Cache result
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: holidays,
            timestamp: Date.now(),
        }))

        return holidays
    } catch (error) {
        console.error("[GlobalEnhancer] Holiday fetch error:", error)
        return []
    }
}

function checkIfHoliday(holidays: Holiday[], date: Date = new Date()): Holiday | null {
    const dateStr = date.toISOString().split("T")[0]
    return holidays.find(h => h.date === dateStr) || null
}

function calculateHolidayImpact(holiday: Holiday | null, venueType: string): number {
    if (!holiday) return 0

    // Different holidays affect venues differently
    if (holiday.type === "public") {
        // Public holidays = more people at outdoor venues
        if (["outdoor_court", "pool", "park"].includes(venueType)) {
            return 25 // 25% more traffic
        }
        // Gyms often closed or quiet on holidays
        if (venueType === "indoor_gym") {
            return -20 // 20% less traffic
        }
        return 10
    }

    return 5 // Minor holidays have minor impact
}

// ============================================
// SCHOOL SCHEDULE DETECTION
// Affects youth sports timing
// ============================================

function isSchoolInSession(date: Date = new Date(), countryCode: string = "US"): boolean {
    const month = date.getMonth() // 0-11
    const day = date.getDate()

    // Simplified global school calendar
    // Northern Hemisphere: Sept-June
    // Southern Hemisphere: Feb-Nov

    const southernCountries = ["AU", "NZ", "AR", "CL", "ZA", "BR"]
    const isSouthern = southernCountries.includes(countryCode)

    if (isSouthern) {
        // School: Feb - Nov (with breaks)
        return month >= 1 && month <= 10
    } else {
        // School: Sept - June (with breaks)
        if (month >= 8 || month <= 4) return true // Sept-May
        if (month === 5 && day <= 15) return true // Early June
        return false
    }
}

// ============================================
// EVENT IMPACT CALCULATION
// Sports games, concerts increase nearby venue traffic
// ============================================

function calculateEventImpact(events: LocalEvent[], venueLat: number, venueLon: number): number {
    if (!events.length) return 0

    let totalImpact = 0

    for (const event of events) {
        // Big events within 5km increase traffic
        if ((event.distance || 10) < 5) {
            if (event.type === "sports") {
                totalImpact += 30 // Before/after game traffic
            } else if (event.type === "concert") {
                totalImpact += 20
            } else {
                totalImpact += 10
            }
        }
    }

    return Math.min(totalImpact, 50) // Cap at 50%
}

// ============================================
// MAIN API: GET ALL PREDICTION ENHANCEMENTS
// ============================================

export async function getPredictionEnhancements(
    lat: number,
    lon: number,
    venueType: string = "general",
    date: Date = new Date()
): Promise<PredictionEnhancements> {
    // Fetch all data in parallel
    const [population, events] = await Promise.all([
        fetchGlobalPopulation(lat, lon),
        Promise.resolve([]), // Events: placeholder for future Ticketmaster/Eventbrite integration
    ])

    // Get country code from population data
    const countryCode = population?.countryCode || guessCountryCode(lat, lon)

    // Fetch holidays for this country
    const holidays = await fetchGlobalHolidays(countryCode)
    const todaysHoliday = checkIfHoliday(holidays, date)

    // Calculate impacts
    const holidayImpact = calculateHolidayImpact(todaysHoliday, venueType)
    const eventImpact = calculateEventImpact(events, lat, lon)
    const schoolInSession = isSchoolInSession(date, countryCode)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    return {
        population,
        holidays,
        isHoliday: !!todaysHoliday,
        holidayImpact,
        events,
        eventImpact,
        schoolInSession,
        weekendVibes: isWeekend,
    }
}

// ============================================
// HELPER: GUESS COUNTRY FROM COORDINATES
// ============================================

function guessCountryCode(lat: number, lon: number): string {
    // Rough geographic bounds for major countries
    if (lat > 24 && lat < 50 && lon > -130 && lon < -65) return "US"
    if (lat > 49 && lat < 60 && lon > -8 && lon < 2) return "GB"
    if (lat > 35 && lat < 44 && lon > -10 && lon < 4) return "ES"
    if (lat > 41 && lat < 51 && lon > -5 && lon < 10) return "FR"
    if (lat > 47 && lat < 55 && lon > 5 && lon < 15) return "DE"
    if (lat > 35 && lat < 46 && lon > 6 && lon < 19) return "IT"
    if (lat > 49 && lat < 55 && lon > 14 && lon < 24) return "PL"
    if (lat > 55 && lat < 70 && lon > 5 && lon < 31) return "SE"
    if (lat > 30 && lat < 46 && lon > 127 && lon < 146) return "JP"
    if (lat > 33 && lat < 39 && lon > 124 && lon < 132) return "KR"
    if (lat > -45 && lat < -10 && lon > 110 && lon < 155) return "AU"
    if (lat > -47 && lat < -34 && lon > 166 && lon < 179) return "NZ"
    if (lat > 42 && lat < 82 && lon > -141 && lon < -52) return "CA"
    if (lat > 14 && lat < 33 && lon > -118 && lon < -86) return "MX"
    if (lat > -35 && lat < -22 && lon > -58 && lon < -44) return "BR"
    if (lat > -56 && lat < -22 && lon > -74 && lon < -53) return "AR"
    if (lat > 22 && lat < 32 && lon > 51 && lon < 57) return "AE"
    if (lat > 0 && lat < 2 && lon > 103 && lon < 105) return "SG"
    if (lat > 8 && lat < 37 && lon > 68 && lon < 97) return "IN"
    if (lat > 18 && lat < 54 && lon > 73 && lon < 135) return "CN"
    if (lat > 41 && lat < 82 && lon > 19 && lon < 180) return "RU"
    if (lat > -35 && lat < -22 && lon > 16 && lon < 33) return "ZA"

    return "US" // Default
}

// ============================================
// ENHANCED TRAFFIC MODIFIER
// Call this to adjust base traffic score
// ============================================

export function applyEnhancements(
    baseScore: number,
    enhancements: PredictionEnhancements
): { adjustedScore: number; factors: string[] } {
    let score = baseScore
    const factors: string[] = []

    // Population impact
    if (enhancements.population) {
        const pop = enhancements.population.population
        if (pop > 5000000) {
            score += 15
            factors.push(`Major metro (${enhancements.population.city})`)
        } else if (pop > 1000000) {
            score += 10
            factors.push(`Large city`)
        } else if (pop < 50000) {
            score -= 10
            factors.push(`Smaller town`)
        }
    }

    // Holiday impact
    if (enhancements.isHoliday) {
        score += enhancements.holidayImpact
        factors.push(`Holiday: ${enhancements.holidayImpact > 0 ? "busier" : "quieter"}`)
    }

    // Event impact
    if (enhancements.eventImpact > 0) {
        score += Math.round(enhancements.eventImpact * 0.5) // Apply 50% of event impact
        factors.push(`Nearby event (+${enhancements.eventImpact}%)`)
    }

    // School impact (affects afternoon/evening at youth sports venues)
    if (enhancements.schoolInSession) {
        // After school hours = busier at courts
        const hour = new Date().getHours()
        if (hour >= 15 && hour <= 18) {
            score += 10
            factors.push(`After-school rush`)
        }
    }

    // Weekend vibes
    if (enhancements.weekendVibes) {
        score += 15
        factors.push(`Weekend crowds`)
    }

    return {
        adjustedScore: Math.max(0, Math.min(100, score)),
        factors,
    }
}
