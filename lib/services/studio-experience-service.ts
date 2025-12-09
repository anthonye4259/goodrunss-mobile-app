/**
 * Studio Experience Service
 * 
 * Services for:
 * - Reformer availability tracking
 * - Vibe matching
 * - No-ClassPass studio discovery
 */

import { db } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type {
    Studio,
    StudioVibe,
    MusicStyle,
    ReformerAvailability,
    UserVibePreferences,
} from "@/lib/types/studio-experience"
import { calculateVibeMatch } from "@/lib/types/studio-experience"

// ============================================
// STUDIO QUERIES
// ============================================

/**
 * Get studios that don't use ClassPass
 */
export async function getNoClassPassStudios(
    city?: string,
    modality?: string,
    limit: number = 20
): Promise<Studio[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, limit: limitFn, getDocs } = await import("firebase/firestore")

        const constraints: any[] = [
            where("directBookingOnly", "==", true)
        ]

        if (city) {
            constraints.push(where("city", "==", city))
        }

        if (modality) {
            constraints.push(where("modalities", "array-contains", modality))
        }

        constraints.push(orderBy("rating", "desc"))
        constraints.push(limitFn(limit))

        const q = query(collection(db, "studios"), ...constraints)
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Studio))
    } catch (error) {
        console.error("[StudioService] getNoClassPassStudios error:", error)
        return []
    }
}

/**
 * Get studios by vibe
 */
export async function getStudiosByVibe(
    vibes: StudioVibe[],
    city?: string,
    limit: number = 20
): Promise<Studio[]> {
    if (!db || vibes.length === 0) return []

    try {
        const { collection, query, where, orderBy, limit: limitFn, getDocs } = await import("firebase/firestore")

        const constraints: any[] = [
            where("vibe", "in", vibes)
        ]

        if (city) {
            constraints.push(where("city", "==", city))
        }

        constraints.push(orderBy("rating", "desc"))
        constraints.push(limitFn(limit))

        const q = query(collection(db, "studios"), ...constraints)
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Studio))
    } catch (error) {
        console.error("[StudioService] getStudiosByVibe error:", error)
        return []
    }
}

/**
 * Get studios by music preference
 */
export async function getStudiosByMusic(
    musicStyles: MusicStyle[],
    city?: string
): Promise<Studio[]> {
    if (!db || musicStyles.length === 0) return []

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        // Firestore array-contains-any for music styles
        const q = query(
            collection(db, "studios"),
            where("musicStyle", "array-contains-any", musicStyles),
            ...(city ? [where("city", "==", city)] : [])
        )
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Studio))
    } catch (error) {
        console.error("[StudioService] getStudiosByMusic error:", error)
        return []
    }
}

// ============================================
// REFORMER AVAILABILITY
// ============================================

/**
 * Get reformer availability for a class
 */
export async function getReformerAvailability(classId: string): Promise<ReformerAvailability | null> {
    if (!db) return null

    try {
        const { doc, getDoc } = await import("firebase/firestore")

        const classDoc = await getDoc(doc(db, "wellnessClasses", classId))
        if (!classDoc.exists()) return null

        const classData = classDoc.data()
        const studioId = classData.studioId

        if (!studioId) return null

        // Get studio equipment info
        const studioDoc = await getDoc(doc(db, "studios", studioId))
        if (!studioDoc.exists()) return null

        const studioData = studioDoc.data()
        const totalReformers = studioData.equipment?.reformers || 10

        // Calculate availability
        const bookedReformers = classData.bookedCount || 0
        const waitlistCount = classData.waitlistCount || 0

        // Calculate demand level based on historical data
        let demandLevel: ReformerAvailability["demandLevel"] = "low"
        if (waitlistCount > 5) demandLevel = "extreme"
        else if (waitlistCount > 2) demandLevel = "high"
        else if (bookedReformers >= totalReformers * 0.8) demandLevel = "medium"

        return {
            studioId,
            classId,
            totalReformers,
            bookedReformers,
            availableReformers: Math.max(0, totalReformers - bookedReformers),
            waitlistCount,
            averageWaitlistSize: waitlistCount, // Would need historical data
            bookedOutDays: demandLevel === "extreme" ? 7 : demandLevel === "high" ? 3 : 1,
            demandLevel,
        }
    } catch (error) {
        console.error("[StudioService] getReformerAvailability error:", error)
        return null
    }
}

