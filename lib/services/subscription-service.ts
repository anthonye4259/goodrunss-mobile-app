import AsyncStorage from "@react-native-async-storage/async-storage"
import { db } from "@/lib/firebase-config"

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionTier = "free" | "pro"
export type SubscriptionPeriod = "monthly" | "3months" | "6months"
export type SubscriptionStatus = "active" | "expired" | "canceled" | "trial"

export interface Subscription {
    tier: SubscriptionTier
    status: SubscriptionStatus
    period?: SubscriptionPeriod
    startDate?: string
    endDate?: string
    trialEndsAt?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
}

export interface ProFeature {
    id: string
    name: string
    description: string
    icon: string
    color: string
    available: boolean
    requiredTier: SubscriptionTier
}

// ============================================
// PRO FEATURES DEFINITION
// ============================================

export const PRO_FEATURES: ProFeature[] = [
    {
        id: "advanced_analytics",
        name: "Advanced Analytics",
        description: "Deep insights into your earnings, clients, and growth trends",
        icon: "analytics",
        color: "#8B5CF6",
        available: false,
        requiredTier: "pro",
    },
    {
        id: "gia_business",
        name: "GIA Business Mode",
        description: "AI-powered business copilot with scheduling & client management",
        icon: "sparkles",
        color: "#7ED957",
        available: false,
        requiredTier: "pro",
    },
    {
        id: "smart_pricing",
        name: "Smart Pricing",
        description: "AI suggests optimal pricing based on demand and competition",
        icon: "trending-up",
        color: "#06B6D4",
        available: false,
        requiredTier: "pro",
    },
    {
        id: "auto_reminders",
        name: "Auto-Reminders",
        description: "Automatic session reminders and follow-ups for clients",
        icon: "notifications",
        color: "#FBBF24",
        available: false,
        requiredTier: "pro",
    },
    {
        id: "priority_placement",
        name: "Priority Placement",
        description: "Appear higher in search results for potential clients",
        icon: "medal",
        color: "#EC4899",
        available: false,
        requiredTier: "pro",
    },
    {
        id: "bulk_messaging",
        name: "Bulk Messaging",
        description: "Send announcements to all your clients at once",
        icon: "megaphone",
        color: "#10B981",
        available: false,
        requiredTier: "pro",
    },
]

// ============================================
// PRICING
// ============================================

export const PRICING = {
    monthly: { price: 15, period: "month", stripePriceId: "price_monthly" },
    "3months": { price: 40, period: "3 months", stripePriceId: "price_3months", savings: "11%" },
    "6months": { price: 75, period: "6 months", stripePriceId: "price_6months", savings: "17%" },
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    SUBSCRIPTION: "@goodrunss_subscription",
    STRIPE_CUSTOMER: "@goodrunss_stripe_customer",
}

// ============================================
// SUBSCRIPTION SERVICE
// ============================================

class SubscriptionService {
    private static instance: SubscriptionService
    private cachedSubscription: Subscription | null = null

    private constructor() { }

