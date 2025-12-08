import { useState, useEffect, useCallback } from "react"
import { socialService, type CheckIn, type Challenge, type UserXP, type Badge } from "@/lib/services/social-service"
import type { FriendActivity } from "@/lib/friends-types"

/**
 * Hook for accessing user's XP and badges
 */
export function useUserXP() {
    const [xp, setXP] = useState<UserXP | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        const data = await socialService.getUserXP()
        setXP(data)
    }, [])

    useEffect(() => {
        const load = async () => {
            await refresh()
            setIsLoading(false)
        }
        load()
    }, [refresh])

    const addXP = async (amount: number, reason: string) => {
        const updated = await socialService.addXP(amount, reason)
        setXP(updated)
        return updated
    }

    return { xp, isLoading, refresh, addXP }
}

/**
 * Hook for managing check-ins
 */
export function useCheckIn() {
    const [myCheckIn, setMyCheckIn] = useState<CheckIn | null>(null)
    const [nearbyCheckIns, setNearbyCheckIns] = useState<CheckIn[]>([])
    const [friendCheckIns, setFriendCheckIns] = useState<CheckIn[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async (lat?: number, lng?: number, friendIds?: string[]) => {
        const my = await socialService.getMyCheckIn()
        setMyCheckIn(my)

        if (lat !== undefined && lng !== undefined) {
            const nearby = await socialService.getNearbyCheckIns(lat, lng)
            setNearbyCheckIns(nearby)
        }

        if (friendIds && friendIds.length > 0) {
            const friends = await socialService.getFriendCheckIns(friendIds)
            setFriendCheckIns(friends)
        }
    }, [])

    useEffect(() => {
        const load = async () => {
            await refresh()
            setIsLoading(false)
        }
        load()
    }, [refresh])

    const checkIn = async (data: Omit<CheckIn, "id" | "createdAt" | "expiresAt">) => {
        const newCheckIn = await socialService.checkIn(data)
        setMyCheckIn(newCheckIn)
        return newCheckIn
    }

    const checkOut = async () => {
        await socialService.checkOut()
        setMyCheckIn(null)
    }

    return {
        myCheckIn,
        nearbyCheckIns,
        friendCheckIns,
        isLoading,
        checkIn,
        checkOut,
        refresh,
    }
}

/**
 * Hook for managing challenges
 */
export function useChallenges(userId?: string) {
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        const all = await socialService.getChallenges()
        setChallenges(all)

        if (userId) {
            const pending = await socialService.getPendingChallenges(userId)
            setPendingChallenges(pending)
        }
    }, [userId])

    useEffect(() => {
        const load = async () => {
            await refresh()
            setIsLoading(false)
        }
        load()
    }, [refresh])

    const sendChallenge = async (data: Omit<Challenge, "id" | "createdAt" | "expiresAt" | "status">) => {
        const challenge = await socialService.sendChallenge(data)
        setChallenges((prev) => [...prev, challenge])
        return challenge
    }

    const respondToChallenge = async (challengeId: string, accept: boolean) => {
        await socialService.respondToChallenge(challengeId, accept)
        await refresh()
    }

    return {
        challenges,
        pendingChallenges,
        isLoading,
        sendChallenge,
        respondToChallenge,
        refresh,
    }
}

/**
 * Hook for friend activity feed
 */
export function useFriendActivities() {
    const [activities, setActivities] = useState<FriendActivity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        const data = await socialService.getFriendActivities()
        setActivities(data)
    }, [])

    useEffect(() => {
        const load = async () => {
            await refresh()
            setIsLoading(false)
        }
        load()
    }, [refresh])

    return { activities, isLoading, refresh }
}

/**
 * Hook for tracking actions that earn XP/badges
 */
export function useTracking() {
    const trackReport = async () => {
        await socialService.trackReportSubmission()
    }

    const trackReferral = async (referralCode: string) => {
        await socialService.trackReferral(referralCode)
    }

    const trackCheckIn = async (checkInData: Omit<CheckIn, "id" | "createdAt" | "expiresAt">) => {
        return await socialService.checkIn(checkInData)
    }

    const trackChallenge = async (challengeData: Omit<Challenge, "id" | "createdAt" | "expiresAt" | "status">) => {
        return await socialService.sendChallenge(challengeData)
    }

    return {
        trackReport,
        trackReferral,
        trackCheckIn,
        trackChallenge,
    }
}
