/**
 * Location Intelligence Service
 * 
 * Automatically fetches and caches location data for ML predictions:
 * - Population density (from coordinates)
 * - Road traffic conditions (from Google Maps or estimates)
 * - City type (urban/suburban/rural)
 * - Nearby features (colleges, transit)
 * 
 * This data feeds into traffic-prediction.ts automatically
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import type { PopulationFactors, GeoTrafficFactors } from "./traffic-prediction"

// ============================================
// CONFIGURATION
// ============================================

// Google Maps Traffic API (if available)
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""

// Cache duration (30 minutes for traffic, 24 hours for population)
const TRAFFIC_CACHE_MS = 30 * 60 * 1000
const POPULATION_CACHE_MS = 24 * 60 * 60 * 1000

// ============================================
// MAJOR CITY DATA (Pre-loaded for common areas)
// ============================================

interface CityData {
    name: string
    population: number
    density: number // per sq mile
    metro: boolean
    colleges: number
}

// Top US cities by population with density data
const MAJOR_CITIES: Record<string, CityData> = {
    // Format: "lat,lon" rounded to 1 decimal
    "40.7,-74.0": { name: "New York", population: 8336817, density: 27016, metro: true, colleges: 100 },
    "34.1,-118.2": { name: "Los Angeles", population: 3979576, density: 8092, metro: true, colleges: 80 },
    "41.9,-87.6": { name: "Chicago", population: 2693976, density: 11841, metro: true, colleges: 50 },
    "29.8,-95.4": { name: "Houston", population: 2320268, density: 3613, metro: true, colleges: 30 },
    "33.4,-112.1": { name: "Phoenix", population: 1680992, density: 3120, metro: true, colleges: 15 },
    "39.9,-75.2": { name: "Philadelphia", population: 1584064, density: 11379, metro: true, colleges: 60 },
    "29.4,-98.5": { name: "San Antonio", population: 1547253, density: 3238, metro: true, colleges: 12 },
    "32.7,-117.2": { name: "San Diego", population: 1423851, density: 4325, metro: true, colleges: 20 },
    "32.8,-96.8": { name: "Dallas", population: 1343573, density: 3866, metro: true, colleges: 25 },
    "37.3,-121.9": { name: "San Jose", population: 1021795, density: 5756, metro: true, colleges: 10 },
    "30.3,-97.7": { name: "Austin", population: 978908, density: 3006, metro: true, colleges: 15 },
    "25.8,-80.2": { name: "Miami", population: 467963, density: 12139, metro: true, colleges: 20 },
    "47.6,-122.3": { name: "Seattle", population: 753675, density: 8775, metro: true, colleges: 15 },
    "39.7,-104.9": { name: "Denver", population: 727211, density: 4520, metro: true, colleges: 12 },
    "33.8,-84.4": { name: "Atlanta", population: 498715, density: 3667, metro: true, colleges: 25 },
    "37.8,-122.4": { name: "San Francisco", population: 873965, density: 18569, metro: true, colleges: 15 },
    "42.4,-71.1": { name: "Boston", population: 692600, density: 14165, metro: true, colleges: 50 },
    "36.2,-115.1": { name: "Las Vegas", population: 641903, density: 4527, metro: true, colleges: 5 },
    "35.2,-80.8": { name: "Charlotte", population: 885708, density: 2907, metro: true, colleges: 10 },
    "45.5,-122.7": { name: "Portland", population: 654741, density: 4907, metro: true, colleges: 10 },
}

// College towns (smaller but high density during school year)
const COLLEGE_TOWNS: Record<string, { name: string; colleges: number }> = {
    "42.3,-83.0": { name: "Ann Arbor", colleges: 3 },
    "40.4,-86.9": { name: "West Lafayette", colleges: 2 },
    "40.8,-77.9": { name: "State College", colleges: 1 },
    "38.0,-78.5": { name: "Charlottesville", colleges: 2 },
    "35.9,-79.1": { name: "Chapel Hill", colleges: 2 },
    "30.4,-91.2": { name: "Baton Rouge", colleges: 2 },
    "41.7,-86.2": { name: "South Bend", colleges: 2 },
    "43.1,-89.4": { name: "Madison", colleges: 3 },
    "33.2,-87.5": { name: "Tuscaloosa", colleges: 1 },
    "34.2,-77.9": { name: "Wilmington", colleges: 2 },
}

// ============================================
// LOCATION LOOKUP
// ============================================

function getCityKey(lat: number, lon: number): string {
    return `${lat.toFixed(1)},${lon.toFixed(1)}`
}

function findNearbyCity(lat: number, lon: number): CityData | null {
    // Check exact match first
    const key = getCityKey(lat, lon)
    if (MAJOR_CITIES[key]) return MAJOR_CITIES[key]

    // Check neighboring coordinates (within ~10 miles)
    for (let dLat = -0.2; dLat <= 0.2; dLat += 0.1) {
        for (let dLon = -0.2; dLon <= 0.2; dLon += 0.1) {
            const nearbyKey = getCityKey(lat + dLat, lon + dLon)
            if (MAJOR_CITIES[nearbyKey]) return MAJOR_CITIES[nearbyKey]
        }
    }

    return null
}

function findCollegeTown(lat: number, lon: number): { name: string; colleges: number } | null {
    const key = getCityKey(lat, lon)
    if (COLLEGE_TOWNS[key]) return COLLEGE_TOWNS[key]

    // Check neighbors
    for (let dLat = -0.1; dLat <= 0.1; dLat += 0.1) {
        for (let dLon = -0.1; dLon <= 0.1; dLon += 0.1) {
            const nearbyKey = getCityKey(lat + dLat, lon + dLon)
            if (COLLEGE_TOWNS[nearbyKey]) return COLLEGE_TOWNS[nearbyKey]
        }
    }

    return null
}

// ============================================
// POPULATION DATA
// ============================================

export async function getPopulationFactors(lat: number, lon: number): Promise<PopulationFactors> {
    const cacheKey = `@population_${getCityKey(lat, lon)}`

    // Check cache
    try {
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < POPULATION_CACHE_MS) {
                return data
            }
        }
    } catch (e) {
        // Cache miss, continue
    }

    // Try to find known city
    const city = findNearbyCity(lat, lon)
    const collegeTown = findCollegeTown(lat, lon)

    let factors: PopulationFactors

    if (city) {
        factors = {
            cityPopulation: city.population,
            populationDensity: city.density,
            metropolitanArea: city.metro,
            nearbyColleges: city.colleges + (collegeTown?.colleges || 0),
        }
    } else if (collegeTown) {
        // Small college town
        factors = {
            cityPopulation: 80000, // Typical college town
            populationDensity: 3500,
            metropolitanArea: false,
            nearbyColleges: collegeTown.colleges,
        }
    } else {
        // Estimate based on US average
        // TODO: Could call external API for precise data
        factors = {
            cityPopulation: 50000, // Default suburban
            populationDensity: 2500,
            metropolitanArea: false,
            nearbyColleges: 0,
        }
    }

    // Cache the result
    try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: factors,
            timestamp: Date.now(),
        }))
    } catch (e) {
        // Cache write failed, continue
    }

    return factors
}

// ============================================
// GEO-TRAFFIC DATA  
// ============================================

export async function getGeoTrafficFactors(lat: number, lon: number): Promise<GeoTrafficFactors> {
    const cacheKey = `@geotraffic_${getCityKey(lat, lon)}`

    // Check cache (short duration - traffic changes frequently)
    try {
        const cached = await AsyncStorage.getItem(cacheKey)
        if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < TRAFFIC_CACHE_MS) {
                return data
            }
        }
    } catch (e) {
        // Cache miss
    }

    let factors: GeoTrafficFactors

    // If Google Maps API available, fetch real traffic
    if (GOOGLE_MAPS_API_KEY) {
        try {
            factors = await fetchGoogleTraffic(lat, lon)
        } catch (e) {
            console.warn("[LocationIntel] Google traffic failed, using estimates")
            factors = estimateTrafficFromTime()
        }
    } else {
        // Estimate based on time of day and population
        factors = estimateTrafficFromTime()
    }

    // Cache
    try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data: factors,
            timestamp: Date.now(),
        }))
    } catch (e) {
        // Continue
    }

    return factors
}

async function fetchGoogleTraffic(lat: number, lon: number): Promise<GeoTrafficFactors> {
    // Google Distance Matrix API can indicate traffic
    // This is a simplified example - full implementation would use proper endpoints

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${lat},${lon}&destinations=${lat + 0.01},${lon + 0.01}` +
        `&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`

    try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.rows?.[0]?.elements?.[0]) {
            const element = data.rows[0].elements[0]
            const durationInTraffic = element.duration_in_traffic?.value || element.duration?.value
            const normalDuration = element.duration?.value

            if (durationInTraffic && normalDuration) {
                const ratio = durationInTraffic / normalDuration

                let roadTrafficLevel: GeoTrafficFactors["roadTrafficLevel"]
                if (ratio > 2.0) roadTrafficLevel = "standstill"
                else if (ratio > 1.5) roadTrafficLevel = "heavy"
                else if (ratio > 1.2) roadTrafficLevel = "moderate"
                else if (ratio > 1.0) roadTrafficLevel = "light"
                else roadTrafficLevel = "free"

                return {
                    roadTrafficLevel,
                    averageCommute: Math.round(durationInTraffic / 60),
                    nearHighway: true, // Assume if we got traffic data
                    parkingAvailability: "moderate", // Would need separate API
                    transitNearby: true, // Would need separate API
                }
            }
        }
    } catch (e) {
        console.warn("[LocationIntel] Google API error:", e)
    }

    return estimateTrafficFromTime()
}

function estimateTrafficFromTime(): GeoTrafficFactors {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Estimate road traffic based on time
    let roadTrafficLevel: GeoTrafficFactors["roadTrafficLevel"]

    if (isWeekend) {
        // Weekends: lighter traffic overall
        if (hour >= 11 && hour <= 15) {
            roadTrafficLevel = "moderate"
        } else {
            roadTrafficLevel = "light"
        }
    } else {
        // Weekdays: rush hours
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            roadTrafficLevel = "heavy"
        } else if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 20)) {
            roadTrafficLevel = "moderate"
        } else {
            roadTrafficLevel = "light"
        }
    }

    return {
        roadTrafficLevel,
        averageCommute: roadTrafficLevel === "heavy" ? 25 : roadTrafficLevel === "moderate" ? 15 : 10,
        nearHighway: undefined, // Unknown
        parkingAvailability: "moderate", // Default
        transitNearby: undefined, // Unknown
    }
}

// ============================================
// COMBINED LOCATION INTELLIGENCE
// ============================================

export interface LocationIntelligence {
    population: PopulationFactors
    geoTraffic: GeoTrafficFactors
    cityName?: string
    cityType: "urban" | "suburban" | "rural"
    isCollegeTown: boolean
}

export async function getLocationIntelligence(lat: number, lon: number): Promise<LocationIntelligence> {
    const [population, geoTraffic] = await Promise.all([
        getPopulationFactors(lat, lon),
        getGeoTrafficFactors(lat, lon),
    ])

    const city = findNearbyCity(lat, lon)
    const collegeTown = findCollegeTown(lat, lon)

    // Determine city type
    let cityType: LocationIntelligence["cityType"]
    if (population.populationDensity && population.populationDensity > 10000) {
        cityType = "urban"
    } else if (population.populationDensity && population.populationDensity > 2000) {
        cityType = "suburban"
    } else {
        cityType = "rural"
    }

    return {
        population,
        geoTraffic,
        cityName: city?.name || collegeTown?.name,
        cityType,
        isCollegeTown: (population.nearbyColleges || 0) > 0,
    }
}

// ============================================
// ENHANCED TRAFFIC PREDICTION (with auto-data)
// ============================================

import { predictVenueTraffic, type VenueType, type WeatherFactors, type TrafficPrediction } from "./traffic-prediction"

/**
 * Smart traffic prediction that automatically fetches location data
 * Just pass coordinates - we handle the rest!
 */
export async function predictVenueTrafficSmart(
    venueId: string,
    lat: number,
    lon: number,
    venueType: VenueType = "general",
    currentTime: Date = new Date(),
    activePlayersNow?: number,
    weather?: WeatherFactors
): Promise<TrafficPrediction & { locationContext: LocationIntelligence }> {
    // Fetch location data automatically
    const locationContext = await getLocationIntelligence(lat, lon)

    // Get prediction with all factors
    const prediction = predictVenueTraffic(
        venueId,
        currentTime,
        activePlayersNow,
        weather,
        venueType,
        locationContext.population,
        locationContext.geoTraffic
    )

    return {
        ...prediction,
        locationContext,
    }
}
