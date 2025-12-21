/**
 * useCourtStatus Hook
 * 
 * React hook for real-time court status with auto-refresh.
 * Returns simple Waze-style status data.
 */

import { useState, useEffect, useCallback } from "react"
import { useLocation } from "@/lib/location-context"
import {
    courtStatusService,
    type CourtStatus,
    type CrowdLevel
} from "@/lib/services/court-status-service"
import type { VenueType, WeatherFactors } from "@/lib/traffic-prediction"

interface UseCourtStatusOptions {
    venueId: string
    venueName?: string
    venueType?: VenueType
    autoRefresh?: boolean
    refreshInterval?: number // in seconds
}

interface UseCourtStatusResult {
    status: CourtStatus | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    submitReport: (crowdLevel: CrowdLevel, conditions?: string[]) => Promise<boolean>
}

export function useCourtStatus({
    venueId,
    venueName,
    venueType = "outdoor_court",
    autoRefresh = true,
    refreshInterval = 60, // 1 minute default
}: UseCourtStatusOptions): UseCourtStatusResult {
    const [status, setStatus] = useState<CourtStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStatus = useCallback(async () => {
        try {
            setError(null)
            const result = await courtStatusService.getCourtStatus(
                venueId,
                venueName,
                venueType
            )
            setStatus(result)
        } catch (err: any) {
            console.error("[useCourtStatus] Error:", err)
            setError(err.message || "Failed to fetch status")
        } finally {
            setLoading(false)
        }
    }, [venueId, venueName, venueType])

    // Initial fetch
    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(fetchStatus, refreshInterval * 1000)
        return () => clearInterval(interval)
    }, [autoRefresh, refreshInterval, fetchStatus])

    // Submit report helper
    const submitReport = useCallback(async (
        crowdLevel: CrowdLevel,
        conditions?: string[]
    ): Promise<boolean> => {
        // Would need userId from auth context
        const userId = "anonymous" // TODO: Get from auth
        const success = await courtStatusService.submitQuickReport(
            venueId,
            userId,
            crowdLevel,
            conditions
        )

        if (success) {
            // Refresh status after report
            await fetchStatus()
        }

        return success
    }, [venueId, fetchStatus])

    return {
        status,
        loading,
        error,
        refresh: fetchStatus,
        submitReport,
    }
}

/**
 * Hook for multiple courts (map view)
 */
export function useMultiCourtStatus(venueIds: string[]) {
    const [statuses, setStatuses] = useState<Map<string, CourtStatus>>(new Map())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (venueIds.length === 0) {
            setLoading(false)
            return
        }

        setLoading(true)
        courtStatusService.getStatusForMultipleVenues(venueIds)
            .then(setStatuses)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [venueIds.join(",")])

    return { statuses, loading }
}

/**
 * Quick crowd level indicator (for lists)
 */
export function useCrowdLevel(venueId: string): {
    level: CrowdLevel | null
    color: string
    loading: boolean
} {
    const { status, loading } = useCourtStatus({ venueId, autoRefresh: false })

    return {
        level: status?.crowdLevel || null,
        color: status?.crowdColor || "#6B7280",
        loading,
    }
}
