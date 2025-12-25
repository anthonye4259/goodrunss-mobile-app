import { Tabs } from "expo-router"
import { View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"

export default function TabLayout() {
  const { preferences } = useUserPreferences()
  const isTrainer = preferences.userType === "trainer" || preferences.userType === "instructor"

  return (
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

      {/* 2. Explore - Map + Live Mode */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
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

      {/* 4. Bookings - User's bookings hub */}
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />

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
      <Tabs.Screen name="SwipeableTabs" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="live" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="report" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="trainer" options={{ href: null }} />
      <Tabs.Screen name="trainers" options={{ href: null }} />
    </Tabs>
  )
}
