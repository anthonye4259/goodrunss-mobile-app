/**
 * Facility Subscription Service
 * Handles $50/month premium subscription for facilities
 */

import { db } from "../firebase-config"
import { getFunctions, httpsCallable } from "firebase/functions"

const functions = getFunctions()

// Subscription pricing
export const FACILITY_SUBSCRIPTION = {
    FREE: {
        name: "Free",
        price: 0,
        takeRate: 8, // 8% of bookings
        features: {
            // Basic features
            listFacility: true,
            acceptBookings: true,
            basicAnalytics: true,
            // Premium features
            featuredPlacement: false,
            prioritySearch: false,
            reducedFees: false,
            // AI Features (Premium only)
            aiSlotFilling: false,
            demandInsights: false,
            aiPricingOptimizer: false,
            bookingPredictions: false,
            automatedPromotions: false,
            competitorAnalysis: false,
            aiChatSupport: false,
        }
    },
    PREMIUM: {
        name: "Premium",
        price: 5000, // $50.00 in cents
        priceMonthly: 50,
        takeRate: 5, // Reduced to 5%
        features: {
            // Basic features
            listFacility: true,
            acceptBookings: true,
            basicAnalytics: true,
            // Premium features
            featuredPlacement: true,
            prioritySearch: true,
            reducedFees: true, // 5% instead of 8%
            // AI Features ⭐
            aiSlotFilling: true,        // AI fills empty slots with smart discounts
            demandInsights: true,       // AI-powered demand forecasting
            aiPricingOptimizer: true,   // Suggests optimal hourly rates
            bookingPredictions: true,   // Predicts busy/slow periods
            automatedPromotions: true,  // AI-generated deals for empty slots
            competitorAnalysis: true,   // AI insights on nearby facilities
            aiChatSupport: true,        // Priority AI assistant support
        }
    }
}

// AI Feature descriptions for UI
export const AI_FEATURE_DESCRIPTIONS = {
    aiSlotFilling: {
        name: "AI Slot Filling",
        description: "Automatically fills empty slots with smart discounts to maximize revenue",
        icon: "flash",
    },
    demandInsights: {
        name: "Demand Insights",
        description: "AI-powered forecasting shows when players are most likely to book",
        icon: "analytics",
    },
    aiPricingOptimizer: {
        name: "AI Price Optimizer",
        description: "Get personalized rate suggestions based on demand and competition",
        icon: "trending-up",
    },
    bookingPredictions: {
        name: "Booking Predictions",
        description: "7-day forecast of expected bookings and revenue",
        icon: "calendar",
    },
    automatedPromotions: {
        name: "Smart Promotions",
        description: "AI creates and sends deals to fill your slowest time slots",
        icon: "megaphone",
    },
    competitorAnalysis: {
        name: "Competitor Intel",
        description: "See how your pricing and ratings compare to nearby facilities",
        icon: "stats-chart",
    },
    aiChatSupport: {
        name: "Priority AI Support",
        description: "GIA prioritizes your questions and provides facility-specific insights",
        icon: "sparkles",
    },
}

export const facilitySubscriptionService = {
    /**
     * Create Stripe subscription for facility
     */
    async createSubscription(facilityId: string): Promise<{
        sessionUrl: string
    } | null> {
        try {
            const createSub = httpsCallable(functions, "createFacilitySubscription")
            const result = await createSub({ facilityId })
            const data = result.data as { sessionUrl: string }
            return { sessionUrl: data.sessionUrl }
        } catch (error) {
            console.error("Error creating facility subscription:", error)
            return null
        }
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription(facilityId: string): Promise<boolean> {
        try {
            const cancelSub = httpsCallable(functions, "cancelFacilitySubscription")
            await cancelSub({ facilityId })
            return true
        } catch (error) {
            console.error("Error cancelling subscription:", error)
            return false
        }
    },

    /**
     * Get subscription status
     */
    async getSubscriptionStatus(facilityId: string): Promise<{
        tier: "free" | "premium"
        expiresAt?: Date
        willRenew: boolean
    }> {
        if (!db) return { tier: "free", willRenew: false }

        try {
            const doc = await db.collection("claimed_facilities").doc(facilityId).get()
            if (!doc.exists) return { tier: "free", willRenew: false }

            const data = doc.data()
            return {
                tier: data?.subscriptionTier || "free",
                expiresAt: data?.subscriptionExpiresAt?.toDate?.(),
                willRenew: !!data?.stripeSubscriptionId,
            }
        } catch (error) {
            console.error("Error getting subscription status:", error)
            return { tier: "free", willRenew: false }
        }
    },

    /**
     * Check if facility has premium feature
     */
    hasFeature(tier: "free" | "premium", feature: keyof typeof FACILITY_SUBSCRIPTION.FREE.features): boolean {
        const plan = tier === "premium" ? FACILITY_SUBSCRIPTION.PREMIUM : FACILITY_SUBSCRIPTION.FREE
        return plan.features[feature] || false
    },

    /**
     * Get take rate based on tier
     */
    getTakeRate(tier: "free" | "premium"): number {
        return tier === "premium" ? FACILITY_SUBSCRIPTION.PREMIUM.takeRate : FACILITY_SUBSCRIPTION.FREE.takeRate
    },

    /**
     * Calculate savings from upgrading
     */
    calculateMonthlySavings(monthlyBookingRevenue: number): number {
        const freeRate = FACILITY_SUBSCRIPTION.FREE.takeRate / 100
        const premiumRate = FACILITY_SUBSCRIPTION.PREMIUM.takeRate / 100
        const subscriptionCost = FACILITY_SUBSCRIPTION.PREMIUM.priceMonthly

        const currentFees = monthlyBookingRevenue * freeRate
        const premiumFees = monthlyBookingRevenue * premiumRate
        const savings = currentFees - premiumFees - subscriptionCost

        return Math.round(savings)
    },
}

export default facilitySubscriptionService
