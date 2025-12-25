/**
 * Stripe Connect Service
 * Handles facility owner onboarding for payments
 * 
 * This service calls Firebase Cloud Functions for Stripe Connect operations.
 */

import { getFunctions, httpsCallable } from "firebase/functions"

// Initialize Firebase Functions
const functions = getFunctions()

export interface ConnectAccountStatus {
    hasAccount: boolean
    accountId?: string
    isOnboarded: boolean
    payoutsEnabled: boolean
    chargesEnabled: boolean
    detailsSubmitted: boolean
}

export const stripeConnectService = {
    /**
     * Create a Stripe Connect Express account for a facility
     * Returns an onboarding URL that the user should be redirected to
     */
    async createConnectAccount(
        facilityId: string,
        businessInfo: {
            businessName: string
            email: string
            country?: string
        }
    ): Promise<{ accountId: string; onboardingUrl: string } | null> {
        try {
            const createAccount = httpsCallable(functions, "createFacilityConnectAccount")

            const result = await createAccount({
                facilityId,
                businessName: businessInfo.businessName,
                email: businessInfo.email,
                returnUrl: "goodrunss://facility/stripe-return",
                refreshUrl: "goodrunss://facility/stripe-refresh",
            })

            const data = result.data as { accountId: string; onboardingUrl: string }

            return {
                accountId: data.accountId,
                onboardingUrl: data.onboardingUrl,
            }
        } catch (error) {
            console.error("Error creating Connect account:", error)
            return null
        }
    },

    /**
     * Generate a new onboarding link if the user needs to complete setup
     */
    async createOnboardingLink(accountId: string): Promise<string | null> {
        try {
            const createLink = httpsCallable(functions, "createFacilityOnboardingLink")

            const result = await createLink({
                stripeAccountId: accountId,
                returnUrl: "goodrunss://facility/stripe-return",
                refreshUrl: "goodrunss://facility/stripe-refresh",
            })

            const data = result.data as { url: string }
            return data.url
        } catch (error) {
            console.error("Error creating onboarding link:", error)
            return null
        }
    },

    /**
     * Get the status of a Connect account
     */
    async getAccountStatus(accountId: string): Promise<ConnectAccountStatus | null> {
        try {
            const getStatus = httpsCallable(functions, "getFacilityConnectStatus")

            const result = await getStatus({ stripeAccountId: accountId })

            const data = result.data as {
                id: string
                charges_enabled: boolean
                payouts_enabled: boolean
                details_submitted: boolean
            }

            return {
                hasAccount: true,
                accountId: data.id,
                isOnboarded: data.details_submitted && data.payouts_enabled,
                payoutsEnabled: data.payouts_enabled,
                chargesEnabled: data.charges_enabled,
                detailsSubmitted: data.details_submitted,
            }
        } catch (error) {
            console.error("Error getting account status:", error)
            return null
        }
    },

    /**
     * Create a login link for the facility to access their Stripe dashboard
     */
    async createDashboardLink(accountId: string): Promise<string | null> {
        try {
            const createLink = httpsCallable(functions, "createFacilityDashboardLink")

            const result = await createLink({ stripeAccountId: accountId })

            const data = result.data as { url: string }
            return data.url
        } catch (error) {
            console.error("Error creating dashboard link:", error)
            return null
        }
    },

    /**
     * Create a payment intent with automatic split to facility's Connect account
     * 
     * Payment flow:
     * - Player pays: courtRate + $3 booking fee
     * - GoodRunss takes: $3 + 8% of courtRate (applicationFeeAmount)
     * - Facility gets: 92% of courtRate (automatically via Stripe transfer)
     */
    async createConnectPaymentIntent(
        amount: number, // In cents - total charge to player
        facilityAccountId: string,
        applicationFeeAmount: number, // GoodRunss's cut in cents ($3 + 8%)
        metadata?: {
            bookingId?: string
            courtId?: string
            facilityId?: string
            courtRate?: number
        }
    ): Promise<{
        paymentIntentId: string
        clientSecret: string
    } | null> {
        try {
            const createIntent = httpsCallable(functions, "createFacilityPaymentIntent")

            const result = await createIntent({
                amount,
                facilityStripeAccountId: facilityAccountId,
                applicationFeeAmount,
                ...metadata,
            })

            const data = result.data as {
                paymentIntentId: string
                clientSecret: string
            }

            return {
                paymentIntentId: data.paymentIntentId,
                clientSecret: data.clientSecret,
            }
        } catch (error) {
            console.error("Error creating Connect payment intent:", error)
            return null
        }
    },
}

export default stripeConnectService
