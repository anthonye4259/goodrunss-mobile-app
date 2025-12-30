/**
 * useVenueTraffic Hook
 * 
 * Fetches venues with their pre-computed traffic data from Firestore
 * Traffic is updated every 30 min by the Cloud Function
 * 
 * Usage:
 *   const { nearestVenue, loading } = useVenueTraffic()
 *   // nearestVenue.traffic.level === "moderate"
 */

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase-config"

// ============================================
// TYPES
// ============================================

export interface VenueTraffic {
    level: "low" | "moderate" | "busy" | "empty" | "quiet" | "packed"
    emoji: string
    color: string
    label: string
    waitTime: string | null
    weatherImpact: string | null
    populationImpact: string | null
    geoTrafficImpact: string | null
    updatedAt: any
}

export interface VenueWithTraffic {
    id: string
    name: string
    distance?: string
    type: string
    location?: { lat: number; lon: number }
    latitude?: number
    longitude?: number
    traffic?: VenueTraffic
    rating?: number
    isOpen?: boolean
    closesAt?: string
    address?: string
}

// ============================================
// MAIN HOOK
// ============================================

interface UseVenueTrafficOptions {
    limit?: number
    venueType?: string
    nearLocation?: { lat: number; lon: number }
}

export function useVenueTraffic(options: UseVenueTrafficOptions = {}) {
    const { limit = 10, venueType, nearLocation } = options

    const [venues, setVenues] = useState<VenueWithTraffic[]>([])
    const [nearestVenue, setNearestVenue] = useState<VenueWithTraffic | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    useEffect(() => {
        fetchVenuesWithTraffic()
    }, [venueType, nearLocation?.lat, nearLocation?.lon])

    const fetchVenuesWithTraffic = async () => {
        if (!db) {
            // Fallback to mock data if Firebase not available
            setVenues(getMockVenuesWithTraffic())
            setNearestVenue(getMockVenuesWithTraffic()[0])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const { collection, query, getDocs, orderBy, limit: firestoreLimit, where } = await import("firebase/firestore")

            // Build query
            let venuesQuery = query(
                collection(db, "venues"),
                firestoreLimit(limit)
            )

            // Filter by type if specified
            if (venueType) {
                venuesQuery = query(
                    collection(db, "venues"),
                    where("type", "==", venueType),
                    firestoreLimit(limit)
                )
            }

            const snapshot = await getDocs(venuesQuery)

            if (snapshot.empty) {
                // Use mock data if no venues in Firestore
                const mockVenues = getMockVenuesWithTraffic()
                setVenues(mockVenues)
                setNearestVenue(mockVenues[0])
                setLoading(false)
                return
            }

            const fetchedVenues: VenueWithTraffic[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as VenueWithTraffic))

            // Sort by distance if location provided
            if (nearLocation) {
                fetchedVenues.sort((a, b) => {
                    const distA = calculateDistance(nearLocation, a)
                    const distB = calculateDistance(nearLocation, b)
                    return distA - distB
                })
            }

            setVenues(fetchedVenues)
            setNearestVenue(fetchedVenues[0] || null)
            setLastUpdated(new Date())
            setLoading(false)

        } catch (err) {
            console.error("[useVenueTraffic] Error:", err)
            setError("Failed to load venue traffic")
            // Fallback to mock
            const mockVenues = getMockVenuesWithTraffic()
            setVenues(mockVenues)
            setNearestVenue(mockVenues[0])
            setLoading(false)
        }
    }

    const refresh = () => fetchVenuesWithTraffic()

    return {
        venues,
        nearestVenue,
        loading,
        error,
        lastUpdated,
        refresh,
    }
}

// ============================================
// SINGLE VENUE HOOK
// ============================================

