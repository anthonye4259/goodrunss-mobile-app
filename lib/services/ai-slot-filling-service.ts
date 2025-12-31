/**
 * AI Slot Filling Service
 * 
 * Intelligently fills empty court slots using:
 * - Empty slot detection (next 24-48 hours)
 * - Dynamic discount suggestions
 * - Push notification triggers
 * - Conversion tracking
 */

import { db } from "../firebase-config"

// Types
export interface EmptySlot {
    courtId: string
    courtName: string
    facilityId: string
    facilityName: string
    date: string // YYYY-MM-DD
    startTime: string // HH:MM
    endTime: string // HH:MM
    regularPrice: number
    hoursUntilSlot: number
}

export interface SlotSuggestion {
    slot: EmptySlot
    suggestedDiscount: number // Percentage (0-50)
    suggestedPrice: number
    urgency: "low" | "medium" | "high" | "urgent"
    reason: string
    expectedFillRate: number // 0-100
}

export interface PromotionCampaign {
    id: string
    facilityId: string
    slots: EmptySlot[]
    discount: number
    message: string
    targetAudience: "nearby" | "previous_bookers" | "all"
    sentAt?: Date
    conversions: number
    revenue: number
}

// AI configuration
const AI_CONFIG = {
    // Hours before slot to apply discount tiers
    urgencyThresholds: {
        urgent: 4,   // 4 hours - max discount
        high: 12,    // 12 hours
        medium: 24,  // 24 hours
        low: 48,     // 48 hours - minimal discount
    },
    // Discount percentages by urgency
    discountTiers: {
        urgent: 40,  // 40% off
        high: 30,    // 30% off
        medium: 20,  // 20% off
        low: 10,     // 10% off
    },
    // Minimum discount to make an impact
    minDiscount: 10,
    maxDiscount: 50,
}

