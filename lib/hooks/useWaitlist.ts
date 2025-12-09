/**
 * useWaitlist Hook
 * 
 * React hook for wellness class waitlist functionality:
 * - Join/leave waitlist
 * - Check position
 * - Auto-book toggle
 * - Claim spot during flash window
 */

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import {
    joinWaitlist,
    leaveWaitlist,
    isOnWaitlist,
    getWaitlistPosition,
    claimSpot,
    getMyWaitlists,
    type JoinWaitlistOptions,
    type WaitlistResult,
} from "@/lib/services/wellness-waitlist-service"

interface UseWaitlistResult {
    isOnWaitlist: boolean
    position: number | null
    isLoading: boolean
    joinResult: WaitlistResult | null
    join: (autoBook?: boolean) => Promise<WaitlistResult>
    leave: () => Promise<boolean>
    claim: () => Promise<boolean>
}

/**
 * Hook to manage waitlist for a specific class
 */
export function useWaitlist(classId: string, isPro: boolean = false): UseWaitlistResult {
    const { user } = useAuth()
    const [onWaitlist, setOnWaitlist] = useState(false)
    const [position, setPosition] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [joinResult, setJoinResult] = useState<WaitlistResult | null>(null)

    // Check initial status
    useEffect(() => {
        if (!user?.id || !classId) {
            setIsLoading(false)
            return
        }
        checkStatus()
    }, [user?.id, classId])

    const checkStatus = async () => {
        if (!user?.id) return
        setIsLoading(true)

        const [onList, pos] = await Promise.all([
            isOnWaitlist(classId, user.id),
            getWaitlistPosition(classId, user.id),
        ])

        setOnWaitlist(onList)
        setPosition(pos)
        setIsLoading(false)
    }

    const join = useCallback(async (autoBook: boolean = true): Promise<WaitlistResult> => {
        if (!user?.id) {
            return { success: false, position: 0, message: "Please sign in" }
        }

        setIsLoading(true)
        const result = await joinWaitlist(classId, user.id, { autoBook, isPro })

        if (result.success) {
            setOnWaitlist(true)
            setPosition(result.position)
        }

        setJoinResult(result)
        setIsLoading(false)
        return result
    }, [user?.id, classId, isPro])

    const leave = useCallback(async (): Promise<boolean> => {
        if (!user?.id) return false

        setIsLoading(true)
        const success = await leaveWaitlist(classId, user.id)

        if (success) {
            setOnWaitlist(false)
            setPosition(null)
            setJoinResult(null)
        }

        setIsLoading(false)
        return success
    }, [user?.id, classId])

    const claim = useCallback(async (): Promise<boolean> => {
        if (!user?.id) return false

        setIsLoading(true)
        const success = await claimSpot(classId, user.id)

        if (success) {
            setOnWaitlist(false)
            setPosition(null)
        }

        setIsLoading(false)
        return success
    }, [user?.id, classId])

    return {
        isOnWaitlist: onWaitlist,
        position,
        isLoading,
        joinResult,
        join,
        leave,
        claim,
    }
}

interface MyWaitlistEntry {
    classId: string
    position: number
    autoBook: boolean
}

interface UseMyWaitlistsResult {
    waitlists: MyWaitlistEntry[]
    isLoading: boolean
    refetch: () => Promise<void>
}

/**
 * Hook to get all waitlists the user is on
 */
export function useMyWaitlists(): UseMyWaitlistsResult {
    const { user } = useAuth()
    const [waitlists, setWaitlists] = useState<MyWaitlistEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchWaitlists = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        const result = await getMyWaitlists(user.id)
        setWaitlists(result)
        setIsLoading(false)
    }, [user?.id])

    useEffect(() => {
        fetchWaitlists()
    }, [fetchWaitlists])

    return {
        waitlists,
        isLoading,
        refetch: fetchWaitlists,
    }
}
