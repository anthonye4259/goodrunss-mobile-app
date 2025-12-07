
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { UserPreferencesProvider } from "@/lib/user-preferences"
import { LocationProvider } from "@/lib/location-context"
import { StripeProvider } from "@/lib/stripe-provider"
import { NotificationService } from "@/lib/notification-service"
import { useEffect } from "react"
import "@/lib/i18n"
import "../global.css"
import { AuthProvider } from "@/lib/auth-context"

export default function RootLayout() {
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance()
        await notificationService.requestPermissions()
        await notificationService.registerForPushNotifications()

        // Set up notification handlers
        notificationService.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        })
      } catch (error) {
        // Don't crash the app if notifications fail
        console.warn("Notification initialization failed:", error)
      }
    }

    initNotifications()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserPreferencesProvider>
          <LocationProvider>
            <StripeProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="language-selection" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="referrals" />
                <Stack.Screen name="rating/[sport]" />
                <Stack.Screen name="venues/[id]" />
                <Stack.Screen name="trainers/[id]" />
                <Stack.Screen name="chat/[id]" />
                <Stack.Screen name="need-players/[venueId]" />
                <Stack.Screen name="alerts/index" />
                <Stack.Screen name="settings/edit-profile" />
                <Stack.Screen name="settings/payment-methods" />
                <Stack.Screen name="settings/privacy" />
                <Stack.Screen name="settings/help" />
                <Stack.Screen name="settings/terms" />
                <Stack.Screen name="booking/[id]" />
                <Stack.Screen name="review/[id]" />
                <Stack.Screen name="friends/[friendshipId]/settings" />
                <Stack.Screen name="settings/notifications/friends" />
              </Stack>
            </StripeProvider>
          </LocationProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
