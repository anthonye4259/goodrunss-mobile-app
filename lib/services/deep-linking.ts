/**
 * Deep Linking Service
 * 
 * Handles navigation from:
 * - Push notifications → Specific screens
 * - External URLs → App screens
 * - Dashboard links → Mobile app
 * 
 * URL Scheme: goodrunss://
 * 
 * Routes:
 * - goodrunss://booking/[id] → Booking details
 * - goodrunss://session/[id] → Session details
 * - goodrunss://class/[id] → Class details
 * - goodrunss://instructor/[id] → Instructor profile
 * - goodrunss://chat/[conversationId] → Chat screen
 * - goodrunss://waitlist/claim/[classId] → Claim waitlist spot
 * - goodrunss://dashboard → Trainer dashboard
 */

import { router } from "expo-router"
import { Linking } from "react-native"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

// URL Scheme
const URL_SCHEME = "goodrunss://"
const WEB_DOMAIN = "goodrunss.com"

// Deep link routes
export type DeepLinkRoute =
    | { type: "booking"; id: string }
    | { type: "session"; id: string }
    | { type: "class"; id: string }
    | { type: "instructor"; id: string }
    | { type: "chat"; conversationId: string }
    | { type: "waitlist_claim"; classId: string }
    | { type: "dashboard"; tab?: string }
    | { type: "home" }

// ============================================
// URL PARSING
// ============================================

/**
 * Parse incoming URL to route
 */
export function parseDeepLink(url: string): DeepLinkRoute | null {
    try {
        // Remove scheme prefix
        let path = url
            .replace(URL_SCHEME, "")
            .replace(`https://${WEB_DOMAIN}/`, "")
            .replace(`http://${WEB_DOMAIN}/`, "")

        // Remove trailing slash
        path = path.replace(/\/$/, "")

        // Split into segments
        const segments = path.split("/")

        if (segments.length === 0) {
            return { type: "home" }
        }

        const [first, second, third] = segments

        // Route matching
        switch (first) {
            case "booking":
                return second ? { type: "booking", id: second } : null

            case "session":
                return second ? { type: "session", id: second } : null

            case "class":
                return second ? { type: "class", id: second } : null

            case "instructor":
            case "i":
                return second ? { type: "instructor", id: second } : null

            case "chat":
            case "messages":
                return second ? { type: "chat", conversationId: second } : null

            case "waitlist":
                if (second === "claim" && third) {
                    return { type: "waitlist_claim", classId: third }
                }
                return null

            case "dashboard":
                return { type: "dashboard", tab: second }

            default:
                return { type: "home" }
        }
    } catch (error) {
        console.error("[DeepLink] parseDeepLink error:", error)
        return null
    }
}

/**
 * Navigate to a deep link route
 */
export function navigateToDeepLink(route: DeepLinkRoute): void {
    try {
        switch (route.type) {
            case "booking":
                router.push(`/booking/${route.id}`)
                break

            case "session":
                router.push(`/booking/${route.id}`)
                break

            case "class":
                router.push(`/venues/${route.id}`)
                break

            case "instructor":
                router.push(`/instructors/${route.id}`)
                break

            case "chat":
                router.push(`/chat/${route.conversationId}`)
                break

            case "waitlist_claim":
                router.push(`/waitlist/claim/${route.classId}`)
                break

            case "dashboard":
                router.push("/pro-dashboard")
                break

            case "home":
            default:
                router.replace("/(tabs)")
                break
        }

        console.log("[DeepLink] Navigated to:", route.type)
    } catch (error) {
        console.error("[DeepLink] navigateToDeepLink error:", error)
    }
}

// ============================================
// NOTIFICATION DEEP LINKS
// ============================================

/**
 * Handle notification that was tapped
 */
export function handleNotificationResponse(
    response: Notifications.NotificationResponse
): void {
    const data = response.notification.request.content.data

    if (!data) return

    // Map notification data to route
    if (data.bookingId) {
        navigateToDeepLink({ type: "booking", id: data.bookingId as string })
    } else if (data.classId) {
        navigateToDeepLink({ type: "class", id: data.classId as string })
    } else if (data.instructorId) {
        navigateToDeepLink({ type: "instructor", id: data.instructorId as string })
    } else if (data.conversationId || data.senderId) {
        navigateToDeepLink({
            type: "chat",
            conversationId: (data.conversationId || data.senderId) as string
        })
    } else if (data.waitlistId) {
        navigateToDeepLink({ type: "waitlist_claim", classId: data.classId as string })
    }
}

