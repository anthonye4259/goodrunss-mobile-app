/**
 * Ping Service
 * 
 * Enables facilities and trainers to send mini-messages (pings) to interested players.
 * 
 * Features:
 * - Quick message templates
 * - Free tier: 3 pings/month
 * - Premium: Unlimited pings
 * - Push notification delivery
 */

import { db } from "../firebase-config"
import { FACILITY_SUBSCRIPTION } from "./facility-subscription-service"

// Ping message templates
export const PING_TEMPLATES = {
    COURT_AVAILABLE: {
        id: "court_available",
        icon: "🎾",
        title: "Court Available Today",
        message: "Hey {playerName}! We have a court available today at {time}. Book now before it's gone!",
        category: "availability",
    },
    FIRST_TIME_DISCOUNT: {
        id: "first_time_discount",
        icon: "⭐",
        title: "First-Time Offer",
        message: "Welcome to {businessName}! Get 20% off your first booking. Use code: WELCOME20",
        category: "promotion",
    },
    WEEKEND_SPECIAL: {
        id: "weekend_special",
        icon: "🔥",
        title: "Weekend Special",
        message: "Limited slots this weekend! Book your court at {businessName} before they fill up.",
        category: "urgency",
    },
    SESSION_REMINDER: {
        id: "session_reminder",
        icon: "📅",
        title: "Ready to Train?",
        message: "Hi {playerName}! I noticed you checked my availability. I have openings this week - let's get you on the court!",
        category: "trainer",
    },
    SKILL_MATCH: {
        id: "skill_match",
        icon: "🏆",
        title: "Perfect Match",
        message: "Your {sport} level is perfect for my training style. Book a session and let's take your game to the next level!",
        category: "trainer",
    },
    CUSTOM: {
        id: "custom",
        icon: "💬",
        title: "Custom Message",
        message: "",
        category: "custom",
    },
} as const

export type PingTemplateId = keyof typeof PING_TEMPLATES

export interface Ping {
    id?: string
    senderId: string
    senderType: "facility" | "trainer"
    senderName: string
    recipientId: string
    recipientName?: string
    templateId: PingTemplateId
    message: string
    customMessage?: string
    sentAt: Date
    opened: boolean
    openedAt?: Date
    clickedThrough: boolean
    clickedAt?: Date
}

export interface PingLimit {
    used: number
    limit: number
    resetsAt: Date
    isPremium: boolean
}

