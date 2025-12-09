/**
 * Pro Subscription Revenue Share
 * 
 * Client Pro ($10/mo) revenue is split:
 * - $7 → GoodRunss platform
 * - $3 → Instructor pool (split among instructors they book with)
 * 
 * This incentivizes instructors to encourage Pro signups
 */

import { db } from "@/lib/firebase-config"

// Revenue split
export const PRO_SUBSCRIPTION_PRICE = 1000 // cents ($10)
export const PLATFORM_SHARE = 700 // cents ($7)
export const INSTRUCTOR_POOL_SHARE = 300 // cents ($3)

// Trainer subscription pricing
export const TRAINER_PRICING = {
    monthly: { price: 1500, label: "$15/month" },
    quarterly: { price: 4000, label: "$40/3 months", savings: "Save 11%" },
    biannual: { price: 7500, label: "$75/6 months", savings: "Save 17%", best: true },
}

// Types
export interface ProSubscription {
    id: string
    clientId: string
    status: "active" | "cancelled" | "expired"
    startDate: Date
    renewDate: Date
    stripeSubscriptionId?: string
}

export interface InstructorRevenueShare {
    instructorId: string
    month: string // "2024-12"
    totalBookings: number
    revenueShare: number // cents
    proClientsBooked: string[]
    status: "pending" | "paid"
    paidAt?: Date
}

export interface ProClientActivity {
    clientId: string
    month: string
    instructorBookings: { instructorId: string; count: number }[]
}

// ============================================
// REVENUE TRACKING
// ============================================

/**
 * Track when a Pro client books with an instructor
 * Called after every booking by a Pro member
 */
export async function trackProClientBooking(
    clientId: string,
    instructorId: string
): Promise<void> {
    if (!db) return

    try {
        const { doc, setDoc, increment, arrayUnion } = await import("firebase/firestore")

        const month = new Date().toISOString().slice(0, 7) // "2024-12"
        const docId = `${instructorId}_${month}`

        await setDoc(
            doc(db, "instructorRevenueShare", docId),
            {
                instructorId,
                month,
                totalBookings: increment(1),
                proClientsBooked: arrayUnion(clientId),
                status: "pending",
                updatedAt: new Date(),
            },
            { merge: true }
        )

        console.log(`[RevenueShare] Tracked Pro booking: client ${clientId} → instructor ${instructorId}`)
    } catch (error) {
        console.error("[RevenueShare] trackProClientBooking error:", error)
    }
}

/**
 * Calculate monthly revenue share for instructors
 * Run at end of each month
 */
export async function calculateMonthlyRevenueShares(month: string): Promise<void> {
    if (!db) return

    try {
        const { collection, query, where, getDocs, doc, updateDoc } = await import("firebase/firestore")

        // Get all Pro subscriptions active this month
        const subsQuery = query(
            collection(db, "proSubscriptions"),
            where("status", "==", "active")
        )
        const subsSnapshot = await getDocs(subsQuery)
        const totalProRevenue = subsSnapshot.size * INSTRUCTOR_POOL_SHARE

        // Get all instructor bookings this month
        const revenueQuery = query(
            collection(db, "instructorRevenueShare"),
            where("month", "==", month),
            where("status", "==", "pending")
        )
        const revenueSnapshot = await getDocs(revenueQuery)

        // Calculate total bookings
        let totalBookings = 0
        revenueSnapshot.docs.forEach(d => {
            totalBookings += d.data().totalBookings || 0
        })

        // Calculate per-booking share
        const perBookingShare = totalBookings > 0
            ? Math.floor(totalProRevenue / totalBookings)
            : 0

        // Update each instructor's share
        for (const docSnap of revenueSnapshot.docs) {
            const data = docSnap.data()
            const instructorShare = (data.totalBookings || 0) * perBookingShare

            await updateDoc(docSnap.ref, {
                revenueShare: instructorShare,
                calculatedAt: new Date(),
            })
        }

        console.log(`[RevenueShare] Calculated ${month}: $${(totalProRevenue / 100).toFixed(2)} split among ${revenueSnapshot.size} instructors`)
    } catch (error) {
        console.error("[RevenueShare] calculateMonthlyRevenueShares error:", error)
    }
}

