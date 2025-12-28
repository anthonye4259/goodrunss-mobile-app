import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

const RADAR_TASK_NAME = "GOODRUNSS_RADAR_MONITOR"

// Define the task globally (needs to be executing in the background)
TaskManager.defineTask(RADAR_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error("[Radar] Task error:", error)
        return
    }

    if (data) {
        const { eventType, region } = data as any

        // Log for debugging
        console.log(`[Radar] Region ${eventType}:`, region)

        if (eventType === Location.GeofencingEventType.Enter) {
            // Check if we've already notified recently to avoid spam
            const lastNotified = await AsyncStorage.getItem(`last_notified_${region.identifier}`)
            const now = Date.now()

            // Cooldown: 2 hours
            if (!lastNotified || now - parseInt(lastNotified) > 7200000) {
                // TODO: Fetch actual status from realtime service
                // For now, we'll send a generic prompt with encouraging language
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🏀 You're Near a Court!",
                        body: `${region.identifier} is nearby - tap to check if it's open!`,
                        data: {
                            venueId: region.identifier,
                            type: "court_nearby_quiet",
                            action: "check_status"
                        },
                        sound: true,
                    },
                    trigger: null, // Send immediately
                })

                await AsyncStorage.setItem(`last_notified_${region.identifier}`, now.toString())
            }
        }
    }
})

export const geofenceService = {
    /**
     * Start monitoring a list of regions (Venues)
     */
    async startMonitoring(regions: Location.LocationRegion[]) {
        try {
            const { status } = await Location.requestBackgroundPermissionsAsync()
            if (status !== 'granted') {
                console.log("[Radar] Background permission not granted")
                return false
            }

            // Max 20 regions allowed by iOS usually, so limit to closest
            // For now, we'll just monitor a few key ones or phase 1 cities
            const limitedRegions = regions.slice(0, 15)

            await Location.startGeofencingAsync(RADAR_TASK_NAME, limitedRegions)
            console.log(`[Radar] Active for ${limitedRegions.length} regions`)
            return true
        } catch (error) {
            console.error("[Radar] Start monitoring failed:", error)
            return false
        }
    },

    /**
     * Stop all monitoring (e.g. user toggle off)
     */
    async stopMonitoring() {
        try {
            await Location.stopGeofencingAsync(RADAR_TASK_NAME)
            console.log("[Radar] Stopped")
        } catch (error) {
            // Ignore if task not running
        }
    }
}
