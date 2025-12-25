/**
 * Class Service
 * Handles wellness class scheduling and booking for studios
 * 
 * Used for: Pilates, Yoga (class-based booking)
 * Different from court booking (hourly rental)
 */

import { db } from "../firebase-config"

const CLASSES_COLLECTION = "studio_classes"
const CLASS_BOOKINGS_COLLECTION = "class_bookings"

// Player booking fee
export const CLASS_BOOKING_FEE = 300 // $3.00
export const CLASS_TAKE_RATE = 0.08 // 8%

/**
 * Studio class definition
 */
export interface StudioClass {
    id: string
    facilityId: string
    venueId: string

    // Class details
    name: string // "Morning Flow Yoga", "Power Pilates"
    description?: string
    type: "yoga" | "pilates" | "other"
    instructor?: string

    // Schedule
    dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
    startTime: string // "09:00"
    duration: number // minutes (45, 60, 75, 90)

    // Capacity
    maxSpots: number // e.g., 20
    bookedSpots: number // current booking count

    // Pricing (in cents)
    pricePerSpot: number // e.g., 2500 = $25

    // Status
    isActive: boolean
    isRecurring: boolean // repeats weekly

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

/**
 * Class booking (player's reservation)
 */
export interface ClassBooking {
    id: string
    classId: string
    facilityId: string
    venueId: string
    userId: string

    // User info
    userName: string
    userEmail?: string

    // Class info (denormalized for easy display)
    className: string
    classDate: string // "2025-12-25" (specific date)
    classTime: string // "09:00"
    classDuration: number
    instructor?: string

    // Pricing (in cents)
    classPrice: number
    bookingFee: number // $3
    totalCharged: number
    facilityPayout: number // 92% of class price

    // Payment
    stripePaymentIntentId?: string
    paymentStatus: "pending" | "paid" | "failed" | "refunded"

    // Status
    status: "confirmed" | "cancelled" | "attended" | "no-show"

