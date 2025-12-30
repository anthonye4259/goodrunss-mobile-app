
import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { UserPreferencesProvider, useUserPreferences } from "@/lib/user-preferences"
import { LocationProvider, useLocation } from "@/lib/location-context"
import { StripeProvider } from "@/lib/stripe-provider"
import { NotificationService } from "@/lib/notification-service"
import { dailyEngagementService } from "@/lib/services/daily-engagement-service"
import { upgradeNotificationService } from "@/lib/services/upgrade-notification-service"
import { liveActivityNotifications } from "@/lib/services/live-activity-notifications"
import { crashReporting } from "@/lib/services/crash-reporting-service"
import { useEffect, useCallback } from "react"
import "@/lib/i18n"
import "../global.css"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { useDeepLinking } from "@/lib/services/deep-linking"
import { setupTrainerRealTimeSync, setupClientRealTimeSync, unsubscribeAll } from "@/lib/services/realtime-sync"
import { View, ActivityIndicator, Text } from "react-native"
import { ToastProvider } from "@/components/ui/Toast"
import { NudgesProvider } from "@/components/ui/OnboardingNudges"
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit"
import * as SplashScreen from "expo-splash-screen"

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

// Initialize crash reporting early
crashReporting.init()



// Inner component that has access to auth
function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { preferences } = useUserPreferences()

  // Initialize deep linking
  useDeepLinking()

  // Set up real-time sync for the user
  // Note: Could check user.role if needed, but client sync works for both
  useEffect(() => {
    if (!user?.id) return

    // Initialize Active Engagement Service (Duolingo-style notifications)
    const role = user.role === "trainer" ? "trainer" : "player"
    dailyEngagementService.scheduleAllNotifications(role).catch(err =>
      console.log("[Engagement] Failed to schedule:", err)
    )

    // Schedule upgrade prompts for free trainers/facilities
    const userType = preferences?.userType
    if (userType === "trainer" || userType === "instructor") {
      upgradeNotificationService.scheduleUpgradePrompt("trainer").catch(err =>
        console.log("[UpgradeNotif] Failed to schedule trainer prompt:", err)
      )
    } else if (userType === "facility") {
      upgradeNotificationService.scheduleUpgradePrompt("facility").catch(err =>
        console.log("[UpgradeNotif] Failed to schedule facility prompt:", err)
      )
    }

    // Start live activity notifications for players
    // (friend check-ins, active runs, etc.)
    if (userType === "player" || userType === "both") {
      // Get friend IDs from user profile (would need to fetch from Firestore)
      const friendIds = user.friendIds || []
      if (friendIds.length > 0) {
        liveActivityNotifications.startFriendCheckInListener(user.id, friendIds)
      }
    }

    // Set up client sync (works for both clients and trainers for now)
    const cleanup = setupClientRealTimeSync(user.id)

    return () => {
      if (cleanup) cleanup()
      unsubscribeAll()
      liveActivityNotifications.stopFriendCheckInListener()
    }
  }, [user?.id, user?.role, preferences?.userType])

  return <>{children}</>
}


export default function RootLayout() {
  // Load Outfit fonts
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  })

  // Hide splash screen once fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView()
    }
  }, [fontsLoaded, onLayoutRootView])

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

  // Show loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#0A0A0A',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: '#7ED957',
          marginBottom: 8,
        }}>GoodRunss</Text>
        <ActivityIndicator size="small" color="#7ED957" style={{ marginTop: 20 }} />
      </View>
    )
  }



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent>
          <UserPreferencesProvider>
            <LocationProvider>
              <RadarInitializer />
              <StripeProvider>
                <ToastProvider>
                  <NudgesProvider>
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
                      <Stack.Screen name="instructors/[id]" />
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
                      <Stack.Screen name="waitlist/claim/[classId]" />
                      <Stack.Screen name="instructor-dashboard" />
                      <Stack.Screen name="trainer-dashboard" />
                    </Stack>
                  </NudgesProvider>
                </ToastProvider>
              </StripeProvider>
            </LocationProvider>
          </UserPreferencesProvider>
        </AppContent>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}

// Separate component to access LocationContext
import { useLocation } from "@/lib/location-context"
import { geofenceService } from "@/lib/services/geofence-service"
import { venueService } from "@/lib/services/venue-service"

function RadarInitializer() {
  const { location } = useLocation()

  useEffect(() => {
    if (!location) return

    const initRadar = async () => {
      // Find venues within 5km to monitor
      // Note: In real app, we'd act smarter about which ones to specificially watch
      // For now, we watch the top 10 nearest
      try {
        const center = { lat: location.latitude, lng: location.longitude }
        const venues = await venueService.getVenuesNearby(center, 5) // 5km radius

        if (venues.length > 0) {
          const regions = venues.slice(0, 10).map(v => ({
            identifier: v.name, // using name as ID for readable notifications
            latitude: v.lat,
            longitude: v.lng,
            radius: 150, // 150 meters
            notifyOnEnter: true,
            notifyOnExit: false,
          }))

          // Only start if we have permission (handled inside startMonitoring)
          await geofenceService.startMonitoring(regions)
        }
      } catch (err) {
        console.log("[Radar] Init failed", err)
      }
    }

    initRadar()
  }, [location])

  return null
}

