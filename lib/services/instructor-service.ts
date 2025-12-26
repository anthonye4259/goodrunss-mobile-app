/**
 * Instructor Service
 * 
 * Manages wellness instructor data and classes.
 */

import { db } from "@/lib/firebase-config"
import type { Instructor, WellnessClass } from "@/lib/types/wellness-instructor"

/**
 * Get instructor by ID
 */
export async function getInstructorById(instructorId: string): Promise<Instructor | null> {
    if (!db) return null

    try {
        const doc = await db.collection("instructors").doc(instructorId).get()
        if (!doc.exists) return null
        return { id: doc.id, ...doc.data() } as Instructor
    } catch (error) {
        console.error("Error getting instructor:", error)
        return null
    }
}

/**
 * Get instructor's upcoming classes
 */
export async function getInstructorClasses(instructorId: string, limit = 10): Promise<WellnessClass[]> {
    if (!db) return []

    try {
        const now = new Date()
        const snapshot = await db.collection("wellness_classes")
            .where("instructorId", "==", instructorId)
            .where("startTime", ">=", now)
            .orderBy("startTime", "asc")
            .limit(limit)
            .get()

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime?.toDate?.() || new Date(),
            endTime: doc.data().endTime?.toDate?.() || new Date(),
        })) as WellnessClass[]
    } catch (error) {
        console.error("Error getting instructor classes:", error)
        return []
    }
}

/**
 * Search instructors
 */
export async function searchInstructors(options: {
    modality?: string
    city?: string
    limit?: number
}): Promise<Instructor[]> {
    if (!db) return []

    try {
        let query = db.collection("instructors").where("isActive", "==", true)

        if (options.modality) {
            query = query.where("modalities", "array-contains", options.modality)
        }

        const snapshot = await query.limit(options.limit || 20).get()
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Instructor[]
    } catch (error) {
        console.error("Error searching instructors:", error)
        return []
    }
}

export const instructorService = {
    getInstructorById,
    getInstructorClasses,
    searchInstructors,
}
