
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SkeletonLoader } from "@/components/skeleton-loader"

export default function FindPartnersScreen() {
  const [searchRadius, setSearchRadius] = useState(5)
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sports = ["Basketball", "Tennis", "Pickleball", "Golf", "Swimming", "Yoga"]
  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"]

  // Mock nearby players - would come from GPS-based backend query
  const nearbyPlayers = [
    {
      id: "1",
      name: "Mike Johnson",
      sport: "Basketball",
      skillLevel: "Advanced",
      rating: 4.8,
      matchesPlayed: 47,
      distance: "0.3 mi",
      availability: "Available now",
      avatar: "MJ",
    },
    {
      id: "2",
      name: "Sarah Chen",
      sport: "Tennis",
      skillLevel: "Intermediate",
      rating: 4.6,
      matchesPlayed: 32,
      distance: "0.7 mi",
      availability: "Available today",
      avatar: "SC",
    },
    {
      id: "3",
      name: "Alex Rivera",
      sport: "Pickleball",
      skillLevel: "Expert",
      rating: 4.9,
      matchesPlayed: 89,
      distance: "1.2 mi",
      availability: "Available weekends",
      avatar: "AR",
    },
  ]

  const filteredPlayers = nearbyPlayers.filter((player) => {
    if (selectedSport && player.sport !== selectedSport) return false
    if (selectedSkillLevel && player.skillLevel !== selectedSkillLevel) return false
    return true
  })

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Find Partners</Text>
            <View className="w-6" />
          </View>
          <Text className="text-muted-foreground">GPS-based player matching near you</Text>
        </View>

        {/* Search Radius */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-border rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-foreground font-bold">Search Radius</Text>
              <Text className="text-primary font-bold">{searchRadius} miles</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {[1, 5, 10, 25].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  className={`flex-1 py-2 rounded-lg ${searchRadius === radius ? "bg-primary" : "bg-muted/30"}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setSearchRadius(radius)
                  }}
                >
                  <Text
                    className={`text-center font-semibold ${searchRadius === radius ? "text-background" : "text-foreground"}`}
                  >
                    {radius}mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Sport Filter */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            <TouchableOpacity
              className={`px-4 py-2 rounded-full ${!selectedSport ? "bg-primary" : "bg-card border border-border"}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setSelectedSport(null)
              }}
            >
              <Text className={`font-semibold ${!selectedSport ? "text-background" : "text-foreground"}`}>All</Text>
            </TouchableOpacity>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport}
                className={`px-4 py-2 rounded-full ${selectedSport === sport ? "bg-primary" : "bg-card border border-border"}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedSport(sport)
                }}
              >
                <Text className={`font-semibold ${selectedSport === sport ? "text-background" : "text-foreground"}`}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Skill Level Filter */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Skill Level</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${!selectedSkillLevel ? "bg-primary" : "bg-card border border-border"}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setSelectedSkillLevel(null)
              }}
            >
              <Text
                className={`text-center font-semibold ${!selectedSkillLevel ? "text-background" : "text-foreground"}`}
              >
                All
              </Text>
            </TouchableOpacity>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                className={`flex-1 py-2 rounded-lg ${selectedSkillLevel === level ? "bg-primary" : "bg-card border border-border"}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedSkillLevel(level)
                }}
              >
                <Text
                  className={`text-center font-semibold text-xs ${selectedSkillLevel === level ? "text-background" : "text-foreground"}`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">{filteredPlayers.length} Players Found</Text>

          {loading ? (
            <SkeletonLoader type="list" count={3} />
          ) : (
            filteredPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                className="bg-card border border-border rounded-2xl p-4 mb-4"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push(`/player/${player.id}`)
                }}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-start flex-1">
                    <View className="bg-primary/20 rounded-full w-16 h-16 items-center justify-center mr-4">
                      <Text className="text-primary font-bold text-xl">{player.avatar}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-lg mb-1">{player.name}</Text>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text className="text-foreground font-semibold ml-1">{player.rating}</Text>
                        <Text className="text-muted-foreground text-sm ml-1">({player.matchesPlayed} matches)</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="navigate" size={14} color="#7ED957" />
                        <Text className="text-muted-foreground text-sm ml-1">{player.distance} away</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center mb-3 gap-2">
                  <View className="bg-primary/20 rounded-lg px-3 py-1">
                    <Text className="text-primary text-sm font-semibold">{player.sport}</Text>
                  </View>
                  <View className="bg-muted/30 rounded-lg px-3 py-1">
                    <Text className="text-foreground text-sm font-semibold">{player.skillLevel}</Text>
                  </View>
                  <View className="bg-accent/20 rounded-lg px-3 py-1">
                    <Text className="text-accent text-sm font-semibold">{player.availability}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-primary rounded-xl py-3"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    router.push(`/match-request/${player.id}`)
                  }}
                >
                  <Text className="text-background font-bold text-center">Send Match Request</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
