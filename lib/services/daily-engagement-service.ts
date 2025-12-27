/**
 * Daily Engagement Notifications Service
 * 
 * Duolingo-style notifications - motivational, sport-specific, personalized.
 * Key psychology:
 * - Loss aversion (streaks, FOMO)
 * - Social proof (others are playing)
 * - Progress tracking (you're improving)
 * - Variable rewards (randomized messages)
 */

import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Notification types
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
    | "progress_update"
    | "challenge"
    | "recommendation"

interface ScheduledNotification {
    id: string
    type: EngagementNotificationType
    title: string
    body: string
    hour: number
    minute: number
    weekdays?: number[]
    userType?: "player" | "trainer" | "instructor" | "all"
}

// ============================================
// PLAYER NOTIFICATIONS - SPORT SPECIFIC 🏀🎾
// ============================================
const PLAYER_NOTIFICATIONS: ScheduledNotification[] = [
    // Morning - 7:30 AM
    {
        id: "morning-1",
        type: "morning_motivation",
        title: "🌅 Rise and Grind",
        body: "Champions train before the world wakes up. Courts are empty - your time to shine.",
        hour: 7,
        minute: 30,
        userType: "player",
    },
    // Lunch - 12:00 PM
    {
        id: "lunch-1",
        type: "lunch_reminder",
        title: "⏰ Lunch Break = Level Up",
        body: "30 minutes of play > 30 minutes of scrolling. Courts near you are active!",
        hour: 12,
        minute: 0,
        userType: "player",
    },
    // Afternoon - 4:00 PM
    {
        id: "afternoon-1",
        type: "nearby_activity",
        title: "🔥 The Crowd's Showing Up",
        body: "Games are forming. Get there before the good spots are taken!",
        hour: 16,
        minute: 0,
        userType: "player",
    },
    // Report Incentive - 5:30 PM
    {
        id: "report-1",
        type: "report_reminder",
        title: "💰 Quick $5: 30 Seconds",
        body: "Report court conditions. Get paid. Help your community. Win-win-win.",
        hour: 17,
        minute: 30,
        userType: "player",
    },
    // Evening Peak - 6:00 PM
    {
        id: "evening-1",
        type: "evening_peak",
        title: "⚡ PRIME TIME",
        body: "This is THE hour. Courts are live. Games are running. You in?",
        hour: 18,
        minute: 0,
        userType: "player",
    },
    // Social - 6:30 PM
    {
        id: "evening-2",
        type: "social_nudge",
        title: "👥 Games Need Players",
        body: "Don't let them play without you. Jump in!",
        hour: 18,
        minute: 30,
        userType: "player",
    },
    // Streak Reminder - 8:00 PM
    {
        id: "night-1",
        type: "streak_reminder",
        title: "🔥 Your Streak!",
        body: "You've been consistent. Don't break it now. One quick check-in.",
        hour: 20,
        minute: 0,
        userType: "player",
    },
]

// ============================================
// TRAINER NOTIFICATIONS - BUSINESS FOCUSED 📈
// ============================================
const TRAINER_NOTIFICATIONS: ScheduledNotification[] = [
    // Morning - 8:00 AM
    {
        id: "trainer-morning-1",
        type: "trainer_check_in",
        title: "☀️ Good Morning, Coach",
        body: "Your clients are counting on you. Check today's schedule and show up strong.",
        hour: 8,
        minute: 0,
        userType: "trainer",
    },
    // Midday - 12:30 PM
    {
        id: "trainer-midday-1",
        type: "trainer_check_in",
        title: "📅 Fill Your Calendar",
        body: "Empty slots = lost income. Update your availability and get booked.",
        hour: 12,
        minute: 30,
        userType: "trainer",
    },
    // Afternoon - 4:30 PM
    {
        id: "trainer-afternoon-1",
        type: "nearby_activity",
        title: "📍 Players Looking for You",
        body: "Courts are busy. People want to learn. Time to grow your client base.",
        hour: 16,
        minute: 30,
        userType: "trainer",
    },
    // Evening - 7:00 PM
    {
        id: "trainer-evening-1",
        type: "social_nudge",
        title: "✍️ Session Complete?",
        body: "Log it. Get reviews. Build your reputation. Future you says thanks.",
        hour: 19,
        minute: 0,
        userType: "trainer",
    },
    // Sunday Weekly Recap - 10:00 AM
    {
        id: "trainer-weekly-1",
        type: "weekly_recap",
        title: "📊 Your Weekly Numbers",
        body: "See what you earned, who you helped, and where to grow next week.",
        hour: 10,
        minute: 0,
        weekdays: [1],
        userType: "trainer",
    },
]

