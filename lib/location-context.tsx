"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"

type LocationData = {
  latitude: number
  longitude: number
  city?: string
  state?: string
  zipCode?: string
}

type LocationContextType = {
  location: LocationData | null
  loading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  calculateDistance: (lat: number, lon: number) => number | null
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCachedLocation()
  }, [])

  const loadCachedLocation = async () => {
    try {
      const cached = await AsyncStorage.getItem("userLocation")
      if (cached) {
        setLocation(JSON.parse(cached))
      }
    } catch (err) {
      console.log("[v0] Failed to load cached location:", err)
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = async () => {
    try {
      setLoading(true)
      setError(null)

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Location permission denied")
        setLoading(false)
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = currentLocation.coords

      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude })

      const locationData: LocationData = {
        latitude,
        longitude,
        city: geocode?.city,
        state: geocode?.region,
        zipCode: geocode?.postalCode,
      }

      setLocation(locationData)
      await AsyncStorage.setItem("userLocation", JSON.stringify(locationData))
    } catch (err) {
      setError("Failed to get location")
      console.log("[v0] Location error:", err)
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
    <LocationContext.Provider value={{ location, loading, error, requestLocation, calculateDistance }}>
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
