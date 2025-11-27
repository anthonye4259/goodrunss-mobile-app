"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Animated, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import type { Persona } from "@/lib/persona-types"
import { EmptyState } from "@/components/empty-state"

export default function PersonasScreen() {
  const [activeTab, setActiveTab] = useState<"featured" | "trainers" | "players">("featured")
  const [searchQuery, setSearchQuery] = useState("")
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  // Mock personas data
  const personas: Persona[] = [
    {
      id: "1",
      userId: "trainer1",
      type: "trainer",
      name: "Coach Mike",
      displayName: "Coach Mike (AI Persona)",
      bio: "Elite basketball conditioning specialist. 15+ years experience training NBA players.",
      sportIcons: ["🏀"],
      skillGraph: {
        sportFocus: ["Basketball", "Conditioning", "Agility"],
        strengths: ["Footwork", "Defense", "Endurance"],
        habits: ["Early morning training", "Film study", "Nutrition focus"],
        voiceTone: "intense",
        energyLevel: 9,
      },
      rating: 4.8,
      usageCount: 1247,
      earnings: 3890,
      voiceEnabled: true,
      actions: ["give_advice", "create_workout", "analyze_performance"],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      isFeatured: true,
    },
    {
      id: "2",
      userId: "trainer2",
      type: "trainer",
      name: "Coach Sarah",
      displayName: "Coach Sarah (AI Persona)",
      bio: "Tennis agility and footwork expert. Former D1 player turned coach.",
      sportIcons: ["🎾"],
      skillGraph: {
        sportFocus: ["Tennis", "Agility", "Footwork"],
        strengths: ["Court movement", "Quick reflexes", "Strategy"],
        habits: ["Drill repetition", "Video analysis", "Mental training"],
        voiceTone: "motivational",
        energyLevel: 8,
      },
      rating: 4.9,
      usageCount: 892,
      earnings: 2670,
      voiceEnabled: true,
      actions: ["give_advice", "simulate_practice", "recommend_match"],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      isFeatured: true,
    },
    {
      id: "3",
      userId: "trainer3",
      type: "trainer",
      name: "Coach Jay",
      displayName: "Coach Jay (AI Persona)",
      bio: "Pickleball strategy and technique coach. Helping players level up their game.",
      sportIcons: ["🏓"],
      skillGraph: {
        sportFocus: ["Pickleball", "Strategy", "Technique"],
        strengths: ["Dinking", "Third shot drop", "Court positioning"],
        habits: ["Pattern recognition", "Shot selection", "Partner communication"],
        voiceTone: "friendly",
        energyLevel: 7,
      },
      rating: 4.7,
      usageCount: 634,
      earnings: 1890,
      voiceEnabled: false,
      actions: ["give_advice", "schedule_session", "analyze_performance"],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      isFeatured: true,
    },
  ]

  const filteredPersonas = personas
    .filter((persona) => {
      if (activeTab === "featured") return persona.isFeatured
      if (activeTab === "trainers") return persona.type === "trainer"
      if (activeTab === "players") return persona.type === "player"
      return true
    })
    .filter(
      (persona) =>
        persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        persona.bio.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-16 pb-6">
            <Text className="text-white text-3xl font-bold mb-2">AI Personas</Text>
            <Text className="text-zinc-400 text-base">Train with AI-powered coaches</Text>
          </View>

          {/* Search */}
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 border border-zinc-800 rounded-xl flex-row items-center px-4 py-3">
              <Ionicons name="search" size={20} color="#7ED957" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search personas..."
                placeholderTextColor="#71717a"
                className="flex-1 ml-3 text-white text-base"
              />
            </View>
          </View>

          {/* Tabs */}
          <View className="px-6 mb-6">
            <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex-row">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${activeTab === "featured" ? "bg-lime-500" : ""}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setActiveTab("featured")
                }}
              >
                <Text
                  className={`text-center font-semibold ${activeTab === "featured" ? "text-black" : "text-zinc-400"}`}
                >
                  Featured
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${activeTab === "trainers" ? "bg-lime-500" : ""}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setActiveTab("trainers")
                }}
              >
                <Text
                  className={`text-center font-semibold ${activeTab === "trainers" ? "text-black" : "text-zinc-400"}`}
                >
                  Trainers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${activeTab === "players" ? "bg-lime-500" : ""}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setActiveTab("players")
                }}
              >
                <Text
                  className={`text-center font-semibold ${activeTab === "players" ? "text-black" : "text-zinc-400"}`}
                >
                  Players
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personas List */}
          <View className="px-6 pb-10">
            {filteredPersonas.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No personas found"
                description="Try adjusting your search or filters"
              />
            ) : (
              filteredPersonas.map((persona) => (
                <TouchableOpacity
                  key={persona.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    router.push(`/personas/${persona.id}`)
                  }}
                >
                  {/* Header */}
                  <View className="flex-row items-start mb-3">
                    <View className="bg-lime-500/20 rounded-full w-16 h-16 items-center justify-center mr-4">
                      <Text className="text-3xl">{persona.sportIcons[0]}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-white font-bold text-lg">{persona.name}</Text>
                        <View className="bg-purple-500/20 rounded-full px-2 py-0.5">
                          <Text className="text-purple-400 text-xs font-medium">AI</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="star" size={14} color="#7ED957" />
                        <Text className="text-zinc-400 text-sm ml-1">{persona.rating}</Text>
                        <Text className="text-zinc-600 text-sm mx-2">•</Text>
                        <Text className="text-zinc-400 text-sm">{persona.usageCount} sessions</Text>
                      </View>
                    </View>
                    {persona.voiceEnabled && (
                      <View className="bg-blue-500/20 rounded-full p-2">
                        <Ionicons name="mic" size={16} color="#3b82f6" />
                      </View>
                    )}
                  </View>

                  {/* Bio */}
                  <Text className="text-zinc-400 text-sm mb-3" numberOfLines={2}>
                    {persona.bio}
                  </Text>

                  {/* Energy Level */}
                  <View className="mb-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-zinc-500 text-xs">Energy Level</Text>
                      <Text className="text-lime-500 text-xs font-semibold">{persona.skillGraph.energyLevel}/10</Text>
                    </View>
                    <View className="bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <View
                        className="bg-lime-500 h-full rounded-full"
                        style={{ width: `${persona.skillGraph.energyLevel * 10}%` }}
                      />
                    </View>
                  </View>

                  {/* Skills */}
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {persona.skillGraph.sportFocus.slice(0, 3).map((skill, idx) => (
                      <View key={idx} className="bg-lime-500/10 rounded-lg px-3 py-1">
                        <Text className="text-lime-500 text-xs font-medium">{skill}</Text>
                      </View>
                    ))}
                  </View>

                  {/* CTA */}
                  <TouchableOpacity
                    className="bg-lime-500 rounded-xl py-3"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                      router.push(`/personas/${persona.id}/chat`)
                    }}
                  >
                    <Text className="text-black font-bold text-center">Chat with {persona.name}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Create Persona FAB */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-lime-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            router.push("/personas/create")
          }}
        >
          <Ionicons name="add" size={28} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  )
}
