/**
 * Daily Engagement Notifications Service
 * 
 * Duolingo-style notifications to keep users active and engaged.
 * Sends contextual notifications based on:
 * - Time of day
 * - User type (player/trainer)
 * - Activity history
 * - Local court activity
 * - Streak status
 */

import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Notification types for engagement
export type EngagementNotificationType =
    | "morning_motivation"
    | "lunch_reminder"
    | "evening_peak"
    | "streak_reminder"
    | "nearby_activity"
    | "trainer_check_in"
    | "report_reminder"
    | "social_nudge"
    | "weekly_recap"

interface ScheduledNotification {
    id: string
    type: EngagementNotificationType
    title: string
    body: string
    hour: number
    minute: number
    weekdays?: number[] // 1-7 for Sun-Sat
    userType?: "player" | "trainer" | "instructor" | "all"
}

// Player notification templates
const PLAYER_NOTIFICATIONS: ScheduledNotification[] = [
    // Morning (7-9 AM)
    {
        id: "morning-1",
        type: "morning_motivation",
        title: "🌅 Rise and Run!",
        body: "Courts are quiet this morning. Perfect time to get some shots up!",
        hour: 7,
        minute: 30,
        userType: "player",
    },
    // Lunch (12 PM)
    {
        id: "lunch-1",
        type: "lunch_reminder",
        title: "🏀 Lunch Run?",
        body: "Take a break and get some runs in. Courts are active near you!",
        hour: 12,
        minute: 0,
        userType: "player",
    },
    // Afternoon (4 PM)
    {
        id: "afternoon-1",
        type: "nearby_activity",
        title: "⚡ Courts are heating up!",
        body: "After-school crowd is out. Players looking for runs near you.",
        hour: 16,
        minute: 0,
        userType: "player",
    },
    // Evening Peak (6 PM)
    {
        id: "evening-1",
        type: "evening_peak",
        title: "🔥 Peak hours! Games happening now",
        body: "This is when the action happens. Check live court activity!",
        hour: 18,
        minute: 0,
        userType: "player",
    },
    // Social nudge (6:30 PM)
    {
        id: "evening-2",
        type: "social_nudge",
        title: "👋 Your crew is playing!",
        body: "Friends checked in nearby. Join them before spots fill up!",
        hour: 18,
        minute: 30,
        userType: "player",
    },
    // Streak reminder (8 PM)
    {
        id: "night-1",
        type: "streak_reminder",
        title: "🏆 Don't break your streak!",
        body: "You haven't checked in today. One quick report saves it!",
        hour: 20,
        minute: 0,
        userType: "player",
    },
    // Report reminder (5:30 PM)
    {
        id: "report-1",
        type: "report_reminder",
        title: "💰 Earn $5 in 30 seconds",
        body: "At a court? Quick report = instant rewards!",
        hour: 17,
        minute: 30,
        userType: "player",
    },
]

// Trainer notification templates
const TRAINER_NOTIFICATIONS: ScheduledNotification[] = [
    // Morning
    {
        id: "trainer-morning-1",
        type: "trainer_check_in",
        title: "🌟 Good morning, Coach!",
        body: "Check your bookings for today. Clients are waiting!",
        hour: 8,
        minute: 0,
        userType: "trainer",
    },
    // Midday
    {
        id: "trainer-midday-1",
        type: "trainer_check_in",
        title: "📊 Midday check-in",
        body: "Update your availability. Open slots = more bookings!",
        hour: 12,
        minute: 30,
        userType: "trainer",
    },
    // Afternoon
    {
        id: "trainer-afternoon-1",
        type: "nearby_activity",
        title: "📍 Courts are busy near you!",
        body: "Players looking for training. Promote your sessions.",
        hour: 16,
        minute: 30,
        userType: "trainer",
    },
    // Evening
    {
        id: "trainer-evening-1",
        type: "social_nudge",
        title: "💪 How was your session?",
        body: "Log your training and build your reputation!",
        hour: 19,
        minute: 0,
        userType: "trainer",
    },
    // Weekly recap (Sunday)
    {
        id: "trainer-weekly-1",
        type: "weekly_recap",
        title: "📈 Your weekly stats are in!",
        body: "See your views, bookings, and earnings this week!",
        hour: 10,
        minute: 0,
        weekdays: [1], // Sunday
        userType: "trainer",
    },
]

