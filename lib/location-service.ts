import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface Coordinates {
  latitude: number
  longitude: number
}

export class LocationService {
  private static instance: LocationService
  private currentLocation: Coordinates | null = null

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService()
    }
    return LocationService.instance
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      console.log("[v0] Location permissions denied")
      return false
    }
    return true
  }

  async getCurrentLocation(): Promise<Coordinates | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return null

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      // Cache location
      await AsyncStorage.setItem("last_location", JSON.stringify(this.currentLocation))

      return this.currentLocation
    } catch (error) {
      console.error("[v0] Error getting location:", error)

      // Try to get cached location
      const cached = await AsyncStorage.getItem("last_location")
      if (cached) {
        this.currentLocation = JSON.parse(cached)
        return this.currentLocation
      }

      return null
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  async getNearbyItems<T extends { latitude: number; longitude: number }>(
    items: T[],
    maxDistance = 10,
  ): Promise<(T & { distance: number })[]> {
    const location = await this.getCurrentLocation()
    if (!location) return []

    return items
      .map((item) => ({
        ...item,
        distance: this.calculateDistance(location.latitude, location.longitude, item.latitude, item.longitude),
      }))
      .filter((item) => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
  }
}
