/**
 * Player Incentive Service
 * First-booking discounts and referral credits to drive marketplace growth
 */

import { db } from "../firebase-config"

const INCENTIVES_COLLECTION = "player_incentives"
const REDEMPTIONS_COLLECTION = "incentive_redemptions"

// Current active promotions
export const ACTIVE_PROMOTIONS = {
    FIRST_BOOKING: {
        code: "FIRST5",
        type: "first_booking" as const,
        discountAmount: 500, // $5.00 in cents
        description: "$5 off your first booking",
        minBookingAmount: 1000, // Min $10 booking
        expiresAt: null, // No expiration
    },
    REFERRAL_CREDIT: {
        code: "REFERRAL",
        type: "referral" as const,
        discountAmount: 500, // $5.00 credit
        description: "$5 credit when friend books",
        minBookingAmount: 1000,
        expiresAt: null,
    },
}

export interface PlayerIncentive {
    id: string
    userId: string
    type: "first_booking" | "referral" | "promo" | "loyalty"
    code: string
    discountAmount: number // In cents
    description: string

    // Status
    status: "active" | "used" | "expired"
    usedAt?: Date
    usedOnBookingId?: string

    // Validity
    expiresAt?: Date
    minBookingAmount?: number

    // Metadata
    createdAt: Date
    source?: string // "signup", "referral", "promo_campaign"
}

export const playerIncentiveService = {
    /**
     * Grant first-booking discount to new user
     * Called on signup
     */
    async grantFirstBookingDiscount(userId: string): Promise<string | null> {
        if (!db) return null

        try {
            // Check if already has first booking incentive
            const existingQuery = db.collection(INCENTIVES_COLLECTION)
                .where("userId", "==", userId)
                .where("type", "==", "first_booking")
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) return existing.docs[0].id

            const promo = ACTIVE_PROMOTIONS.FIRST_BOOKING

            const incentive: Omit<PlayerIncentive, "id"> = {
                userId,
                type: "first_booking",
                code: promo.code,
                discountAmount: promo.discountAmount,
                description: promo.description,
                status: "active",
                minBookingAmount: promo.minBookingAmount,
                createdAt: new Date(),
                source: "signup",
            }

            const docRef = await db.collection(INCENTIVES_COLLECTION).add(incentive)
            return docRef.id
        } catch (error) {
            console.error("Error granting first booking discount:", error)
            return null
        }
    },

    /**
     * Grant referral credit when referred friend books
     */
    async grantReferralCredit(referrerId: string, referredUserId: string): Promise<string | null> {
        if (!db) return null

        try {
            const promo = ACTIVE_PROMOTIONS.REFERRAL_CREDIT

            const incentive: Omit<PlayerIncentive, "id"> = {
                userId: referrerId,
                type: "referral",
                code: promo.code,
                discountAmount: promo.discountAmount,
                description: promo.description,
                status: "active",
                minBookingAmount: promo.minBookingAmount,
                createdAt: new Date(),
                source: `referral_${referredUserId}`,
            }

            const docRef = await db.collection(INCENTIVES_COLLECTION).add(incentive)
            return docRef.id
        } catch (error) {
            console.error("Error granting referral credit:", error)
            return null
        }
    },

    /**
     * Get user's available incentives
     */
    async getAvailableIncentives(userId: string): Promise<PlayerIncentive[]> {
        if (!db) return []

        try {
            const query = db.collection(INCENTIVES_COLLECTION)
                .where("userId", "==", userId)
                .where("status", "==", "active")

            const snapshot = await query.get()
            const now = new Date()

            return snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                    expiresAt: doc.data().expiresAt?.toDate?.(),
                    usedAt: doc.data().usedAt?.toDate?.(),
                }) as PlayerIncentive)
                .filter(inc => !inc.expiresAt || inc.expiresAt > now)
        } catch (error) {
            console.error("Error getting incentives:", error)
            return []
        }
    },

    /**
     * Get best available discount for a booking amount
     */
    async getBestDiscount(userId: string, bookingAmount: number): Promise<PlayerIncentive | null> {
        const incentives = await this.getAvailableIncentives(userId)

        const eligible = incentives.filter(
            inc => !inc.minBookingAmount || bookingAmount >= inc.minBookingAmount
        )

        if (eligible.length === 0) return null

        // Return highest value discount
        return eligible.reduce((best, current) =>
            current.discountAmount > best.discountAmount ? current : best
        )
    },

    /**
     * Apply incentive to a booking
     */
    async redeemIncentive(
        incentiveId: string,
        userId: string,
        bookingId: string
    ): Promise<{ success: boolean; discountAmount: number }> {
        if (!db) return { success: false, discountAmount: 0 }

        try {
            const docRef = db.collection(INCENTIVES_COLLECTION).doc(incentiveId)
            const doc = await docRef.get()

            if (!doc.exists) return { success: false, discountAmount: 0 }

            const incentive = doc.data() as PlayerIncentive
            if (incentive.userId !== userId) return { success: false, discountAmount: 0 }
            if (incentive.status !== "active") return { success: false, discountAmount: 0 }

            // Mark as used
            await docRef.update({
                status: "used",
                usedAt: new Date(),
                usedOnBookingId: bookingId,
            })

            // Record redemption
            await db.collection(REDEMPTIONS_COLLECTION).add({
                incentiveId,
                userId,
                bookingId,
                discountAmount: incentive.discountAmount,
                createdAt: new Date(),
            })

            return { success: true, discountAmount: incentive.discountAmount }
        } catch (error) {
            console.error("Error redeeming incentive:", error)
            return { success: false, discountAmount: 0 }
        }
    },

    /**
     * Check if user has used first booking discount
     */
    async hasUsedFirstBooking(userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const query = db.collection(INCENTIVES_COLLECTION)
                .where("userId", "==", userId)
                .where("type", "==", "first_booking")
                .where("status", "==", "used")
                .limit(1)

            const snapshot = await query.get()
            return !snapshot.empty
        } catch (error) {
            console.error("Error checking first booking:", error)
            return false
        }
    },

    /**
     * Format discount for display
     */
    formatDiscount(cents: number): string {
        return `$${(cents / 100).toFixed(0)} off`
    },
}

export default playerIncentiveService
