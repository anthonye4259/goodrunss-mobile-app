/**
 * Instructor Service
 * 
 * Firebase service for instructor following system:
 * - Search instructors by name, modality, location
 * - Follow/unfollow instructors
 * - Get followed instructors
 * - Get instructor's upcoming classes
 */

import { db } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
    type Instructor,
    type Follow,
    type WellnessClass,
    type InstructorModality,
    MODALITY_DISPLAY_NAMES,
} from "@/lib/types/wellness-instructor"

// Cache keys
const FOLLOWING_CACHE_KEY = "@following_instructors"
const INSTRUCTOR_CACHE_PREFIX = "@instructor_"

// ============================================
// INSTRUCTOR CRUD
// ============================================

/**
 * Get instructor by ID
 */
export async function getInstructorById(instructorId: string): Promise<Instructor | null> {
    // Check cache first
    const cached = await getCachedInstructor(instructorId)
    if (cached) return cached

    if (!db) return null

    try {
        const { doc, getDoc } = await import("firebase/firestore")
        const docRef = doc(db, "instructors", instructorId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) return null

        const instructor = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
            updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Instructor

        // Cache it
        await cacheInstructor(instructor)

        return instructor
    } catch (error) {
        console.error("[InstructorService] getById error:", error)
        return null
    }
}

/**
 * Search instructors by query
 */
export async function searchInstructors(
    query: string,
    options?: {
        modality?: InstructorModality
        city?: string
        limit?: number
    }
): Promise<Instructor[]> {
    if (!db) return []

    try {
        const { collection, query: firestoreQuery, where, orderBy, limit, getDocs } = await import("firebase/firestore")

        let q = collection(db, "instructors")
        const constraints: any[] = []

        // Filter by modality if specified
        if (options?.modality) {
            constraints.push(where("modalities", "array-contains", options.modality))
        }

        // Filter by city if specified
        if (options?.city) {
            constraints.push(where("location.city", "==", options.city))
        }

        // Limit results
        constraints.push(limit(options?.limit || 20))

        const querySnapshot = await getDocs(firestoreQuery(q, ...constraints))

        const instructors: Instructor[] = []

        querySnapshot.forEach(doc => {
            const data = doc.data()
            // Client-side filter by name (Firestore doesn't support full-text search)
            const matchesQuery = !query ||
                data.displayName?.toLowerCase().includes(query.toLowerCase()) ||
                data.tagline?.toLowerCase().includes(query.toLowerCase())

            if (matchesQuery) {
                instructors.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Instructor)
            }
        })

        return instructors
    } catch (error) {
        console.error("[InstructorService] search error:", error)
        return []
    }
}

/**
 * Get popular instructors (by follower count)
 */
export async function getPopularInstructors(limit: number = 10): Promise<Instructor[]> {
    if (!db) return []

    try {
        const { collection, query, orderBy, limit: limitFn, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "instructors"),
            orderBy("followerCount", "desc"),
            limitFn(limit)
        )

        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Instructor))
    } catch (error) {
        console.error("[InstructorService] getPopular error:", error)
        return []
    }
}

// ============================================
// FOLLOWING SYSTEM
// ============================================

/**
 * Follow an instructor
 */
export async function followInstructor(
    clientId: string,
    instructorId: string,
    notificationsEnabled: boolean = true
): Promise<boolean> {
    if (!db) return false

    try {
        const { collection, addDoc, doc, updateDoc, increment, serverTimestamp, query, where, getDocs } = await import("firebase/firestore")

        // Check if already following
        const existingFollow = await getFollowRelation(clientId, instructorId)
        if (existingFollow) return true // Already following

        // Create follow relationship
        await addDoc(collection(db, "follows"), {
            clientId,
            instructorId,
            notificationsEnabled,
            createdAt: serverTimestamp(),
        })

        // Increment instructor's follower count
        const instructorRef = doc(db, "instructors", instructorId)
        await updateDoc(instructorRef, {
            followerCount: increment(1),
        })

        // Update local cache
        await addToFollowingCache(instructorId)

        console.log(`[InstructorService] Followed instructor ${instructorId}`)
        return true
    } catch (error) {
        console.error("[InstructorService] follow error:", error)
        return false
    }
}

/**
 * Unfollow an instructor
 */
export async function unfollowInstructor(
    clientId: string,
    instructorId: string
): Promise<boolean> {
    if (!db) return false

    try {
        const { collection, query, where, getDocs, deleteDoc, doc, updateDoc, increment } = await import("firebase/firestore")

        // Find the follow relationship
        const q = query(
            collection(db, "follows"),
            where("clientId", "==", clientId),
            where("instructorId", "==", instructorId)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) return false

        // Delete the follow
        await deleteDoc(snapshot.docs[0].ref)

        // Decrement instructor's follower count
        const instructorRef = doc(db, "instructors", instructorId)
        await updateDoc(instructorRef, {
            followerCount: increment(-1),
        })

        // Update local cache
        await removeFromFollowingCache(instructorId)

        console.log(`[InstructorService] Unfollowed instructor ${instructorId}`)
        return true
    } catch (error) {
        console.error("[InstructorService] unfollow error:", error)
        return false
    }
}

/**
 * Check if user is following an instructor
 */
export async function isFollowing(
    clientId: string,
    instructorId: string
): Promise<boolean> {
    const follow = await getFollowRelation(clientId, instructorId)
    return !!follow
}

/**
 * Get the follow relationship (if exists)
 */
