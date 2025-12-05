import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "react-native"
import { useUserPreferences } from "@/lib/user-preferences"

export default function TabsLayout() {
  const { preferences } = useUserPreferences()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#141414",
          borderTopColor: "#252525",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#7ED957",
        tabBarInactiveTintColor: "#666",
      }}
    >
      {/* Core Action 1: Talk to GIA */}
      <Tabs.Screen
        name="gia"
        options={{
          title: "GIA",
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />

      {/* Core Action 2: Report Court Condition */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard" size={size} color={color} />,
        }}
      />

      {/* Core Action 3: View Live Traffic */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Live",
          tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={color} />,
        }}
      />

      {/* Core Action 4: Book a Trainer */}
      <Tabs.Screen
        name="trainers"
        options={{
          title: "Trainers",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/images/goodrunss-logo-white.png")}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Hidden tabs - accessible via navigation but not in tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="trainer" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
    </Tabs>
  )
}