/**
 * Get all reformer classes with availability for next 7 days
 */
export async function getReformerClassesWithAvailability(
    city: string,
    daysAhead: number = 7
): Promise<{ classId: string; availability: ReformerAvailability }[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs, Timestamp } = await import("firebase/firestore")

        const now = Timestamp.now()
        const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)

        const q = query(
            collection(db, "wellnessClasses"),
            where("modality", "==", "pilates_reformer"),
            where("startTime", ">", now),
            where("startTime", "<", Timestamp.fromDate(futureDate)),
            orderBy("startTime", "asc")
        )

        const snapshot = await getDocs(q)
        const results: { classId: string; availability: ReformerAvailability }[] = []

        for (const doc of snapshot.docs.slice(0, 50)) {
            const availability = await getReformerAvailability(doc.id)
            if (availability) {
                results.push({ classId: doc.id, availability })
            }
        }

        return results
    } catch (error) {
        console.error("[StudioService] getReformerClassesWithAvailability error:", error)
        return []
    }
}

/**
 * Find classes with available reformers (not full)
 */
export async function findAvailableReformerClasses(city: string): Promise<string[]> {
    const allClasses = await getReformerClassesWithAvailability(city)
    return allClasses
        .filter(c => c.availability.availableReformers > 0)
        .map(c => c.classId)
}

// ============================================
// VIBE MATCHING
// ============================================

/**
 * Get matched studios based on user preferences
 */
export async function getVibeMatchedStudios(
    userPrefs: UserVibePreferences,
    city?: string,
    limit: number = 20
): Promise<{ studio: Studio; matchScore: number }[]> {
    if (!db) return []

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        let q = query(collection(db, "studios"))

        if (city) {
            q = query(collection(db, "studios"), where("city", "==", city))
        }

        const snapshot = await getDocs(q)
        const studios = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Studio))

        // Calculate match scores
        const scored = studios.map(studio => ({
            studio,
            matchScore: calculateVibeMatch(
                userPrefs,
                studio.vibe,
                studio.musicStyle,
                studio.ambiance
            ),
        }))

        // Sort by score and apply limit
        return scored
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit)
    } catch (error) {
        console.error("[StudioService] getVibeMatchedStudios error:", error)
        return []
    }
}

// ============================================
// USER PREFERENCES
// ============================================

const VIBE_PREFS_KEY = "@user_vibe_preferences"

/**
 * Save user's vibe preferences
 */
export async function saveVibePreferences(prefs: UserVibePreferences): Promise<void> {
    try {
        await AsyncStorage.setItem(VIBE_PREFS_KEY, JSON.stringify(prefs))
    } catch (error) {
        console.error("[StudioService] saveVibePreferences error:", error)
    }
}

/**
 * Get user's vibe preferences
 */
export async function getVibePreferences(): Promise<UserVibePreferences | null> {
    try {
        const stored = await AsyncStorage.getItem(VIBE_PREFS_KEY)
        return stored ? JSON.parse(stored) : null
    } catch (error) {
        console.error("[StudioService] getVibePreferences error:", error)
        return null
    }
}

/**
 * Update single vibe preference
 */
export async function updateVibePreference<K extends keyof UserVibePreferences>(
    key: K,
    value: UserVibePreferences[K]
): Promise<void> {
    const current = await getVibePreferences() || {
        preferredVibes: [],
        preferredMusic: [],
        preferredAmbiance: [],
        mustHaveAmenities: [],
        avoidClassPassStudios: false,
    }

    current[key] = value
    await saveVibePreferences(current)
}