export const pingService = {
    /**
     * Get ping limits for a facility/trainer
     */
    async getPingLimits(
        senderId: string,
        senderType: "facility" | "trainer"
    ): Promise<PingLimit> {
        if (!db) {
            return { used: 0, limit: 3, resetsAt: new Date(), isPremium: false }
        }

        try {
            // Get sender's subscription status
            const collection = senderType === "facility" ? "claimed_facilities" : "trainers"
            const doc = await db.collection(collection).doc(senderId).get()
            const data = doc.data()
            const isPremium = data?.subscriptionTier === "premium"

            // Get pings sent this month
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const nextMonth = new Date(startOfMonth)
            nextMonth.setMonth(nextMonth.getMonth() + 1)

            const pingsSnapshot = await db.collection("pings")
                .where("senderId", "==", senderId)
                .where("sentAt", ">=", startOfMonth)
                .get()

            return {
                used: pingsSnapshot.size,
                limit: isPremium ? 999 : 3, // 3 for free, unlimited for premium
                resetsAt: nextMonth,
                isPremium,
            }
        } catch (error) {
            console.error("Error getting ping limits:", error)
            return { used: 0, limit: 3, resetsAt: new Date(), isPremium: false }
        }
    },

    /**
     * Check if can send ping (under limit)
     */
    async canSendPing(
        senderId: string,
        senderType: "facility" | "trainer"
    ): Promise<boolean> {
        const limits = await this.getPingLimits(senderId, senderType)
        return limits.used < limits.limit
    },

    /**
     * Send a ping to a player
     */
    async sendPing(params: {
        senderId: string
        senderType: "facility" | "trainer"
        senderName: string
        recipientId: string
        recipientName?: string
        templateId: PingTemplateId
        customMessage?: string
        variables?: Record<string, string>
    }): Promise<{ success: boolean; error?: string; pingId?: string }> {
        if (!db) {
            return { success: false, error: "Database not available" }
        }

        try {
            // Check limits
            const canSend = await this.canSendPing(params.senderId, params.senderType)
            if (!canSend) {
                return {
                    success: false,
                    error: "Ping limit reached. Upgrade to Premium for unlimited pings!"
                }
            }

            // Get template and build message
            const template = PING_TEMPLATES[params.templateId]
            let message = params.customMessage || template.message

            // Replace variables
            if (params.variables) {
                Object.entries(params.variables).forEach(([key, value]) => {
                    message = message.replace(`{${key}}`, value)
                })
            }

            // Create ping record
            const ping: Omit<Ping, "id"> = {
                senderId: params.senderId,
                senderType: params.senderType,
                senderName: params.senderName,
                recipientId: params.recipientId,
                recipientName: params.recipientName,
                templateId: params.templateId,
                message,
                customMessage: params.customMessage,
                sentAt: new Date(),
                opened: false,
                clickedThrough: false,
            }

            const docRef = await db.collection("pings").add(ping)

            // TODO: Send push notification to player
            // await sendPushNotification(params.recipientId, {
            //     title: `${template.icon} ${params.senderName}`,
            //     body: message,
            //     data: { pingId: docRef.id, type: "ping" }
            // })

            return { success: true, pingId: docRef.id }
        } catch (error) {
            console.error("Error sending ping:", error)
            return { success: false, error: "Failed to send ping" }
        }
    },

    /**
     * Get sent pings history
     */
    async getSentPings(
        senderId: string,
        limit: number = 20
    ): Promise<Ping[]> {
        if (!db) return []

        try {
            const snapshot = await db.collection("pings")
                .where("senderId", "==", senderId)
                .orderBy("sentAt", "desc")
                .limit(limit)
                .get()

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                sentAt: doc.data().sentAt?.toDate?.() || new Date(),
                openedAt: doc.data().openedAt?.toDate?.(),
                clickedAt: doc.data().clickedAt?.toDate?.(),
            })) as Ping[]
        } catch (error) {
            console.error("Error getting sent pings:", error)
            return []
        }
    },

    /**
     * Get received pings for a player
     */
    async getReceivedPings(
        playerId: string,
        unreadOnly: boolean = false
    ): Promise<Ping[]> {
        if (!db) return []

        try {
            let query = db.collection("pings")
                .where("recipientId", "==", playerId)
                .orderBy("sentAt", "desc")
                .limit(50)

            const snapshot = await query.get()

            const pings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                sentAt: doc.data().sentAt?.toDate?.() || new Date(),
            })) as Ping[]

            if (unreadOnly) {
                return pings.filter(p => !p.opened)
            }

            return pings
        } catch (error) {
            console.error("Error getting received pings:", error)
            return []
        }
    },

    /**
     * Mark ping as opened
     */
    async markPingOpened(pingId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection("pings").doc(pingId).update({
                opened: true,
                openedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error marking ping opened:", error)
            return false
        }
    },

    /**
     * Get ping template
     */
    getTemplate(templateId: PingTemplateId) {
        return PING_TEMPLATES[templateId]
    },

    /**
     * Get all templates for a sender type
     */
    getTemplatesForType(senderType: "facility" | "trainer") {
        if (senderType === "trainer") {
            return [
                PING_TEMPLATES.SESSION_REMINDER,
                PING_TEMPLATES.SKILL_MATCH,
                PING_TEMPLATES.FIRST_TIME_DISCOUNT,
                PING_TEMPLATES.CUSTOM,
            ]
        }
        return [
            PING_TEMPLATES.COURT_AVAILABLE,
            PING_TEMPLATES.FIRST_TIME_DISCOUNT,
            PING_TEMPLATES.WEEKEND_SPECIAL,
            PING_TEMPLATES.CUSTOM,
        ]
    },
}

export default pingService
