
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { getPrimaryActivity } from "@/lib/activity-content"
import * as Haptics from "expo-haptics"

export default function AlertsScreen() {
  const { preferences } = useUserPreferences()
  const [activeTab, setActiveTab] = useState<"check-ins" | "need-players" | "psa">("need-players")

  const primaryActivity = getPrimaryActivity(preferences.activities)

  // Mock data - would come from backend
  const checkInAlerts = [
    {
      id: "1",
      venueName: "Rucker Park",
      sport: "Basketball",
      playerCount: 3,
      distance: "0.8 mi",
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: "2",
      venueName: "West 4th Street Courts",
      sport: "Basketball",
      playerCount: 2,
      distance: "1.2 mi",
      timestamp: new Date(Date.now() - 30 * 60000),
    },
  ]

  const needPlayersAlerts = [
    {
      id: "1",
      userName: "Mike J.",
      venueName: "Rucker Park",
      sport: "Basketball",
      playersNeeded: 2,
      skillLevel: "Intermediate",
      distance: "0.8 mi",
      timestamp: new Date(Date.now() - 10 * 60000),
    },
    {
      id: "2",
      userName: "Sarah K.",
      venueName: "Chelsea Piers",
      sport: "Pickleball",
      playersNeeded: 1,
      skillLevel: "Advanced",
      distance: "2.1 mi",
      timestamp: new Date(Date.now() - 25 * 60000),
    },
  ]

  const psaAlerts = [
    {
      id: "1",
      userName: "Coach Tony",
      message: "Free basketball clinic at Rucker Park this Saturday 10am! All levels welcome 🏀",
      sport: "Basketball",
      venueName: "Rucker Park",
      distance: "0.8 mi",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "2",
      userName: "Tennis Pro Sarah",
      message: "Looking for doubles partners for a tournament next month. DM me!",
      sport: "Tennis",
      distance: "1.5 mi",
      timestamp: new Date(Date.now() - 20 * 60000),
    },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold text-foreground mb-2">Player Alerts</Text>
        <Text className="text-muted-foreground">Find active players and games near you</Text>
      </View>

      <View className="px-6 mb-4">
        <View className="bg-card border border-border rounded-xl p-1 flex-row">
          <TouchableOpacity
            className={`flex-1 rounded-lg py-3 ${activeTab === "need-players" ? "bg-primary" : ""}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setActiveTab("need-players")
            }}
          >
            <Text
              className={`text-center font-bold text-xs ${activeTab === "need-players" ? "text-background" : "text-muted-foreground"}`}
            >
              Need Players
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-lg py-3 ${activeTab === "check-ins" ? "bg-primary" : ""}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setActiveTab("check-ins")
            }}
          >
            <Text
              className={`text-center font-bold text-xs ${activeTab === "check-ins" ? "text-background" : "text-muted-foreground"}`}
            >
              Check-ins
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-lg py-3 ${activeTab === "psa" ? "bg-primary" : ""}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setActiveTab("psa")
            }}
          >
            <Text
              className={`text-center font-bold text-xs ${activeTab === "psa" ? "text-background" : "text-muted-foreground"}`}
            >
              PSA
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {activeTab === "need-players" ? (
          <View>
            {needPlayersAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                className="bg-card border border-border rounded-2xl p-4 mb-4"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  console.log("[v0] Respond to alert:", alert.id)
                }}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{alert.userName}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={14} color="#7ED957" />
                      <Text className="text-muted-foreground text-sm ml-1">{alert.venueName}</Text>
                    </View>
                  </View>
                  <View className="bg-primary/20 rounded-full px-3 py-1">
                    <Text className="text-primary font-bold text-xs">
                      {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 rounded-lg px-3 py-1 mr-2">
                    <Text className="text-primary text-sm font-semibold">
                      Need {alert.playersNeeded} {alert.playersNeeded === 1 ? "player" : "players"}
                    </Text>
                  </View>
                  <View className="bg-muted/30 rounded-lg px-3 py-1 mr-2">
                    <Text className="text-foreground text-sm font-semibold">{alert.skillLevel}</Text>
                  </View>
                  <View className="bg-muted/30 rounded-lg px-3 py-1">
                    <Text className="text-foreground text-sm font-semibold">{alert.sport}</Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="navigate" size={16} color="#666" />
                    <Text className="text-muted-foreground text-sm ml-1">{alert.distance} away</Text>
                  </View>
                  <View className="bg-primary rounded-lg px-4 py-2">
                    <Text className="text-background font-bold">Join Game</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : activeTab === "check-ins" ? (
          <View>
            {checkInAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                className="bg-card border border-border rounded-2xl p-4 mb-4"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push(`/venues/${alert.id}`)
                }}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{alert.venueName}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="people" size={14} color="#7ED957" />
                      <Text className="text-muted-foreground text-sm ml-1">
                        {alert.playerCount} {alert.playerCount === 1 ? "player" : "players"} active
                      </Text>
                    </View>
                  </View>
                  <View className="bg-primary/20 rounded-full px-3 py-1">
                    <Text className="text-primary font-bold text-xs">
                      {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="navigate" size={16} color="#666" />
                    <Text className="text-muted-foreground text-sm ml-1">{alert.distance} away</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-primary font-semibold mr-2">View Court</Text>
                    <Ionicons name="chevron-forward" size={20} color="#7ED957" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {psaAlerts.map((alert) => (
              <View key={alert.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{alert.userName}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="megaphone" size={14} color="#7ED957" />
                      <Text className="text-muted-foreground text-sm ml-1">
                        {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                      </Text>
                    </View>
                  </View>
                  {alert.sport && (
                    <View className="bg-primary/20 rounded-full px-3 py-1">
                      <Text className="text-primary font-bold text-xs">{alert.sport}</Text>
                    </View>
                  )}
                </View>

                <Text className="text-foreground mb-3">{alert.message}</Text>

                {alert.venueName && (
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="location" size={14} color="#7ED957" />
                    <Text className="text-muted-foreground text-sm ml-1">{alert.venueName}</Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="navigate" size={16} color="#666" />
                    <Text className="text-muted-foreground text-sm ml-1">{alert.distance} away</Text>
                  </View>
                  <TouchableOpacity
                    className="bg-primary rounded-lg px-4 py-2"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                      router.push(`/chat/${alert.id}`)
                    }}
                  >
                    <Text className="text-background font-bold">Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary rounded-full w-16 h-16 items-center justify-center shadow-lg"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          router.push("/send-psa")
        }}
      >
        <Ionicons name="megaphone" size={28} color="#000" />
      </TouchableOpacity>
    </LinearGradient>
  )
}
