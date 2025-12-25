import * as Location from 'expo-location'
import { useState, useEffect } from 'react'

export interface UserLocation {
    lat: number
    lng: number
    city?: string
}

// Default fallback location (NYC)
const DEFAULT_LOCATION: UserLocation = { lat: 40.7128, lng: -74.0060 }

class LocationService {
    private static instance: LocationService
    private currentLocation: UserLocation = DEFAULT_LOCATION
    private hasPermission: boolean = false

    private constructor() { }

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService()
        }
        return LocationService.instance
    }

    async requestPermission(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            this.hasPermission = status === 'granted'
            return this.hasPermission
        } catch (error) {
            console.error('Error requesting location permission:', error)
            return false
        }
    }

    async getCurrentLocation(): Promise<UserLocation> {
        try {
            if (!this.hasPermission) {
                const granted = await this.requestPermission()
                if (!granted) {
                    console.warn('Location permission denied, using default location')
                    return DEFAULT_LOCATION
                }
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            })

            this.currentLocation = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            }

            return this.currentLocation
        } catch (error) {
            console.error('Error getting current location:', error)
            return DEFAULT_LOCATION
        }
    }

    getCachedLocation(): UserLocation {
        return this.currentLocation
    }
}

export const locationService = LocationService.getInstance()

// React hook for using location in components
export function useUserLocation() {
    const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadLocation()
    }, [])

    const loadLocation = async () => {
        try {
            setLoading(true)
            const userLocation = await locationService.getCurrentLocation()
            setLocation(userLocation)
            setError(null)
        } catch (err) {
            console.error('Failed to load location:', err)
            setError('Failed to get location')
            setLocation(DEFAULT_LOCATION)
        } finally {
            setLoading(false)
        }
    }

    const refreshLocation = async () => {
        await loadLocation()
    }

    return { location, loading, error, refreshLocation }
}
