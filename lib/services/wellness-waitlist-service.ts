/**
 * Wellness Waitlist Service
 * 
 * Smart waitlist system for wellness classes:
 * - Auto-book: Automatically confirm when spot opens
 * - Priority: Pro members get bumped up in queue (if instructor allows)
 * - Flash booking: 5-min exclusive window before next person
 * - Instant notifications: Push the moment a spot opens
 */

import { db } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { NotificationService } from "@/lib/notification-service"
import type { WaitlistEntry, WellnessClass } from "@/lib/types/wellness-instructor"
import { isProPriorityAllowed } from "@/components/ProPrioritySettings"

// Cache key for user's waitlists
const MY_WAITLISTS_CACHE = "@my_waitlists"

// How long the "flash booking" window is (before next person gets notified)
const FLASH_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

export interface JoinWaitlistOptions {
    autoBook: boolean // Auto-confirm when spot opens
    isPro: boolean // Pro members get priority (if instructor allows)
}

export interface WaitlistResult {
    success: boolean
    position: number
    estimatedWait?: string
    message: string
}

// ============================================
// JOIN WAITLIST
// ============================================

/**
 * Join the waitlist for a class
 */
export async function joinWaitlist(
    classId: string,
    clientId: string,
    options: JoinWaitlistOptions,
    instructorId?: string // Need to check instructor's Pro priority setting
): Promise<WaitlistResult> {
    if (!db) {
        return { success: false, position: 0, message: "Database not available" }
    }

    try {
        const { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, getDoc } = await import("firebase/firestore")

        // Check if already on waitlist
        const existingEntry = await getWaitlistEntry(classId, clientId)
        if (existingEntry) {
            return {
                success: true,
                position: existingEntry.position,
                message: "You're already on the waitlist!",
            }
        }

        // Get instructor ID from class if not provided
        let actualInstructorId = instructorId
        if (!actualInstructorId) {
            const classDoc = await getDoc(doc(db, "wellnessClasses", classId))
            if (classDoc.exists()) {
                actualInstructorId = classDoc.data().instructorId
            }
        }

        // Check if instructor allows Pro priority
        let allowProPriority = false
        if (options.isPro && actualInstructorId) {
            allowProPriority = await isProPriorityAllowed(actualInstructorId, classId)
        }

        // Get current waitlist size to determine position
        const waitlistQuery = query(
            collection(db, "classWaitlists"),
            where("classId", "==", classId),
            orderBy("position", "desc")
        )
        const snapshot = await getDocs(waitlistQuery)

        // Calculate position (Pro members get priority only if instructor allows)
        let position: number
        if (options.isPro && allowProPriority && snapshot.size > 0) {
            // Pro gets position after other Pro members but before regular
            const proCount = snapshot.docs.filter(d => d.data().isPro).length
            position = proCount + 1
        } else {
            position = snapshot.size + 1
        }


        // Create waitlist entry
        await addDoc(collection(db, "classWaitlists"), {
            classId,
            clientId,
            position,
            autoBook: options.autoBook,
            isPro: options.isPro,
            notified: false,
            notifiedAt: null,
            flashExpiresAt: null, // Set when they're notified
            createdAt: serverTimestamp(),
        })

        // Update local cache
        await addToWaitlistCache(classId)

        // Increment class waitlist count
        await updateClassWaitlistCount(classId, 1)

        const estimatedWait = position === 1
            ? "You're next!"
            : position <= 3
                ? "A few spots ahead"
                : `${position - 1} people ahead`

        console.log(`[WaitlistService] Joined waitlist for ${classId}, position ${position}`)

        return {
            success: true,
            position,
            estimatedWait,
            message: options.autoBook
                ? "You'll be auto-booked when a spot opens!"
                : "We'll notify you when a spot opens",
        }
    } catch (error) {
        console.error("[WaitlistService] joinWaitlist error:", error)
        return { success: false, position: 0, message: "Failed to join waitlist" }
    }
}

// ============================================
// LEAVE WAITLIST
// ============================================

/**
 * Leave/remove from waitlist
 */
