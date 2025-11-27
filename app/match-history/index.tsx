import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function MatchHistoryScreen() {
  const matches = [
    {
      id: "1",
      playerName: "Mike Johnson",
      sport: "Basketball",
      venue: "Rucker Park",
      date: "2 days ago",
      result: "Won 21-18",
      rating: 5,
      avatar: "MJ",
    },
    {
      id: "2",
      playerName: "Sarah Chen",
      sport: "Tennis",
      venue: "Chelsea Piers",
      date: "1 week ago",
      result: "Lost 6-4, 3-6, 4-6",
      rating: 4,
      avatar: "SC",
    },
    {
      id: "3",
      playerName: "Alex Rivera",
      sport: "Pickleball",
      venue: "West 4th Street Courts",
      date: "2 weeks ago",
      result: "Won 11-7, 11-9",
      rating: 5,
      avatar: "AR",
    },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Match History</Text>
            <View className="w-6" />
          </View>
          <Text className="text-muted-foreground">{matches.length} matches played</Text>
        </View>

        <View className="px-6">
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              className="bg-card border border-border rounded-2xl p-4 mb-4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push(`/player/${match.id}`)
              }}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-start flex-1">
                  <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                    <Text className="text-primary font-bold text-lg">{match.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{match.playerName}</Text>
                    <Text className="text-muted-foreground text-sm mb-1">{match.sport}</Text>
                    <View className="flex-row items-center">
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name={i < match.rating ? "star" : "star-outline"} size={14} color="#FFD700" />
                      ))}
                    </View>
                  </View>
                </View>
                <Text className="text-muted-foreground text-sm">{match.date}</Text>
              </View>

              <View className="bg-muted/20 rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={16} color="#7ED957" />
                  <Text className="text-foreground ml-2">{match.venue}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="trophy" size={16} color="#7ED957" />
                  <Text className="text-foreground ml-2">{match.result}</Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-3"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push(`/match-request/${match.id}`)
                }}
              >
                <Text className="text-background font-bold text-center">Play Again</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