// ============================================
// URL LINK LISTENER
// ============================================

/**
 * Set up listeners for incoming deep links
 */
export function setupDeepLinkListeners(): () => void {
    // Handle URL when app is already open
    const urlSubscription = Linking.addEventListener("url", (event) => {
        const route = parseDeepLink(event.url)
        if (route) {
            navigateToDeepLink(route)
        }
    })

    // Handle notification tap
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
    )

    // Check for initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
        if (url) {
            const route = parseDeepLink(url)
            if (route) {
                // Delay to ensure app is ready
                setTimeout(() => navigateToDeepLink(route), 500)
            }
        }
    })

    // Check for initial notification (app opened from notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) {
            handleNotificationResponse(response)
        }
    })

    console.log("[DeepLink] Listeners set up")

    // Return cleanup function
    return () => {
        urlSubscription.remove()
        notificationSubscription.remove()
    }
}

// ============================================
// DEEP LINK GENERATION
// ============================================

/**
 * Generate a deep link URL
 */
export function generateDeepLink(route: DeepLinkRoute): string {
    switch (route.type) {
        case "booking":
            return `${URL_SCHEME}booking/${route.id}`
        case "session":
            return `${URL_SCHEME}session/${route.id}`
        case "class":
            return `${URL_SCHEME}class/${route.id}`
        case "instructor":
            return `${URL_SCHEME}instructor/${route.id}`
        case "chat":
            return `${URL_SCHEME}chat/${route.conversationId}`
        case "waitlist_claim":
            return `${URL_SCHEME}waitlist/claim/${route.classId}`
        case "dashboard":
            return `${URL_SCHEME}dashboard${route.tab ? `/${route.tab}` : ""}`
        case "home":
        default:
            return URL_SCHEME
    }
}

/**
 * Generate a web link (for sharing)
 */
export function generateWebLink(route: DeepLinkRoute): string {
    const base = `https://${WEB_DOMAIN}`

    switch (route.type) {
        case "booking":
            return `${base}/booking/${route.id}`
        case "instructor":
            return `${base}/i/${route.id}`
        case "class":
            return `${base}/class/${route.id}`
        default:
            return base
    }
}

// ============================================
// PENDING DEEP LINK (for after auth)
// ============================================

const PENDING_DEEP_LINK_KEY = "@pending_deep_link"

/**
 * Store a deep link to navigate after authentication
 */
export async function storePendingDeepLink(route: DeepLinkRoute): Promise<void> {
    await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, JSON.stringify(route))
}

/**
 * Get and clear pending deep link
 */
export async function consumePendingDeepLink(): Promise<DeepLinkRoute | null> {
    const stored = await AsyncStorage.getItem(PENDING_DEEP_LINK_KEY)
    if (!stored) return null

    await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY)

    try {
        return JSON.parse(stored) as DeepLinkRoute
    } catch {
        return null
    }
}

/**
 * Navigate to pending deep link if exists
 * Call this after user authenticates
 */
export async function navigateToPendingDeepLink(): Promise<boolean> {
    const route = await consumePendingDeepLink()
    if (route) {
        navigateToDeepLink(route)
        return true
    }
    return false
}

// ============================================
// HOOK
// ============================================

import { useEffect } from "react"

/**
 * Hook to set up deep link listeners
 */
export function useDeepLinking(): void {
    useEffect(() => {
        const cleanup = setupDeepLinkListeners()
        return cleanup
    }, [])
}

export default {
    parseDeepLink,
    navigateToDeepLink,
    handleNotificationResponse,
    setupDeepLinkListeners,
    generateDeepLink,
    generateWebLink,
    storePendingDeepLink,
    consumePendingDeepLink,
    navigateToPendingDeepLink,
    useDeepLinking,
}
