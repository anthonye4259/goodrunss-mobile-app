import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react"
import {
    subscriptionService,
    type Subscription,
    type ProFeature,
    type SubscriptionPeriod
} from "@/lib/services/subscription-service"

// ============================================
// CONTEXT
// ============================================

interface SubscriptionContextType {
    subscription: Subscription | null
    isPro: boolean
    isTrialing: boolean
    trialDaysRemaining: number
    features: ProFeature[]
    lockedFeatures: ProFeature[]
    isLoading: boolean
    refresh: () => Promise<void>
    startTrial: () => Promise<void>
    subscribe: (period: SubscriptionPeriod) => Promise<void>
    canAccess: (featureId: string) => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

// ============================================
// PROVIDER
// ============================================

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [isPro, setIsPro] = useState(false)
    const [isTrialing, setIsTrialing] = useState(false)
    const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)
    const [features, setFeatures] = useState<ProFeature[]>([])
    const [lockedFeatures, setLockedFeatures] = useState<ProFeature[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            const [sub, pro, trial, days, allFeatures, locked] = await Promise.all([
                subscriptionService.getSubscription(),
                subscriptionService.isPro(),
                subscriptionService.isTrialing(),
                subscriptionService.getTrialDaysRemaining(),
                subscriptionService.getAvailableFeatures(),
                subscriptionService.getLockedFeatures(),
            ])

            setSubscription(sub)
            setIsPro(pro)
            setIsTrialing(trial)
            setTrialDaysRemaining(days)
            setFeatures(allFeatures)
            setLockedFeatures(locked)
        } catch (error) {
            console.error("Error refreshing subscription:", error)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            await refresh()
            setIsLoading(false)
        }
        init()
    }, [refresh])

    const startTrial = async () => {
        await subscriptionService.startTrial()
        await refresh()
    }

    const subscribe = async (period: SubscriptionPeriod) => {
        // This would open Stripe checkout
        const sessionUrl = await subscriptionService.createStripeCheckoutSession(period)
        if (sessionUrl) {
            // Open in browser
            // Linking.openURL(sessionUrl)
        }
        await refresh()
    }

    const canAccess = (featureId: string) => {
        const feature = features.find(f => f.id === featureId)
        return feature?.available ?? false
    }

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                isPro,
                isTrialing,
                trialDaysRemaining,
                features,
                lockedFeatures,
                isLoading,
                refresh,
                startTrial,
                subscribe,
                canAccess,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    )
}

// ============================================
// HOOK
// ============================================

export function useSubscription() {
    const context = useContext(SubscriptionContext)

    if (!context) {
        // If used outside provider, return a standalone version
        return useStandaloneSubscription()
    }

    return context
}

// Standalone hook for when provider isn't available
function useStandaloneSubscription() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [isPro, setIsPro] = useState(false)
    const [isTrialing, setIsTrialing] = useState(false)
    const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)
    const [features, setFeatures] = useState<ProFeature[]>([])
    const [lockedFeatures, setLockedFeatures] = useState<ProFeature[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        try {
            const [sub, pro, trial, days, allFeatures, locked] = await Promise.all([
                subscriptionService.getSubscription(),
                subscriptionService.isPro(),
                subscriptionService.isTrialing(),
                subscriptionService.getTrialDaysRemaining(),
                subscriptionService.getAvailableFeatures(),
                subscriptionService.getLockedFeatures(),
            ])

            setSubscription(sub)
            setIsPro(pro)
            setIsTrialing(trial)
            setTrialDaysRemaining(days)
            setFeatures(allFeatures)
            setLockedFeatures(locked)
        } catch (error) {
            console.error("Error refreshing subscription:", error)
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            await refresh()
            setIsLoading(false)
        }
        init()
    }, [refresh])

    const startTrial = async () => {
        await subscriptionService.startTrial()
        await refresh()
    }

    const subscribe = async (period: SubscriptionPeriod) => {
        await subscriptionService.createStripeCheckoutSession(period)
        await refresh()
    }

    const canAccess = (featureId: string) => {
        const feature = features.find(f => f.id === featureId)
        return feature?.available ?? false
    }

    return {
        subscription,
        isPro,
        isTrialing,
        trialDaysRemaining,
        features,
        lockedFeatures,
        isLoading,
        refresh,
        startTrial,
        subscribe,
        canAccess,
    }
}

// ============================================
// FEATURE GATE COMPONENT
// ============================================

interface FeatureGateProps {
    featureId: string
    children: ReactNode
    fallback?: ReactNode
}

export function FeatureGate({ featureId, children, fallback }: FeatureGateProps) {
    const { canAccess, isLoading } = useSubscription()

    if (isLoading) return null

    if (canAccess(featureId)) {
        return <>{children}</>
    }

    return fallback ? <>{fallback}</> : null
}

// ============================================
// PRO BADGE COMPONENT
// ============================================

import { View, Text, StyleSheet } from "react-native"

export function ProBadge({ small = false }: { small?: boolean }) {
    return (
        <View style={[styles.proBadge, small && styles.proBadgeSmall]}>
            <Text style={[styles.proBadgeText, small && styles.proBadgeTextSmall]}>PRO</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    proBadge: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    proBadgeSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#000",
        letterSpacing: 0.5,
    },
    proBadgeTextSmall: {
        fontSize: 8,
    },
})
