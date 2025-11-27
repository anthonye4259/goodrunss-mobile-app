"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { Ionicons } from "@expo/vector-icons"
import { RATING_CONFIGS } from "@/lib/player-rating-types"

const REC_ACTIVITIES = ["Basketball", "Tennis", "Pickleball", "Golf", "Soccer", "Volleyball"]
const STUDIO_ACTIVITIES = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]

export default function QuestionnaireScreen() {
  const router = useRouter()
  const { setPreferences } = useUserPreferences()
  const { requestLocation, loading: locationLoading, error: locationError } = useLocation()
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [step, setStep] = useState<"activity" | "skill" | "location">("activity")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<number | null>(null)

  const handleActivitySelect = () => {
    if (selectedActivity) {
      if (RATING_CONFIGS[selectedActivity]) {
        setStep("skill")
      } else {
        setStep("location")
      }
    }
  }

  const handleSkillSelect = () => {
    if (selectedSkillLevel !== null) {
      setStep("location")
    }
  }

  const handleLocationRequest = async () => {
    await requestLocation()
    handleComplete()
  }

  const handleSkipLocation = () => {
    handleComplete()
  }

  const handleComplete = () => {
    if (selectedActivity) {
      const isStudio = STUDIO_ACTIVITIES.includes(selectedActivity)
      setPreferences({
        activities: [selectedActivity],
        isStudioUser: isStudio,
        isRecUser: !isStudio,
        userType: "player",
        primaryActivity: selectedActivity,
        playerRating:
          selectedSkillLevel !== null
            ? {
                sport: selectedActivity,
                rating: selectedSkillLevel,
                matches: 0,
              }
            : undefined,
      })
      router.replace("/(tabs)")
    }
  }

  if (step === "skill" && selectedActivity && RATING_CONFIGS[selectedActivity]) {
    const config = RATING_CONFIGS[selectedActivity]

    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-20 pb-10">
          <View className="mb-8">
            <Text className="text-sm text-primary mb-2">Question 2 of 6</Text>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View className="h-full w-2/6 bg-primary rounded-full" />
            </View>
          </View>

          <Text className="text-3xl font-bold text-foreground mb-4">What's your {selectedActivity} skill level?</Text>
          <Text className="text-muted-foreground mb-8">{config.description}</Text>

          <View className="space-y-3 mb-8">
            {config.levels.map((level) => (
              <TouchableOpacity
                key={level.value}
                onPress={() => setSelectedSkillLevel(level.value)}
                className={`border-2 rounded-xl p-5 ${
                  selectedSkillLevel === level.value ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: level.color }} />
                    <Text className="text-foreground font-bold text-lg">{level.label}</Text>
                  </View>
                  <Text className="text-primary font-bold">{level.value}</Text>
                </View>
                <Text className="text-muted-foreground">{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedSkillLevel !== null && (
            <TouchableOpacity onPress={handleSkillSelect} className="bg-primary rounded-xl py-4">
              <Text className="text-center text-background font-bold text-lg">Continue</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    )
  }

  if (step === "location") {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
        <View className="flex-1 px-6 pt-20 pb-10 justify-center items-center">
          <Ionicons name="location" size={80} color="#84CC16" />
          <Text className="text-3xl font-bold text-foreground mt-8 mb-4 text-center">Enable Location</Text>
          <Text className="text-muted-foreground text-center mb-8 px-4">
            Allow GoodRunss to access your location to show nearby trainers, courts, and studios in your area.
          </Text>

          {locationError && (
            <View className="bg-destructive/20 border border-destructive rounded-lg p-4 mb-6">
              <Text className="text-destructive text-center">{locationError}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLocationRequest}
            disabled={locationLoading}
            className="bg-primary rounded-xl py-4 px-8 w-full mb-4"
          >
            {locationLoading ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <Text className="text-center text-background font-bold text-lg">Enable Location</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipLocation} className="py-3">
            <Text className="text-muted-foreground text-center">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView contentContainerClassName="px-6 pt-20 pb-10">
        <View className="mb-8">
          <Text className="text-sm text-primary mb-2">Question 1 of 6</Text>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View className="h-full w-1/6 bg-primary rounded-full" />
          </View>
        </View>

        <Text className="text-3xl font-bold text-foreground mb-8">What activities do you enjoy?</Text>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-primary mb-4">GoodRunss Rec</Text>
          <View className="space-y-3">
            {REC_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity}
                onPress={() => setSelectedActivity(activity)}
                className={`border-2 rounded-xl p-4 ${
                  selectedActivity === activity ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <Text className="text-foreground font-medium">{activity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-accent mb-4">GoodRunss Studios</Text>
          <View className="space-y-3">
            {STUDIO_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity}
                onPress={() => setSelectedActivity(activity)}
                className={`border-2 rounded-xl p-4 ${
                  selectedActivity === activity ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <Text className="text-foreground font-medium">{activity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedActivity && (
          <TouchableOpacity onPress={handleActivitySelect} className="bg-primary rounded-xl py-4 mt-4">
            <Text className="text-center text-background font-bold text-lg">Continue</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
