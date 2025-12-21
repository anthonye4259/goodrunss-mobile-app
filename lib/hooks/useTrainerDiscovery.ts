/**
 * useTrainerDiscovery Hook
 * 
 * React hook for smart trainer discovery with match scoring.
 * Uses user's preferences and location to recommend trainers.
 */

import { useState, useEffect, useCallback } from "react"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import {
    trainerDiscoveryService,
    TrainerMatch,
    UserMatchPreferences,
} from "@/lib/services/trainer-discovery-service"

interface UseTrainerDiscoveryOptions {
    sport?: string
    autoLoad?: boolean
    limit?: number
    sortBy?: "match" | "distance" | "rating" | "price"
}

interface UseTrainerDiscoveryResult {
    trainers: TrainerMatch[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    searchBySport: (sport: string) => Promise<void>
    sortBy: (sort: "match" | "distance" | "rating" | "price") => void
}

export function useTrainerDiscovery(
    options: UseTrainerDiscoveryOptions = {}
): UseTrainerDiscoveryResult {
    const { sport, autoLoad = true, limit = 20, sortBy: initialSort = "match" } = options

    const { preferences } = useUserPreferences()
    const { location } = useLocation()

    const [trainers, setTrainers] = useState<TrainerMatch[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentSort, setCurrentSort] = useState(initialSort)

    // Build match preferences from user data
    const buildMatchPrefs = useCallback((): UserMatchPreferences => {
        return {
            activities: sport ? [sport] : preferences.activities || [],
            location: location ? {
                latitude: location.latitude,
                longitude: location.longitude,
            } : preferences.location ? {
                latitude: preferences.location.latitude,
                longitude: preferences.location.longitude,
            } : undefined,
            maxDistance: 50, // 50km default
        }
    }, [sport, preferences, location])

    // Fetch recommended trainers
    const fetchTrainers = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const prefs = buildMatchPrefs()

            if (prefs.activities.length === 0) {
                // No activities selected, get all nearby
                if (prefs.location) {
                    const results = await trainerDiscoveryService.getTrainersNearby(
                        prefs.location.latitude,
                        prefs.location.longitude,
                        50,
                        limit
                    )
                    setTrainers(results)
                } else {
                    setTrainers([])
                }
            } else {
                // Get personalized recommendations
                const results = await trainerDiscoveryService.getRecommendedTrainers(prefs, limit)
                setTrainers(results)
            }
        } catch (err: any) {
            console.error("[useTrainerDiscovery] Error:", err)
            setError(err.message || "Failed to load trainers")
        } finally {
            setLoading(false)
        }
    }, [buildMatchPrefs, limit])

    // Search by specific sport
    const searchBySport = useCallback(async (searchSport: string) => {
        setLoading(true)
        setError(null)

        try {
            const userLocation = location || preferences.location
            const results = await trainerDiscoveryService.searchTrainers(
                searchSport,
                userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined,
                currentSort === "match" ? "rating" : currentSort as "distance" | "rating" | "price"
            )
            setTrainers(results)
        } catch (err: any) {
            console.error("[useTrainerDiscovery] Search error:", err)
            setError(err.message || "Search failed")
        } finally {
            setLoading(false)
        }
    }, [location, preferences.location, currentSort])

    // Sort handler
    const handleSortBy = useCallback((sort: "match" | "distance" | "rating" | "price") => {
        setCurrentSort(sort)

        // Re-sort the current trainers
        setTrainers(prev => {
            const sorted = [...prev]
            switch (sort) {
                case "match":
                    sorted.sort((a, b) => b.matchScore - a.matchScore)
                    break
                case "distance":
                    sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999))
                    break
                case "rating":
                    sorted.sort((a, b) => b.trainer.rating - a.trainer.rating)
                    break
                case "price":
                    sorted.sort((a, b) => a.trainer.price - b.trainer.price)
                    break
            }
            return sorted
        })
    }, [])

    // Auto-load on mount
    useEffect(() => {
        if (autoLoad) {
            fetchTrainers()
        }
    }, [autoLoad]) // Only run once on mount

    return {
        trainers,
        loading,
        error,
        refresh: fetchTrainers,
        searchBySport,
        sortBy: handleSortBy,
    }
}

/**
 * Get similar trainers to a given trainer
 */
export function useSimilarTrainers(trainerId: string | null) {
    const [trainers, setTrainers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!trainerId) {
            setTrainers([])
            return
        }

        setLoading(true)
        trainerDiscoveryService.getSimilarTrainers(trainerId)
            .then(setTrainers)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [trainerId])

    return { trainers, loading }
}
