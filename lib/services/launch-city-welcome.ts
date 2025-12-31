/**
 * Launch City Welcome Service
 * 
 * Detects when a user enters a priority launch city for the first time
 * and sends a welcome push notification.
 */

import * as Notifications from "expo-notifications"
import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { PRIORITY_LAUNCH_CITIES, LAUNCH_CITIES, getLaunchCity } from "@/lib/launch-cities"

const STORAGE_KEY = "@goodrunss_welcomed_cities"

// City center coordinates for geofencing
const CITY_CENTERS: Record<string, { lat: number; lng: number; radius: number }> = {
    "new-york": { lat: 40.7128, lng: -74.0060, radius: 50 }, // 50km radius
    "san-francisco": { lat: 37.7749, lng: -122.4194, radius: 30 },
    "myrtle-beach": { lat: 33.6891, lng: -78.8867, radius: 20 },
}

// Welcome messages per city
const WELCOME_MESSAGES: Record<string, { title: string; body: string }> = {
    "new-york": {
        title: "Welcome to NYC!",
        body: "Find the best basketball courts and trainers near you. GIA's got your back in the city.",
    },
    "san-francisco": {
        title: "You're in SF!",
        body: "Discover pickup games happening now. The Bay Area courts are waiting.",
    },
    "myrtle-beach": {
        title: "Welcome to Myrtle Beach!",
        body: "On vacation? Find courts, trainers, and games nearby. Let's play!",
    },
}

class LaunchCityWelcomeService {
    private static instance: LaunchCityWelcomeService

    static getInstance(): LaunchCityWelcomeService {
        if (!LaunchCityWelcomeService.instance) {
            LaunchCityWelcomeService.instance = new LaunchCityWelcomeService()
        }
        return LaunchCityWelcomeService.instance
    }

    /**
     * Check if user is in a priority launch city and send welcome if first time
     */
    async checkAndWelcome(userLocation: { lat: number; lng: number }): Promise<string | null> {
        try {
            // Check which city the user is in
            const cityId = this.detectCity(userLocation)
            if (!cityId) return null

            // Check if already welcomed
            const alreadyWelcomed = await this.hasBeenWelcomed(cityId)
            if (alreadyWelcomed) return null

            // Send welcome notification
            await this.sendWelcomeNotification(cityId)

            // Mark as welcomed
            await this.markAsWelcomed(cityId)

            return cityId
        } catch (error) {
            console.error("[LaunchCityWelcome] Error:", error)
            return null
        }
    }

    /**
     * Detect which priority city the user is in based on coordinates
     */
    private detectCity(location: { lat: number; lng: number }): string | null {
        for (const cityId of PRIORITY_LAUNCH_CITIES) {
            const center = CITY_CENTERS[cityId]
            if (!center) continue

            const distance = this.calculateDistance(
                location.lat,
                location.lng,
                center.lat,
                center.lng
            )

            if (distance <= center.radius) {
                return cityId
            }
        }
        return null
    }

    /**
     * Calculate distance between two points in km (Haversine formula)
     */
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371 // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1)
        const dLng = this.toRad(lng2 - lng1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180)
    }

    /**
     * Check if user has been welcomed to a city
     */
    private async hasBeenWelcomed(cityId: string): Promise<boolean> {
        const welcomed = await AsyncStorage.getItem(STORAGE_KEY)
        if (!welcomed) return false
        const cities: string[] = JSON.parse(welcomed)
        return cities.includes(cityId)
    }

    /**
     * Mark city as welcomed
     */
    private async markAsWelcomed(cityId: string): Promise<void> {
        const welcomed = await AsyncStorage.getItem(STORAGE_KEY)
        const cities: string[] = welcomed ? JSON.parse(welcomed) : []
        if (!cities.includes(cityId)) {
            cities.push(cityId)
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
        }
    }

    /**
     * Send welcome push notification
     */
    private async sendWelcomeNotification(cityId: string): Promise<void> {
        const message = WELCOME_MESSAGES[cityId]
        if (!message) return

        await Notifications.scheduleNotificationAsync({
            content: {
                title: message.title,
                body: message.body,
                data: {
                    type: "launch_city_welcome",
                    cityId,
                    screen: "/discover",
                },
                sound: true,
            },
            trigger: null, // Immediate
        })

        console.log(`[LaunchCityWelcome] Sent welcome for ${cityId}`)
    }

    /**
     * Get the user's current city ID based on location
     */
    async getCurrentCityId(): Promise<string | null> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync()
            if (status !== "granted") return null

            const location = await Location.getCurrentPositionAsync({})
            return this.detectCity({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            })
        } catch (error) {
            console.error("[LaunchCityWelcome] Location error:", error)
            return null
        }
    }
}

export const launchCityWelcomeService = LaunchCityWelcomeService.getInstance()
