import { Tabs } from "expo-router"
import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { GIAFloatingButton } from "@/components/GIAFloatingButton"
import { QuickReportFloatingButton } from "@/components/QuickReportFloatingButton"

export default function TabLayout() {
  const { preferences } = useUserPreferences()
  // 3 user types: player, trainer (includes instructor), facility
  const isTrainer = preferences.userType === "trainer" || preferences.userType === "instructor"
  const isFacility = preferences.userType === "facility"

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0F0F0F",
            borderTopColor: "#1A1A1A",
            height: 85,
            paddingBottom: 25,
          },
          tabBarActiveTintColor: "#7ED957",
          tabBarInactiveTintColor: "#666",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: "Inter_500Medium",
            fontSize: 11,
          },
        }}
      >
        {/* ===== 5 CORE TABS ===== */}

        {/* 1. Today - Main Discovery Feed */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "today" : "today-outline"} size={24} color={color} />
            ),
          }}
        />

        {/* 2. Discover - Venues, Trainers, Map */}
        <Tabs.Screen
          name="discover"
          options={{
            title: "Discover",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "compass" : "compass-outline"} size={24} color={color} />
            ),
          }}
        />

        {/* 3. GIA - AI Assistant (Center) */}
        <Tabs.Screen
          name="gia"
          options={{
            title: "GIA",
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? {
                backgroundColor: "#8B5CF6",
                borderRadius: 12,
                padding: 6,
              } : {}}>
                <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={24} color={focused ? "#FFFFFF" : color} />
              </View>
            ),
            tabBarActiveTintColor: "#8B5CF6",
          }}
        />

        {/* 4a. Sessions - TRAINER ONLY */}
        {isTrainer && (
          <Tabs.Screen
            name="trainer"
            options={{
              title: "Sessions",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
              ),
            }}
          />
        )}

        {/* 4b. Dashboard - FACILITY ONLY */}
        {isFacility && (
          <Tabs.Screen
            name="facility-dashboard"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
              ),
            }}
          />
        )}

        {/* 5. Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            ),
          }}
        />

        {/* ===== HIDDEN SCREENS (accessible via router.push) ===== */}
        <Tabs.Screen name="activity" options={{ href: null }} />
        <Tabs.Screen name="bookings" options={{ href: null }} />
        <Tabs.Screen name="my-bookings" options={{ href: null }} />
        <Tabs.Screen name="live" options={{ href: null }} />
        <Tabs.Screen name="messages" options={{ href: null }} />
        <Tabs.Screen name="report" options={{ href: null }} />
        <Tabs.Screen name="stats" options={{ href: null }} />
        {/* trainer is visible for trainers only */}
        {!isTrainer && <Tabs.Screen name="trainer" options={{ href: null }} />}
        {/* facility-dashboard is visible for facilities only */}
        {!isFacility && <Tabs.Screen name="facility-dashboard" options={{ href: null }} />}
        <Tabs.Screen name="trainers" options={{ href: null }} />
      </Tabs>

      {/* Floating Action Buttons - Cal.ai Aesthetic */}
      <GIAFloatingButton hidden={isFacility || isTrainer} />
      <QuickReportFloatingButton hidden={isFacility} />
    </>
  )
}
