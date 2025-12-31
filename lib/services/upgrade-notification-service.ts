import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { router } from "expo-router"
import { revenueCatService } from "@/lib/revenue-cat"

// ============================================
// UPGRADE NOTIFICATION SERVICE
// Prompts free trainers & facilities to upgrade
// ============================================

const STORAGE_KEYS = {
    LAST_PROMPT_DATE: "@goodrunss_last_upgrade_prompt",
    PROMPT_COUNT: "@goodrunss_upgrade_prompt_count",
    DISMISSED_FOREVER: "@goodrunss_upgrade_dismissed",
}

// Minimum days between upgrade prompts
const DAYS_BETWEEN_PROMPTS = 3
const MAX_PROMPTS_BEFORE_DISMISS_OPTION = 5

// ============================================
// NOTIFICATION MESSAGES
// ============================================

const TRAINER_MESSAGES = [
    {
        title: "GIA: You're growing fast!",
        body: "I can help you manage all these new clients with automated invoicing. Want to see how?",
    },
    {
        title: "GIA: Eyes on you",
        body: "Your profile is getting hits. Going Pro boosts your visibility by 3x. Let's get you fully booked!",
    },
    {
        title: "GIA: Hate paperwork?",
        body: "I can handle your invoices and payments automatically. Upgrade to Pro and I'll get started.",
    },
    {
        title: "GIA: Join the pros",
        body: "500+ trainers use me to run their business. Ready to level up your game?",
    },
    {
        title: "GIA: Ready to earn more?",
        body: "Pro trainers earn $500 more per month on average. I can help you get there.",
    },
]

const FACILITY_MESSAGES = [
    {
        title: "GIA: Boost your revenue",
        body: "I predict we could fill 40% more court time with Premium visibility. Interested?",
    },
    {
        title: "GIA: Empty courts?",
        body: "I can find players to fill those slots automatically using my demand prediction engine.",
    },
    {
        title: "GIA: Get discovered",
        body: "Players are searching nearby. Upgrade to Premium and I'll put your facility at the top.",
    },
    {
        title: "GIA: Save on fees",
        body: "Smart move: Premium members save 3% on every booking. That adds up!",
    },
    {
        title: "GIA: High demand detected",
        body: "Lots of players active nearby. Let's make sure they see your facility first.",
    },
]

// ============================================
// UPGRADE NOTIFICATION SERVICE
// ============================================

class UpgradeNotificationService {
    private static instance: UpgradeNotificationService

    static getInstance(): UpgradeNotificationService {
        if (!UpgradeNotificationService.instance) {
            UpgradeNotificationService.instance = new UpgradeNotificationService()
        }
        return UpgradeNotificationService.instance
    }

