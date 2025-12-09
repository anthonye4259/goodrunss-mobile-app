/**
 * Instructor Browse Hook
 * 
 * React hook for browsing wellness instructors with real Firebase data
 */

import { useState, useEffect, useCallback } from "react"
import {
    searchInstructors,
    getPopularInstructors,
    getFollowedInstructors,
} from "@/lib/services/instructor-service"
import type { Instructor, InstructorModality } from "@/lib/types/wellness-instructor"
import { MODALITY_DISPLAY_NAMES } from "@/lib/types/wellness-instructor"
import { useAuth } from "@/lib/auth-context"

// ============================================
// BROWSE INSTRUCTORS
// ============================================

interface UseInstructorBrowseOptions {
    initialModality?: InstructorModality
    initialCity?: string
    limit?: number
}

export function useInstructorBrowse(options: UseInstructorBrowseOptions = {}) {
    const { user } = useAuth()
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [modalityFilter, setModalityFilter] = useState<InstructorModality | null>(
        options.initialModality || null
    )
    const [cityFilter, setCityFilter] = useState<string | null>(
        options.initialCity || null
    )

    // Fetch instructors based on current filters
    const fetchInstructors = useCallback(async () => {
        setLoading(true)
        try {
            let results: Instructor[]

            if (searchQuery || modalityFilter || cityFilter) {
                // Search with filters
                results = await searchInstructors(searchQuery, {
                    modality: modalityFilter || undefined,
                    city: cityFilter || undefined,
                    limit: options.limit || 20,
                })
            } else {
                // Get popular instructors when no filters
                results = await getPopularInstructors(options.limit || 20)
            }

            setInstructors(results)
        } catch (error) {
            console.error("[useInstructorBrowse] Error:", error)
            setInstructors([])
        } finally {
            setLoading(false)
        }
    }, [searchQuery, modalityFilter, cityFilter, options.limit])

    // Initial fetch and refresh on filter changes
    useEffect(() => {
        fetchInstructors()
    }, [fetchInstructors])

    // Debounced search
    const search = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    // Filter setters
    const filterByModality = useCallback((modality: InstructorModality | null) => {
        setModalityFilter(modality)
    }, [])

    const filterByCity = useCallback((city: string | null) => {
        setCityFilter(city)
    }, [])

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery("")
        setModalityFilter(null)
        setCityFilter(null)
    }, [])

    return {
        instructors,
        loading,
        searchQuery,
        modalityFilter,
        cityFilter,
        search,
        filterByModality,
        filterByCity,
        clearFilters,
        refresh: fetchInstructors,
    }
}

// ============================================
// FOLLOWED INSTRUCTORS
// ============================================

export function useFollowedInstructors() {
    const { user } = useAuth()
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFollowing = useCallback(async () => {
        if (!user?.id) {
            setInstructors([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const results = await getFollowedInstructors(user.id)
            setInstructors(results)
        } catch (error) {
            console.error("[useFollowedInstructors] Error:", error)
            setInstructors([])
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        fetchFollowing()
    }, [fetchFollowing])

    return {
        instructors,
        loading,
        refresh: fetchFollowing,
    }
}

// ============================================
// MODALITY OPTIONS
// ============================================

export const MODALITY_FILTERS: { key: InstructorModality; label: string; emoji: string }[] = [
    { key: "yoga", label: "Yoga", emoji: "🧘" },
    { key: "pilates", label: "Pilates", emoji: "💪" },
    { key: "meditation", label: "Meditation", emoji: "🧠" },
    { key: "barre", label: "Barre", emoji: "🩰" },
    { key: "hiit", label: "HIIT", emoji: "🔥" },
    { key: "strength", label: "Strength", emoji: "🏋️" },
    { key: "cycling", label: "Cycling", emoji: "🚴" },
    { key: "dance", label: "Dance", emoji: "💃" },
    { key: "boxing", label: "Boxing", emoji: "🥊" },
    { key: "stretch", label: "Stretch", emoji: "🤸" },
    { key: "breathwork", label: "Breathwork", emoji: "🌬️" },
    { key: "sound_healing", label: "Sound Healing", emoji: "🔔" },
]
