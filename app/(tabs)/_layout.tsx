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
        },
        tabBarActiveTintColor: "#7ED957",
        tabBarInactiveTintColor: "#666",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "today" : "today-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: isTrainer ? "Market" : "Live",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={isTrainer ? (focused ? "briefcase" : "briefcase-outline") : (focused ? "radio" : "radio-outline")}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="gia"
        options={{
          title: "GIA",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: "#8B5CF6",
              borderRadius: 12,
              padding: 4,
            } : {}}>
              <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={24} color={focused ? "#FFFFFF" : color} />
            </View>
          ),
          tabBarActiveTintColor: "#8B5CF6", // Purple for GIA
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* Hide other files in this directory from the tab bar */}
      <Tabs.Screen name="SwipeableTabs" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="index-old" options={{ href: null }} />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={color} />
          ),
          tabBarBadge: 2, // Mock badge for demo
        }}
      />
      <Tabs.Screen name="report" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="trainer" options={{ href: null }} />
      <Tabs.Screen name="trainers" options={{ href: null }} />
    </Tabs>
  )
}