// ============================================
// SPORT-SPECIFIC VARIED MESSAGES
// (Randomized for freshness - Duolingo style)
// ============================================
const SPORT_MESSAGES = {
    basketball: [
        { title: "🏀 Time to Ball", body: "Courts are calling. Get your shots up." },
        { title: "🏀 Hoopers Unite", body: "Runs are forming. Don't miss out." },
        { title: "🏀 Buckets Await", body: "The rim won't score itself. Let's go." },
    ],
    tennis: [
        { title: "🎾 Court Time", body: "Serve. Rally. Win. Courts are open." },
        { title: "🎾 Match Point", body: "Find a partner. Get on the court." },
        { title: "🎾 Ace the Day", body: "Tennis courts near you are waiting." },
    ],
    pickleball: [
        { title: "🏓 Dink & Drive", body: "Pickleball courts are filling up. Join the fun!" },
        { title: "🏓 Pickle Power", body: "Fast-growing sport. Growing skills. Let's play." },
        { title: "🏓 Kitchen Ready?", body: "Get to the court and dominate the kitchen." },
    ],
    soccer: [
        { title: "⚽ Goal Time", body: "Fields are active. Find a pickup game." },
        { title: "⚽ Beautiful Game", body: "There's always room for one more on the pitch." },
    ],
    volleyball: [
        { title: "🏐 Bump. Set. Spike.", body: "Courts are filling. Get in the rotation." },
        { title: "🏐 Sand or Indoor?", body: "Volleyball games forming near you." },
    ],
}

// Generic motivational messages (Duolingo psychology)
const MOTIVATIONAL_MESSAGES = {
    morning_motivation: [
        { title: "🌅 The Early Grind", body: "While others sleep, you improve. Courts are empty." },
        { title: "💪 Earn Your Day", body: "Start with movement. Win at everything else." },
        { title: "🔥 Morning Reps", body: "The version of you from yesterday is watching. Level up." },
        { title: "☀️ New Day, New PR", body: "What will you accomplish before noon?" },
        { title: "⚡ Built Different", body: "You're up early. That already sets you apart." },
    ],
    streak_reminder: [
        { title: "😱 Streak in Danger!", body: "You've come too far to quit now. One quick check-in!" },
        { title: "🔥 DON'T LET IT DIE", body: "Your streak survives with one action. Do it now." },
        { title: "🏆 Consistency = Greatness", body: "The greats never skip. Will you?" },
        { title: "⏰ Time's Running Out", body: "Your streak ends at midnight. Save it!" },
        { title: "💔 Break the Streak?", body: "After all that progress? Nah. Check in." },
    ],
    social_nudge: [
        { title: "👀 They Started Without You", body: "Games are happening. Get there!" },
        { title: "🤝 Your Crew is Playing", body: "Friends are at the court. Don't miss out." },
        { title: "👥 1 Spot Left", body: "Game needs one more. Could be you." },
        { title: "🎯 Prove Yourself", body: "New players to compete with. Show them what you've got." },
    ],
    evening_peak: [
        { title: "🔥 IT'S GO TIME", body: "Peak hours. Full courts. Maximum energy." },
        { title: "⚡ Prime Time", body: "This is when legends play. Are you one?" },
        { title: "🌙 Golden Hour", body: "Best games of the day are happening right now." },
        { title: "🏀 The Runs Are Hot", body: "Courts are packed and competitive. Join up." },
    ],
    lunch_reminder: [
        { title: "🍽️ Lunch Sweat", body: "Skip the extra scroll. Get a quick session in." },
        { title: "⏰ 30 Min to Change", body: "Lunch break = self-improvement time." },
        { title: "💪 Midday Movement", body: "Your afternoon self will thank you. Move!" },
    ],
    report_reminder: [
        { title: "💰 Easiest $5 Ever", body: "30 seconds. Snap. Report. Get paid." },
        { title: "📸 Help the Community", body: "Report conditions. Earn rewards. Be a hero." },
        { title: "🤑 Stack That Cash", body: "You're at a court anyway. Why not get paid?" },
    ],
    nearby_activity: [
        { title: "📍 Activity Alert", body: "Courts near you are popping off right now." },
        { title: "🔔 Players Nearby", body: "People are playing. Go be one of them." },
        { title: "🗺️ Close to Action", body: "Great games within a mile. Check it out." },
    ],
    challenge: [
        { title: "🎯 Daily Challenge", body: "Play one game today. Can you do it?" },
        { title: "💪 Push Yourself", body: "One more session than last week. You got this." },
        { title: "🏆 Beat Your Best", body: "Last week you played 3x. Can you hit 4?" },
    ],
    progress_update: [
        { title: "📈 You're Improving!", body: "More check-ins this week. Keep it up!" },
        { title: "🌟 On a Roll", body: "Your activity is trending up. Don't stop now." },
        { title: "💎 Rare Player", body: "Top 10% most active in your area. Nice." },
    ],
}

