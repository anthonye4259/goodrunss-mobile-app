/**
 * useSportContext Hook
 * 
 * Easy access to sport-specific predictions and context.
 * Combines sport intelligence with real-time data.
 */

import { useState, useEffect, useCallback } from "react"
import {
    sportIntelligenceService,
    type SportContext,
    type Sport,
    type ActivityLevel
} from "@/lib/services/sport-intelligence-service"
import type { WeatherFactors } from "@/lib/traffic-prediction"

interface UseSportContextOptions {
    venueId: string
    sport: Sport
    weather?: WeatherFactors
    autoRefresh?: boolean
    refreshInterval?: number // seconds
}

interface UseSportContextResult {
    context: SportContext | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    reportActivity: (level: ActivityLevel) => void
}

export function useSportContext({
    venueId,
    sport,
    weather,
    autoRefresh = true,
    refreshInterval = 60,
}: UseSportContextOptions): UseSportContextResult {
    const [context, setContext] = useState<SportContext | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reportedLevel, setReportedLevel] = useState<ActivityLevel | undefined>()

    const fetchContext = useCallback(async () => {
        try {
            setError(null)
            // TODO: Get activeCheckIns from Firebase
            const result = await sportIntelligenceService.getSportContext(
                venueId,
                sport,
                weather,
                undefined, // activeCheckIns - would come from real-time data
                reportedLevel
            )
            setContext(result)
        } catch (err: any) {
            console.error("[useSportContext] Error:", err)
            setError(err.message || "Failed to fetch context")
        } finally {
            setLoading(false)
        }
    }, [venueId, sport, weather, reportedLevel])

    // Initial fetch
    useEffect(() => {
        fetchContext()
    }, [fetchContext])

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(fetchContext, refreshInterval * 1000)
        return () => clearInterval(interval)
    }, [autoRefresh, refreshInterval, fetchContext])

    // Report activity (updates local state, would also save to Firebase)
    const reportActivity = useCallback((level: ActivityLevel) => {
        setReportedLevel(level)
        // This will trigger a re-fetch with the new reported level
    }, [])

    return {
        context,
        loading,
        error,
        refresh: fetchContext,
        reportActivity,
    }
}

/**
 * Quick hook for just headline/status
 */
export function useSportHeadline(
    venueId: string,
    sport: Sport
): { headline: string; color: string; loading: boolean } {
    const { context, loading } = useSportContext({ venueId, sport, autoRefresh: false })

    return {
        headline: context?.headline || "Loading...",
        color: context?.activityColor || "#6B7280",
        loading,
    }
}
