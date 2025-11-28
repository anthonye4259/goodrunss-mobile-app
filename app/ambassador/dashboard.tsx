
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { type AmbassadorProfile, AMBASSADOR_ROLES, getTierProgress } from "@/lib/ambassador-types"

export default function AmbassadorDashboardScreen() {
  const [profile] = useState<AmbassadorProfile>({
    id: "1",
    userId: "u1",
    role: "court_captain",
    tier: "bronze",
    status: "active",
    appliedAt: new Date("2025-01-01"),
    approvedAt: new Date("2025-01-03"),
    stats: {
      totalEarnings: 234,
      thisMonthEarnings: 87,
      facilityReports: 23,
    },
    perks: ["$1-5 per report", "5% booking discount", "Captain badge"],
  })

  const roleInfo = AMBASSADOR_ROLES[profile.role]
  const tierProgress = getTierProgress(profile.role, profile.stats)

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Ambassador Dashboard</Text>
            <View className="w-6" />
          </View>

          <View className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <Text className="text-5xl mr-4">{roleInfo.icon}</Text>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-2xl">{roleInfo.name}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="bg-primary/30 rounded-full px-3 py-1">
                    <Text className="text-primary font-bold text-sm uppercase">{profile.tier}</Text>
                  </View>
                  <View className="bg-primary/30 rounded-full px-3 py-1 ml-2">
                    <Text className="text-primary font-bold text-sm">{profile.status}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-3xl font-bold text-primary">${profile.stats.totalEarnings}</Text>
                <Text className="text-muted-foreground">Total Earned</Text>
              </View>
              <View className="items-end">
                <Text className="text-3xl font-bold text-accent">${profile.stats.thisMonthEarnings}</Text>
                <Text className="text-muted-foreground">This Month</Text>
              </View>
            </View>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Tier Progress</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">
                Current: <Text className="text-foreground font-bold uppercase">{tierProgress.current}</Text>
              </Text>
              {tierProgress.nextTier && (
                <Text className="text-muted-foreground">
                  Next: <Text className="text-primary font-bold uppercase">{tierProgress.nextTier}</Text>
                </Text>
              )}
            </View>
            <View className="bg-muted rounded-full h-3 mb-2">
              <View className="bg-primary rounded-full h-3" style={{ width: `${tierProgress.progress}%` }} />
            </View>
            <Text className="text-muted-foreground text-sm">{tierProgress.requirement}</Text>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Active Perks</Text>
            {profile.perks.map((perk, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">{perk}</Text>
              </View>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Quick Actions</Text>
            {profile.role === "court_captain" && (
              <TouchableOpacity
                className="bg-primary rounded-xl p-4 flex-row items-center justify-between mb-3"
                onPress={() => router.push("/venues")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="clipboard" size={24} color="#000" />
                  <Text className="text-background font-bold text-lg ml-3">Submit Facility Report</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            )}
            {profile.role === "ugc_creator" && (
              <TouchableOpacity
                className="bg-primary rounded-xl p-4 flex-row items-center justify-between mb-3"
                onPress={() => router.push("/social/feed")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="camera" size={24} color="#000" />
                  <Text className="text-background font-bold text-lg ml-3">Create Content</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            )}
            {profile.role === "ambassador" && (
              <TouchableOpacity
                className="bg-primary rounded-xl p-4 flex-row items-center justify-between mb-3"
                onPress={() => router.push("/referrals")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="people" size={24} color="#000" />
                  <Text className="text-background font-bold text-lg ml-3">Refer Friends</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
