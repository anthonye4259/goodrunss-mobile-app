
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"

export default function LeaderboardScreen() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week")

  const leaderboard = [
    { rank: 1, name: "Sarah Johnson", avatar: "SJ", points: 2450, badge: "🥇" },
    { rank: 2, name: "Mike Chen", avatar: "MC", points: 2280, badge: "🥈" },
    { rank: 3, name: "Emma Davis", avatar: "ED", points: 2150, badge: "🥉" },
    { rank: 4, name: "Alex Martinez", avatar: "AM", points: 1980, badge: "" },
    { rank: 5, name: "Lisa Wong", avatar: "LW", points: 1850, badge: "" },
    { rank: 12, name: "You", avatar: "YO", points: 1420, badge: "", isCurrentUser: true },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Leaderboard</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${timeframe === "week" ? "bg-primary" : ""}`}
              onPress={() => setTimeframe("week")}
            >
              <Text
                className={`text-center font-semibold ${timeframe === "week" ? "text-background" : "text-muted-foreground"}`}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${timeframe === "month" ? "bg-primary" : ""}`}
              onPress={() => setTimeframe("month")}
            >
              <Text
                className={`text-center font-semibold ${timeframe === "month" ? "text-background" : "text-muted-foreground"}`}
              >
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${timeframe === "all" ? "bg-primary" : ""}`}
              onPress={() => setTimeframe("all")}
            >
              <Text
                className={`text-center font-semibold ${timeframe === "all" ? "text-background" : "text-muted-foreground"}`}
              >
                All Time
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {leaderboard.map((user) => (
            <View
              key={user.rank}
              className={`rounded-2xl p-4 mb-3 ${user.isCurrentUser ? "bg-primary/20 border-2 border-primary" : "bg-card border border-border"}`}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold text-foreground w-10">{user.badge || `#${user.rank}`}</Text>
                <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                  <Text className="text-primary font-bold">{user.avatar}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`font-bold text-lg ${user.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                    {user.name}
                  </Text>
                  <Text className="text-muted-foreground text-sm">{user.points} points</Text>
                </View>
                {user.rank <= 3 && (
                  <View className="bg-primary/20 rounded-full px-3 py-1">
                    <Text className="text-primary font-bold text-sm">Top 3</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