    // Timestamps
    createdAt: Date
    updatedAt: Date
}

/**
 * Day names for display
 */
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const classService = {
    /**
     * Calculate pricing for a class booking
     */
    calculatePricing(pricePerSpot: number): {
        classPrice: number
        bookingFee: number
        takeAmount: number
        facilityPayout: number
        totalCharged: number
    } {
        const classPrice = pricePerSpot
        const bookingFee = CLASS_BOOKING_FEE
        const takeAmount = Math.round(classPrice * CLASS_TAKE_RATE)
        const facilityPayout = classPrice - takeAmount
        const totalCharged = classPrice + bookingFee

        return {
            classPrice,
            bookingFee,
            takeAmount,
            facilityPayout,
            totalCharged,
        }
    },

    /**
     * Create a new class (by studio owner)
     */
    async createClass(
        classData: Omit<StudioClass, "id" | "bookedSpots" | "createdAt" | "updatedAt">
    ): Promise<string | null> {
        if (!db) return null

        try {
            const newClass: Omit<StudioClass, "id"> = {
                ...classData,
                bookedSpots: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(CLASSES_COLLECTION).add(newClass)
            return docRef.id
        } catch (error) {
            console.error("Error creating class:", error)
            return null
        }
    },

    /**
     * Get all classes for a facility
     */
    async getClasses(facilityId: string): Promise<StudioClass[]> {
        if (!db) return []

        try {
            const query = db.collection(CLASSES_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("isActive", "==", true)
                .orderBy("dayOfWeek")
                .orderBy("startTime")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as StudioClass[]
        } catch (error) {
            console.error("Error getting classes:", error)
            return []
        }
    },

    /**
     * Get classes for a venue (by venue ID)
     */
    async getVenueClasses(venueId: string): Promise<StudioClass[]> {
        if (!db) return []

        try {
            const query = db.collection(CLASSES_COLLECTION)
                .where("venueId", "==", venueId)
                .where("isActive", "==", true)
                .orderBy("dayOfWeek")
                .orderBy("startTime")

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as StudioClass[]
        } catch (error) {
            console.error("Error getting venue classes:", error)
            return []
        }
    },

    /**
     * Update class details
     */
    async updateClass(
        classId: string,
        updates: Partial<Omit<StudioClass, "id" | "createdAt">>
    ): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(CLASSES_COLLECTION).doc(classId).update({
                ...updates,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error updating class:", error)
            return false
        }
    },

    /**
     * Delete (deactivate) a class
     */
    async deleteClass(classId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(CLASSES_COLLECTION).doc(classId).update({
                isActive: false,
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error deleting class:", error)
            return false
        }
    },

    /**
     * Get available spots for a class on a specific date
     */
    async getAvailableSpots(classId: string, date: string): Promise<number> {
        if (!db) return 0

        try {
            // Get class max capacity
            const classDoc = await db.collection(CLASSES_COLLECTION).doc(classId).get()
            if (!classDoc.exists) return 0

            const studioClass = classDoc.data() as StudioClass
            const maxSpots = studioClass.maxSpots

            // Count existing bookings for this class on this date
            const bookingsQuery = db.collection(CLASS_BOOKINGS_COLLECTION)
                .where("classId", "==", classId)
                .where("classDate", "==", date)
                .where("status", "in", ["confirmed", "attended"])

            const bookingsSnapshot = await bookingsQuery.get()
            const bookedCount = bookingsSnapshot.size

            return Math.max(0, maxSpots - bookedCount)
        } catch (error) {
            console.error("Error getting available spots:", error)
            return 0
        }
    },

    /**
     * Book a spot in a class
     */
    async bookClassSpot(
        bookingData: {
            classId: string
            facilityId: string
            venueId: string
            userId: string
            userName: string
            userEmail?: string
            className: string
            classDate: string
            classTime: string
            classDuration: number
            instructor?: string
            classPrice: number
            stripePaymentIntentId?: string
        }
    ): Promise<string | null> {
        if (!db) return null

        try {
            // Check if spots available
            const availableSpots = await this.getAvailableSpots(bookingData.classId, bookingData.classDate)
            if (availableSpots <= 0) {
                console.warn("No spots available")
                return null
            }

            // Check if user already booked this class on this date
            const existingQuery = db.collection(CLASS_BOOKINGS_COLLECTION)
                .where("classId", "==", bookingData.classId)
                .where("classDate", "==", bookingData.classDate)
                .where("userId", "==", bookingData.userId)
                .where("status", "==", "confirmed")
                .limit(1)

            const existing = await existingQuery.get()
            if (!existing.empty) {
                console.warn("User already booked this class")
                return null
            }

            // Calculate pricing
            const pricing = this.calculatePricing(bookingData.classPrice)

            const booking: Omit<ClassBooking, "id"> = {
                classId: bookingData.classId,
                facilityId: bookingData.facilityId,
                venueId: bookingData.venueId,
                userId: bookingData.userId,
                userName: bookingData.userName,
                userEmail: bookingData.userEmail,
                className: bookingData.className,
                classDate: bookingData.classDate,
                classTime: bookingData.classTime,
                classDuration: bookingData.classDuration,
                instructor: bookingData.instructor,
                classPrice: pricing.classPrice,
                bookingFee: pricing.bookingFee,
                totalCharged: pricing.totalCharged,
                facilityPayout: pricing.facilityPayout,
                stripePaymentIntentId: bookingData.stripePaymentIntentId,
                paymentStatus: bookingData.stripePaymentIntentId ? "paid" : "pending",
                status: "confirmed",
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await db.collection(CLASS_BOOKINGS_COLLECTION).add(booking)
            return docRef.id
        } catch (error) {
            console.error("Error booking class spot:", error)
            return null
        }
    },

    /**
     * Get player's class bookings
     */
    async getPlayerClassBookings(userId: string): Promise<ClassBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(CLASS_BOOKINGS_COLLECTION)
                .where("userId", "==", userId)
                .orderBy("classDate", "desc")
                .limit(50)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as ClassBooking[]
        } catch (error) {
            console.error("Error getting player class bookings:", error)
            return []
        }
    },

    /**
     * Get facility's class bookings
     */
    async getFacilityClassBookings(facilityId: string): Promise<ClassBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(CLASS_BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .orderBy("classDate", "desc")
                .limit(100)

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as ClassBooking[]
        } catch (error) {
            console.error("Error getting facility class bookings:", error)
            return []
        }
    },

    /**
     * Cancel a class booking
     */
    async cancelBooking(bookingId: string, userId: string): Promise<boolean> {
        if (!db) return false

        try {
            const docRef = db.collection(CLASS_BOOKINGS_COLLECTION).doc(bookingId)
            const doc = await docRef.get()

            if (!doc.exists) return false
            if (doc.data()?.userId !== userId) return false

            await docRef.update({
                status: "cancelled",
                paymentStatus: "refunded",
                updatedAt: new Date(),
            })

            return true
        } catch (error) {
            console.error("Error cancelling booking:", error)
            return false
        }
    },

    /**
     * Mark attendance
     */
    async markAttended(bookingId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(CLASS_BOOKINGS_COLLECTION).doc(bookingId).update({
                status: "attended",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error marking attended:", error)
            return false
        }
    },

    /**
     * Mark no-show
     */
    async markNoShow(bookingId: string): Promise<boolean> {
        if (!db) return false

        try {
            await db.collection(CLASS_BOOKINGS_COLLECTION).doc(bookingId).update({
                status: "no-show",
                updatedAt: new Date(),
            })
            return true
        } catch (error) {
            console.error("Error marking no-show:", error)
            return false
        }
    },

    /**
     * Get bookings for a specific class on a specific date
     */
    async getClassBookings(classId: string, date: string): Promise<ClassBooking[]> {
        if (!db) return []

        try {
            const query = db.collection(CLASS_BOOKINGS_COLLECTION)
                .where("classId", "==", classId)
                .where("classDate", "==", date)
                .where("status", "in", ["confirmed", "attended"])

            const snapshot = await query.get()
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            })) as ClassBooking[]
        } catch (error) {
            console.error("Error getting class bookings:", error)
            return []
        }
    },
}

export default classService
