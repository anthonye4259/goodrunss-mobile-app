/**
 * Waitlist Service
 * AI-powered slot filling - auto-notify players when slots open up
 */

import { db } from "../firebase-config"

const WAITLIST_COLLECTION = "court_waitlist"

export interface WaitlistEntry {
    id: string

    // What they're waiting for
    courtId: string
    facilityId: string
    venueId: string
    date: string // "2025-12-25"
    timeSlot: string // "09:00" - the slot they want

    // Who's waiting
    userId: string
    userName: string
    userEmail?: string
    pushToken?: string // For notifications

    // Status
    status: "waiting" | "notified" | "booked" | "expired"
    notifiedAt?: Date

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

export const waitlistService = {
    /**
     * Join waitlist for a fully-booked slot
     */
    async joinWaitlist(entry: {
        courtId: string
        facilityId: string
        venueId: string
        date: string
        timeSlot: string
        userId: string
        userName: string
        userEmail?: string
        pushToken?: string
    }): Promise<string | null> {
        if (!db) return null

        try {
            // Check if already on waitlist
            const existingQuery = db.collection(WAITLIST_COLLECTION)
                .where("courtId", "==", entry.courtId)
                .where("date", "==", entry.date)
                .where("timeSlot", "==", entry.timeSlot)
                .where("userId", "==", entry.userId)
                .where("status", "==", "waiting")
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) {
                console.log("User already on waitlist")
                return existing.docs[0].id
            }

            const waitlistEntry: Omit<WaitlistEntry, "id"> = {
                ...entry,
                status: "waiting",
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(WAITLIST_COLLECTION).add(waitlistEntry)
            return docRef.id
        } catch (error) {
            console.error("Error joining waitlist:", error)
            return null
        }
    },

    /**
     * Get waitlist entries for a specific slot
     * Ordered by createdAt (first-come-first-serve)
     */
    async getWaitlistForSlot(
        courtId: string,
        date: string,
        timeSlot: string
    ): Promise<WaitlistEntry[]> {
        if (!db) return []

        try {
            const query = db.collection(WAITLIST_COLLECTION)
                .where("courtId", "==", courtId)
                .where("date", "==", date)
                .where("timeSlot", "==", timeSlot)
                .where("status", "==", "waiting")
                .orderBy("createdAt", "asc")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as WaitlistEntry[]
        } catch (error) {
            console.error("Error getting waitlist:", error)
            return []
        }
    },

    /**
     * Get user's active waitlist entries
     */
    async getUserWaitlist(userId: string): Promise<WaitlistEntry[]> {
        if (!db) return []

        try {
            const today = new Date().toISOString().split("T")[0]

            const query = db.collection(WAITLIST_COLLECTION)
                .where("userId", "==", userId)
                .where("status", "==", "waiting")
                .where("date", ">=", today)
                .orderBy("date")
                .orderBy("timeSlot")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as WaitlistEntry[]
        } catch (error) {
            console.error("Error getting user waitlist:", error)
            return []
        }
    },

    /**
     * Mark entry as notified (slot just opened up)
     */
    async markNotified(entryId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(WAITLIST_COLLECTION).doc(entryId).update({
                status: "notified",
                notifiedAt: new Date(),
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error marking notified:", error)
            return false
        }
    },

    /**
     * Mark entry as booked (player successfully booked the slot)
     */
    async markBooked(entryId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(WAITLIST_COLLECTION).doc(entryId).update({
                status: "booked",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error marking booked:", error)
            return false
        }
    },

    /**
     * Remove from waitlist
     */
    async leaveWaitlist(entryId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const doc = await db.collection(WAITLIST_COLLECTION).doc(entryId).get()
            if (!doc.exists || doc.data()?.userId !== userId) return false

            await db.collection(WAITLIST_COLLECTION).doc(entryId).delete()
            return true
        } catch (error) {
            console.error("Error leaving waitlist:", error)
            return false
        }
    },

    /**
     * Get waitlist count for a slot
     */
    async getWaitlistCount(courtId: string, date: string, timeSlot: string): Promise<number> {
        if (!db) return 0

        try {
            const query = db.collection(WAITLIST_COLLECTION)
                .where("courtId", "==", courtId)
                .where("date", "==", date)
                .where("timeSlot", "==", timeSlot)
                .where("status", "==", "waiting")

            const snapshot = await query.get()
            return snapshot.size
        } catch (error) {
            console.error("Error getting waitlist count:", error)
            return 0
        }
    },

    /**
     * Expire old waitlist entries (cleanup)
     */
    async expireOldEntries(): Promise<number> {
        if (!db) return 0

        try {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split("T")[0]

            const query = db.collection(WAITLIST_COLLECTION)
                .where("status", "==", "waiting")
                .where("date", "<", yesterdayStr)
                .limit(100)

            const snapshot = await query.get()

            const batch = db.batch()
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { status: "expired", updatedAt: new Date() })
            })
            await batch.commit()

            return snapshot.size
        } catch (error) {
            console.error("Error expiring old entries:", error)
            return 0
        }
    },
}

export default waitlistService