export const aiSlotFillingService = {
    /**
     * Get empty slots for a facility in the next N hours
     */
    async getEmptySlots(facilityId: string, hoursAhead: number = 48): Promise<EmptySlot[]> {
        if (!db) return []

        try {
            // Get facility courts
            const courtsSnapshot = await db.collection("courts")
                .where("facilityId", "==", facilityId)
                .get()

            if (courtsSnapshot.empty) return []

            const courts = courtsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Get existing bookings for time range
            const now = new Date()
            const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

            const bookingsSnapshot = await db.collection("court_bookings")
                .where("facilityId", "==", facilityId)
                .where("date", ">=", now.toISOString().split("T")[0])
                .where("date", "<=", endTime.toISOString().split("T")[0])
                .where("status", "in", ["confirmed", "pending"])
                .get()

            const bookedSlots = new Set(
                bookingsSnapshot.docs.map(doc => {
                    const data = doc.data()
                    return `${data.courtId}-${data.date}-${data.startTime}`
                })
            )

            // Generate empty slots
            const emptySlots: EmptySlot[] = []
            const operatingHours = { start: 6, end: 22 } // 6 AM to 10 PM

            for (let day = 0; day < Math.ceil(hoursAhead / 24); day++) {
                const date = new Date(now)
                date.setDate(date.getDate() + day)
                const dateStr = date.toISOString().split("T")[0]

                for (const court of courts) {
                    for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
                        const startTime = `${hour.toString().padStart(2, "0")}:00`
                        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`
                        const slotKey = `${court.id}-${dateStr}-${startTime}`

                        // Skip if already booked
                        if (bookedSlots.has(slotKey)) continue

                        // Skip if slot is in the past
                        const slotDateTime = new Date(`${dateStr}T${startTime}`)
                        if (slotDateTime <= now) continue

                        const hoursUntilSlot = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

                        emptySlots.push({
                            courtId: court.id,
                            courtName: (court as any).name || `Court ${court.id.slice(-4)}`,
                            facilityId,
                            facilityName: "", // Will be filled by caller
                            date: dateStr,
                            startTime,
                            endTime,
                            regularPrice: (court as any).hourlyRate / 100 || 45,
                            hoursUntilSlot,
                        })
                    }
                }
            }

            return emptySlots.sort((a, b) => a.hoursUntilSlot - b.hoursUntilSlot)
        } catch (error) {
            console.error("Error getting empty slots:", error)
            return []
        }
    },

    /**
     * Generate AI suggestions for filling empty slots
     */
    generateSuggestions(emptySlots: EmptySlot[]): SlotSuggestion[] {
        return emptySlots.map(slot => {
            // Determine urgency based on hours until slot
            let urgency: "low" | "medium" | "high" | "urgent" = "low"
            if (slot.hoursUntilSlot <= AI_CONFIG.urgencyThresholds.urgent) {
                urgency = "urgent"
            } else if (slot.hoursUntilSlot <= AI_CONFIG.urgencyThresholds.high) {
                urgency = "high"
            } else if (slot.hoursUntilSlot <= AI_CONFIG.urgencyThresholds.medium) {
                urgency = "medium"
            }

            // Calculate discount based on urgency
            const baseDiscount = AI_CONFIG.discountTiers[urgency]

            // Add modifiers
            let discount = baseDiscount

            // Weekend bonus (more demand, less discount needed)
            const date = new Date(slot.date)
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            if (isWeekend) {
                discount = Math.max(AI_CONFIG.minDiscount, discount - 10)
            }

            // Peak hours (5-8 PM) need less discount
            const hour = parseInt(slot.startTime.split(":")[0])
            const isPeakHour = hour >= 17 && hour <= 20
            if (isPeakHour) {
                discount = Math.max(AI_CONFIG.minDiscount, discount - 5)
            }

            // Cap discount
            discount = Math.min(AI_CONFIG.maxDiscount, Math.max(AI_CONFIG.minDiscount, discount))

            const suggestedPrice = slot.regularPrice * (1 - discount / 100)

            // Calculate expected fill rate
            const expectedFillRate = Math.min(95, 50 + discount * 1.5)

            // Generate reason
            let reason = ""
            if (urgency === "urgent") {
                reason = "Slot is in less than 4 hours - high discount recommended"
            } else if (urgency === "high") {
                reason = "Slot is today - moderate discount to fill quickly"
            } else if (isPeakHour) {
                reason = "Peak hour slot - minimal discount should work"
            } else if (isWeekend) {
                reason = "Weekend demand is high - standard discount"
            } else {
                reason = "Off-peak slot - consider early-bird deal"
            }

            return {
                slot,
                suggestedDiscount: discount,
                suggestedPrice: Math.round(suggestedPrice),
                urgency,
                reason,
                expectedFillRate: Math.round(expectedFillRate),
            }
        })
    },

    /**
     * Get top priority slots to fill (most urgent)
     */
    getTopPrioritySlots(suggestions: SlotSuggestion[], limit: number = 5): SlotSuggestion[] {
        // Sort by urgency (urgent first) then by hours until slot
        const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 }

        return [...suggestions]
            .sort((a, b) => {
                const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
                if (urgencyDiff !== 0) return urgencyDiff
                return a.slot.hoursUntilSlot - b.slot.hoursUntilSlot
            })
            .slice(0, limit)
    },

    /**
     * Generate promotion message for a set of slots
     */
    generatePromotionMessage(slots: SlotSuggestion[], facilityName: string): string {
        if (slots.length === 0) return ""

        const avgDiscount = Math.round(
            slots.reduce((sum, s) => sum + s.suggestedDiscount, 0) / slots.length
        )

        if (slots.length === 1) {
            const slot = slots[0]
            return `Flash Deal: ${slot.slot.courtName} at ${facilityName} - ${slot.suggestedDiscount}% off today at ${slot.slot.startTime}! Book now`
        }

        return `${slots.length} slots available at ${facilityName} with up to ${avgDiscount}% off! Limited time`
    },

    /**
     * Calculate potential revenue from filled slots
     */
    calculatePotentialRevenue(slots: SlotSuggestion[]): {
        regularRevenue: number
        discountedRevenue: number
        lostIfUnfilled: number
    } {
        const regularRevenue = slots.reduce((sum, s) => sum + s.slot.regularPrice, 0)
        const discountedRevenue = slots.reduce((sum, s) => sum + s.suggestedPrice, 0)

        return {
            regularRevenue: Math.round(regularRevenue),
            discountedRevenue: Math.round(discountedRevenue),
            lostIfUnfilled: Math.round(regularRevenue),
        }
    },

    /**
     * Get AI insights summary for dashboard
     */
    async getAIInsights(facilityId: string): Promise<{
        emptySlots24h: number
        emptySlots48h: number
        potentialRevenue: number
        topSuggestions: SlotSuggestion[]
        urgentSlots: number
    }> {
        const emptySlots = await this.getEmptySlots(facilityId, 48)
        const suggestions = this.generateSuggestions(emptySlots)
        const topSuggestions = this.getTopPrioritySlots(suggestions, 3)
        const { discountedRevenue } = this.calculatePotentialRevenue(suggestions)

        return {
            emptySlots24h: emptySlots.filter(s => s.hoursUntilSlot <= 24).length,
            emptySlots48h: emptySlots.length,
            potentialRevenue: discountedRevenue,
            topSuggestions,
            urgentSlots: suggestions.filter(s => s.urgency === "urgent" || s.urgency === "high").length,
        }
    },
}

export default aiSlotFillingService
