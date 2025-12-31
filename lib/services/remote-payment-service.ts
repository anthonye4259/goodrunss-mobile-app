/**
 * Remote Training Payment Service
 * 
 * Handles payments for remote training services
 * Uses Stripe for international payment processing
 * 
 * Features:
 * - Multi-currency support
 * - Payment intents for secure checkout
 * - Trainer payout tracking
 * - Refund handling
 */

import { db, auth } from "@/lib/firebase-config"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { RemoteService, SupportedCurrency } from "@/lib/types/remote-training"
import { SUPPORTED_CURRENCIES } from "@/lib/types/remote-training"

// ============================================
// TYPES
// ============================================

export interface PaymentIntent {
    id: string
    clientSecret: string
    amount: number
    currency: SupportedCurrency
    status: "requires_payment_method" | "requires_confirmation" | "succeeded" | "canceled"
}

export interface PaymentRecord {
    id: string
    bookingId: string
    serviceId: string
    trainerId: string
    playerId: string
    amount: number
    currency: string
    platformFee: number
    trainerPayout: number
    status: "pending" | "completed" | "refunded" | "failed"
    stripePaymentId?: string
    createdAt: string
    completedAt?: string
}

export interface TrainerEarnings {
    totalEarnings: number
    pendingPayout: number
    completedPayouts: number
    currency: string
    recentPayments: PaymentRecord[]
}

// ============================================
// CONSTANTS
// ============================================

const PLATFORM_FEE_PERCENT = 15 // 15% platform fee
const STORAGE_KEYS = {
    PAYMENTS: "@goodrunss_payments",
    TRAINER_EARNINGS: "@goodrunss_trainer_earnings",
}

// ============================================
// REMOTE PAYMENT SERVICE
// ============================================

class RemotePaymentService {
    private static instance: RemotePaymentService

    static getInstance(): RemotePaymentService {
        if (!RemotePaymentService.instance) {
            RemotePaymentService.instance = new RemotePaymentService()
        }
        return RemotePaymentService.instance
    }

    /**
     * Create a payment intent for a remote service
     * In production, this calls your backend which calls Stripe API
     */
    async createPaymentIntent(
        service: RemoteService,
        bookingId: string
    ): Promise<PaymentIntent | null> {
        try {
            // In production: Call your backend
            // const response = await fetch(`${YOUR_BACKEND}/create-payment-intent`, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         amount: service.price * 100, // Stripe uses cents
            //         currency: service.currency.toLowerCase(),
            //         trainerId: service.trainerId,
            //         bookingId,
            //     }),
            // })
            // return await response.json()

            // Mock payment intent for development
            const mockIntent: PaymentIntent = {
                id: `pi_${Date.now()}`,
                clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
                amount: service.price * 100,
                currency: service.currency as SupportedCurrency,
                status: "requires_payment_method",
            }

            return mockIntent
        } catch (error) {
            console.error("Failed to create payment intent:", error)
            return null
        }
    }

