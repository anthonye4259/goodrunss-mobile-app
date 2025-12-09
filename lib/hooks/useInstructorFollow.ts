/**
 * useInstructorFollow Hook
 * 
 * React hook for instructor following functionality:
 * - Check if following an instructor
 * - Follow/unfollow with optimistic updates
 * - Get list of followed instructors
 * - Get following feed (upcoming classes)
 */

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import {
    isFollowing,
    followInstructor,
    unfollowInstructor,
    getFollowedInstructors,
    getFollowedInstructorIds,
    getFollowingFeed,
} from "@/lib/services/instructor-service"
import type { Instructor, WellnessClass } from "@/lib/types/wellness-instructor"

interface UseFollowResult {
    isFollowing: boolean
    isLoading: boolean
    toggleFollow: () => Promise<void>
}

/**
 * Hook to manage following a specific instructor
 */
export function useFollow(instructorId: string): UseFollowResult {
    const { user } = useAuth()
    const [following, setFollowing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Check initial follow status
    useEffect(() => {
        if (!user?.id || !instructorId) {
            setIsLoading(false)
            return
        }

        checkFollowStatus()
    }, [user?.id, instructorId])

    const checkFollowStatus = async () => {
        if (!user?.id) return
        setIsLoading(true)
        const result = await isFollowing(user.id, instructorId)
        setFollowing(result)
        setIsLoading(false)
    }

    const toggleFollow = useCallback(async () => {
        if (!user?.id) return

        // Optimistic update
        const wasFollowing = following
        setFollowing(!wasFollowing)

        try {
            if (wasFollowing) {
                await unfollowInstructor(user.id, instructorId)
            } else {
                await followInstructor(user.id, instructorId, true)
            }
        } catch (error) {
            // Revert on error
            setFollowing(wasFollowing)
            console.error("[useFollow] toggleFollow error:", error)
        }
    }, [user?.id, instructorId, following])

    return {
        isFollowing: following,
        isLoading,
        toggleFollow,
    }
}

interface UseFollowedInstructorsResult {
    instructors: Instructor[]
    isLoading: boolean
    refetch: () => Promise<void>
}

/**
 * Hook to get all instructors the user follows
 */
export function useFollowedInstructors(): UseFollowedInstructorsResult {
    const { user } = useAuth()
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchInstructors = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        const result = await getFollowedInstructors(user.id)
        setInstructors(result)
        setIsLoading(false)
    }, [user?.id])

    useEffect(() => {
        fetchInstructors()
    }, [fetchInstructors])

    return {
        instructors,
        isLoading,
        refetch: fetchInstructors,
    }
}

interface UseFollowingFeedResult {
    classes: WellnessClass[]
    isLoading: boolean
    refetch: () => Promise<void>
}

/**
 * Hook to get upcoming classes from followed instructors
 */
export function useFollowingFeed(): UseFollowingFeedResult {
    const { user } = useAuth()
    const [classes, setClasses] = useState<WellnessClass[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchFeed = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        const result = await getFollowingFeed(user.id)
        setClasses(result)
        setIsLoading(false)
    }, [user?.id])

    useEffect(() => {
        fetchFeed()
    }, [fetchFeed])

    return {
        classes,
        isLoading,
        refetch: fetchFeed,
    }
}

interface UseFollowingIdsResult {
    followingIds: string[]
    isLoading: boolean
    isFollowingId: (instructorId: string) => boolean
}

/**
 * Hook to get Set of followed instructor IDs (for quick lookups)
 */
export function useFollowingIds(): UseFollowingIdsResult {
    const { user } = useAuth()
    const [followingIds, setFollowingIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user?.id) {
            setIsLoading(false)
            return
        }

        getFollowedInstructorIds(user.id).then(ids => {
            setFollowingIds(ids)
            setIsLoading(false)
        })
    }, [user?.id])

    const isFollowingId = useCallback(
        (instructorId: string) => followingIds.includes(instructorId),
        [followingIds]
    )

    return {
        followingIds,
        isLoading,
        isFollowingId,
    }
}
