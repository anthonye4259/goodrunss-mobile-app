/**
 * Venue Check-In Service
 * 
 * Records user check-ins at venues and uses aggregated data to:
 * 1. Improve traffic predictions with REAL user data
 * 2. Trigger push notifications when conditions are good
 * 3. Show "X people here now" with actual numbers
 * 
 * This is the KEY to self-improving predictions!
 */

import { db } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { reviewTriggers } from "@/lib/services/app-review-service"

// ============================================
// TYPES
// ============================================

export interface CheckIn {
    id?: string
    venueId: string
    venueName: string
    userId: string
    timestamp: Date
    activity?: string
    duration?: number // minutes stayed
    crowdEstimate?: "empty" | "light" | "moderate" | "busy" | "packed"
    quality?: 1 | 2 | 3 | 4 | 5 // How was your experience?
}

export interface VenueActivity {
    venueId: string
    activeCheckIns: number
    recentCheckIns: number
    avgDuration: number
    peakHour: number
    trend: "increasing" | "stable" | "decreasing"
}

// Cache keys
const LAST_CHECKIN_KEY = "@last_checkin"
const CHECKIN_HISTORY_KEY = "@checkin_history"

// ============================================
// CHECK-IN FUNCTIONS
// ============================================

/**
 * Record a user check-in at a venue
 * This data feeds back into the ML model!
 */
export async function recordCheckIn(
    venueId: string,
    venueName: string,
    userId: string,
    activity?: string,
    crowdEstimate?: CheckIn["crowdEstimate"]
): Promise<{ success: boolean; checkInId?: string }> {
    const checkIn: CheckIn = {
        venueId,
        venueName,
        userId,
        timestamp: new Date(),
        activity,
        crowdEstimate,
    }

    try {
        if (db) {
            // Save to Firestore
            const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")

            const docRef = await addDoc(collection(db, "checkIns"), {
                ...checkIn,
                timestamp: serverTimestamp(),
            })

            // Also update venue's active count
            await updateVenueActiveCount(venueId, 1)

            // Save locally
            await saveLocalCheckIn(checkIn)

            console.log(`[CheckIn] Recorded at ${venueName}:`, docRef.id)

            // Trigger review prompt after successful check-in
            reviewTriggers.onCheckIn()

            return { success: true, checkInId: docRef.id }
        } else {
            // Offline mode - save locally only
            await saveLocalCheckIn(checkIn)
            return { success: true }
        }
    } catch (error) {
        console.error("[CheckIn] Error:", error)
        // Still save locally as backup
        await saveLocalCheckIn(checkIn)
        return { success: false }
    }
}

/**
 * Record check-out (user leaving venue)
 * Updates duration for better predictions
 */
export async function recordCheckOut(
    venueId: string,
    userId: string,
    quality?: 1 | 2 | 3 | 4 | 5
): Promise<void> {
    try {
        // Get the last check-in
        const lastCheckIn = await getLastCheckIn()
        if (!lastCheckIn || lastCheckIn.venueId !== venueId) return

        const duration = Math.round(
            (new Date().getTime() - new Date(lastCheckIn.timestamp).getTime()) / 60000
        )

        if (db) {
            const { collection, query, where, orderBy, limit, getDocs, updateDoc } = await import("firebase/firestore")

            // Find and update the check-in record
            const q = query(
                collection(db, "checkIns"),
                where("userId", "==", userId),
                where("venueId", "==", venueId),
                orderBy("timestamp", "desc"),
                limit(1)
            )

            const snapshot = await getDocs(q)
            if (!snapshot.empty) {
                await updateDoc(snapshot.docs[0].ref, {
                    duration,
                    quality,
                })
            }

            // Decrement venue active count
            await updateVenueActiveCount(venueId, -1)
        }

        // Clear local check-in
        await AsyncStorage.removeItem(LAST_CHECKIN_KEY)

        console.log(`[CheckIn] Checked out from venue, stayed ${duration} min`)
    } catch (error) {
        console.error("[CheckOut] Error:", error)
    }
}

// ============================================
// VENUE ACTIVITY DATA (for predictions)
// ============================================

/**
 * Update real-time active count at a venue
 */
async function updateVenueActiveCount(venueId: string, delta: number): Promise<void> {
    if (!db) return

    try {
        const { doc, updateDoc, increment, setDoc, getDoc } = await import("firebase/firestore")

        const venueRef = doc(db, "venueActivity", venueId)
        const venueDoc = await getDoc(venueRef)

        if (venueDoc.exists()) {
            await updateDoc(venueRef, {
                activeCheckIns: increment(delta),
                lastUpdated: new Date(),
            })
        } else {
            await setDoc(venueRef, {
                activeCheckIns: Math.max(0, delta),
                lastUpdated: new Date(),
            })
        }
    } catch (error) {
        console.error("[VenueActivity] Update error:", error)
    }
}

/**
 * Get real-time activity for a venue
 * Used to show "X players here now"
 */
