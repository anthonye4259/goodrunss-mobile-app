
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Standardize with what consumers expect
type UserLocation = {
  latitude: number
  longitude: number
  city?: string
  state?: string
  zipCode?: string
}

// Default fallback (NYC) - consistent with old service
const DEFAULT_LOCATION: UserLocation = {
  latitude: 40.7128,
  longitude: -74.0060,
  city: "New York",
  state: "NY"
}

type LocationContextType = {
  location: UserLocation | null
  loading: boolean
  error: string | null
  permissionGranted: boolean
  requestLocation: () => Promise<void>
  calculateDistance: (lat: number, lon: number) => number | null
  refreshLocation: () => Promise<void>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Initial load - try catch, then fresh
    loadInitialLocation()
  }, [])

  const loadInitialLocation = async () => {
    try {
      // 1. Check cache
      const cached = await AsyncStorage.getItem("userLocation")
      if (cached) {
        setLocation(JSON.parse(cached))
      }

      // 2. Check permission status without asking first
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status === "granted") {
        setPermissionGranted(true)
        await fetchFreshLocation()
      } else {
        // If we have no permission and no cache, fallback to default
        if (!cached) {
          setLocation(DEFAULT_LOCATION)
        }
        setLoading(false)
      }
    } catch (err) {
      console.log("[Location] Init error:", err)
      if (!location) setLocation(DEFAULT_LOCATION)
    } finally {
      setLoading(false)
    }
  }

  const fetchFreshLocation = async () => {
    setLoading(true)
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = currentLocation.coords

      // Reverse geocode for city name
      let cityData = {}
      try {
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude })
        cityData = {
          city: geocode?.city,
          state: geocode?.region,
          zipCode: geocode?.postalCode,
        }
      } catch (e) {
        console.log("Reverse geocode failed, using coords only")
      }

      const locationData: UserLocation = {
        latitude,
        longitude,
        ...cityData
      }

      setLocation(locationData)
      await AsyncStorage.setItem("userLocation", JSON.stringify(locationData))
      setError(null)
    } catch (err) {
      console.error("[Location] Failed to get fresh location", err)
      setError("Failed to get fresh location")
      // Keep using cached or default if available
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = async () => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status === "granted") {
        setPermissionGranted(true)
        await fetchFreshLocation()
      } else {
        setPermissionGranted(false)
        setError("Location permission denied")
        // Enforce default fallback if we have nothing
        if (!location) setLocation(DEFAULT_LOCATION)
      }
    } catch (err) {
      console.error("[Location] Request permission error", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat: number, lon: number): number | null => {
    if (!location) return null

    const R = 3959 // Earth's radius in miles
    const dLat = ((lat - location.latitude) * Math.PI) / 180
    const dLon = ((lon - location.longitude) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((location.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <LocationContext.Provider value={{
      location,
      loading,
      error,
      permissionGranted,
      requestLocation,
      calculateDistance,
      refreshLocation: fetchFreshLocation
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider")
  }
  return context
}

// Backward compatibility helper for components migrating from useUserLocation
export function useUserLocation() {
  const { location, loading, error, refreshLocation } = useLocation()

  // Adapt to the shape expected by old consumers if needed, 
  // but the unified shape (latitude, longitude) is cleaner.
  // Old service used { lat, lng }, so let's map it for compatibility:
  return {
    location: location ? {
      lat: location.latitude,
      lng: location.longitude,
      city: location.city
    } : null,
    loading,
    error,
    refreshLocation
  }
}
