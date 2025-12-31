/**
 * Live Activity Notifications Service
 * 
 * Real-time notifications about nearby venue activity:
 * - Friend check-ins (highest priority)
 * - Active runs at venues
 * - Best time predictions
 * - Need Players alerts
 */

import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { venueService } from "./venue-service"
import { ActivityPredictor } from "./activity-predictor"
import { db } from "@/lib/firebase-config"
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore"

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
    LAST_ACTIVITY_NOTIF: "@goodrunss_last_activity_notif",
    ACTIVITY_NOTIF_COUNT: "@goodrunss_activity_notif_count_today",
    LAST_NOTIF_DATE: "@goodrunss_activity_notif_date",
}

const MAX_NOTIFS_PER_DAY = 3 // For non-friend notifications
const COOLDOWN_HOURS = 2 // Hours between non-friend notifications

// ============================================
// NOTIFICATION MESSAGES
// ============================================

const ACTIVE_RUN_MESSAGES = [
    { template: (venue: string, count: number) => `GIA: ${venue} is on fire right now! ${count} players checked in.` },
    { template: (venue: string, count: number) => `GIA: Active courts alert! ${count} people are playing at ${venue}.` },
    { template: (venue: string, count: number) => `GIA: I see a lot of activity at ${venue}. ${count} players active.` },
]

const NEED_PLAYERS_MESSAGES = [
    { template: (venue: string, count: number) => `GIA: Help needed! ${count} players looking for a game at ${venue}.` },
    { template: (venue: string, count: number) => `GIA: Match opportunity! A group needs ${count} more at ${venue}.` },
]

const BEST_TIME_MESSAGES = [
    { template: (venue: string) => `GIA: Pssst... ${venue} is strangely quiet right now. Perfect for practice!` },
    { template: (venue: string) => `GIA: Pro tip: ${venue} has open courts. Go now!` },
]

const FRIEND_CHECKIN_MESSAGES = [
    { template: (name: string, venue: string) => `GIA: Your friend ${name} is playing at ${venue}. Want to join?` },
    { template: (name: string, venue: string) => `GIA: Look who's here! ${name} just checked into ${venue}.` },
    { template: (name: string, venue: string) => `GIA: ${name} is active at ${venue}. Time to lace up?` },
]

// ============================================
// SERVICE CLASS
// ============================================

class LiveActivityNotifications {
    private static instance: LiveActivityNotifications
    private activityPredictor: ActivityPredictor
    private friendCheckInUnsubscribe: (() => void) | null = null

    static getInstance(): LiveActivityNotifications {
        if (!LiveActivityNotifications.instance) {
            LiveActivityNotifications.instance = new LiveActivityNotifications()
        }
        return LiveActivityNotifications.instance
    }

    constructor() {
        this.activityPredictor = ActivityPredictor.getInstance()
    }

    // ============================================
    // FRIEND CHECK-IN LISTENER (Real-time)
    // ============================================

