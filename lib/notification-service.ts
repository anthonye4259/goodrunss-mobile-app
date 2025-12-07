import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export type NotificationType =
  | "booking_confirmed"
  | "booking_reminder"
  | "message_received"
  | "need_players"
  | "check_in"
  | "referral_reward"
  | "payment_received"

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
          lightColor: "#7ED957",
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
      const projectId = "54c9b3c6-9f21-44cc-921b-0fa2db35b4a4"
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
      message_received: true,
      need_players: true,
      check_in: true,
      referral_reward: true,
      payment_received: true,
    }
  }

  async updateNotificationPreference(type: NotificationType, enabled: boolean) {
    const prefs = await this.getNotificationPreferences()
    prefs[type] = enabled
    await AsyncStorage.setItem("notification_preferences", JSON.stringify(prefs))
  }
}
