/**
 * App Review Service
 * 
 * Prompts users to rate the app after positive experiences.
 * Uses Apple's StoreKit for native review prompt.
 * 
 * Triggers after:
 * - Completing a booking
 * - Earning a badge/achievement
 * - 5th successful court report
 * - Trainer receives 5-star review
 * - Player reaches new XP level
 */

import * as StoreReview from "expo-store-review"
import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEYS = {
    REVIEW_REQUESTED: "@goodrunss_review_requested",
    POSITIVE_ACTIONS_COUNT: "@goodrunss_positive_actions",
    LAST_PROMPT_DATE: "@goodrunss_last_review_prompt",
}

// Only prompt after this many positive actions
const MIN_POSITIVE_ACTIONS = 3
// Don't prompt more than once every 30 days
const MIN_DAYS_BETWEEN_PROMPTS = 30

interface ReviewState {
    hasReviewed: boolean
    positiveActionsCount: number
    lastPromptDate: string | null
}

class AppReviewService {
    private static instance: AppReviewService

    static getInstance(): AppReviewService {
        if (!AppReviewService.instance) {
            AppReviewService.instance = new AppReviewService()
        }
        return AppReviewService.instance
    }

    /**
     * Check if we can show a review prompt
     */
    private async canShowReview(): Promise<boolean> {
        try {
            // Check if StoreReview is available
            const isAvailable = await StoreReview.isAvailableAsync()
            if (!isAvailable) {
                console.log("[AppReview] StoreReview not available")
                return false
            }

            // Check if user already reviewed
            const hasReviewed = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED)
            if (hasReviewed === "true") {
                console.log("[AppReview] User already reviewed")
                return false
            }

            // Check if we've prompted recently
            const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE)
            if (lastPromptDate) {
                const daysSincePrompt = this.daysBetween(new Date(lastPromptDate), new Date())
                if (daysSincePrompt < MIN_DAYS_BETWEEN_PROMPTS) {
                    console.log("[AppReview] Prompted recently, waiting...")
                    return false
                }
            }

            // Check positive actions count
            const actionsStr = await AsyncStorage.getItem(STORAGE_KEYS.POSITIVE_ACTIONS_COUNT)
            const actionsCount = actionsStr ? parseInt(actionsStr) : 0
            if (actionsCount < MIN_POSITIVE_ACTIONS) {
                console.log(`[AppReview] Not enough positive actions: ${actionsCount}/${MIN_POSITIVE_ACTIONS}`)
                return false
            }

            return true
        } catch (error) {
            console.log("[AppReview] Error checking review availability:", error)
            return false
        }
    }

    /**
     * Calculate days between two dates
     */
    private daysBetween(date1: Date, date2: Date): number {
        const oneDay = 24 * 60 * 60 * 1000
        return Math.floor(Math.abs((date2.getTime() - date1.getTime()) / oneDay))
    }

    /**
     * Record a positive action and potentially show review prompt
     */
    async recordPositiveAction(action: string): Promise<void> {
        try {
            // Increment positive actions count
            const actionsStr = await AsyncStorage.getItem(STORAGE_KEYS.POSITIVE_ACTIONS_COUNT)
            const currentCount = actionsStr ? parseInt(actionsStr) : 0
            const newCount = currentCount + 1
            await AsyncStorage.setItem(STORAGE_KEYS.POSITIVE_ACTIONS_COUNT, String(newCount))

            console.log(`[AppReview] Positive action recorded: ${action} (total: ${newCount})`)

            // Check if we should show review prompt
            const canShow = await this.canShowReview()
            if (canShow) {
                await this.requestReview()
            }
        } catch (error) {
            console.log("[AppReview] Error recording positive action:", error)
        }
    }

    /**
     * Request app review using native prompt
     */
    async requestReview(): Promise<void> {
        try {
            console.log("[AppReview] Requesting app review...")

            // Record that we prompted
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT_DATE, new Date().toISOString())

            // Show native review prompt
            await StoreReview.requestReview()

            // Mark as reviewed (assume they did after seeing prompt)
            await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, "true")

            console.log("[AppReview] Review requested successfully")
        } catch (error) {
            console.log("[AppReview] Error requesting review:", error)
        }
    }

    /**
     * Force show review (for testing in development)
     */
    async forceShowReview(): Promise<void> {
        try {
            const isAvailable = await StoreReview.isAvailableAsync()
            if (isAvailable) {
                await StoreReview.requestReview()
            }
        } catch (error) {
            console.log("[AppReview] Error forcing review:", error)
        }
    }

    /**
     * Reset review state (for testing)
     */
    async resetReviewState(): Promise<void> {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.REVIEW_REQUESTED,
            STORAGE_KEYS.POSITIVE_ACTIONS_COUNT,
            STORAGE_KEYS.LAST_PROMPT_DATE,
        ])
        console.log("[AppReview] Review state reset")
    }

    /**
     * Get current review state
     */
    async getReviewState(): Promise<ReviewState> {
        const hasReviewed = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_REQUESTED)
        const actionsStr = await AsyncStorage.getItem(STORAGE_KEYS.POSITIVE_ACTIONS_COUNT)
        const lastPromptDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE)

        return {
            hasReviewed: hasReviewed === "true",
            positiveActionsCount: actionsStr ? parseInt(actionsStr) : 0,
            lastPromptDate,
        }
    }
}

// Export singleton and convenience functions
export const appReviewService = AppReviewService.getInstance()

// Convenience functions for common positive actions
export const reviewTriggers = {
    /**
     * Call after user completes a booking
     */
    onBookingComplete: () => appReviewService.recordPositiveAction("booking_complete"),

    /**
     * Call after user earns a badge
     */
    onBadgeEarned: () => appReviewService.recordPositiveAction("badge_earned"),

    /**
     * Call after user submits a court report
     */
    onCourtReportSubmitted: () => appReviewService.recordPositiveAction("court_report"),

    /**
     * Call after trainer receives 5-star review
     */
    onFiveStarReview: () => appReviewService.recordPositiveAction("five_star_review"),

    /**
     * Call after user reaches new XP level
     */
    onLevelUp: () => appReviewService.recordPositiveAction("level_up"),

    /**
     * Call after user successfully checks in
     */
    onCheckIn: () => appReviewService.recordPositiveAction("check_in"),

    /**
     * Call after user makes their first friend
     */
    onFirstFriend: () => appReviewService.recordPositiveAction("first_friend"),
}

export default appReviewService
