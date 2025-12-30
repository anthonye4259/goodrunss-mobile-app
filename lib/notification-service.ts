import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// NOTE: setNotificationHandler is called in _layout.tsx, not at module level
// Calling it at module load time can crash the app before RN is initialized

export type NotificationType =
  | "booking_confirmed"
  | "booking_reminder"
  | "booking_request"      // New: for trainers when client requests booking
  | "session_reminder"     // New: reminder X mins before session
  | "new_client"           // New: new client booked with you
  | "message_received"
  | "need_players"
  | "check_in"
  | "referral_reward"
  | "payment_received"
  | "friend_checkin"
  | "challenge_received"
  | "challenge_accepted"
  | "badge_earned"
  | "level_up"
  | "waitlist_spot"        // New: spot opened on waitlist
  | "availability_reminder" // New: remind trainer to update availability
  | "court_status_change"  // Court status changed (favorite courts)
  | "court_nearby_quiet"   // Nearby court is quiet (geofence trigger)
  | "upgrade_prompt_trainer"  // Prompt free trainers to upgrade
  | "upgrade_prompt_facility" // Prompt free facilities to upgrade
  | "live_friend_checkin"     // Real-time: friend checked into venue
  | "live_active_run"         // Real-time: active run at nearby venue
  | "live_best_time"          // Real-time: best time to play prediction
  | "live_need_players"       // Real-time: someone needs players nearby
  | "general"              // Generic notification



export interface NotificationData {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
}

export class NotificationService {
  private static instance: NotificationService

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== "granted") {
        console.log("[v0] Notification permissions denied")
        return false
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6B9B5A",
        })
      }

      return true
    } catch (error) {
      console.error("[v0] Error requesting permissions:", error)
      return false
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      const token = await this.getPushToken()
      if (token) {
        // Store token locally
        await AsyncStorage.setItem("pushToken", token)
        console.log("[v0] Registered for push notifications:", token)

        // Register token with Firebase backend
        await this.registerFCMToken(token)
      }
      return token
    } catch (error) {
      console.error("[v0] Error registering for push notifications:", error)
      return null
    }
  }

  /**
   * Register FCM token with Firebase backend
   */
  async registerFCMToken(token: string): Promise<boolean> {
    try {
      // Import Firebase functions
      const { getFunctions, httpsCallable } = await import("firebase/functions")
      const { app } = await import("@/lib/firebase-config")

      if (!app) {
        console.warn("[v0] Firebase not configured, skipping FCM registration")
        return false
      }

      const functions = getFunctions(app)
      const registerToken = httpsCallable(functions, "registerFCMToken")

      // Get device ID
      const deviceId = await this.getDeviceId()

      await registerToken({ token, deviceId })
      console.log("[v0] FCM token registered with backend")
      return true
    } catch (error) {
      console.error("[v0] Error registering FCM token:", error)
      return false
    }
  }

  /**
   * Get unique device ID
   */
  async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem("deviceId")

      if (!deviceId) {
        // Generate unique device ID
        deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        await AsyncStorage.setItem("deviceId", deviceId)
      }

      return deviceId
    } catch (error) {
      console.error("[v0] Error getting device ID:", error)
      return `${Platform.OS}-${Date.now()}`
    }
  }

  setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean
      shouldPlaySound: boolean
      shouldSetBadge: boolean
    }>
  }) {
    Notifications.setNotificationHandler(handler)
  }

  async getPushToken(): Promise<string | null> {
    try {
      // projectId is required for Expo push tokens in SDK 52+
      // IMPORTANT: This must match the projectId in app.json
      const projectId = "b63887f4-0f38-4414-8597-47548483ad9f"
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
      console.log("[v0] Push token:", token)
      return token
    } catch (error) {
      console.error("[v0] Error getting push token:", error)
      // Don't crash the app if push token fails
      return null
    }
  }

  async scheduleNotification(notification: NotificationData, trigger?: Notifications.NotificationTriggerInput) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: { ...notification.data, type: notification.type },
        sound: true,
      },
      trigger: trigger || null,
    })
  }

  async sendLocalNotification(notification: NotificationData) {
    await this.scheduleNotification(notification)
  }

  async getNotificationPreferences(): Promise<Record<NotificationType, boolean>> {
    const prefs = await AsyncStorage.getItem("notification_preferences")
    if (prefs) {
      return JSON.parse(prefs)
    }

    // Default preferences
    return {
      booking_confirmed: true,
      booking_reminder: true,
      booking_request: true,     // Trainer: new booking request
      session_reminder: true,    // Trainer: reminder before session
      new_client: true,          // Trainer: new client
      message_received: true,
      need_players: true,
      check_in: true,
      referral_reward: true,
      payment_received: true,
      friend_checkin: true,
      challenge_received: true,
      challenge_accepted: true,
      badge_earned: true,
      level_up: true,
      waitlist_spot: true,       // Client: spot opened
      availability_reminder: true, // Trainer: update availability
      court_status_change: true,  // Favorite court status changed
      court_nearby_quiet: true,   // Nearby court is quiet
      upgrade_prompt_trainer: true, // Upgrade prompts for trainers
      upgrade_prompt_facility: true, // Upgrade prompts for facilities
      live_friend_checkin: true,  // Real-time: friend checked in
      live_active_run: true,      // Real-time: active run nearby
      live_best_time: true,       // Real-time: best time prediction
      live_need_players: true,    // Real-time: someone needs players
      general: true,             // Generic notifications
    }
  }

  async updateNotificationPreference(type: NotificationType, enabled: boolean) {
    const prefs = await this.getNotificationPreferences()
    prefs[type] = enabled
    await AsyncStorage.setItem("notification_preferences", JSON.stringify(prefs))
  }
}
