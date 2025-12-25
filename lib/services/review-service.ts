/**
 * Review Service
 * Handles ratings and reviews for venues
 */

import { db } from "../firebase-config"

const REVIEWS_COLLECTION = "venue_reviews"
const VENUES_COLLECTION = "venues"

export interface Review {
    id: string

    // What's being reviewed
    venueId: string
    venueName?: string

    // Who wrote it
    userId: string
    userName: string
    userPhoto?: string

    // Content
    rating: number // 1-5 stars
    text: string

    // Optional tags
    tags?: ("clean" | "great-courts" | "friendly-staff" | "easy-booking" | "good-value")[]

    // Response from owner
    ownerResponse?: string
    ownerRespondedAt?: Date

    // Verification
    hasVerifiedBooking: boolean // Booked through GoodRunss
    bookingId?: string

    // Helpful votes
    helpfulCount: number

    // Status
    status: "visible" | "flagged" | "removed"

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

export interface VenueRatingSummary {
    averageRating: number
    totalReviews: number
    distribution: {
        5: number
        4: number
        3: number
        2: number
        1: number
    }
}

export const reviewService = {
    /**
     * Create a new review
     */
    async createReview(data: {
        venueId: string
        venueName?: string
        userId: string
        userName: string
        userPhoto?: string
        rating: number
        text: string
        tags?: Review["tags"]
        bookingId?: string
    }): Promise<string | null> {
        if (!db) return null

        try {
            // Check if user already reviewed this venue
            const existingQuery = db.collection(REVIEWS_COLLECTION)
                .where("venueId", "==", data.venueId)
                .where("userId", "==", data.userId)
                .where("status", "==", "visible")
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) {
                console.warn("User already reviewed this venue")
                return null
            }

            // Check if user has a verified booking
            let hasVerifiedBooking = false
            if (data.bookingId) {
                hasVerifiedBooking = true
            } else {
                // Check if they've ever booked here
                const bookingQuery = db.collection("court_bookings")
                    .where("venueId", "==", data.venueId)
                    .where("userId", "==", data.userId)
                    .where("status", "==", "completed")
                    .limit(1)

                const bookingCheck = await bookingQuery.get()
                hasVerifiedBooking = !bookingCheck.empty
            }

            const review: Omit<Review, "id"> = {
                venueId: data.venueId,
                venueName: data.venueName,
                userId: data.userId,
                userName: data.userName,
                userPhoto: data.userPhoto,
                rating: Math.min(5, Math.max(1, Math.round(data.rating))),
                text: data.text,
                tags: data.tags,
                hasVerifiedBooking,
                bookingId: data.bookingId,
                helpfulCount: 0,
                status: "visible",
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(REVIEWS_COLLECTION).add(review)

            // Update venue's cached rating
            await this.updateVenueRating(data.venueId)

            return docRef.id
        } catch (error) {
            console.error("Error creating review:", error)
            return null
        }
    },

    /**
     * Get reviews for a venue
     */
    async getVenueReviews(
        venueId: string,
        options?: {
            limit?: number
            sortBy?: "recent" | "helpful" | "highest" | "lowest"
        }
    ): Promise<Review[]> {
        if (!db) return []

        try {
            let query = db.collection(REVIEWS_COLLECTION)
                .where("venueId", "==", venueId)
                .where("status", "==", "visible")

            const sortBy = options?.sortBy || "recent"
            switch (sortBy) {
                case "helpful":
                    query = query.orderBy("helpfulCount", "desc")
                    break
                case "highest":
                    query = query.orderBy("rating", "desc")
                    break
                case "lowest":
                    query = query.orderBy("rating", "asc")
                    break
                case "recent":
                default:
                    query = query.orderBy("createdAt", "desc")
            }

            if (options?.limit) {
                query = query.limit(options.limit)
            }

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
                ownerRespondedAt: doc.data().ownerRespondedAt?.toDate?.(),
            })) as Review[]
        } catch (error) {
            console.error("Error getting venue reviews:", error)
            return []
        }
    },

    /**
     * Get rating summary for a venue
     */
    async getVenueRatingSummary(venueId: string): Promise<VenueRatingSummary> {
        if (!db) return {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        }

        try {
            const query = db.collection(REVIEWS_COLLECTION)
                .where("venueId", "==", venueId)
                .where("status", "==", "visible")

            const snapshot = await query.get()

            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            let totalRating = 0

            snapshot.docs.forEach(doc => {
                const rating = doc.data().rating as 1 | 2 | 3 | 4 | 5
                distribution[rating]++
                totalRating += rating
            })

            return {
                averageRating: snapshot.size > 0 ? Math.round((totalRating / snapshot.size) * 10) / 10 : 0,
                totalReviews: snapshot.size,
                distribution,
            }
        } catch (error) {
            console.error("Error getting rating summary:", error)
            return {
                averageRating: 0,
                totalReviews: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            }
        }
    },

    /**
     * Update venue's cached rating (called after new review)
     */
    async updateVenueRating(venueId: string): Promise<void> {
        if (!db) return

        try {
            const summary = await this.getVenueRatingSummary(venueId)

            // Update venue document with cached rating
            await db.collection(VENUES_COLLECTION).doc(venueId).update({
                averageRating: summary.averageRating,
                totalReviews: summary.totalReviews,
                updatedAt: new Date(),
            })
        } catch (error) {
            // Venue might not exist in venues collection (external data)
            console.log("Could not update venue rating cache:", error)
        }
    },

    /**
     * Mark a review as helpful
     */
    async markHelpful(reviewId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            // Check if user already marked this review
            const helpfulRef = db.collection(REVIEWS_COLLECTION).doc(reviewId).collection("helpful").doc(userId)
            const helpfulDoc = await helpfulRef.get()

            if (helpfulDoc.exists) {
                // Already marked, remove it
                await helpfulRef.delete()
                await db.collection(REVIEWS_COLLECTION).doc(reviewId).update({
                    helpfulCount: (await db.collection(REVIEWS_COLLECTION).doc(reviewId).get()).data()?.helpfulCount - 1,
                })
            } else {
                // Mark as helpful
                await helpfulRef.set({ createdAt: new Date() })
                await db.collection(REVIEWS_COLLECTION).doc(reviewId).update({
                    helpfulCount: (await db.collection(REVIEWS_COLLECTION).doc(reviewId).get()).data()?.helpfulCount + 1,
                })
            }

            return true
        } catch (error) {
            console.error("Error marking helpful:", error)
            return false
        }
    },

    /**
     * Owner responds to a review
     */
    async addOwnerResponse(
        reviewId: string,
        ownerId: string,
        venueId: string,
        response: string
    ): Promise<boolean> {
        if (!db) return false

        try {
            // Verify owner owns this venue
            const facilityQuery = db.collection("claimed_facilities")
                .where("venueId", "==", venueId)
                .where("ownerId", "==", ownerId)
                .limit(1)

            const facilityCheck = await facilityQuery.get()
            if (facilityCheck.empty) return false

            await db.collection(REVIEWS_COLLECTION).doc(reviewId).update({
                ownerResponse: response,
                ownerRespondedAt: new Date(),
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error adding owner response:", error)
            return false
        }
    },

    /**
     * Flag a review for moderation
     */
    async flagReview(reviewId: string, userId: string, reason: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(REVIEWS_COLLECTION).doc(reviewId).collection("flags").add({
                userId,
                reason,
                createdAt: new Date(),
            })

            // After 3 flags, automatically change status
            const flagsSnapshot = await db.collection(REVIEWS_COLLECTION).doc(reviewId).collection("flags").get()
            if (flagsSnapshot.size >= 3) {
                await db.collection(REVIEWS_COLLECTION).doc(reviewId).update({
                    status: "flagged",
                    updatedAt: new Date(),
                })
            }

            return true
        } catch (error) {
            console.error("Error flagging review:", error)
            return false
        }
    },

    /**
     * Get user's reviews
     */
    async getUserReviews(userId: string): Promise<Review[]> {
        if (!db) return []

        try {
            const query = db.collection(REVIEWS_COLLECTION)
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as Review[]
        } catch (error) {
            console.error("Error getting user reviews:", error)
            return []
        }
    },

    /**
     * Delete own review
     */
    async deleteReview(reviewId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(REVIEWS_COLLECTION).doc(reviewId)
            const doc = await docRef.get()

            if (!doc.exists || doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "removed",
                updatedAt: new Date(),
            })

            // Update venue rating
            const venueId = doc.data()?.venueId
            if (venueId) {
                await this.updateVenueRating(venueId)
            }

            return true
        } catch (error) {
            console.error("Error deleting review:", error)
            return false
        }
    },
}

export default reviewService
