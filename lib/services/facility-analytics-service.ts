/**
 * Facility Analytics Service
 * 
 * Aggregates real booking, revenue, and customer data from Firebase.
 * Used by Facility Manager dashboard for real-time analytics.
 */

import { db } from "../firebase-config"

const BOOKINGS_COLLECTION = "court_bookings"
const REVIEWS_COLLECTION = "venue_reviews"
const TRAINER_RENTALS_COLLECTION = "trainer_rentals"

// Types for analytics data
export type DailyRevenueData = {
    todayRevenue: number      // In dollars
    yesterdayRevenue: number
    bookingsToday: number
    percentChange: number
}

export type OccupancyData = {
    occupancyPercent: number
    totalSlots: number
    bookedSlots: number
    availableSlots: number
}

export type PopularTimesData = {
    hourlyData: { hour: number; bookings: number; revenue: number }[]
    peakHour: number
    quietHour: number
}

export type CustomerRetentionData = {
    newCustomers: number
    returningCustomers: number
    retentionRate: number
    avgVisitsPerCustomer: number
    churnRisk: number
}

export type BookingSourceData = {
    source: "app" | "website" | "phone" | "walk_in" | "referral" | "social"
    count: number
    revenue: number
}

export type RepeatBooker = {
    customerId: string
    customerName: string
    totalBookings: number
    totalSpent: number
    averagePerMonth: number
    favoriteSlots: string[]
    memberSince: Date
}

export type NoShowData = {
    records: {
        customerId: string
        customerName: string
        noShowCount: number
        lastNoShow: Date
        totalBookings: number
    }[]
    totalNoShows: number
}

export type CancellationData = {
    cancellations: {
        id: string
        courtName: string
        date: string
        time: string
        customerName: string
        cancelledAt: Date
        refundAmount?: number
        waitlistCount: number
    }[]
}

export type ReviewsData = {
    reviews: {
        id: string
        customerName: string
        rating: number
        text: string
        createdAt: Date
        responded: boolean
    }[]
    averageRating: number
    totalReviews: number
    unrepliedCount: number
}

export type CapacityAlert = {
    courtId: string
    courtName: string
    date: string
    capacityPercent: number
    bookedSlots: number
    totalSlots: number
    projectedToSellOut: boolean
}

export type TrainerRevenueData = {
    trainerId: string
    trainerName: string
    totalRevenue: number
    rentalsThisMonth: number
}

export type RevenueForecastData = {
    projectedMonthly: number
    confirmedRevenue: number
    pendingRevenue: number
    comparedToLastMonth: number
    confidenceLevel: number
}

// Maintenance Task Type
export type MaintenanceTask = {
    id: string
    title: string
    courtId: string
    courtName: string
    priority: "low" | "medium" | "high" | "urgent"
    status: "pending" | "in_progress" | "resolved"
    createdAt: Date
    assignedTo?: string
}

// Waitlist Type
export type WaitlistEntry = {
    id: string
    courtId: string
    courtName: string
    date: string
    time: string
    customerName: string
    customerEmail: string
    phone: string
    partySize: number
    joinedAt: Date
    status: "pending" | "notified" | "expired"
}

// Helper functions
function getDateString(date: Date): string {
    return date.toISOString().split("T")[0]
}

function getMonthStart(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
}

function getLastMonthStart(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() - 1, 1)
}

function getLastMonthEnd(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 0)
}

// Guard for db null check
function getDb() {
    if (!db) throw new Error("Firestore not initialized")
    return db
}