export function useVenueDetails(venueId: string) {
    const [venue, setVenue] = useState<VenueWithTraffic | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!venueId) return

        fetchVenue()
    }, [venueId])

    const fetchVenue = async () => {
        if (!db) {
            setVenue(getMockVenuesWithTraffic()[0])
            setLoading(false)
            return
        }

        try {
            const { doc, getDoc } = await import("firebase/firestore")
            const venueDoc = await getDoc(doc(db, "venues", venueId))

            if (venueDoc.exists()) {
                setVenue({ id: venueDoc.id, ...venueDoc.data() } as VenueWithTraffic)
            }
            setLoading(false)
        } catch (err) {
            console.error("[useVenueDetails] Error:", err)
            setLoading(false)
        }
    }

    return { venue, loading, refresh: fetchVenue }
}

// ============================================
// HELPERS
// ============================================

function calculateDistance(
    from: { lat: number; lon: number },
    venue: VenueWithTraffic
): number {
    const venueLat = venue.location?.lat || venue.latitude || 0
    const venueLon = venue.location?.lon || venue.longitude || 0

    if (!venueLat || !venueLon) return Infinity

    // Simple Euclidean distance (good enough for sorting)
    const latDiff = from.lat - venueLat
    const lonDiff = from.lon - venueLon
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)
}

// ============================================
// MOCK DATA (fallback when Firestore empty)
// ============================================

function getMockVenuesWithTraffic(): VenueWithTraffic[] {
    const now = new Date()
    const hour = now.getHours()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    const isPeak = isWeekend
        ? (hour >= 10 && hour <= 17)
        : ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20))

    const mockLevel = isPeak ? "busy" : hour < 10 ? "quiet" : "moderate"
    const mockTraffic: VenueTraffic = {
        level: mockLevel as VenueTraffic["level"],
        emoji: mockLevel === "busy" ? "🔴" : mockLevel === "quiet" ? "🟢" : "🟡",
        color: mockLevel === "busy" ? "#FF6B6B" : mockLevel === "quiet" ? "#6B9B5A" : "#FBBF24",
        label: mockLevel === "busy" ? "Busy" : mockLevel === "quiet" ? "Quiet" : "Moderate",
        waitTime: mockLevel === "busy" ? "15-20 min wait" : mockLevel === "moderate" ? "5-10 min" : null,
        weatherImpact: null,
        populationImpact: null,
        geoTrafficImpact: null,
        updatedAt: now,
    }

    return [
        {
            id: "mock_1",
            name: "Central Park Tennis Courts",
            distance: "0.3 mi",
            type: "outdoor_court",
            traffic: mockTraffic,
            isOpen: true,
            closesAt: "10:00 PM",
        },
        {
            id: "mock_2",
            name: "Chelsea Piers Sports",
            distance: "0.8 mi",
            type: "indoor_gym",
            traffic: { ...mockTraffic, level: "moderate", label: "Moderate", emoji: "🟡", color: "#FBBF24" },
            isOpen: true,
            closesAt: "11:00 PM",
        },
        {
            id: "mock_3",
            name: "Rucker Park",
            distance: "1.2 mi",
            type: "outdoor_court",
            traffic: { ...mockTraffic, level: "busy", label: "Busy", emoji: "🔴", color: "#FF6B6B" },
            isOpen: true,
            closesAt: "9:00 PM",
        },
    ]
}

// ============================================
// TRAFFIC DISPLAY HELPERS
// ============================================

export function getTrafficColor(level: string): string {
    const colors: Record<string, string> = {
        empty: "#22C55E",
        quiet: "#22C55E",
        low: "#22C55E",
        moderate: "#FBBF24",
        busy: "#F97316",
        packed: "#EF4444",
    }
    return colors[level] || "#9CA3AF"
}

export function getTrafficLabel(level: string): string {
    const labels: Record<string, string> = {
        empty: "Empty",
        quiet: "Quiet",
        low: "Low",
        moderate: "Moderate",
        busy: "Busy",
        packed: "Packed",
    }
    return labels[level] || "Unknown"
}

export function getTrafficEmoji(level: string): string {
    const emojis: Record<string, string> = {
        empty: "🟢",
        quiet: "🟢",
        low: "🟢",
        moderate: "🟡",
        busy: "🔴",
        packed: "🔴",
    }
    return emojis[level] || "⚪"
}