export async function leaveWaitlist(classId: string, clientId: string): Promise<boolean> {
    if (!db) return false

    try {
        const { collection, query, where, getDocs, deleteDoc, writeBatch } = await import("firebase/firestore")

        // Find the entry
        const waitlistQuery = query(
            collection(db, "classWaitlists"),
            where("classId", "==", classId),
            where("clientId", "==", clientId)
        )
        const snapshot = await getDocs(waitlistQuery)

        if (snapshot.empty) return false

        const entry = snapshot.docs[0]
        const entryPosition = entry.data().position

        // Delete the entry
        await deleteDoc(entry.ref)

        // Update positions of everyone behind them
        const allEntriesQuery = query(
            collection(db, "classWaitlists"),
            where("classId", "==", classId),
            where("position", ">", entryPosition)
        )
        const allEntries = await getDocs(allEntriesQuery)

        if (allEntries.size > 0) {
            const batch = writeBatch(db)
            allEntries.docs.forEach(doc => {
                batch.update(doc.ref, { position: doc.data().position - 1 })
            })
            await batch.commit()
        }

        // Update local cache
        await removeFromWaitlistCache(classId)

        // Decrement class waitlist count
        await updateClassWaitlistCount(classId, -1)

        console.log(`[WaitlistService] Left waitlist for ${classId}`)
        return true
    } catch (error) {
        console.error("[WaitlistService] leaveWaitlist error:", error)
        return false
    }
}

// ============================================
// PROCESS SPOT OPENING (Called by Cloud Function)
// ============================================

/**
 * Process when a spot opens in a class
 * Returns the client who should get the spot
 */
export async function processSpotOpening(classId: string): Promise<string | null> {
    if (!db) return null

    try {
        const { collection, query, where, orderBy, limit, getDocs, updateDoc, Timestamp } = await import("firebase/firestore")

        // Get the first person in line
        const waitlistQuery = query(
            collection(db, "classWaitlists"),
            where("classId", "==", classId),
            where("notified", "==", false),
            orderBy("position", "asc"),
            limit(1)
        )
        const snapshot = await getDocs(waitlistQuery)

        if (snapshot.empty) {
            console.log("[WaitlistService] No one on waitlist")
            return null
        }

        const entry = snapshot.docs[0]
        const data = entry.data()
        const clientId = data.clientId
        const autoBook = data.autoBook

        if (autoBook) {
            // Auto-book: Immediately book them and remove from waitlist
            console.log(`[WaitlistService] Auto-booking client ${clientId}`)

            // Book the class for them
            await bookClassForClient(classId, clientId)

            // Remove from waitlist
            await leaveWaitlist(classId, clientId)

            // Send confirmation notification
            const notificationService = NotificationService.getInstance()
            await notificationService.sendLocalNotification({
                type: "booking_confirmed",
                title: "Auto-Booked! 🎉",
                body: "A spot opened and we booked it for you!",
            })

            return clientId
        } else {
            // Flash booking: Give them 5 min exclusive window
            const flashExpiresAt = new Date(Date.now() + FLASH_WINDOW_MS)

            await updateDoc(entry.ref, {
                notified: true,
                notifiedAt: Timestamp.now(),
                flashExpiresAt: Timestamp.fromDate(flashExpiresAt),
            })

            // Send notification
            const notificationService = NotificationService.getInstance()
            await notificationService.sendLocalNotification({
                type: "general",
                title: "Spot Just Opened! ⚡",
                body: "You have 5 minutes to claim it before the next person",
            })

            console.log(`[WaitlistService] Notified client ${clientId}, flash window until ${flashExpiresAt}`)
            return clientId
        }
    } catch (error) {
        console.error("[WaitlistService] processSpotOpening error:", error)
        return null
    }
}

/**
 * Called when flash window expires - moves to next person
 */
export async function handleFlashExpired(classId: string, expiredClientId: string): Promise<void> {
    if (!db) return

    try {
        // Remove the expired entry
        await leaveWaitlist(classId, expiredClientId)

        // Notify them they missed it
        const notificationService = NotificationService.getInstance()
        await notificationService.sendLocalNotification({
            type: "general",
            title: "Spot Given Away",
            body: "The 5-minute window expired. You've been removed from the waitlist.",
        })

        // Process next person
        await processSpotOpening(classId)
    } catch (error) {
        console.error("[WaitlistService] handleFlashExpired error:", error)
    }
}

/**
 * Client claims the spot during flash window
 */