    static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService()
        }
        return SubscriptionService.instance
    }

    // ============================================
    // SUBSCRIPTION STATUS
    // ============================================

    async getSubscription(): Promise<Subscription> {
        // Check cache first
        if (this.cachedSubscription) {
            return this.cachedSubscription
        }

        // Try to get from Firebase first (source of truth)
        if (db) {
            try {
                const { doc, getDoc } = await import("firebase/firestore")
                const userId = await this.getCurrentUserId()
                if (userId) {
                    const subDoc = await getDoc(doc(db, "subscriptions", userId))
                    if (subDoc.exists()) {
                        const data = subDoc.data() as Subscription
                        await this.cacheSubscription(data)
                        return data
                    }
                }
            } catch (error) {
                console.warn("Firebase subscription check failed:", error)
            }
        }

        // Fallback to local storage
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION)
        if (stored) {
            const sub = JSON.parse(stored) as Subscription
            this.cachedSubscription = sub
            return sub
        }

        // Default free subscription
        return {
            tier: "free",
            status: "active",
        }
    }

    async isPro(): Promise<boolean> {
        const sub = await this.getSubscription()
        return sub.tier === "pro" && (sub.status === "active" || sub.status === "trial")
    }

    async isTrialing(): Promise<boolean> {
        const sub = await this.getSubscription()
        return sub.status === "trial"
    }

    async getTrialDaysRemaining(): Promise<number> {
        const sub = await this.getSubscription()
        if (sub.status !== "trial" || !sub.trialEndsAt) return 0

        const trialEnd = new Date(sub.trialEndsAt)
        const now = new Date()
        const diff = trialEnd.getTime() - now.getTime()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    // ============================================
    // FEATURE ACCESS
    // ============================================

    async canAccessFeature(featureId: string): Promise<boolean> {
        const feature = PRO_FEATURES.find(f => f.id === featureId)
        if (!feature) return false

        if (feature.requiredTier === "free") return true

        return await this.isPro()
    }

    async getAvailableFeatures(): Promise<ProFeature[]> {
        const isPro = await this.isPro()

        return PRO_FEATURES.map(feature => ({
            ...feature,
            available: feature.requiredTier === "free" || isPro,
        }))
    }

    async getLockedFeatures(): Promise<ProFeature[]> {
        const isPro = await this.isPro()
        if (isPro) return []

        return PRO_FEATURES.filter(f => f.requiredTier === "pro")
    }

    // ============================================
    // SUBSCRIPTION MANAGEMENT
    // ============================================

    async startTrial(): Promise<Subscription> {
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial

        const subscription: Subscription = {
            tier: "pro",
            status: "trial",
            startDate: new Date().toISOString(),
            trialEndsAt: trialEndsAt.toISOString(),
        }

        await this.saveSubscription(subscription)
        return subscription
    }

    async activateSubscription(
        period: SubscriptionPeriod,
        stripeCustomerId: string,
        stripeSubscriptionId: string
    ): Promise<Subscription> {
        const startDate = new Date()
        const endDate = new Date()

        switch (period) {
            case "monthly":
                endDate.setMonth(endDate.getMonth() + 1)
                break
            case "3months":
                endDate.setMonth(endDate.getMonth() + 3)
                break
            case "6months":
                endDate.setMonth(endDate.getMonth() + 6)
                break
        }

        const subscription: Subscription = {
            tier: "pro",
            status: "active",
            period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            stripeCustomerId,
            stripeSubscriptionId,
        }

        await this.saveSubscription(subscription)
        return subscription
    }

    async cancelSubscription(): Promise<Subscription> {
        const current = await this.getSubscription()

        const subscription: Subscription = {
            ...current,
            status: "canceled",
        }

        await this.saveSubscription(subscription)
        return subscription
    }

    // ============================================
    // STRIPE INTEGRATION
    // ============================================

    async createStripeCheckoutSession(period: SubscriptionPeriod): Promise<string | null> {
        try {
            const pricing = PRICING[period]
            const userId = await this.getCurrentUserId()

            // In production, call your backend to create a Stripe Checkout Session
            // This returns a session URL or payment sheet params

            // For now, simulate the flow
            console.log(`[Subscription] Creating checkout for ${pricing.price} / ${pricing.period}`)

            // Would call: POST /api/stripe/create-checkout-session
            // Returns: { sessionId: "cs_xxx", url: "https://checkout.stripe.com/..." }

            return null // Replace with actual session URL
        } catch (error) {
            console.error("Error creating checkout session:", error)
            return null
        }
    }

    async handleStripeWebhook(event: any): Promise<void> {
        // This would be called when Stripe sends a webhook
        // Most webhook handling should be on your backend
        // But you can sync the subscription status here

        switch (event.type) {
            case "checkout.session.completed":
                // Payment successful, activate subscription
                break
            case "customer.subscription.deleted":
                // Subscription canceled
                break
            case "invoice.payment_failed":
                // Payment failed
                break
        }
    }

    // ============================================
    // SYNC WITH WEB DASHBOARD
    // ============================================

    async syncWithDashboard(): Promise<Subscription | null> {
        if (!db) return null

        try {
            const userId = await this.getCurrentUserId()
            if (!userId) return null

            const { doc, getDoc } = await import("firebase/firestore")
            const subDoc = await getDoc(doc(db, "subscriptions", userId))

            if (subDoc.exists()) {
                const subscription = subDoc.data() as Subscription
                await this.cacheSubscription(subscription)
                return subscription
            }

            return null
        } catch (error) {
            console.error("Error syncing with dashboard:", error)
            return null
        }
    }

    // ============================================
    // HELPERS
    // ============================================

    private async saveSubscription(subscription: Subscription): Promise<void> {
        // Save locally
        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription))
        this.cachedSubscription = subscription

        // Sync to Firebase
        if (db) {
            try {
                const userId = await this.getCurrentUserId()
                if (userId) {
                    const { doc, setDoc } = await import("firebase/firestore")
                    await setDoc(doc(db, "subscriptions", userId), subscription)
                    console.log("[Subscription] Synced to Firebase")
                }
            } catch (error) {
                console.warn("Firebase sync failed:", error)
            }
        }
    }

    private async cacheSubscription(subscription: Subscription): Promise<void> {
        this.cachedSubscription = subscription
        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription))
    }

    private async getCurrentUserId(): Promise<string | null> {
        try {
            const { auth } = await import("@/lib/firebase-config")
            return auth?.currentUser?.uid || await AsyncStorage.getItem("userId")
        } catch (error) {
            return await AsyncStorage.getItem("userId")
        }
    }

    // Clear cache on logout
    async clearCache(): Promise<void> {
        this.cachedSubscription = null
        await AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION)
    }
}

// Export singleton
export const subscriptionService = SubscriptionService.getInstance()

// Export hooks-friendly functions
export const isPro = () => subscriptionService.isPro()
export const canAccessFeature = (id: string) => subscriptionService.canAccessFeature(id)
export const getSubscription = () => subscriptionService.getSubscription()