    /**
     * Record a successful payment
     */
    async recordPayment(
        bookingId: string,
        service: RemoteService,
        stripePaymentId?: string
    ): Promise<PaymentRecord> {
        const userId = auth?.currentUser?.uid || "local_user"
        const amount = service.price
        const platformFee = amount * (PLATFORM_FEE_PERCENT / 100)
        const trainerPayout = amount - platformFee

        const payment: PaymentRecord = {
            id: `payment_${Date.now()}`,
            bookingId,
            serviceId: service.id,
            trainerId: service.trainerId,
            playerId: userId,
            amount,
            currency: service.currency,
            platformFee,
            trainerPayout,
            status: "completed",
            stripePaymentId,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        }

        // Store locally
        const payments = await this.getPayments()
        payments.push(payment)
        await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments))

        // Update trainer earnings
        await this.updateTrainerEarnings(service.trainerId, trainerPayout, service.currency)

        // Sync to Firestore
        if (db) {
            try {
                const { doc, setDoc, collection } = await import("firebase/firestore")
                await setDoc(doc(collection(db, "payments"), payment.id), payment)
            } catch (error) {
                console.error("Failed to sync payment to Firestore:", error)
            }
        }

        return payment
    }

    /**
     * Process a refund
     */
    async processRefund(paymentId: string, reason?: string): Promise<boolean> {
        const payments = await this.getPayments()
        const index = payments.findIndex(p => p.id === paymentId)

        if (index === -1) return false

        const payment = payments[index]

        // In production: Call Stripe refund API via backend
        // await fetch(`${YOUR_BACKEND}/refund`, { ... })

        payments[index] = {
            ...payment,
            status: "refunded",
        }

        await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments))

        // Deduct from trainer earnings
        await this.updateTrainerEarnings(
            payment.trainerId,
            -payment.trainerPayout,
            payment.currency
        )

        return true
    }

    /**
     * Get trainer earnings
     */
    async getTrainerEarnings(trainerId?: string): Promise<TrainerEarnings> {
        const id = trainerId || auth?.currentUser?.uid || "local_trainer"
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRAINER_EARNINGS)
        const allEarnings = stored ? JSON.parse(stored) : {}

        return allEarnings[id] || {
            totalEarnings: 0,
            pendingPayout: 0,
            completedPayouts: 0,
            currency: "USD",
            recentPayments: [],
        }
    }

    /**
     * Update trainer earnings
     */
    private async updateTrainerEarnings(
        trainerId: string,
        amount: number,
        currency: string
    ): Promise<void> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRAINER_EARNINGS)
        const allEarnings = stored ? JSON.parse(stored) : {}

        const current = allEarnings[trainerId] || {
            totalEarnings: 0,
            pendingPayout: 0,
            completedPayouts: 0,
            currency,
            recentPayments: [],
        }

        allEarnings[trainerId] = {
            ...current,
            totalEarnings: current.totalEarnings + amount,
            pendingPayout: current.pendingPayout + amount,
        }

        await AsyncStorage.setItem(STORAGE_KEYS.TRAINER_EARNINGS, JSON.stringify(allEarnings))
    }

    /**
     * Request payout for trainer
     */
    async requestPayout(trainerId?: string): Promise<boolean> {
        const id = trainerId || auth?.currentUser?.uid || "local_trainer"
        const earnings = await this.getTrainerEarnings(id)

        if (earnings.pendingPayout < 50) {
            // Minimum payout threshold
            console.error("Minimum payout is $50")
            return false
        }

        // In production: Call Stripe Connect payout API
        // await fetch(`${YOUR_BACKEND}/payout`, { trainerId, amount: earnings.pendingPayout })

        const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRAINER_EARNINGS)
        const allEarnings = stored ? JSON.parse(stored) : {}

        allEarnings[id] = {
            ...earnings,
            pendingPayout: 0,
            completedPayouts: earnings.completedPayouts + earnings.pendingPayout,
        }

        await AsyncStorage.setItem(STORAGE_KEYS.TRAINER_EARNINGS, JSON.stringify(allEarnings))
        return true
    }

    /**
     * Get payment history
     */
    private async getPayments(): Promise<PaymentRecord[]> {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS)
        return stored ? JSON.parse(stored) : []
    }

    /**
     * Get player's payment history
     */
    async getPlayerPayments(): Promise<PaymentRecord[]> {
        const userId = auth?.currentUser?.uid || "local_user"
        const payments = await this.getPayments()
        return payments.filter(p => p.playerId === userId)
    }

    /**
     * Get trainer's received payments
     */
    async getTrainerPayments(trainerId?: string): Promise<PaymentRecord[]> {
        const id = trainerId || auth?.currentUser?.uid || "local_trainer"
        const payments = await this.getPayments()
        return payments.filter(p => p.trainerId === id)
    }

    /**
     * Convert price between currencies (mock rates)
     */
    convertCurrency(
        amount: number,
        from: SupportedCurrency,
        to: SupportedCurrency
    ): number {
        // Mock exchange rates (in production, use real-time rates)
        const toUSD: Record<SupportedCurrency, number> = {
            USD: 1,
            EUR: 1.10,
            GBP: 1.27,
            AED: 0.27,
        }

        const usdAmount = amount * toUSD[from]
        return usdAmount / toUSD[to]
    }

    /**
     * Format price with currency symbol
     */
    formatPrice(amount: number, currency: SupportedCurrency): string {
        const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency)
        const symbol = currencyInfo?.symbol || "$"
        return `${symbol}${amount.toFixed(2)}`
    }
}

export const remotePaymentService = RemotePaymentService.getInstance()