/**
 * Get instructor's pending revenue share
 */
export async function getInstructorPendingRevenue(instructorId: string): Promise<number> {
    if (!db) return 0

    try {
        const { collection, query, where, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "instructorRevenueShare"),
            where("instructorId", "==", instructorId),
            where("status", "==", "pending")
        )

        const snapshot = await getDocs(q)
        let total = 0
        snapshot.docs.forEach(d => {
            total += d.data().revenueShare || 0
        })

        return total
    } catch (error) {
        console.error("[RevenueShare] getInstructorPendingRevenue error:", error)
        return 0
    }
}

/**
 * Get instructor's revenue history
 */
export async function getInstructorRevenueHistory(
    instructorId: string
): Promise<InstructorRevenueShare[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "instructorRevenueShare"),
            where("instructorId", "==", instructorId),
            orderBy("month", "desc")
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => ({
            ...d.data(),
            id: d.id,
            paidAt: d.data().paidAt?.toDate(),
        } as InstructorRevenueShare))
    } catch (error) {
        console.error("[RevenueShare] getInstructorRevenueHistory error:", error)
        return []
    }
}

// ============================================
// PRO SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Check if client has Pro subscription
 */
export async function isProClient(clientId: string): Promise<boolean> {
    if (!db) return false

    try {
        const { doc, getDoc } = await import("firebase/firestore")

        const subDoc = await getDoc(doc(db, "proSubscriptions", clientId))
        if (!subDoc.exists()) return false

        return subDoc.data().status === "active"
    } catch (error) {
        console.error("[RevenueShare] isProClient error:", error)
        return false
    }
}

/**
 * Get Pro subscription details
 */
export async function getProSubscription(clientId: string): Promise<ProSubscription | null> {
    if (!db) return null

    try {
        const { doc, getDoc } = await import("firebase/firestore")

        const subDoc = await getDoc(doc(db, "proSubscriptions", clientId))
        if (!subDoc.exists()) return null

        const data = subDoc.data()
        return {
            id: subDoc.id,
            clientId,
            status: data.status,
            startDate: data.startDate?.toDate() || new Date(),
            renewDate: data.renewDate?.toDate() || new Date(),
            stripeSubscriptionId: data.stripeSubscriptionId,
        }
    } catch (error) {
        console.error("[RevenueShare] getProSubscription error:", error)
        return null
    }
}

// ============================================
// HOOKS
// ============================================

import { useState, useEffect, useCallback } from "react"

/**
 * Hook for checking client Pro status
 */
export function useIsProClient(clientId: string | undefined) {
    const [isPro, setIsPro] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!clientId) {
            setIsPro(false)
            setLoading(false)
            return
        }

        isProClient(clientId).then(result => {
            setIsPro(result)
            setLoading(false)
        })
    }, [clientId])

    return { isPro, loading }
}

/**
 * Hook for instructor revenue share
 */
export function useInstructorRevenueShare(instructorId: string | undefined) {
    const [pendingRevenue, setPendingRevenue] = useState(0)
    const [history, setHistory] = useState<InstructorRevenueShare[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!instructorId) return

        setLoading(true)
        const [pending, hist] = await Promise.all([
            getInstructorPendingRevenue(instructorId),
            getInstructorRevenueHistory(instructorId),
        ])
        setPendingRevenue(pending)
        setHistory(hist)
        setLoading(false)
    }, [instructorId])

    useEffect(() => {
        refresh()
    }, [refresh])

    return {
        pendingRevenue,
        pendingRevenueFormatted: `$${(pendingRevenue / 100).toFixed(2)}`,
        history,
        loading,
        refresh,
    }
}

export default {
    // Constants
    PRO_SUBSCRIPTION_PRICE,
    PLATFORM_SHARE,
    INSTRUCTOR_POOL_SHARE,
    TRAINER_PRICING,

    // Functions
    trackProClientBooking,
    calculateMonthlyRevenueShares,
    getInstructorPendingRevenue,
    getInstructorRevenueHistory,
    isProClient,
    getProSubscription,

    // Hooks
    useIsProClient,
    useInstructorRevenueShare,
}
