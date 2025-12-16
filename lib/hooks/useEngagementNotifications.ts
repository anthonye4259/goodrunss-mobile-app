/**
 * useEngagementNotifications Hook
 * 
 * Initializes and manages daily engagement notifications based on user preferences.
 */

import { useEffect, useRef } from "react"
import { dailyEngagementService } from "@/lib/services/daily-engagement-service"
import { useUserPreferences } from "@/lib/user-preferences"
import { useAuth } from "@/lib/auth-context"

export function useEngagementNotifications() {
    const { preferences } = useUserPreferences()
    const { user } = useAuth()
    const hasScheduled = useRef(false)

    useEffect(() => {
        // Only schedule once per session, after preferences are loaded
        if (!preferences?.userType || hasScheduled.current) return
        if (!user?.id) return // Only for logged-in users

        const scheduleNotifications = async () => {
            try {
                const isEnabled = await dailyEngagementService.isEnabled()

                // Auto-enable for new users, respect existing preference for returning users
                if (isEnabled === false) {
                    // User has explicitly disabled - respect that
                    return
                }

                // Schedule based on user type
                const userType = preferences.userType === "trainer" || preferences.userType === "instructor"
                    ? "trainer"
                    : "player"

                await dailyEngagementService.scheduleAllNotifications(userType)
                hasScheduled.current = true

                console.log(`[Engagement] Notifications scheduled for ${userType}`)
            } catch (error) {
                console.error("[Engagement] Failed to schedule notifications:", error)
            }
        }

        scheduleNotifications()
    }, [preferences?.userType, user?.id])

    return {
        enableNotifications: async () => {
            const userType = preferences?.userType === "trainer" || preferences?.userType === "instructor"
                ? "trainer"
                : "player"
            await dailyEngagementService.scheduleAllNotifications(userType)
        },
        disableNotifications: async () => {
            await dailyEngagementService.disableNotifications()
        },
        isEnabled: dailyEngagementService.isEnabled,
    }
}