export async function claimSpot(classId: string, clientId: string): Promise<boolean> {
    if (!db) return false

    try {
        // Verify they have an active flash window
        const entry = await getWaitlistEntry(classId, clientId)
        if (!entry || !entry.notified) {
            console.log("[WaitlistService] No active flash window for client")
            return false
        }

        // Book the class
        await bookClassForClient(classId, clientId)

        // Remove from waitlist
        await leaveWaitlist(classId, clientId)

        // Send confirmation
        const notificationService = NotificationService.getInstance()
        await notificationService.sendLocalNotification({
            type: "booking_confirmed",
            title: "Spot Claimed! 🎉",
            body: "You're in! See you in class.",
        })

        return true
    } catch (error) {
        console.error("[WaitlistService] claimSpot error:", error)
        return false
    }
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Get a specific waitlist entry
 */
async function getWaitlistEntry(classId: string, clientId: string): Promise<WaitlistEntry | null> {
    if (!db) return null

    try {
        const { collection, query, where, getDocs, limit } = await import("firebase/firestore")

        const q = query(
            collection(db, "classWaitlists"),
            where("classId", "==", classId),
            where("clientId", "==", clientId),
            limit(1)
        )
        const snapshot = await getDocs(q)

        if (snapshot.empty) return null

        const doc = snapshot.docs[0]
        return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as WaitlistEntry
    } catch (error) {
        return null
    }
}

/**
 * Get all waitlist entries for a class
 */
export async function getClassWaitlist(classId: string): Promise<WaitlistEntry[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "classWaitlists"),
            where("classId", "==", classId),
            orderBy("position", "asc")
        )
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as WaitlistEntry))
    } catch (error) {
        console.error("[WaitlistService] getClassWaitlist error:", error)
        return []
    }
}

/**
 * Get user's position on a waitlist
 */
export async function getWaitlistPosition(classId: string, clientId: string): Promise<number | null> {
    const entry = await getWaitlistEntry(classId, clientId)
    return entry?.position || null
}

/**
 * Check if user is on waitlist
 */
export async function isOnWaitlist(classId: string, clientId: string): Promise<boolean> {
    const entry = await getWaitlistEntry(classId, clientId)
    return !!entry
}

/**
 * Get all waitlists the user is on
 */
export async function getMyWaitlists(clientId: string): Promise<{ classId: string; position: number; autoBook: boolean }[]> {
    if (!db) return []

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "classWaitlists"),
            where("clientId", "==", clientId)
        )
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            classId: doc.data().classId,
            position: doc.data().position,
            autoBook: doc.data().autoBook,
        }))
    } catch (error) {
        console.error("[WaitlistService] getMyWaitlists error:", error)
        return []
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function bookClassForClient(classId: string, clientId: string): Promise<void> {
    if (!db) return

    try {
        const { doc, updateDoc, increment, addDoc, collection, serverTimestamp } = await import("firebase/firestore")

        // Add booking
        await addDoc(collection(db, "classBookings"), {
            classId,
            clientId,
            bookedAt: serverTimestamp(),
            fromWaitlist: true,
        })

        // Increment class booked count
        const classRef = doc(db, "wellnessClasses", classId)
        await updateDoc(classRef, {
            bookedCount: increment(1),
        })
    } catch (error) {
        console.error("[WaitlistService] bookClassForClient error:", error)
    }
}

async function updateClassWaitlistCount(classId: string, delta: number): Promise<void> {
    if (!db) return

    try {
        const { doc, updateDoc, increment } = await import("firebase/firestore")

        const classRef = doc(db, "wellnessClasses", classId)
        await updateDoc(classRef, {
            waitlistCount: increment(delta),
        })
    } catch (error) {
        console.error("[WaitlistService] updateClassWaitlistCount error:", error)
    }
}

// ============================================
// LOCAL CACHE
// ============================================

async function getWaitlistCache(): Promise<string[]> {
    try {
        const cached = await AsyncStorage.getItem(MY_WAITLISTS_CACHE)
        return cached ? JSON.parse(cached) : []
    } catch {
        return []
    }
}

async function addToWaitlistCache(classId: string): Promise<void> {
    const current = await getWaitlistCache()
    if (!current.includes(classId)) {
        current.push(classId)
        await AsyncStorage.setItem(MY_WAITLISTS_CACHE, JSON.stringify(current))
    }
}

async function removeFromWaitlistCache(classId: string): Promise<void> {
    const current = await getWaitlistCache()
    const updated = current.filter(id => id !== classId)
    await AsyncStorage.setItem(MY_WAITLISTS_CACHE, JSON.stringify(updated))
}

/**
 * Check if user is on any waitlist (from cache)
 */
export async function getCachedWaitlistIds(): Promise<string[]> {
    return getWaitlistCache()
}
