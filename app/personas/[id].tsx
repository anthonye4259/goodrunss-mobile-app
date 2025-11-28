
import { useRef, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import { type Persona, PERSONA_ACTIONS } from "@/lib/persona-types"

export default function PersonaDetailScreen() {
  const { id } = useLocalSearchParams()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  // Mock persona data
  const persona: Persona = {
    id: id as string,
    userId: "trainer1",
    type: "trainer",
    name: "Coach Mike",
    displayName: "Coach Mike (AI Persona)",
    bio: "Elite basketball conditioning specialist with 15+ years experience training NBA players. Specializes in defensive techniques, footwork drills, and building championship-level endurance.",
    sportIcons: ["🏀"],
    skillGraph: {
      sportFocus: ["Basketball", "Conditioning", "Agility", "Defense"],
      strengths: ["Footwork", "Defense", "Endurance", "Mental Toughness"],
      habits: ["Early morning training", "Film study", "Nutrition focus", "Recovery protocols"],
      voiceTone: "intense",
      energyLevel: 9,
    },
    rating: 4.8,
    usageCount: 1247,
    earnings: 3890,
    voiceEnabled: true,
    actions: ["give_advice", "create_workout", "analyze_performance", "simulate_practice"],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: true,
    isFeatured: true,
  }

  const pricing = {
    perSession: 5.99,
    monthly: 49.99,
    credits: 10, // Credits per session
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-16 pb-6">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View className="flex-row items-start mb-4">
              <View className="bg-lime-500/20 rounded-full w-20 h-20 items-center justify-center mr-4">
                <Text className="text-4xl">{persona.sportIcons[0]}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <Text className="text-white font-bold text-2xl">{persona.name}</Text>
                  <View className="bg-purple-500/20 rounded-full px-3 py-1">
                    <Text className="text-purple-400 text-xs font-bold">AI PERSONA</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#7ED957" />
                  <Text className="text-white text-base ml-1 font-semibold">{persona.rating}</Text>
                  <Text className="text-zinc-600 text-base mx-2">•</Text>
                  <Text className="text-zinc-400 text-base">{persona.usageCount.toLocaleString()} sessions</Text>
                </View>
              </View>
            </View>

            <Text className="text-zinc-300 text-base leading-relaxed mb-4">{persona.bio}</Text>

            {/* Voice Badge */}
            {persona.voiceEnabled && (
              <View className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 flex-row items-center">
                <Ionicons name="mic" size={20} color="#3b82f6" />
                <Text className="text-blue-400 ml-2 font-medium">Voice-enabled with ElevenLabs</Text>
              </View>
            )}
          </View>

          {/* Energy Level */}
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-bold text-lg">Energy Level</Text>
                <View className="flex-row items-center">
                  <Ionicons name="flash" size={20} color="#7ED957" />
                  <Text className="text-lime-500 text-xl font-bold ml-1">{persona.skillGraph.energyLevel}/10</Text>
                </View>
              </View>
              <View className="bg-zinc-800 rounded-full h-3 overflow-hidden">
                <LinearGradient
                  colors={["#7ED957", "#84cc16"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${persona.skillGraph.energyLevel * 10}%`, height: "100%", borderRadius: 9999 }}
                />
              </View>
              <Text className="text-zinc-500 text-sm mt-2">
                {persona.skillGraph.voiceTone.charAt(0).toUpperCase() + persona.skillGraph.voiceTone.slice(1)} coaching
                style
              </Text>
            </View>
          </View>

          {/* Skill Graph */}
          <View className="px-6 mb-6">
            <Text className="text-white font-bold text-xl mb-4">Skill Focus</Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <View className="flex-row flex-wrap gap-2">
                {persona.skillGraph.sportFocus.map((skill, idx) => (
                  <View key={idx} className="bg-lime-500/10 border border-lime-500/30 rounded-lg px-4 py-2">
                    <Text className="text-lime-500 font-medium">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Strengths */}
          <View className="px-6 mb-6">
            <Text className="text-white font-bold text-xl mb-4">Core Strengths</Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              {persona.skillGraph.strengths.map((strength, idx) => (
                <View key={idx} className="flex-row items-center mb-3 last:mb-0">
                  <View className="bg-lime-500 rounded-full w-2 h-2 mr-3" />
                  <Text className="text-zinc-300 text-base flex-1">{strength}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Training Habits */}
          <View className="px-6 mb-6">
            <Text className="text-white font-bold text-xl mb-4">Training Philosophy</Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              {persona.skillGraph.habits.map((habit, idx) => (
                <View key={idx} className="flex-row items-center mb-3 last:mb-0">
                  <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                  <Text className="text-zinc-300 text-base ml-3 flex-1">{habit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Available Actions */}
          <View className="px-6 mb-6">
            <Text className="text-white font-bold text-xl mb-4">What I Can Do</Text>
            <View className="gap-3">
              {persona.actions.map((action) => {
                const actionInfo = PERSONA_ACTIONS[action]
                return (
                  <View
                    key={action}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-row items-center"
                  >
                    <View className="bg-lime-500/20 rounded-full w-10 h-10 items-center justify-center mr-3">
                      <Ionicons name={actionInfo.icon as any} size={20} color="#7ED957" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold mb-1">{actionInfo.label}</Text>
                      <Text className="text-zinc-400 text-sm">{actionInfo.description}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Stats */}
          <View className="px-6 mb-10">
            <Text className="text-white font-bold text-xl mb-4">Performance Stats</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <Ionicons name="people" size={24} color="#7ED957" />
                <Text className="text-white text-2xl font-bold mt-2">{persona.usageCount.toLocaleString()}</Text>
                <Text className="text-zinc-400 text-sm">Total Sessions</Text>
              </View>
              <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <Ionicons name="star" size={24} color="#7ED957" />
                <Text className="text-white text-2xl font-bold mt-2">{persona.rating}</Text>
                <Text className="text-zinc-400 text-sm">Avg Rating</Text>
              </View>
            </View>
          </View>

          <View className="px-6 mb-10">
            <Text className="text-white font-bold text-xl mb-4">Pricing</Text>
            <View className="gap-3">
              <View className="bg-zinc-900 border border-lime-500/30 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-white font-semibold text-lg">Pay Per Session</Text>
                  <Text className="text-lime-500 font-bold text-2xl">${pricing.perSession}</Text>
                </View>
                <Text className="text-zinc-400 text-sm">or {pricing.credits} credits per session</Text>
              </View>
              <View className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View>
                    <Text className="text-white font-semibold text-lg">Monthly Unlimited</Text>
                    <Text className="text-zinc-400 text-sm">Best value - unlimited sessions</Text>
                  </View>
                  <Text className="text-purple-400 font-bold text-2xl">${pricing.monthly}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 py-4 border-t border-zinc-800 bg-black">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-4 flex-row items-center justify-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                console.log("[v0] Purchase single session")
              }}
            >
              <Text className="text-white font-semibold">1 Session</Text>
              <Text className="text-lime-500 font-bold ml-2">${pricing.perSession}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-lime-500 rounded-xl py-4 flex-row items-center justify-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                router.push(`/personas/${id}/chat`)
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#000" />
              <Text className="text-black font-bold ml-2">Start Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  )
}
