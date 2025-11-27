"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

const INTRO_STEPS = [
  {
    title: "Meet GIA",
    subtitle: "Your Personal AI Assistant",
    description: "GIA is your intelligent fitness companion, designed to help you achieve your goals faster.",
    gradient: ["#0EA5E9", "#0369A1", "#0A0A0A"],
    icon: "sparkles" as const,
  },
  {
    title: "What GIA Can Do",
    subtitle: "Your All-in-One Fitness Partner",
    features: [
      { icon: "location", text: "Find nearby courts and facilities" },
      { icon: "barbell", text: "Generate personalized workouts" },
      { icon: "calendar", text: "Book trainers and classes instantly" },
      { icon: "stats-chart", text: "Track your progress and stats" },
      { icon: "people", text: "Connect with players near you" },
      { icon: "chatbubbles", text: "Get instant answers to fitness questions" },
    ],
    gradient: ["#8B5CF6", "#6D28D9", "#0A0A0A"],
  },
  {
    title: "Seamless Integrations",
    subtitle: "Connect Your Favorite Apps",
    integrations: [
      { icon: "fitness", text: "Apple Health & HealthKit" },
      { icon: "watch", text: "Apple Watch" },
      { icon: "bicycle", text: "Strava" },
      { icon: "heart", text: "Fitbit" },
      { icon: "analytics", text: "MyFitnessPal" },
      { icon: "calendar", text: "Google Calendar" },
    ],
    gradient: ["#84CC16", "#65A30D", "#0A0A0A"],
  },
]

export default function GIAIntroScreen() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const step = INTRO_STEPS[currentStep]

  const handleNext = async () => {
    if (currentStep < INTRO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await AsyncStorage.setItem("hasSeenGIAIntro", "true")
      router.push("/onboarding")
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasSeenGIAIntro", "true")
    router.push("/onboarding")
  }

  return (
    <LinearGradient colors={step.gradient} className="flex-1">
      <View className="flex-1 px-6 pt-16 pb-10">
        {/* Skip Button */}
        {currentStep < INTRO_STEPS.length - 1 && (
          <TouchableOpacity onPress={handleSkip} className="self-end mb-8">
            <Text className="text-white/70 text-base">Skip</Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        <Animated.View
          key={currentStep}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(200)}
          className="flex-1 justify-center"
        >
          {/* Icon */}
          {step.icon && (
            <View className="items-center mb-8">
              <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center">
                <Ionicons name={step.icon} size={48} color="white" />
              </View>
            </View>
          )}

          {/* Title */}
          <Text className="text-white text-5xl font-bold mb-3 text-center">{step.title}</Text>
          <Text className="text-white/90 text-2xl mb-6 text-center" style={{ fontFamily: "serif" }}>
            {step.subtitle}
          </Text>

          {/* Description */}
          {step.description && <Text className="text-white/80 text-lg text-center mb-8 px-4">{step.description}</Text>}

          {/* Features List */}
          {step.features && (
            <View className="space-y-4 mb-8">
              {step.features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.delay(index * 100).duration(400)}
                  className="flex-row items-center bg-white/10 rounded-2xl p-4"
                >
                  <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
                    <Ionicons name={feature.icon} size={24} color="white" />
                  </View>
                  <Text className="text-white text-base flex-1">{feature.text}</Text>
                </Animated.View>
              ))}
            </View>
          )}

          {/* Integrations Grid */}
          {step.integrations && (
            <View className="flex-row flex-wrap justify-center gap-3 mb-8">
              {step.integrations.map((integration, index) => (
                <Animated.View
                  key={index}
                  entering={FadeIn.delay(index * 80).duration(400)}
                  className="bg-white/10 rounded-2xl p-4 items-center"
                  style={{ width: (width - 60) / 2 - 6 }}
                >
                  <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-2">
                    <Ionicons name={integration.icon} size={24} color="white" />
                  </View>
                  <Text className="text-white text-sm text-center">{integration.text}</Text>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Progress Dots */}
        <View className="flex-row justify-center items-center mb-6">
          {INTRO_STEPS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${index === currentStep ? "w-8 bg-white" : "w-2 bg-white/30"}`}
            />
          ))}
        </View>

        {/* Get Started Button */}
        <TouchableOpacity onPress={handleNext} className="bg-white rounded-2xl py-5">
          <Text className="text-center text-black font-bold text-lg">
            {currentStep === INTRO_STEPS.length - 1 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        {currentStep === INTRO_STEPS.length - 1 && (
          <TouchableOpacity onPress={() => router.push("/auth")} className="mt-4">
            <Text className="text-white/70 text-center">
              Already have an account? <Text className="text-white font-semibold">Log In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  )
}
