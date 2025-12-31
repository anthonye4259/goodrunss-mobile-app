/**
 * Trainer Pro Service
 * 
 * Premium features for international trainers targeting U.S. clientele
 * 
 * $29/month includes:
 * - Content Library (unlimited drills/tutorials)
 * - Featured "International Pro" placement
 * - U.S. Player Lead notifications
 * - Verified badge
 * - Analytics dashboard
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { db, auth } from "@/lib/firebase-config"

// ============================================
// TYPES
// ============================================

export interface TrainerProSubscription {
    id: string
    trainerId: string
    plan: "monthly" | "annual"
    status: "active" | "cancelled" | "expired" | "trial"
    startedAt: string
    expiresAt: string
    price: number
    currency: string
    features: TrainerProFeatures
}

export interface TrainerProFeatures {
    contentLibrary: boolean          // Unlimited content uploads
    featuredPlacement: boolean       // "International Pro" section
    usPlayerLeads: boolean           // Notifications when U.S. players search
    verifiedBadge: boolean           // Trust badge
    advancedAnalytics: boolean       // Detailed engagement metrics
    prioritySupport: boolean         // Fast response support
    customProfileUrl: boolean        // goodrunss.com/coach/name
}

export interface USPlayerLead {
    id: string
    trainerId: string
    playerId: string
    playerName: string
    playerCity: string
    searchedCity: string           // The city they searched (trainer's city)
    sport: string
    timestamp: string
    viewed: boolean
    contacted: boolean
}

export interface TrainerAnalytics {
    profileViews: number
    profileViewsFromUS: number
    libraryViews: number
    libraryPurchases: number
    remoteSessions: number
    earnings: number
    leadCount: number
    conversionRate: number
    topViewingCities: { city: string; count: number }[]
}

// ============================================
// PRICING
// ============================================

export const TRAINER_PRO_PRICING = {
    monthly: {
        price: 29,
        currency: "USD",
        id: "trainer_pro_monthly",
        name: "Trainer Pro Monthly",
    },
    annual: {
        price: 249, // ~$20.75/mo - 2 months free
        currency: "USD",
        id: "trainer_pro_annual",
        name: "Trainer Pro Annual",
        savings: "Save $99/year",
    },
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    SUBSCRIPTION: "@goodrunss_trainer_pro_sub",
    LEADS: "@goodrunss_us_player_leads",
    ANALYTICS: "@goodrunss_trainer_analytics",
}

// ============================================
// TRAINER PRO SERVICE
// ============================================

class TrainerProService {
    private static instance: TrainerProService

    static getInstance(): TrainerProService {
        if (!TrainerProService.instance) {
            TrainerProService.instance = new TrainerProService()
        }
        return TrainerProService.instance
    }

    // ========================
    // SUBSCRIPTION MANAGEMENT
    // ========================

    /**
     * Check if trainer has active Pro subscription
     */
    async isProTrainer(trainerId?: string): Promise<boolean> {
        const sub = await this.getSubscription(trainerId)
        if (!sub) return false

        return (
            (sub.status === "active" || sub.status === "trial") &&
            new Date(sub.expiresAt) > new Date()
        )
    }

    /**
     * Get subscription details
     */
    async getSubscription(trainerId?: string): Promise<TrainerProSubscription | null> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION)
        return stored ? JSON.parse(stored) : null
    }

    /**
     * Activate Pro subscription (called after payment)
     */
    async activateSubscription(plan: "monthly" | "annual"): Promise<TrainerProSubscription> {
        const trainerId = auth?.currentUser?.uid || "local_trainer"
        const pricing = TRAINER_PRO_PRICING[plan]
        const durationDays = plan === "monthly" ? 30 : 365

        const subscription: TrainerProSubscription = {
            id: `sub_${Date.now()}`,
            trainerId,
            plan,
            status: "active",
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
            price: pricing.price,
            currency: pricing.currency,
            features: {
                contentLibrary: true,
                featuredPlacement: true,
                usPlayerLeads: true,
                verifiedBadge: true,
                advancedAnalytics: true,
                prioritySupport: true,
                customProfileUrl: plan === "annual", // Annual only
            },
        }

        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription))

        // Sync to Firestore
        if (db) {
            try {
                const { doc, setDoc } = await import("firebase/firestore")
                await setDoc(doc(db, "trainer_pro_subscriptions", subscription.id), subscription)
            } catch (error) {
                console.error("Failed to sync subscription:", error)
            }
        }

        return subscription
    }

    /**
     * Start 7-day free trial
     */
    async startFreeTrial(): Promise<TrainerProSubscription> {
        const trainerId = auth?.currentUser?.uid || "local_trainer"

        const subscription: TrainerProSubscription = {
            id: `trial_${Date.now()}`,
            trainerId,
            plan: "monthly",
            status: "trial",
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            price: 0,
            currency: "USD",
            features: {
                contentLibrary: true,
                featuredPlacement: true,
                usPlayerLeads: true,
                verifiedBadge: false, // Not during trial
                advancedAnalytics: true,
                prioritySupport: false,
                customProfileUrl: false,
            },
        }

        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription))
        return subscription
    }

    // ========================
    // U.S. PLAYER LEADS
    // ========================

    /**
     * Record a lead when U.S. player searches trainer's city
     */
    async recordLead(data: {
        playerId: string
        playerName: string
        playerCity: string
        searchedCity: string
        sport: string
    }): Promise<USPlayerLead | null> {
        // Only record for Pro trainers
        const isPro = await this.isProTrainer()
        if (!isPro) return null

        const trainerId = auth?.currentUser?.uid || "local_trainer"
        const leads = await this.getLeads()

        const lead: USPlayerLead = {
            id: `lead_${Date.now()}`,
            trainerId,
            playerId: data.playerId,
            playerName: data.playerName,
            playerCity: data.playerCity,
            searchedCity: data.searchedCity,
            sport: data.sport,
            timestamp: new Date().toISOString(),
            viewed: false,
            contacted: false,
        }

        leads.push(lead)
        await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads))

        // Send push notification to trainer
        await this.sendLeadNotification(lead)

        return lead
    }

    /**
     * Get all leads for trainer
     */
    async getLeads(trainerId?: string): Promise<USPlayerLead[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEADS)
        const leads: USPlayerLead[] = stored ? JSON.parse(stored) : []

        const id = trainerId || auth?.currentUser?.uid || "local_trainer"
        return leads.filter(l => l.trainerId === id)
    }

    /**
     * Get unread lead count
     */
    async getUnreadLeadCount(): Promise<number> {
        const leads = await this.getLeads()
        return leads.filter(l => !l.viewed).length
    }

    /**
     * Mark lead as viewed
     */
    async markLeadViewed(leadId: string): Promise<void> {
        const leads = await this.getLeads()
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEADS)
        const allLeads: USPlayerLead[] = stored ? JSON.parse(stored) : []

        const index = allLeads.findIndex(l => l.id === leadId)
        if (index !== -1) {
            allLeads[index].viewed = true
            await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(allLeads))
        }
    }

    /**
     * Mark lead as contacted
     */
    async markLeadContacted(leadId: string): Promise<void> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.LEADS)
        const allLeads: USPlayerLead[] = stored ? JSON.parse(stored) : []

        const index = allLeads.findIndex(l => l.id === leadId)
        if (index !== -1) {
            allLeads[index].contacted = true
            await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(allLeads))
        }
    }

    /**
     * Send push notification for new lead
     */
    private async sendLeadNotification(lead: USPlayerLead): Promise<void> {
        // In production, this would send a push notification
        console.log(`🔔 New U.S. Lead: ${lead.playerName} from ${lead.playerCity} searched for trainers in ${lead.searchedCity}`)

        // TODO: Integrate with Expo Push Notifications
        // await sendPushNotification(lead.trainerId, {
        //     title: "New U.S. Player Lead! 🇺🇸",
        //     body: `${lead.playerName} from ${lead.playerCity} is looking for ${lead.sport} training in ${lead.searchedCity}`,
        // })
    }

    // ========================
    // ANALYTICS
    // ========================

    /**
     * Get trainer analytics
     */
    async getAnalytics(): Promise<TrainerAnalytics> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS)
        if (stored) return JSON.parse(stored)

        // Return mock data for development
        return {
            profileViews: 234,
            profileViewsFromUS: 156,
            libraryViews: 89,
            libraryPurchases: 12,
            remoteSessions: 8,
            earnings: 420,
            leadCount: 23,
            conversionRate: 35,
            topViewingCities: [
                { city: "Miami", count: 45 },
                { city: "New York", count: 38 },
                { city: "San Francisco", count: 29 },
                { city: "Austin", count: 22 },
                { city: "Atlanta", count: 18 },
            ],
        }
    }

    /**
     * Increment profile view
     */
    async recordProfileView(viewerCity?: string, isFromUS: boolean = false): Promise<void> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS)
        const analytics: TrainerAnalytics = stored ? JSON.parse(stored) : {
            profileViews: 0,
            profileViewsFromUS: 0,
            libraryViews: 0,
            libraryPurchases: 0,
            remoteSessions: 0,
            earnings: 0,
            leadCount: 0,
            conversionRate: 0,
            topViewingCities: [],
        }

        analytics.profileViews++
        if (isFromUS) analytics.profileViewsFromUS++

        if (viewerCity) {
            const cityIndex = analytics.topViewingCities.findIndex(c => c.city === viewerCity)
            if (cityIndex !== -1) {
                analytics.topViewingCities[cityIndex].count++
            } else {
                analytics.topViewingCities.push({ city: viewerCity, count: 1 })
            }
            // Sort by count
            analytics.topViewingCities.sort((a, b) => b.count - a.count)
        }

        await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics))
    }

    // ========================
    // FEATURED INTERNATIONAL TRAINERS
    // ========================

    /**
     * Get featured international trainers for U.S. players
     */
    async getFeaturedInternationalTrainers(filters?: {
        sport?: string
        limit?: number
    }): Promise<any[]> {
        // In production, query trainers with:
        // - Pro subscription active
        // - remoteServicesEnabled: true
        // - Country not USA
        // - Sort by rating/engagement

        return [
            {
                id: "trainer_intl_1",
                name: "Carlos Martinez",
                avatar: null,
                city: "Marbella",
                country: "Spain",
                countryFlag: "🇪🇸",
                sport: "Padel",
                rating: 4.9,
                reviewCount: 127,
                isVerified: true,
                tagline: "Train like the pros in the heart of padel",
                languages: ["English", "Spanish"],
                priceRange: "$35-$125",
                specialties: ["Wall Play", "Competition Prep"],
            },
            {
                id: "trainer_intl_2",
                name: "Ahmed Al-Rashid",
                avatar: null,
                city: "Dubai",
                country: "UAE",
                countryFlag: "🇦🇪",
                sport: "Tennis",
                rating: 4.8,
                reviewCount: 89,
                isVerified: true,
                tagline: "World-class training in the desert",
                languages: ["English", "Arabic"],
                priceRange: "$50-$150",
                specialties: ["Serve Technique", "Mental Game"],
            },
            {
                id: "trainer_intl_3",
                name: "Sophie Williams",
                avatar: null,
                city: "London",
                country: "UK",
                countryFlag: "🇬🇧",
                sport: "Tennis",
                rating: 4.7,
                reviewCount: 64,
                isVerified: true,
                tagline: "LTA certified, Wimbledon experience",
                languages: ["English"],
                priceRange: "$40-$100",
                specialties: ["Grass Court", "Junior Development"],
            },
        ]
    }
}

export const trainerProService = TrainerProService.getInstance()