export async function getVenueActivity(venueId: string): Promise<VenueActivity | null> {
    if (!db) return null

    try {
        const { doc, getDoc, collection, query, where, getDocs, Timestamp } = await import("firebase/firestore")

        // Get current active count
        const activityRef = doc(db, "venueActivity", venueId)
        const activityDoc = await getDoc(activityRef)

        // Get recent check-ins (last 2 hours)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        const q = query(
            collection(db, "checkIns"),
            where("venueId", "==", venueId),
            where("timestamp", ">", Timestamp.fromDate(twoHoursAgo))
        )
        const checkInsSnapshot = await getDocs(q)

        const activeCount = activityDoc.exists() ? activityDoc.data()?.activeCheckIns || 0 : 0
        const recentCount = checkInsSnapshot.size

        // Calculate average duration from recent check-ins
        let totalDuration = 0
        let durationCount = 0
        checkInsSnapshot.forEach(doc => {
            const duration = doc.data().duration
            if (duration) {
                totalDuration += duration
                durationCount++
            }
        })

        return {
            venueId,
            activeCheckIns: activeCount,
            recentCheckIns: recentCount,
            avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 45,
            peakHour: 17, // Will calculate from historical data
            trend: recentCount > 5 ? "increasing" : recentCount > 2 ? "stable" : "decreasing",
        }
    } catch (error) {
        console.error("[VenueActivity] Get error:", error)
        return null
    }
}

/**
 * Get aggregated check-in stats for ML calibration
 * Called by the prediction engine to improve accuracy
 */
export async function getCheckInStats(
    venueId: string,
    hour: number,
    dayOfWeek: number
): Promise<{ avgPeople: number; confidence: number }> {
    if (!db) return { avgPeople: 0, confidence: 0 }

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        // Get check-ins for this venue at this time slot
        const q = query(
            collection(db, "checkIns"),
            where("venueId", "==", venueId)
        )

        const snapshot = await getDocs(q)

        // Filter by hour and day (client-side for simplicity)
        let matchingCount = 0
        let totalAtTime = 0

        snapshot.forEach(doc => {
            const data = doc.data()
            const checkInDate = data.timestamp?.toDate() || new Date()
            const checkInHour = checkInDate.getHours()
            const checkInDay = checkInDate.getDay()

            // Within 2 hours of target time, same day type (weekday/weekend)
            if (Math.abs(checkInHour - hour) <= 2) {
                const sameType = (checkInDay === 0 || checkInDay === 6) === (dayOfWeek === 0 || dayOfWeek === 6)
                if (sameType) {
                    matchingCount++
                    totalAtTime += data.crowdEstimate === "packed" ? 5 :
                        data.crowdEstimate === "busy" ? 4 :
                            data.crowdEstimate === "moderate" ? 3 :
                                data.crowdEstimate === "light" ? 2 : 1
                }
            }
        })

        const avgPeople = matchingCount > 0 ? Math.round(totalAtTime / matchingCount) : 0
        const confidence = Math.min(matchingCount / 10, 1) // More data = higher confidence

        return { avgPeople, confidence }
    } catch (error) {
        console.error("[CheckInStats] Error:", error)
        return { avgPeople: 0, confidence: 0 }
    }
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

async function saveLocalCheckIn(checkIn: CheckIn): Promise<void> {
    try {
        // Save as last check-in
        await AsyncStorage.setItem(LAST_CHECKIN_KEY, JSON.stringify(checkIn))

        // Add to history
        const historyStr = await AsyncStorage.getItem(CHECKIN_HISTORY_KEY)
        const history = historyStr ? JSON.parse(historyStr) : []
        history.unshift(checkIn)
        // Keep last 50
        await AsyncStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
    } catch (error) {
        console.error("[CheckIn] Local save error:", error)
    }
}

async function getLastCheckIn(): Promise<CheckIn | null> {
    try {
        const str = await AsyncStorage.getItem(LAST_CHECKIN_KEY)
        return str ? JSON.parse(str) : null
    } catch {
        return null
    }
}

export async function getCheckInHistory(): Promise<CheckIn[]> {
    try {
        const str = await AsyncStorage.getItem(CHECKIN_HISTORY_KEY)
        return str ? JSON.parse(str) : []
    } catch {
        return []
    }
}

// ============================================
// NOTIFICATION TRIGGERS
// ============================================

/**
 * Check if conditions warrant a push notification
 * Returns notification message if should notify, null otherwise
 */
export async function checkNotificationTriggers(
    venueId: string,
    venueName: string,
    currentLevel: "empty" | "light" | "moderate" | "busy" | "packed"
): Promise<string | null> {
    // Good time to go!
    if (currentLevel === "empty" || currentLevel === "light") {
        return `${venueName} is ${currentLevel} right now - perfect time to play!`
    }

    // Good crowd for pickup games
    if (currentLevel === "moderate") {
        return `${venueName} has a good crowd for games right now!`
    }

    // Getting busy - maybe wait
    if (currentLevel === "busy" || currentLevel === "packed") {
        return null // Don't notify for busy times
    }

    return null
}
