/**
 * useFacilities Hook
 * 
 * React hook for fetching and managing facilities from Firebase
 * Supports filtering by sport, location, and facility type
 */

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, limit, GeoPoint } from 'firebase/firestore'
import { db } from '../firebase'
import { Venue, SportType, FacilityType } from '../types/global-facilities'

export interface UseFacilitiesOptions {
  sport?: SportType
  facilityType?: FacilityType
  userLocation?: { lat: number; lng: number }
  radiusKm?: number
  limit?: number
}

export interface UseFacilitiesResult {
  facilities: Venue[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Hook for fetching facilities from Firebase
 */
export function useFacilities(options: UseFacilitiesOptions = {}): UseFacilitiesResult {
  const [facilities, setFacilities] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      setError(null)

      const facilitiesRef = collection(db, 'facilities')
      let q = query(facilitiesRef)

      // Filter by sport type
      if (options.sport) {
        q = query(q, where('sportTypes', 'array-contains', options.sport))
      }

      // Filter by facility type
      if (options.facilityType) {
        q = query(q, where('facilityType', '==', options.facilityType))
      }

      // Location-based filtering (simplified - for production use Geohash or GeoFirestore)
      if (options.userLocation && options.radiusKm) {
        const { lat, lng } = options.userLocation
        const radiusKm = options.radiusKm
        const latDelta = radiusKm / 111.12 // 1 degree ≈ 111.12 km

        q = query(
          q,
          where('lat', '>=', lat - latDelta),
          where('lat', '<=', lat + latDelta)
        )
      }

      // Limit results
      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      const snapshot = await getDocs(q)
      let results: Venue[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Venue))

      // Additional filtering and distance calculation
      if (options.userLocation) {
        const { lat, lng } = options.userLocation
        const radiusKm = options.radiusKm || 50

        results = results
          .map(facility => ({
            ...facility,
            distance: calculateDistance(lat, lng, facility.lat, facility.lng),
          }))
          .filter(facility => (facility.distance || 0) <= radiusKm)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      setFacilities(results)
    } catch (err) {
      console.error('Error fetching facilities:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities()
  }, [options.sport, options.facilityType, options.userLocation, options.radiusKm, options.limit])

  return {
    facilities,
    loading,
    error,
    refetch: fetchFacilities,
  }
}

/**
 * Hook for fetching nearby facilities
 */
export function useNearbyFacilities(
  userLocation: { lat: number; lng: number } | null,
  radiusKm: number = 10,
  sport?: SportType
): UseFacilitiesResult {
  return useFacilities({
    userLocation: userLocation || undefined,
    radiusKm,
    sport,
    limit: 50,
  })
}

/**
 * Hook for fetching facilities by sport
 */
export function useFacilitiesBySport(
  sport: SportType,
  userLocation?: { lat: number; lng: number }
): UseFacilitiesResult {
  return useFacilities({
    sport,
    userLocation,
    limit: 100,
  })
}

/**
 * Hook for searching facilities
 */
export function useSearchFacilities(
  searchTerm: string,
  userLocation?: { lat: number; lng: number }
): UseFacilitiesResult {
  const [facilities, setFacilities] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const searchFacilities = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setFacilities([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Simple search - for production use Algolia or similar
      const facilitiesRef = collection(db, 'facilities')
      const snapshot = await getDocs(facilitiesRef)
      
      let results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Venue))
        .filter(facility => 
          facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.sportTypes.some(sport => sport.includes(searchTerm.toLowerCase()))
        )

      // Add distance if user location provided
      if (userLocation) {
        results = results.map(facility => ({
          ...facility,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            facility.lat,
            facility.lng
          ),
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      setFacilities(results)
    } catch (err) {
      console.error('Error searching facilities:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchFacilities()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm, userLocation])

  return {
    facilities,
    loading,
    error,
    refetch: searchFacilities,
  }
}