async function getFollowRelation(
    clientId: string,
    instructorId: string
): Promise<Follow | null> {
    if (!db) return null

    try {
        const { collection, query, where, getDocs, limit } = await import("firebase/firestore")

        const q = query(
            collection(db, "follows"),
            where("clientId", "==", clientId),
            where("instructorId", "==", instructorId),
            limit(1)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) return null

        const doc = snapshot.docs[0]
        return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Follow
    } catch (error) {
        console.error("[InstructorService] getFollowRelation error:", error)
        return null
    }
}

/**
 * Get all instructors the user follows
 */
export async function getFollowedInstructors(clientId: string): Promise<Instructor[]> {
    if (!db) return []

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        // Get all follows for this user
        const q = query(
            collection(db, "follows"),
            where("clientId", "==", clientId)
        )
        const followsSnapshot = await getDocs(q)

        if (followsSnapshot.empty) return []

        // Get instructor IDs
        const instructorIds = followsSnapshot.docs.map(doc => doc.data().instructorId)

        // Fetch all instructors (in parallel for up to 10, then batch)
        const instructors = await Promise.all(
            instructorIds.slice(0, 30).map(id => getInstructorById(id))
        )

        return instructors.filter((i): i is Instructor => i !== null)
    } catch (error) {
        console.error("[InstructorService] getFollowed error:", error)
        return []
    }
}

/**
 * Get IDs of followed instructors (for quick checks)
 */
export async function getFollowedInstructorIds(clientId: string): Promise<string[]> {
    // Check cache first
    const cached = await getFollowingCache()
    if (cached && cached.length > 0) return cached

    if (!db) return []

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "follows"),
            where("clientId", "==", clientId)
        )
        const snapshot = await getDocs(q)

        const ids = snapshot.docs.map(doc => doc.data().instructorId)

        // Cache them
        await setFollowingCache(ids)

        return ids
    } catch (error) {
        console.error("[InstructorService] getFollowedIds error:", error)
        return []
    }
}

// ============================================
// INSTRUCTOR CLASSES
// ============================================

/**
 * Get upcoming classes for an instructor
 */
export async function getInstructorClasses(
    instructorId: string,
    limit: number = 10
): Promise<WellnessClass[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, limit: limitFn, getDocs, Timestamp } = await import("firebase/firestore")

        const now = Timestamp.now()

        const q = query(
            collection(db, "wellnessClasses"),
            where("instructorId", "==", instructorId),
            where("startTime", ">", now),
            where("status", "==", "upcoming"),
            orderBy("startTime", "asc"),
            limitFn(limit)
        )

        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate() || new Date(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as WellnessClass))
    } catch (error) {
        console.error("[InstructorService] getClasses error:", error)
        return []
    }
}

/**
 * Get upcoming classes from all followed instructors
 */
export async function getFollowingFeed(clientId: string): Promise<WellnessClass[]> {
    // Get followed instructor IDs
    const followedIds = await getFollowedInstructorIds(clientId)
    if (followedIds.length === 0) return []

    // For each instructor, get their upcoming classes
    const allClasses: WellnessClass[] = []

    for (const instructorId of followedIds.slice(0, 20)) {
        const classes = await getInstructorClasses(instructorId, 5)
        allClasses.push(...classes)
    }

    // Sort by start time
    allClasses.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    return allClasses.slice(0, 20)
}

// ============================================
// CACHING
// ============================================

async function getCachedInstructor(id: string): Promise<Instructor | null> {
    try {
        const cached = await AsyncStorage.getItem(`${INSTRUCTOR_CACHE_PREFIX}${id}`)
        if (!cached) return null

        const { data, timestamp } = JSON.parse(cached)
        // Cache valid for 1 hour
        if (Date.now() - timestamp > 60 * 60 * 1000) return null

        return data
    } catch {
        return null
    }
}

async function cacheInstructor(instructor: Instructor): Promise<void> {
    try {
        await AsyncStorage.setItem(
            `${INSTRUCTOR_CACHE_PREFIX}${instructor.id}`,
            JSON.stringify({ data: instructor, timestamp: Date.now() })
        )
    } catch (error) {
        console.error("[InstructorService] cache error:", error)
    }
}

async function getFollowingCache(): Promise<string[] | null> {
    try {
        const cached = await AsyncStorage.getItem(FOLLOWING_CACHE_KEY)
        return cached ? JSON.parse(cached) : null
    } catch {
        return null
    }
}

async function setFollowingCache(ids: string[]): Promise<void> {
    try {
        await AsyncStorage.setItem(FOLLOWING_CACHE_KEY, JSON.stringify(ids))
    } catch (error) {
        console.error("[InstructorService] setFollowingCache error:", error)
    }
}

async function addToFollowingCache(instructorId: string): Promise<void> {
    const current = await getFollowingCache() || []
    if (!current.includes(instructorId)) {
        current.push(instructorId)
        await setFollowingCache(current)
    }
}

async function removeFromFollowingCache(instructorId: string): Promise<void> {
    const current = await getFollowingCache() || []
    const updated = current.filter(id => id !== instructorId)
    await setFollowingCache(updated)
}

/**
 * Clear all instructor caches (for logout)
 */
export async function clearInstructorCache(): Promise<void> {
    try {
        await AsyncStorage.removeItem(FOLLOWING_CACHE_KEY)
        // Could also clear individual instructor caches if needed
    } catch (error) {
        console.error("[InstructorService] clearCache error:", error)
    }
}
