import axios from "axios"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ""
const STRIPE_API_URL = "https://api.stripe.com/v1"

export interface PaymentIntent {
    id: string
    clientSecret: string
    amount: number
    currency: string
    status: string
}

export const stripeService = {
    /**
     * Create a payment intent for trainer booking
     */
    async createPaymentIntent(
        amount: number,
        currency: string = "usd",
        metadata?: {
            trainerId?: string
            userId?: string
            bookingId?: string
            duration?: number
        }
    ): Promise<PaymentIntent | null> {
        try {
            const response = await axios.post(
                `${STRIPE_API_URL}/payment_intents`,
                new URLSearchParams({
                    amount: (amount * 100).toString(), // Convert to cents
                    currency,
                    "metadata[trainerId]": metadata?.trainerId || "",
                    "metadata[userId]": metadata?.userId || "",
                    "metadata[bookingId]": metadata?.bookingId || "",
                    "metadata[duration]": metadata?.duration?.toString() || "",
                }),
                {
                    headers: {
                        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            )

            return {
                id: response.data.id,
                clientSecret: response.data.client_secret,
                amount: response.data.amount / 100,
                currency: response.data.currency,
                status: response.data.status,
            }
        } catch (error) {
            console.error("Error creating payment intent:", error)
            return null
        }
    },

    /**
     * Confirm a payment
     */
    async confirmPayment(paymentIntentId: string): Promise<boolean> {
        try {
            const response = await axios.post(
                `${STRIPE_API_URL}/payment_intents/${paymentIntentId}/confirm`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                    },
                }
            )

            return response.data.status === "succeeded"
        } catch (error) {
            console.error("Error confirming payment:", error)
            return false
        }
    },

    /**
     * Get payment status
     */
    async getPaymentStatus(paymentIntentId: string): Promise<string | null> {
        try {
            const response = await axios.get(
                `${STRIPE_API_URL}/payment_intents/${paymentIntentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                    },
                }
            )

            return response.data.status
        } catch (error) {
            console.error("Error getting payment status:", error)
            return null
        }
    },

    /**
     * Calculate trainer booking price
     */
    calculateBookingPrice(duration: number, trainerHourlyRate: number): number {
        return (duration / 60) * trainerHourlyRate
    }
}
