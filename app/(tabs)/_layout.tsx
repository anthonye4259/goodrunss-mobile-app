import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { View, Text, Image } from "react-native"
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
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#7ED957",
        tabBarInactiveTintColor: "#666",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Tab 1: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />

      {/* Tab 2: Live Map (BILLION DOLLAR FEATURE) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Live Map",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View style={{
                  position: "absolute",
                  top: -4,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#EF4444",
                }} />
              )}
              <Ionicons name="map" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* Tab 3: Report & Earn (BILLION DOLLAR FEATURE) */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <View style={{
                position: "absolute",
                top: -8,
                right: -12,
                backgroundColor: "#7ED957",
                paddingHorizontal: 4,
                paddingVertical: 1,
                borderRadius: 6,
                zIndex: 1,
              }}>
                <Text style={{ fontSize: 8, fontWeight: "bold", color: "#000" }}>$$$</Text>
              </View>
              <Ionicons name="camera" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* Tab 4: GIA AI (BILLION DOLLAR FEATURE) */}
      <Tabs.Screen
        name="gia"
        options={{
          title: "GIA",
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? "#8B5CF6" : "transparent",
              borderRadius: 12,
              padding: 6,
              marginBottom: -4,
            }}>
              <Ionicons
                name="sparkles"
                size={24}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 5: Trainers */}
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
