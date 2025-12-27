
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

  // No mock data - would come from backend
  const checkInAlerts: any[] = []
  const needPlayersAlerts: any[] = []
  const psaAlerts: any[] = []

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
            {needPlayersAlerts.length > 0 ? needPlayersAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                className="bg-card border border-border rounded-2xl p-4 mb-4"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push(`/venues/${alert.id}`)
                }}
              >
                {/* ... extracted alert content ... */}
              </TouchableOpacity>
            )) : (
              <View className="items-center py-12">
                <View className="bg-muted/10 p-6 rounded-full mb-4">
                  <Ionicons name="people-outline" size={48} color="#666" />
                </View>
                <Text className="text-foreground font-bold text-xl mb-2">No Active Requests</Text>
                <Text className="text-muted-foreground text-center">There are no players looking for games nearby right now.</Text>
              </View>
            )}
          </View>
        ) : activeTab === "check-ins" ? (
          <View>
            {checkInAlerts.length > 0 ? checkInAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                className="bg-card border border-border rounded-2xl p-4 mb-4"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push(`/venues/${alert.id}`)
                }}
              >
                {/* ... extracted alert content ... */}
              </TouchableOpacity>
            )) : (
              <View className="items-center py-12">
                <View className="bg-muted/10 p-6 rounded-full mb-4">
                  <Ionicons name="location-outline" size={48} color="#666" />
                </View>
                <Text className="text-foreground font-bold text-xl mb-2">No Recent Check-ins</Text>
                <Text className="text-muted-foreground text-center">It's quiet out there. Be the first to check in!</Text>
                <TouchableOpacity
                  className="bg-primary px-6 py-3 rounded-xl mt-6"
                  onPress={() => router.push("/venues/map")}
                >
                  <Text className="font-bold text-black">Find Courts</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View>
            {psaAlerts.length > 0 ? psaAlerts.map((alert) => (
              <View key={alert.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                {/* ... extracted alert content ... */}
              </View>
            )) : (
              <View className="items-center py-12">
                <View className="bg-muted/10 p-6 rounded-full mb-4">
                  <Ionicons name="megaphone-outline" size={48} color="#666" />
                </View>
                <Text className="text-foreground font-bold text-xl mb-2">No Announcements</Text>
                <Text className="text-muted-foreground text-center">Check back later for community news and events.</Text>
              </View>
            )}
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
