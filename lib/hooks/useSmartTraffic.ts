/**
 * useSmartTraffic Hook
 * 
 * Just use this hook in any component - it automatically:
 * 1. Gets user's current location
 * 2. Fetches population + road traffic data
 * 3. Returns live traffic predictions for any venue
 * 
 * Zero configuration. Zero manual data passing.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import * as Location from "expo-location"
import { getLocationIntelligence, predictVenueTrafficSmart, type LocationIntelligence } from "../services/location-intelligence-service"
import { type TrafficPrediction, type VenueType, type WeatherFactors } from "../traffic-prediction"

// ============================================
// MAIN HOOK
// ============================================

interface UseSmartTrafficResult {
    // Get traffic for any venue (just pass venue ID)
    getTraffic: (venueId: string, venueType?: VenueType) => TrafficPrediction | null

    // Location context (automatically fetched)
    location: { lat: number; lon: number } | null
    locationContext: LocationIntelligence | null

    // Status
    isLoading: boolean
    error: string | null

    // Manual refresh
    refresh: () => Promise<void>
}

// Global cache so all components share the same data
let globalLocationContext: LocationIntelligence | null = null
let globalLocation: { lat: number; lon: number } | null = null
let globalTrafficCache: Map<string, { prediction: TrafficPrediction; timestamp: number }> = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useSmartTraffic(): UseSmartTrafficResult {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(globalLocation)
    const [locationContext, setLocationContext] = useState<LocationIntelligence | null>(globalLocationContext)
    const [isLoading, setIsLoading] = useState(!globalLocationContext)
    const [error, setError] = useState<string | null>(null)
    const initialized = useRef(false)

    // Initialize on mount
    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        initializeLocation()
    }, [])

    const initializeLocation = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Get location permission
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                // Use default location (will still work, just less accurate)
                console.log("[SmartTraffic] Location permission denied, using defaults")
                setIsLoading(false)
                return
            }

            // Get current position
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            })

            const coords = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            }

            // Fetch location intelligence
            const context = await getLocationIntelligence(coords.lat, coords.lon)

            // Update global cache
            globalLocation = coords
            globalLocationContext = context

            // Update state
            setLocation(coords)
            setLocationContext(context)
            setIsLoading(false)

            console.log(`[SmartTraffic] Initialized: ${context.cityName || "Unknown"} (${context.cityType})`)
        } catch (err) {
            console.error("[SmartTraffic] Init error:", err)
            setError("Failed to get location")
            setIsLoading(false)
        }
    }

    const refresh = useCallback(async () => {
        globalTrafficCache.clear()
        await initializeLocation()
    }, [])

    const getTraffic = useCallback((venueId: string, venueType: VenueType = "general"): TrafficPrediction | null => {
        // Check cache first
        const cacheKey = `${venueId}-${venueType}`
        const cached = globalTrafficCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.prediction
        }

        // If no location context yet, return basic prediction
        if (!globalLocationContext) {
            // Return a default prediction
            const now = new Date()
            const hour = now.getHours()
            const isWeekend = now.getDay() === 0 || now.getDay() === 6
            const isPeak = isWeekend
                ? (hour >= 9 && hour <= 18)
                : ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20))

            return {
                level: isPeak ? "moderate" : "low",
                color: isPeak ? "#FFA500" : "#6B9B5A",
                label: isPeak ? "Moderate" : "Low",
                confidence: 0.6,
                estimatedWaitTime: isPeak ? "5-10 min" : undefined,
                peakHours: isWeekend ? "9 AM - 6 PM" : "6-9 AM, 5-8 PM",
            }
        }

        // Calculate prediction with full context
        const { predictVenueTraffic } = require("../traffic-prediction")
        const prediction = predictVenueTraffic(
            venueId,
            new Date(),
            undefined,
            undefined, // Weather - could integrate here too
            venueType,
            globalLocationContext.population,
            globalLocationContext.geoTraffic
        )

        // Cache the result
        globalTrafficCache.set(cacheKey, { prediction, timestamp: Date.now() })

        return prediction
    }, [])

    return {
        getTraffic,
        location,
        locationContext,
        isLoading,
        error,
        refresh,
    }
}

// ============================================
// SIMPLE CONVENIENCE FUNCTIONS
// ============================================

/**
 * Just get traffic level as a simple string
 * Usage: const level = useTrafficLevel("venue_123") // "moderate"
 */
export function useTrafficLevel(venueId: string, venueType?: VenueType): TrafficPrediction["level"] | "unknown" {
    const { getTraffic, isLoading } = useSmartTraffic()

    if (isLoading) return "unknown"

    const traffic = getTraffic(venueId, venueType)
    return traffic?.level || "unknown"
}

/**
 * Get formatted traffic display
 * Usage: const display = useTrafficDisplay("venue_123")
 *        // { label: "Moderate", color: "#FFA500" }
 */
export function useTrafficDisplay(venueId: string, venueType?: VenueType) {
    const { getTraffic, isLoading } = useSmartTraffic()

    if (isLoading) {
        return { label: "Loading", color: "#9CA3AF" }
    }

    const traffic = getTraffic(venueId, venueType)
    if (!traffic) {
        return { label: "Unknown", color: "#9CA3AF" }
    }

    return {
        label: traffic.label.replace(" Traffic", ""),
        color: traffic.color,
        impact: traffic.populationImpact || traffic.geoTrafficImpact || traffic.weatherImpact,
    }
}