    /**
     * Start listening for friend check-ins
     * This is the most important notification type!
     */
    async startFriendCheckInListener(userId: string, friendIds: string[]): Promise<void> {
        if (!db || friendIds.length === 0) {
            console.log("[LiveActivity] No friends or db not initialized")
            return
        }

        // Stop any existing listener
        this.stopFriendCheckInListener()

        try {
            // Listen for check-ins from friends in the last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

            const checkInsRef = collection(db, "checkins")
            const q = query(
                checkInsRef,
                where("userId", "in", friendIds.slice(0, 10)), // Firestore limit
                where("timestamp", ">=", Timestamp.fromDate(fiveMinutesAgo)),
                orderBy("timestamp", "desc")
            )

            this.friendCheckInUnsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === "added") {
                        const data = change.doc.data()
                        await this.sendFriendCheckInNotification(
                            data.userName || "A friend",
                            data.venueName || "a venue",
                            data.venueId
                        )
                    }
                })
            })

            console.log(`[LiveActivity] Listening for check-ins from ${friendIds.length} friends`)
        } catch (error) {
            console.error("[LiveActivity] Error starting friend listener:", error)
        }
    }

    /**
     * Stop listening for friend check-ins
     */
    stopFriendCheckInListener(): void {
        if (this.friendCheckInUnsubscribe) {
            this.friendCheckInUnsubscribe()
            this.friendCheckInUnsubscribe = null
        }
    }

    /**
     * Send friend check-in notification (no rate limit)
     */
    private async sendFriendCheckInNotification(
        friendName: string,
        venueName: string,
        venueId: string
    ): Promise<void> {
        const message = FRIEND_CHECKIN_MESSAGES[Math.floor(Math.random() * FRIEND_CHECKIN_MESSAGES.length)]

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Friend Alert`,
                body: message.template(friendName, venueName),
                data: {
                    type: "friend_checkin",
                    venueId,
                    screen: `/venues/${venueId}`,
                },
                sound: true,
            },
            trigger: null, // Immediate
        })

        console.log(`[LiveActivity] Sent friend check-in notification: ${friendName} at ${venueName}`)
    }

    // ============================================
    // NEARBY ACTIVITY CHECKS
    // ============================================

    /**
     * Check for active runs at nearby venues
     * Call this periodically (every 30 min or so)
     */
    async checkNearbyActivity(
        userLocation: { lat: number; lng: number },
        preferredSport?: string
    ): Promise<void> {
        try {
            // Rate limiting check
            if (!(await this.canSendActivityNotification())) {
                console.log("[LiveActivity] Rate limited, skipping check")
                return
            }

            // Get nearby venues
            const venues = await venueService.getVenuesNearby(
                userLocation,
                10, // 10km radius
                preferredSport,
                20
            )

            // Check each venue for active check-ins
            for (const venue of venues) {
                const checkIns = await venueService.getVenueCheckIns(venue.id)

                // If 5+ active check-ins, send notification
                if (checkIns.length >= 5) {
                    await this.sendActiveRunNotification(venue.name, checkIns.length, venue.id)
                    return // Only send one notification per check
                }
            }

            // If no active runs, maybe send best time prediction
            await this.checkBestTimePrediction(venues, userLocation)

        } catch (error) {
            console.error("[LiveActivity] Error checking nearby activity:", error)
        }
    }

    /**
     * Send active run notification
     */
    private async sendActiveRunNotification(
        venueName: string,
        playerCount: number,
        venueId: string
    ): Promise<void> {
        const message = ACTIVE_RUN_MESSAGES[Math.floor(Math.random() * ACTIVE_RUN_MESSAGES.length)]

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Runs Going Now`,
                body: message.template(venueName, playerCount),
                data: {
                    type: "active_run",
                    venueId,
                    screen: `/venues/${venueId}`,
                },
                sound: true,
            },
            trigger: null,
        })

        await this.recordNotificationSent()
        console.log(`[LiveActivity] Sent active run notification: ${venueName}`)
    }

    /**
     * Check for best time predictions
     */
    private async checkBestTimePrediction(
        venues: any[],
        userLocation: { lat: number; lng: number }
    ): Promise<void> {
        // 20% chance to send best time prediction
        if (Math.random() > 0.2) return

        const venue = venues[0] // Pick closest venue
        if (!venue) return

        const prediction = this.activityPredictor.predictCrowdLevel(venue)

        // Only notify if low crowd predicted with high confidence
        if (prediction.level === "Low" && prediction.confidence > 0.85) {
            const message = BEST_TIME_MESSAGES[Math.floor(Math.random() * BEST_TIME_MESSAGES.length)]

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Good Time to Play`,
                    body: message.template(venue.name),
                    data: {
                        type: "best_time",
                        venueId: venue.id,
                        screen: `/venues/${venue.id}`,
                    },
                    sound: true,
                },
                trigger: null,
            })

            await this.recordNotificationSent()
            console.log(`[LiveActivity] Sent best time notification: ${venue.name}`)
        }
    }

    // ============================================
    // NEED PLAYERS ALERTS
    // ============================================

    /**
     * Send notification when someone posts a "Need Players" alert nearby
     */
    async sendNeedPlayersNotification(
        venueName: string,
        playersNeeded: number,
        venueId: string
    ): Promise<void> {
        if (!(await this.canSendActivityNotification())) return

        const message = NEED_PLAYERS_MESSAGES[Math.floor(Math.random() * NEED_PLAYERS_MESSAGES.length)]

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Players Needed`,
                body: message.template(venueName, playersNeeded),
                data: {
                    type: "need_players",
                    venueId,
                    screen: `/need-players/${venueId}`,
                },
                sound: true,
            },
            trigger: null,
        })

        await this.recordNotificationSent()
        console.log(`[LiveActivity] Sent need players notification: ${venueName}`)
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    /**
     * Check if we can send another activity notification (non-friend)
     */
    private async canSendActivityNotification(): Promise<boolean> {
        try {
            // Check date - reset count if new day
            const today = new Date().toDateString()
            const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_NOTIF_DATE)

            if (lastDate !== today) {
                await AsyncStorage.setItem(STORAGE_KEYS.LAST_NOTIF_DATE, today)
                await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_NOTIF_COUNT, "0")
            }

            // Check daily count
            const count = parseInt(await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_NOTIF_COUNT) || "0")
            if (count >= MAX_NOTIFS_PER_DAY) {
                return false
            }

            // Check cooldown
            const lastNotif = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY_NOTIF)
            if (lastNotif) {
                const hoursSince = (Date.now() - parseInt(lastNotif)) / (1000 * 60 * 60)
                if (hoursSince < COOLDOWN_HOURS) {
                    return false
                }
            }

            return true
        } catch (error) {
            console.error("[LiveActivity] Error checking rate limit:", error)
            return true
        }
    }

    /**
     * Record that we sent a notification
     */
    private async recordNotificationSent(): Promise<void> {
        const count = parseInt(await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_NOTIF_COUNT) || "0")
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_NOTIF_COUNT, String(count + 1))
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_NOTIF, Date.now().toString())
    }
}

export const liveActivityNotifications = LiveActivityNotifications.getInstance()