// Trainer-specific motivational messages
const TRAINER_MESSAGES = {
    trainer_check_in: [
        { title: "💼 Business Time", body: "Every session is a chance to change a life. Let's go." },
        { title: "🌟 Impact Day", body: "Your clients believe in you. Deliver greatness." },
        { title: "📈 Build the Empire", body: "Today's sessions = tomorrow's referrals." },
        { title: "🎯 Coach Mode: ON", body: "Time to transform some athletes." },
    ],
    weekly_recap: [
        { title: "📊 Week in Review", body: "See your earnings, sessions, and growth." },
        { title: "💰 Payday Check", body: "How much did you earn this week? Let's see." },
        { title: "📈 The Numbers Are In", body: "Your weekly performance report is ready." },
    ],
}

// ============================================
// SERVICE CLASS
// ============================================
class DailyEngagementService {
    private static instance: DailyEngagementService
    private userSport: string = "basketball" // Default

    static getInstance(): DailyEngagementService {
        if (!DailyEngagementService.instance) {
            DailyEngagementService.instance = new DailyEngagementService()
        }
        return DailyEngagementService.instance
    }

    /**
     * Set user's primary sport for personalized messages
     */
    async setUserSport(sport: string) {
        this.userSport = sport.toLowerCase()
        await AsyncStorage.setItem("user_primary_sport", sport.toLowerCase())
    }

    /**
     * Schedule all daily engagement notifications
     */
    async scheduleAllNotifications(
        userType: "player" | "trainer" | "instructor" = "player",
        primarySport?: string
    ) {
        // Cancel existing
        await Notifications.cancelAllScheduledNotificationsAsync()

        if (primarySport) {
            await this.setUserSport(primarySport)
        }

        const notifications = userType === "player"
            ? PLAYER_NOTIFICATIONS
            : TRAINER_NOTIFICATIONS

        for (const notification of notifications) {
            await this.scheduleNotification(notification, userType)
        }

        await AsyncStorage.setItem("engagement_notifications_enabled", "true")
        await AsyncStorage.setItem("engagement_notifications_userType", userType)

        console.log(`[Engagement] Scheduled ${notifications.length} notifications for ${userType}`)
    }

    /**
     * Schedule a single notification with personalized content
     */
    private async scheduleNotification(
        notification: ScheduledNotification,
        userType: "player" | "trainer" | "instructor"
    ) {
        try {
            const message = await this.getPersonalizedMessage(notification.type, userType)

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
            console.error(`Failed to schedule ${notification.id}:`, error)
        }
    }