export const facilityAnalyticsService = {

    /**
     * Get daily revenue metrics
     */
    async getDailyRevenue(facilityId: string): Promise<DailyRevenueData> {
        try {
            const today = getDateString(new Date())
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = getDateString(yesterday)

            // Get today's bookings
            const todaySnapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("date", "==", today)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            // Get yesterday's bookings
            const yesterdaySnapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("date", "==", yesterdayStr)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            const todayRevenue = todaySnapshot.docs.reduce((sum, doc) => {
                const data = doc.data()
                return sum + (data.facilityPayout || 0)
            }, 0) / 100 // Convert cents to dollars

            const yesterdayRevenue = yesterdaySnapshot.docs.reduce((sum, doc) => {
                const data = doc.data()
                return sum + (data.facilityPayout || 0)
            }, 0) / 100

            const percentChange = yesterdayRevenue > 0
                ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                : 0

            return {
                todayRevenue,
                yesterdayRevenue,
                bookingsToday: todaySnapshot.size,
                percentChange,
            }
        } catch (error) {
            console.error("Error fetching daily revenue:", error)
            return {
                todayRevenue: 0,
                yesterdayRevenue: 0,
                bookingsToday: 0,
                percentChange: 0,
            }
        }
    },

    /**
     * Get occupancy rate for today
     */
    async getOccupancyRate(facilityId: string, totalSlots: number): Promise<OccupancyData> {
        try {
            const today = getDateString(new Date())

            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("date", "==", today)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            const bookedSlots = snapshot.size
            const availableSlots = Math.max(0, totalSlots - bookedSlots)
            const occupancyPercent = totalSlots > 0
                ? Math.round((bookedSlots / totalSlots) * 100)
                : 0

            return {
                occupancyPercent,
                totalSlots,
                bookedSlots,
                availableSlots,
            }
        } catch (error) {
            console.error("Error fetching occupancy rate:", error)
            return {
                occupancyPercent: 0,
                totalSlots,
                bookedSlots: 0,
                availableSlots: totalSlots,
            }
        }
    },

    /**
     * Get popular times data based on historical bookings
     */
    async getPopularTimes(facilityId: string): Promise<PopularTimesData> {
        try {
            // Get last 30 days of bookings
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", thirtyDaysAgo)
                .get()

            // Aggregate by hour
            const hourlyMap: Record<number, { bookings: number; revenue: number }> = {}

            // Initialize all hours
            for (let i = 0; i < 24; i++) {
                hourlyMap[i] = { bookings: 0, revenue: 0 }
            }

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                if (data.startTime) {
                    const hour = parseInt(data.startTime.split(":")[0], 10)
                    if (!isNaN(hour) && hour >= 0 && hour < 24) {
                        hourlyMap[hour].bookings += 1
                        hourlyMap[hour].revenue += (data.facilityPayout || 0) / 100
                    }
                }
            })

            const hourlyData = Object.entries(hourlyMap).map(([hour, data]) => ({
                hour: parseInt(hour, 10),
                bookings: data.bookings,
                revenue: Math.round(data.revenue),
            }))

            // Find peak and quiet hours (within business hours 6am-10pm)
            const businessHours = hourlyData.filter(h => h.hour >= 6 && h.hour <= 22)
            const peakHour = businessHours.reduce((max, h) =>
                h.bookings > max.bookings ? h : max, businessHours[0] || { hour: 18, bookings: 0 }
            ).hour
            const quietHour = businessHours.reduce((min, h) =>
                h.bookings < min.bookings ? h : min, businessHours[0] || { hour: 10, bookings: 0 }
            ).hour

            return {
                hourlyData,
                peakHour,
                quietHour,
            }
        } catch (error) {
            console.error("Error fetching popular times:", error)
            return {
                hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: i, bookings: 0, revenue: 0 })),
                peakHour: 18,
                quietHour: 10,
            }
        }
    },

    /**
     * Get customer retention metrics
     */
    async getCustomerRetention(facilityId: string): Promise<CustomerRetentionData> {
        try {
            const monthStart = getMonthStart()

            // Get all bookings for this month
            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", monthStart)
                .get()

            // Track unique customers and their booking counts
            const customerBookings: Record<string, { count: number; firstBooking: Date }> = {}

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                const userId = data.userId
                if (userId) {
                    if (!customerBookings[userId]) {
                        customerBookings[userId] = { count: 0, firstBooking: data.createdAt?.toDate?.() || new Date() }
                    }
                    customerBookings[userId].count += 1
                }
            })

            const customerIds = Object.keys(customerBookings)
            const totalCustomers = customerIds.length

            // Check which customers booked before this month
            let returningCount = 0
            for (const userId of customerIds) {
                const previousBooking = await getDb()
                    .collection(BOOKINGS_COLLECTION)
                    .where("facilityId", "==", facilityId)
                    .where("userId", "==", userId)
                    .where("createdAt", "<", monthStart)
                    .limit(1)
                    .get()

                if (!previousBooking.empty) {
                    returningCount++
                }
            }

            const newCustomers = totalCustomers - returningCount
            const retentionRate = totalCustomers > 0 ? Math.round((returningCount / totalCustomers) * 100) : 0

            // Calculate average visits
            const totalVisits = Object.values(customerBookings).reduce((sum, c) => sum + c.count, 0)
            const avgVisitsPerCustomer = totalCustomers > 0 ? totalVisits / totalCustomers : 0

            // Estimate churn risk (customers who haven't booked in last 14 days)
            const twoWeeksAgo = new Date()
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
            const churnRisk = Math.round(totalCustomers * 0.1) // Simplified - 10% of customer base

            return {
                newCustomers,
                returningCustomers: returningCount,
                retentionRate,
                avgVisitsPerCustomer: parseFloat(avgVisitsPerCustomer.toFixed(1)),
                churnRisk,
            }
        } catch (error) {
            console.error("Error fetching customer retention:", error)
            return {
                newCustomers: 0,
                returningCustomers: 0,
                retentionRate: 0,
                avgVisitsPerCustomer: 0,
                churnRisk: 0,
            }
        }
    },

    /**
     * Get booking sources breakdown
     */
    async getBookingSources(facilityId: string): Promise<BookingSourceData[]> {
        try {
            const monthStart = getMonthStart()

            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", monthStart)
                .get()

            const sourceMap: Record<string, { count: number; revenue: number }> = {
                app: { count: 0, revenue: 0 },
                website: { count: 0, revenue: 0 },
                phone: { count: 0, revenue: 0 },
                walk_in: { count: 0, revenue: 0 },
                referral: { count: 0, revenue: 0 },
                social: { count: 0, revenue: 0 },
            }

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                // Default to "app" if no source specified
                const source = data.bookingSource || "app"
                if (sourceMap[source]) {
                    sourceMap[source].count += 1
                    sourceMap[source].revenue += data.facilityPayout || 0
                }
            })

            return Object.entries(sourceMap)
                .map(([source, data]) => ({
                    source: source as BookingSourceData["source"],
                    count: data.count,
                    revenue: data.revenue,
                }))
                .filter(s => s.count > 0)
        } catch (error) {
            console.error("Error fetching booking sources:", error)
            return []
        }
    },

    /**
     * Get repeat bookers leaderboard
     */
    async getRepeatBookers(facilityId: string): Promise<RepeatBooker[]> {
        try {
            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            const customerMap: Record<string, {
                name: string
                bookings: number
                totalSpent: number
                slots: string[]
                firstBooking: Date
            }> = {}

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                const userId = data.userId
                if (userId) {
                    if (!customerMap[userId]) {
                        customerMap[userId] = {
                            name: data.userName || "Unknown",
                            bookings: 0,
                            totalSpent: 0,
                            slots: [],
                            firstBooking: data.createdAt?.toDate?.() || new Date(),
                        }
                    }
                    customerMap[userId].bookings += 1
                    customerMap[userId].totalSpent += data.facilityPayout || 0
                    if (data.startTime) {
                        customerMap[userId].slots.push(data.startTime)
                    }
                }
            })

            const now = new Date()
            return Object.entries(customerMap)
                .map(([customerId, data]) => {
                    const monthsSinceMember = Math.max(1,
                        Math.ceil((now.getTime() - data.firstBooking.getTime()) / (1000 * 60 * 60 * 24 * 30))
                    )
                    return {
                        customerId,
                        customerName: data.name,
                        totalBookings: data.bookings,
                        totalSpent: data.totalSpent,
                        averagePerMonth: parseFloat((data.bookings / monthsSinceMember).toFixed(1)),
                        favoriteSlots: [...new Set(data.slots)].slice(0, 3),
                        memberSince: data.firstBooking,
                    }
                })
                .filter(b => b.totalBookings >= 2) // Only repeat bookers
                .sort((a, b) => b.totalBookings - a.totalBookings)
                .slice(0, 20)
        } catch (error) {
            console.error("Error fetching repeat bookers:", error)
            return []
        }
    },

    /**
     * Get no-show statistics
     */
    async getNoShowStats(facilityId: string): Promise<NoShowData> {
        try {
            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("status", "==", "no-show")
                .get()

            const customerNoShows: Record<string, {
                name: string
                count: number
                lastNoShow: Date
                totalBookings: number
            }> = {}

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                const userId = data.userId
                if (userId) {
                    if (!customerNoShows[userId]) {
                        customerNoShows[userId] = {
                            name: data.userName || "Unknown",
                            count: 0,
                            lastNoShow: new Date(0),
                            totalBookings: 0,
                        }
                    }
                    customerNoShows[userId].count += 1
                    const bookingDate = data.createdAt?.toDate?.() || new Date()
                    if (bookingDate > customerNoShows[userId].lastNoShow) {
                        customerNoShows[userId].lastNoShow = bookingDate
                    }
                }
            })

            const records = Object.entries(customerNoShows)
                .map(([customerId, data]) => ({
                    customerId,
                    customerName: data.name,
                    noShowCount: data.count,
                    lastNoShow: data.lastNoShow,
                    totalBookings: data.totalBookings,
                }))
                .sort((a, b) => b.noShowCount - a.noShowCount)

            return {
                records,
                totalNoShows: snapshot.size,
            }
        } catch (error) {
            console.error("Error fetching no-show stats:", error)
            return { records: [], totalNoShows: 0 }
        }
    },

    /**
     * Get recent cancellations
     */
    async getRecentCancellations(facilityId: string): Promise<CancellationData> {
        try {
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("status", "==", "cancelled")
                .where("updatedAt", ">=", threeDaysAgo)
                .orderBy("updatedAt", "desc")
                .limit(10)
                .get()

            const cancellations = snapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    courtName: data.courtName || `Court`,
                    date: data.date || "",
                    time: data.startTime || "",
                    customerName: data.userName || "Unknown",
                    cancelledAt: data.updatedAt?.toDate?.() || new Date(),
                    refundAmount: data.refundAmount ? data.refundAmount / 100 : undefined,
                    waitlistCount: 0, // Would need separate waitlist query
                }
            })

            return { cancellations }
        } catch (error) {
            console.error("Error fetching cancellations:", error)
            return { cancellations: [] }
        }
    },

    /**
     * Get pending bookings count
     */
    async getPendingBookingsCount(facilityId: string): Promise<number> {
        try {
            const snapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("paymentStatus", "==", "pending")
                .get()

            return snapshot.size
        } catch (error) {
            console.error("Error fetching pending bookings:", error)
            return 0
        }
    },

    /**
     * Get facility reviews
     */
    async getFacilityReviews(venueId: string): Promise<ReviewsData> {
        try {
            const snapshot = await getDb()
                .collection(REVIEWS_COLLECTION)
                .where("venueId", "==", venueId)
                .where("status", "==", "visible")
                .orderBy("createdAt", "desc")
                .limit(10)
                .get()

            const reviews = snapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    customerName: data.userName || "Anonymous",
                    rating: data.rating || 5,
                    text: data.text || "",
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    responded: !!data.ownerResponse,
                }
            })

            const totalReviews = reviews.length
            const averageRating = totalReviews > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0
            const unrepliedCount = reviews.filter(r => !r.responded).length

            return {
                reviews,
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews,
                unrepliedCount,
            }
        } catch (error) {
            console.error("Error fetching reviews:", error)
            return { reviews: [], averageRating: 0, totalReviews: 0, unrepliedCount: 0 }
        }
    },

    /**
     * Get trainer revenue share
     */
    async getTrainerRevenueShare(facilityId: string): Promise<TrainerRevenueData[]> {
        try {
            const monthStart = getMonthStart()

            const snapshot = await getDb()
                .collection(TRAINER_RENTALS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", monthStart)
                .get()

            const trainerMap: Record<string, { name: string; revenue: number; rentals: number }> = {}

            snapshot.docs.forEach((doc) => {
                const data = doc.data()
                const trainerId = data.trainerId
                if (trainerId) {
                    if (!trainerMap[trainerId]) {
                        trainerMap[trainerId] = {
                            name: data.trainerName || "Unknown Trainer",
                            revenue: 0,
                            rentals: 0,
                        }
                    }
                    trainerMap[trainerId].revenue += (data.facilityRevenue || 0) / 100
                    trainerMap[trainerId].rentals += 1
                }
            })

            return Object.entries(trainerMap)
                .map(([trainerId, data]) => ({
                    trainerId,
                    trainerName: data.name,
                    totalRevenue: Math.round(data.revenue),
                    rentalsThisMonth: data.rentals,
                }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
        } catch (error) {
            console.error("Error fetching trainer revenue:", error)
            return []
        }
    },

    /**
     * Get capacity alerts for all courts
     */
    async getCapacityAlerts(facilityId: string, courts: { id: string; name: string }[]): Promise<CapacityAlert[]> {
        try {
            const today = getDateString(new Date())
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = getDateString(tomorrow)

            const alerts: CapacityAlert[] = []
            const slotsPerCourt = 8 // Assuming 8 hour slots per court

            for (const court of courts) {
                // Check today
                const todayBookings = await getDb()
                    .collection(BOOKINGS_COLLECTION)
                    .where("courtId", "==", court.id)
                    .where("date", "==", today)
                    .where("status", "==", "confirmed")
                    .get()

                const todayBooked = todayBookings.size
                const todayCapacity = Math.round((todayBooked / slotsPerCourt) * 100)

                if (todayCapacity >= 80) {
                    alerts.push({
                        courtId: court.id,
                        courtName: court.name,
                        date: today,
                        capacityPercent: Math.min(todayCapacity, 100),
                        bookedSlots: todayBooked,
                        totalSlots: slotsPerCourt,
                        projectedToSellOut: todayCapacity >= 95,
                    })
                }

                // Check tomorrow
                const tomorrowBookings = await getDb()
                    .collection(BOOKINGS_COLLECTION)
                    .where("courtId", "==", court.id)
                    .where("date", "==", tomorrowStr)
                    .where("status", "==", "confirmed")
                    .get()

                const tomorrowBooked = tomorrowBookings.size
                const tomorrowCapacity = Math.round((tomorrowBooked / slotsPerCourt) * 100)

                if (tomorrowCapacity >= 80) {
                    alerts.push({
                        courtId: court.id,
                        courtName: court.name,
                        date: tomorrowStr,
                        capacityPercent: Math.min(tomorrowCapacity, 100),
                        bookedSlots: tomorrowBooked,
                        totalSlots: slotsPerCourt,
                        projectedToSellOut: tomorrowCapacity >= 95,
                    })
                }
            }

            return alerts.sort((a, b) => b.capacityPercent - a.capacityPercent)
        } catch (error) {
            console.error("Error fetching capacity alerts:", error)
            return []
        }
    },

    /**
     * Get revenue forecast for the month
     */
    async getRevenueForecast(facilityId: string): Promise<RevenueForecastData> {
        try {
            const monthStart = getMonthStart()
            const lastMonthStart = getLastMonthStart()
            const lastMonthEnd = getLastMonthEnd()
            const now = new Date()
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
            const currentDay = now.getDate()

            // Get this month's confirmed bookings
            const confirmedSnapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", monthStart)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            const confirmedRevenue = confirmedSnapshot.docs.reduce((sum, doc) => {
                return sum + ((doc.data().facilityPayout || 0) / 100)
            }, 0)

            // Get pending bookings
            const pendingSnapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", monthStart)
                .where("paymentStatus", "==", "pending")
                .get()

            const pendingRevenue = pendingSnapshot.docs.reduce((sum, doc) => {
                return sum + ((doc.data().facilityPayout || 0) / 100)
            }, 0)

            // Get last month's total
            const lastMonthSnapshot = await getDb()
                .collection(BOOKINGS_COLLECTION)
                .where("facilityId", "==", facilityId)
                .where("createdAt", ">=", lastMonthStart)
                .where("createdAt", "<=", lastMonthEnd)
                .where("status", "in", ["confirmed", "completed"])
                .get()

            const lastMonthTotal = lastMonthSnapshot.docs.reduce((sum, doc) => {
                return sum + ((doc.data().facilityPayout || 0) / 100)
            }, 0)

            // Project monthly total based on current run rate
            const dailyRunRate = currentDay > 0 ? confirmedRevenue / currentDay : 0
            const projectedMonthly = Math.round(dailyRunRate * daysInMonth)

            // Calculate confidence (higher if more days passed)
            const confidenceLevel = Math.min(95, Math.round((currentDay / daysInMonth) * 100))

            // Compare to last month
            const comparedToLastMonth = lastMonthTotal > 0
                ? Math.round(((projectedMonthly - lastMonthTotal) / lastMonthTotal) * 100)
                : 0

            return {
                projectedMonthly,
                confirmedRevenue: Math.round(confirmedRevenue),
                pendingRevenue: Math.round(pendingRevenue),
                comparedToLastMonth,
                confidenceLevel,
            }
        } catch (error) {
            console.error("Error fetching revenue forecast:", error)
            return {
                projectedMonthly: 0,
                confirmedRevenue: 0,
                pendingRevenue: 0,
                comparedToLastMonth: 0,
                confidenceLevel: 0,
            }
        }
    },

    /**
     * Get open slots for sharing/promotion
     */
    async getOpenSlots(facilityId: string, courts: { id: string; name: string }[]): Promise<{ courtName: string; date: string; time: string }[]> {
        try {
            const today = getDateString(new Date())
            const allSlots: { courtName: string; date: string; time: string }[] = []

            // Business hours
            const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

            for (const court of courts) {
                const bookings = await getDb()
                    .collection(BOOKINGS_COLLECTION)
                    .where("courtId", "==", court.id)
                    .where("date", "==", today)
                    .where("status", "==", "confirmed")
                    .get()

                const bookedTimes = new Set(bookings.docs.map(doc => doc.data().startTime))

                hours.forEach(hour => {
                    if (!bookedTimes.has(hour)) {
                        allSlots.push({
                            courtName: court.name,
                            date: "Today",
                            time: hour,
                        })
                    }
                })
            }

            return allSlots.slice(0, 10) // Limit to 10 slots
        } catch (error) {
            console.error("Error fetching open slots:", error)
            return []
        }
    },

    /**
     * Get maintenance tasks
     */
    async getMaintenanceTasks(facilityId: string): Promise<MaintenanceTask[]> {
        try {
            const snapshot = await getDb()
                .collection("facility_maintenance")
                .where("facilityId", "==", facilityId)
                .where("status", "in", ["pending", "in_progress"])
                .orderBy("createdAt", "desc")
                .get()

            return snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    title: data.title || "Maintenance",
                    courtId: data.courtId,
                    courtName: data.courtName || "General",
                    priority: data.priority || "medium",
                    status: data.status || "pending",
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    assignedTo: data.assignedTo,
                } as MaintenanceTask
            })
        } catch (error) {
            console.error("Error fetching maintenance tasks:", error)
            return []
        }
    },

    /**
     * Get waitlist entries
     */
    async getWaitlist(facilityId: string): Promise<WaitlistEntry[]> {
        try {
            const snapshot = await getDb()
                .collection("facility_waitlist")
                .where("facilityId", "==", facilityId)
                .where("status", "==", "pending")
                .orderBy("joinedAt", "asc")
                .get()

            return snapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    courtId: data.courtId,
                    courtName: data.courtName || "Any Court",
                    date: data.date,
                    time: data.time,
                    customerName: data.customerName || "Guest",
                    customerEmail: data.customerEmail,
                    phone: data.phone,
                    partySize: data.partySize || 2,
                    joinedAt: data.joinedAt?.toDate?.() || new Date(),
                    status: data.status || "pending",
                } as WaitlistEntry
            })
        } catch (error) {
            console.error("Error fetching waitlist:", error)
            return []
        }
    },
}

export default facilityAnalyticsService