    /**
     * Check if user should receive upgrade prompt
     */
    async shouldShowUpgradePrompt(userType: "trainer" | "facility"): Promise<boolean> {
        try {
            // Check if dismissed forever
            const dismissed = await AsyncStorage.getItem(STORAGE_KEYS.DISMISSED_FOREVER)
            if (dismissed === "true") {
                console.log("[UpgradeNotif] User dismissed forever")
                return false
            }

            // Check if already subscribed
            const customerInfo = await revenueCatService.getCustomerInfo()
            if (customerInfo && revenueCatService.isPro(customerInfo)) {
                console.log("[UpgradeNotif] User is already Pro")
                return false
            }

            // Check last prompt date
            const lastPrompt = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE)
            if (lastPrompt) {
                const daysSinceLastPrompt = this.getDaysSince(new Date(lastPrompt))
                if (daysSinceLastPrompt < DAYS_BETWEEN_PROMPTS) {
                    console.log(`[UpgradeNotif] Only ${daysSinceLastPrompt} days since last prompt`)
                    return false
                }
            }

            return true
        } catch (error) {
            console.error("[UpgradeNotif] Error checking should show:", error)
            return false
        }
    }

    /**
     * Schedule an upgrade prompt notification
     */
    async scheduleUpgradePrompt(userType: "trainer" | "facility"): Promise<void> {
        try {
            const shouldShow = await this.shouldShowUpgradePrompt(userType)
            if (!shouldShow) return

            // Pick a random message
            const messages = userType === "trainer" ? TRAINER_MESSAGES : FACILITY_MESSAGES
            const message = messages[Math.floor(Math.random() * messages.length)]

            // Schedule for 2 hours from now (not immediately)
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: message.title,
                    body: message.body,
                    data: {
                        type: `upgrade_prompt_${userType}`,
                        action: "open_upgrade",
                        userType,
                    },
                    sound: true,
                },
                trigger: {
                    seconds: 2 * 60 * 60, // 2 hours
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                },
            })

            // Update tracking
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT_DATE, new Date().toISOString())
            const count = parseInt(await AsyncStorage.getItem(STORAGE_KEYS.PROMPT_COUNT) || "0")
            await AsyncStorage.setItem(STORAGE_KEYS.PROMPT_COUNT, String(count + 1))

            console.log(`[UpgradeNotif] Scheduled ${userType} upgrade prompt`)
        } catch (error) {
            console.error("[UpgradeNotif] Error scheduling prompt:", error)
        }
    }

    /**
     * Send immediate upgrade prompt (e.g., when user hits a paywalled feature)
     */
    async sendImmediatePrompt(userType: "trainer" | "facility", trigger?: string): Promise<void> {
        try {
            const customerInfo = await revenueCatService.getCustomerInfo()
            if (customerInfo && revenueCatService.isPro(customerInfo)) return

            const messages = userType === "trainer" ? TRAINER_MESSAGES : FACILITY_MESSAGES
            const message = messages[Math.floor(Math.random() * messages.length)]

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: message.title,
                    body: message.body,
                    data: {
                        type: `upgrade_prompt_${userType}`,
                        action: "open_upgrade",
                        userType,
                        trigger,
                    },
                    sound: true,
                },
                trigger: null, // Immediate
            })

            console.log(`[UpgradeNotif] Sent immediate ${userType} prompt`)
        } catch (error) {
            console.error("[UpgradeNotif] Error sending immediate prompt:", error)
        }
    }

    /**
     * Handle notification tap - deep link to upgrade screen
     */
    handleNotificationTap(notification: Notifications.Notification): boolean {
        const data = notification.request.content.data as any

        if (data?.type?.startsWith("upgrade_prompt_")) {
            const userType = data.userType

            if (userType === "trainer") {
                router.push("/business/subscription")
            } else if (userType === "facility") {
                router.push("/facility/premium")
            }

            return true // Handled
        }

        return false // Not an upgrade notification
    }

    /**
     * Dismiss upgrade prompts forever
     */
    async dismissForever(): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEYS.DISMISSED_FOREVER, "true")
        console.log("[UpgradeNotif] User dismissed upgrade prompts forever")
    }

    /**
     * Check if "Don't show again" option should be visible
     */
    async shouldShowDismissOption(): Promise<boolean> {
        const count = parseInt(await AsyncStorage.getItem(STORAGE_KEYS.PROMPT_COUNT) || "0")
        return count >= MAX_PROMPTS_BEFORE_DISMISS_OPTION
    }

    /**
     * Reset all upgrade prompt state (for testing)
     */
    async reset(): Promise<void> {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.LAST_PROMPT_DATE,
            STORAGE_KEYS.PROMPT_COUNT,
            STORAGE_KEYS.DISMISSED_FOREVER,
        ])
        console.log("[UpgradeNotif] Reset all state")
    }

    // ============================================
    // HELPERS
    // ============================================

    private getDaysSince(date: Date): number {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        return Math.floor(diff / (1000 * 60 * 60 * 24))
    }
}

export const upgradeNotificationService = UpgradeNotificationService.getInstance()
