
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useLocalSearchParams, router } from "expo-router"
import { RATING_CONFIGS, getRatingLevel, type RatingConfig } from "@/lib/player-rating-types"
import * as Haptics from "expo-haptics"

export default function RatingScreen() {
  const { sport } = useLocalSearchParams<{ sport: string }>()
  const config: RatingConfig | undefined = sport ? RATING_CONFIGS[sport] : undefined

  const [currentRating, setCurrentRating] = useState<number>(config?.range.min || 1)
  const [matchesPlayed, setMatchesPlayed] = useState<string>("0")

  if (!config) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Sport not found</Text>
      </View>
    )
  }

  const currentLevel = getRatingLevel(sport!, currentRating)
  const progress = ((currentRating - config.range.min) / (config.range.max - config.range.min)) * 100

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // TODO: Save to backend
    console.log("[v0] Saving rating:", { sport, currentRating, matchesPlayed })
    router.back()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">{sport} Rating</Text>
          <Text className="text-muted-foreground">{config.systemName}</Text>
        </View>

        {/* Current Rating Display */}
        <View className="px-6 mb-8">
          <View className="bg-card border border-border rounded-3xl p-8 items-center">
            <Text className="text-muted-foreground mb-2">Your Current Rating</Text>
            <Text className="text-7xl font-bold text-primary mb-2">{currentRating.toFixed(1)}</Text>
            {currentLevel && (
              <View className="bg-primary/20 rounded-full px-6 py-2">
                <Text className="text-primary font-bold">{currentLevel.label}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Rating Slider */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Adjust Your Rating</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between mb-4">
              <Text className="text-muted-foreground">{config.range.min}</Text>
              <Text className="text-muted-foreground">{config.range.max}</Text>
            </View>

            {/* Progress Bar */}
            <View className="bg-muted rounded-full h-3 mb-6">
              <View className="bg-primary rounded-full h-3" style={{ width: `${progress}%` }} />
            </View>

            {/* Rating Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setCurrentRating(Math.max(config.range.min, currentRating - 0.5))
                }}
                className="bg-muted rounded-xl px-6 py-3"
              >
                <Text className="text-foreground font-bold">- 0.5</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setCurrentRating(Math.min(config.range.max, currentRating + 0.5))
                }}
                className="bg-primary rounded-xl px-6 py-3"
              >
                <Text className="text-background font-bold">+ 0.5</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Rating Levels Guide */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Rating Guide</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            {config.levels.map((level, index) => (
              <View
                key={index}
                className={`p-4 flex-row items-center ${
                  index < config.levels.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View className="w-3 h-3 rounded-full mr-4" style={{ backgroundColor: level.color }} />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-foreground font-bold mr-2">{level.value}</Text>
                    <Text className="text-primary font-semibold">{level.label}</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">{level.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Skill Factors (Basketball) */}
        {config.factors && (
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-foreground mb-4">Skill Factors</Text>
            <View className="bg-card border border-border rounded-2xl p-6">
              {config.factors.map((factor, index) => (
                <View key={index} className="mb-4 last:mb-0">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-foreground">{factor}</Text>
                    <Text className="text-primary font-semibold">{Math.floor(Math.random() * 30 + 70)}%</Text>
                  </View>
                  <View className="bg-muted rounded-full h-2">
                    <View
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${Math.floor(Math.random() * 30 + 70)}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Matches Played */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Match History</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <Text className="text-muted-foreground mb-2">Matches Played</Text>
            <TextInput
              value={matchesPlayed}
              onChangeText={setMatchesPlayed}
              keyboardType="number-pad"
              className="bg-muted text-foreground rounded-xl px-4 py-3 text-lg font-bold"
              placeholder="0"
              placeholderTextColor="#666"
            />
            <Text className="text-muted-foreground text-sm mt-2">More matches = more accurate rating</Text>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6">
          <TouchableOpacity onPress={handleSave} className="bg-primary rounded-xl py-4" activeOpacity={0.8}>
            <Text className="text-background font-bold text-lg text-center">Save Rating</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
