"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

export default function OnboardingScreen() {
  const router = useRouter()
  const [userType, setUserType] = useState<"player" | "trainer" | null>(null)

  const handleContinue = () => {
    if (userType) {
      router.push("/onboarding/questionnaire")
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView contentContainerClassName="flex-1 px-6 pt-20">
        <View className="mb-12">
          <Text className="text-4xl font-bold text-foreground mb-4">Welcome to GoodRunss</Text>
          <Text className="text-lg text-muted-foreground">Let's get you set up. What brings you here?</Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => setUserType("player")}
            className={`border-2 rounded-2xl p-6 ${
              userType === "player" ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <Text className="text-2xl font-bold text-foreground mb-2">I'm a Player</Text>
            <Text className="text-muted-foreground">Find courts, trainers, and join games</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setUserType("trainer")}
            className={`border-2 rounded-2xl p-6 ${
              userType === "trainer" ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <Text className="text-2xl font-bold text-foreground mb-2">I'm a Trainer/Instructor</Text>
            <Text className="text-muted-foreground">Manage clients and grow your business</Text>
          </TouchableOpacity>
        </View>

        {userType && (
          <TouchableOpacity onPress={handleContinue} className="bg-primary rounded-xl py-4 mt-8">
            <Text className="text-center text-background font-bold text-lg">Continue</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