// Varied messages for freshness (like Duolingo!)
const VARIED_MESSAGES = {
    morning_motivation: [
        { title: "🌅 Early bird gets the court!", body: "Beat the crowd. Check which courts are empty." },
        { title: "☀️ New day, new gains!", body: "Start your day with movement." },
        { title: "🔥 Let's get this bread!", body: "Morning workouts hit different." },
        { title: "💪 Champions train early", body: "The greats are up. Are you?" },
    ],
    streak_reminder: [
        { title: "😱 Your streak is in danger!", body: "Don't let it end! One check-in saves it." },
        { title: "🔥 Keep the fire burning!", body: "Check in today to continue your streak!" },
        { title: "💪 Champions show up daily", body: "Your streak proves you're committed." },
        { title: "🏆 Almost there!", body: "One activity keeps your streak alive!" },
    ],
    social_nudge: [
        { title: "👀 Someone's looking for players", body: "A game near you needs one more!" },
        { title: "🤝 Make a new hoops friend", body: "Players at your skill level nearby." },
        { title: "🏀 Squad up?", body: "Check who's at the court!" },
        { title: "🎯 Your turn!", body: "Games happening. Will you show up?" },
    ],
    evening_peak: [
        { title: "🔥 It's game time!", body: "Peak hours are here. Courts are LIT!" },
        { title: "⚡ The runs are starting", body: "Best time to play. Get there!" },
        { title: "🏀 Prime time hoops", body: "This is when legends are made." },
    ],
    lunch_reminder: [
        { title: "🏀 Lunch break = ball time", body: "Get out of the office. Courts are waiting." },
        { title: "🍽️ Feed your game", body: "Lunchtime runs hit different." },
        { title: "⏰ Time for a quick session", body: "30 mins is all you need!" },
    ],
}

class DailyEngagementService {
    private static instance: DailyEngagementService

    static getInstance(): DailyEngagementService {
        if (!DailyEngagementService.instance) {
            DailyEngagementService.instance = new DailyEngagementService()
        }
        return DailyEngagementService.instance
    }

    /**
     * Schedule all daily engagement notifications
     */
    async scheduleAllNotifications(userType: "player" | "trainer" | "instructor" = "player") {
        // Cancel existing scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync()

        const notifications = userType === "player"
            ? PLAYER_NOTIFICATIONS
            : TRAINER_NOTIFICATIONS

        for (const notification of notifications) {
            await this.scheduleNotification(notification)
        }

        await AsyncStorage.setItem("engagement_notifications_enabled", "true")
        await AsyncStorage.setItem("engagement_notifications_userType", userType)

        console.log(`[Engagement] Scheduled ${notifications.length} notifications for ${userType}`)
    }

    /**
     * Schedule a single notification
     */
    private async scheduleNotification(notification: ScheduledNotification) {
        try {
            const message = this.getVariedMessage(notification.type) || {
                title: notification.title,
                body: notification.body,
            }

            const trigger: any = {
                hour: notification.hour,
                minute: notification.minute,
                repeats: true,
            }

            if (notification.weekdays && notification.weekdays.length > 0) {
                trigger.weekday = notification.weekdays[0]
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: message.title,
                    body: message.body,
                    data: {
                        type: notification.type,
                        screen: this.getScreenForType(notification.type),
                    },
                    sound: true,
                },
                trigger,
            })
        } catch (error) {
            console.error(`Failed to schedule notification ${notification.id}:`, error)
        }
    }

    /**
     * Get a random varied message
     */
    private getVariedMessage(type: EngagementNotificationType): { title: string; body: string } | null {
        const messages = VARIED_MESSAGES[type as keyof typeof VARIED_MESSAGES]
        if (!messages) return null
        return messages[Math.floor(Math.random() * messages.length)]
    }

    /**
     * Get screen to navigate to when tapped
     */
    private getScreenForType(type: EngagementNotificationType): string {
        switch (type) {
            case "morning_motivation":
            case "lunch_reminder":
            case "evening_peak":
            case "nearby_activity":
            case "social_nudge":
                return "/(tabs)/explore"
            case "streak_reminder":
            case "report_reminder":
                return "/(tabs)/report"
            case "trainer_check_in":
                return "/trainer-dashboard"
            case "weekly_recap":
                return "/stats/detailed"
            default:
                return "/(tabs)"
        }
    }

    /**
     * Send immediate notification
     */
    async sendImmediateNotification(
        type: EngagementNotificationType,
        customTitle?: string,
        customBody?: string
    ) {
        const message = this.getVariedMessage(type) || {
            title: customTitle || "GoodRunss",
            body: customBody || "Check out what's happening!",
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: message.title,
                body: message.body,
                data: { type, screen: this.getScreenForType(type) },
                sound: true,
            },
            trigger: null,
        })
    }

    /**
     * Disable all notifications
     */
    async disableNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync()
        await AsyncStorage.setItem("engagement_notifications_enabled", "false")
    }

    /**
     * Check if enabled
     */
    async isEnabled(): Promise<boolean> {
        const enabled = await AsyncStorage.getItem("engagement_notifications_enabled")
        return enabled === "true"
    }

    /**
     * Set frequency (high/medium/low)
     */
    async setFrequency(frequency: "high" | "medium" | "low") {
        await AsyncStorage.setItem("notification_frequency", frequency)
        const userType = await AsyncStorage.getItem("engagement_notifications_userType")
        if (userType) {
            await this.scheduleAllNotifications(userType as "player" | "trainer")
        }
    }
}

export const dailyEngagementService = DailyEngagementService.getInstance()
