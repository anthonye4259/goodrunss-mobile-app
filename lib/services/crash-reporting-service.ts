/**
 * Crash Reporting Service
 * 
 * Captures and reports errors to help debug production issues.
 * Uses Sentry for error tracking and performance monitoring.
 * 
 * Setup:
 * 1. Create account at https://sentry.io
 * 2. Create a new React Native project
 * 3. Add your DSN to .env as EXPO_PUBLIC_SENTRY_DSN
 * 4. Initialize in app/_layout.tsx
 */

import * as Sentry from "@sentry/react-native"

// Sentry DSN from environment
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || ""

interface UserContext {
    id: string
    email?: string
    username?: string
    userType?: "player" | "trainer" | "facility"
}

class CrashReportingService {
    private static instance: CrashReportingService
    private initialized = false

    static getInstance(): CrashReportingService {
        if (!CrashReportingService.instance) {
            CrashReportingService.instance = new CrashReportingService()
        }
        return CrashReportingService.instance
    }

    /**
     * Initialize Sentry - Call this in app/_layout.tsx
     */
    init(): void {
        if (this.initialized) {
            console.log("[CrashReporting] Already initialized")
            return
        }

        if (!SENTRY_DSN) {
            console.log("[CrashReporting] No Sentry DSN configured, skipping initialization")
            return
        }

        try {
            Sentry.init({
                dsn: SENTRY_DSN,
                debug: __DEV__, // Only show debug logs in development
                enableAutoSessionTracking: true,
                sessionTrackingIntervalMillis: 30000,
                tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production
                attachStacktrace: true,
                beforeSend(event) {
                    // Don't send events in development
                    if (__DEV__) {
                        console.log("[CrashReporting] Would send event:", event.message)
                        return null
                    }
                    return event
                },
            })

            this.initialized = true
            console.log("[CrashReporting] Sentry initialized successfully")
        } catch (error) {
            console.log("[CrashReporting] Error initializing Sentry:", error)
        }
    }

    /**
     * Set user context for better error attribution
     */
    setUser(user: UserContext): void {
        if (!this.initialized) return

        Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.username,
        })

        Sentry.setTag("user_type", user.userType || "unknown")
        console.log("[CrashReporting] User context set:", user.id)
    }

    /**
     * Clear user context on logout
     */
    clearUser(): void {
        if (!this.initialized) return
        Sentry.setUser(null)
        console.log("[CrashReporting] User context cleared")
    }

    /**
     * Capture an exception
     */
    captureException(error: Error, context?: Record<string, any>): void {
        if (!this.initialized) {
            console.log("[CrashReporting] Exception (not sent):", error.message)
            return
        }

        if (context) {
            Sentry.setContext("extra", context)
        }

        Sentry.captureException(error)
        console.log("[CrashReporting] Exception captured:", error.message)
    }

    /**
     * Capture a message
     */
    captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
        if (!this.initialized) {
            console.log(`[CrashReporting] Message (not sent): ${message}`)
            return
        }

        Sentry.captureMessage(message, level)
        console.log(`[CrashReporting] Message captured: ${message}`)
    }

    /**
     * Add breadcrumb for debugging
     */
    addBreadcrumb(category: string, message: string, data?: Record<string, any>): void {
        if (!this.initialized) return

        Sentry.addBreadcrumb({
            category,
            message,
            data,
            level: "info",
        })
    }

    /**
     * Set a tag for filtering errors
     */
    setTag(key: string, value: string): void {
        if (!this.initialized) return
        Sentry.setTag(key, value)
    }

    /**
     * Start a performance transaction
     */
    startTransaction(name: string, op: string): Sentry.Transaction | null {
        if (!this.initialized) return null
        return Sentry.startTransaction({ name, op })
    }

    /**
     * Wrap a component with Sentry error boundary
     */
    get ErrorBoundary() {
        return Sentry.ErrorBoundary
    }

    /**
     * Check if Sentry is initialized
     */
    isInitialized(): boolean {
        return this.initialized
    }
}

// Export singleton
export const crashReporting = CrashReportingService.getInstance()

// Convenience wrapper for try/catch blocks
export function captureError(error: unknown, context?: Record<string, any>): void {
    if (error instanceof Error) {
        crashReporting.captureException(error, context)
    } else {
        crashReporting.captureMessage(String(error), "error")
    }
}

export default crashReporting