    /**
     * Get personalized message based on sport and randomization
     */
    private async getPersonalizedMessage(
        type: EngagementNotificationType,
        userType: "player" | "trainer" | "instructor"
    ): Promise<{ title: string; body: string }> {
        const storedSport = await AsyncStorage.getItem("user_primary_sport")
        const sport = storedSport || this.userSport

        // 30% chance to use sport-specific message
        if (userType === "player" && Math.random() < 0.3) {
            const sportMessages = SPORT_MESSAGES[sport as keyof typeof SPORT_MESSAGES]
            if (sportMessages && sportMessages.length > 0) {
                return sportMessages[Math.floor(Math.random() * sportMessages.length)]
            }
        }

        // Use trainer messages for trainers
        if (userType === "trainer" || userType === "instructor") {
            const trainerMsgs = TRAINER_MESSAGES[type as keyof typeof TRAINER_MESSAGES]
            if (trainerMsgs && trainerMsgs.length > 0) {
                return trainerMsgs[Math.floor(Math.random() * trainerMsgs.length)]
            }
        }

        // Use motivational messages
        const messages = MOTIVATIONAL_MESSAGES[type as keyof typeof MOTIVATIONAL_MESSAGES]
        if (messages && messages.length > 0) {
            return messages[Math.floor(Math.random() * messages.length)]
        }

        // Fallback
        return { title: "🏀 GoodRunss", body: "Time to get active!" }
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
            case "progress_update":
                return "/stats/detailed"
            case "challenge":
            case "recommendation":
                return "/(tabs)"
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
        const message = customTitle && customBody
            ? { title: customTitle, body: customBody }
            : await this.getPersonalizedMessage(type, "player")

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
     * Set notification frequency
     */
    async setFrequency(frequency: "high" | "medium" | "low") {
        await AsyncStorage.setItem("notification_frequency", frequency)
        const userType = await AsyncStorage.getItem("engagement_notifications_userType")
        if (userType) {
            await this.scheduleAllNotifications(userType as "player" | "trainer")
        }
    }

    /**
     * SMART NUDGE SYSTEM (Context Aware)
     * Checks environment and usage stats to trigger immediate "smart" pushes
     */
    async checkContextualNudges() {
        try {
            const now = Date.now()
            const lastActiveStr = await AsyncStorage.getItem("last_active_timestamp")
            const lastActive = lastActiveStr ? parseInt(lastActiveStr) : now

            // 1. INACTIVITY TRIGGER (Streak Risk)
            // If inactive for > 24 hours but < 48 hours (Streak at risk)
            const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60)

            if (hoursSinceActive > 24 && hoursSinceActive < 48) {
                // Check if we already nudged about this
                const lastNudge = await AsyncStorage.getItem("last_streak_nudge")
                if (!lastNudge || (now - parseInt(lastNudge) > 86400000)) { // 24h cooldown
                    await this.sendImmediateNotification(
                        "streak_reminder",
                        "❄️ Streak Freezing...",
                        "You haven't checked in for 24h. Don't let your progress freeze!"
                    )
                    await AsyncStorage.setItem("last_streak_nudge", now.toString())
                    return // Prioritize streak nudge
                }
            }

            // 2. GOOD WEATHER TRIGGER (Simulated for now, would connect to WeatherWidget)
            // 20% chance to trigger if it's "nice out" (afternoon hours)
            const hour = new Date().getHours()
            const isAfternoon = hour >= 14 && hour <= 18
            const activeCity = "Atlanta" // Default

            if (isAfternoon && Math.random() < 0.2) {
                const lastWeatherNudge = await AsyncStorage.getItem("last_weather_nudge")
                if (!lastWeatherNudge || (now - parseInt(lastWeatherNudge) > 172800000)) { // 48h cooldown
                    await this.sendImmediateNotification(
                        "recommendation", // Reuse nearby_activity type
                        `☀️ Perfect Setup in ${activeCity}`,
                        "72°F and sunny. The courts are calling. Go play!"
                    )
                    await AsyncStorage.setItem("last_weather_nudge", now.toString())
                    return
                }
            }

            // 3. SOCIAL FOMO TRIGGER
            // "3 friends are playing right now"
            if (Math.random() < 0.15) {
                const lastSocial = await AsyncStorage.getItem("last_social_nudge_generated")
                if (!lastSocial || (now - parseInt(lastSocial) > 86400000)) {
                    await this.sendImmediateNotification(
                        "social_nudge",
                        "👀 They're playing without you",
                        "3 friends checked into courts nearby. Join the run!"
                    )
                    await AsyncStorage.setItem("last_social_nudge_generated", now.toString())
                }
            }

        } catch (error) {
            console.log("[Engagement] Smart check failed", error)
        }
    }
}

export const dailyEngagementService = DailyEngagementService.getInstance()
