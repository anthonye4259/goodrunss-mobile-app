/**
 * Fee Calculation Service
 * 
 * Calculates platform fees and booking fees based on client-trainer relationship:
 * 
 * | Booking Type          | Platform Fee | Player Booking Fee |
 * |-----------------------|--------------|-------------------|
 * | Existing client       | 0%           | $1                |
 * | Marketplace (new)     | 15%          | $3                |
 * | Repeat (marketplace)  | 5%           | $1                |
 */

import { determineBookingFeeType, BookingFeeType } from "./client-relationship-service"

// Fee structure (all amounts in cents)
export const FEE_RATES = {
    existing: {
        platformPercent: 0,
        bookingFeeCents: 100,  // $1
        label: "Existing Client",
        description: "0% platform fee for your existing clients",
    },
    repeat: {
        platformPercent: 5,
        bookingFeeCents: 100,  // $1
        label: "Repeat Client",
        description: "5% platform fee for returning clients",
    },
    marketplace: {
        platformPercent: 15,
        bookingFeeCents: 300,  // $3
        label: "New Client",
        description: "15% platform fee for new marketplace clients",
    },
} as const

export interface FeeCalculation {
    // Input
    sessionPrice: number             // Trainer's rate in cents
    feeType: BookingFeeType          // existing, marketplace, or repeat

    // Platform fee
    platformFeePercent: number       // 0, 5, or 15
    platformFeeAmount: number        // In cents

    // Player booking fee
    playerBookingFee: number         // $1 or $3 in cents (100 or 300)

    // Totals
    totalCharge: number              // What player pays (session + booking fee)
    trainerPayout: number            // What trainer receives (session - platform fee)

    // Display
    feeLabel: string
    feeDescription: string
}

/**
 * Calculate all fees for a booking
 * 
 * @param trainerId - Trainer ID
 * @param clientId - Client ID  
 * @param sessionPriceCents - Trainer's session price in cents
 * @returns Fee calculation with all amounts
 */
export async function calculateBookingFees(
    trainerId: string,
    clientId: string,
    sessionPriceCents: number
): Promise<FeeCalculation> {
    // Determine fee type based on relationship
    const feeType = await determineBookingFeeType(trainerId, clientId)
    const rates = FEE_RATES[feeType]

    // Calculate platform fee
    const platformFeeAmount = Math.round(sessionPriceCents * (rates.platformPercent / 100))

    // Trainer payout = session price - platform fee
    const trainerPayout = sessionPriceCents - platformFeeAmount

    // Total charge to player = session price + booking fee
    const totalCharge = sessionPriceCents + rates.bookingFeeCents

    return {
        sessionPrice: sessionPriceCents,
        feeType,
        platformFeePercent: rates.platformPercent,
        platformFeeAmount,
        playerBookingFee: rates.bookingFeeCents,
        totalCharge,
        trainerPayout,
        feeLabel: rates.label,
        feeDescription: rates.description,
    }
}

/**
 * Calculate fees without async relationship lookup
 * Useful when fee type is already known
 */
export function calculateFeesSync(
    sessionPriceCents: number,
    feeType: BookingFeeType
): FeeCalculation {
    const rates = FEE_RATES[feeType]

    const platformFeeAmount = Math.round(sessionPriceCents * (rates.platformPercent / 100))
    const trainerPayout = sessionPriceCents - platformFeeAmount
    const totalCharge = sessionPriceCents + rates.bookingFeeCents

    return {
        sessionPrice: sessionPriceCents,
        feeType,
        platformFeePercent: rates.platformPercent,
        platformFeeAmount,
        playerBookingFee: rates.bookingFeeCents,
        totalCharge,
        trainerPayout,
        feeLabel: rates.label,
        feeDescription: rates.description,
    }
}

/**
 * Format fee for display
 */
export function formatFeeBreakdown(fees: FeeCalculation): {
    sessionPriceDisplay: string
    bookingFeeDisplay: string
    totalDisplay: string
    trainerPayoutDisplay: string
    platformFeeDisplay: string
} {
    return {
        sessionPriceDisplay: `$${(fees.sessionPrice / 100).toFixed(2)}`,
        bookingFeeDisplay: `$${(fees.playerBookingFee / 100).toFixed(2)}`,
        totalDisplay: `$${(fees.totalCharge / 100).toFixed(2)}`,
        trainerPayoutDisplay: `$${(fees.trainerPayout / 100).toFixed(2)}`,
        platformFeeDisplay: fees.platformFeeAmount > 0
            ? `$${(fees.platformFeeAmount / 100).toFixed(2)} (${fees.platformFeePercent}%)`
            : "Free",
    }
}

/**
 * Get fee summary for display in booking modal
 */
export function getFeesSummaryText(fees: FeeCalculation): string {
    const formatted = formatFeeBreakdown(fees)

    if (fees.feeType === "existing") {
        return `Session: ${formatted.sessionPriceDisplay} + ${formatted.bookingFeeDisplay} booking fee = ${formatted.totalDisplay}`
    }

    return `Session: ${formatted.sessionPriceDisplay} + ${formatted.bookingFeeDisplay} booking fee = ${formatted.totalDisplay}`
}

/**
 * Get trainer's payout explanation
 */
export function getTrainerPayoutText(fees: FeeCalculation): string {
    if (fees.platformFeePercent === 0) {
        return `You'll receive ${(fees.trainerPayout / 100).toFixed(2)} (no platform fee for your existing clients)`
    }

    return `You'll receive $${(fees.trainerPayout / 100).toFixed(2)} after ${fees.platformFeePercent}% platform fee`
}
