"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "available" | "completed">("active")

  const activeChallenges = [
    {
      id: 1,
      title: "7 Day Streak",
      description: "Work out 7 days in a row",
      progress: 5,
      total: 7,
      reward: 100,
      icon: "flame",
      color: ["#FF6B6B", "#FF8E53"],
    },
    {
      id: 2,
      title: "Court Explorer",
      description: "Check in at 5 different courts",
      progress: 3,
      total: 5,
      reward: 75,
      icon: "location",
      color: ["#4FACFE", "#00F2FE"],
    },
  ]

  const availableChallenges = [
    {
      id: 3,
      title: "Social Butterfly",
      description: "Invite 3 friends to join you",
      reward: 150,
      icon: "people",
      color: ["#FA709A", "#FEE140"],
    },
    {
      id: 4,
      title: "Early Bird",
      description: "Complete 5 morning workouts",
      reward: 80,
      icon: "sunny",
      color: ["#667EEA", "#764BA2"],
    },
  ]

  const completedChallenges = [
    {
      id: 5,
      title: "First Session",
      description: "Complete your first workout",
      reward: 50,
      completedDate: "2 days ago",
      icon: "checkmark-circle",
      color: ["#7ED957", "#5FB83D"],
    },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Challenges</Text>
            <TouchableOpacity onPress={() => router.push("/challenges/leaderboard")}>
              <Ionicons name="trophy-outline" size={24} color="#7ED957" />
            </TouchableOpacity>
          </View>
          <Text className="text-muted-foreground">Complete challenges to earn credits and badges</Text>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "active" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("active")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "active" ? "text-background" : "text-muted-foreground"}`}
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "available" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("available")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "available" ? "text-background" : "text-muted-foreground"}`}
              >
                Available
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "completed" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("completed")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "completed" ? "text-background" : "text-muted-foreground"}`}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {activeTab === "active" &&
            activeChallenges.map((challenge) => (
              <TouchableOpacity key={challenge.id} className="mb-4">
                <LinearGradient
                  colors={challenge.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-6"
                >
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name={challenge.icon as any} size={24} color="#fff" />
                        <Text className="text-white font-bold text-xl ml-2">{challenge.title}</Text>
                      </View>
                      <Text className="text-white/80 mb-3">{challenge.description}</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="gift" size={16} color="#fff" />
                        <Text className="text-white font-bold ml-1">{challenge.reward} credits</Text>
                      </View>
                    </View>
                  </View>
                  <View className="mb-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-white/80 text-sm">Progress</Text>
                      <Text className="text-white font-bold text-sm">
                        {challenge.progress}/{challenge.total}
                      </Text>
                    </View>
                    <View className="bg-white/20 rounded-full h-2">
                      <View
                        className="bg-white rounded-full h-2"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

          {activeTab === "available" &&
            availableChallenges.map((challenge) => (
              <TouchableOpacity key={challenge.id} className="bg-card border border-border rounded-2xl p-6 mb-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <LinearGradient
                        colors={challenge.color}
                        className="rounded-full w-10 h-10 items-center justify-center mr-3"
                      >
                        <Ionicons name={challenge.icon as any} size={20} color="#fff" />
                      </LinearGradient>
                      <Text className="text-foreground font-bold text-lg flex-1">{challenge.title}</Text>
                    </View>
                    <Text className="text-muted-foreground mb-3">{challenge.description}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="gift" size={16} color="#7ED957" />
                      <Text className="text-primary font-bold ml-1">{challenge.reward} credits</Text>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-primary rounded-xl px-4 py-2">
                    <Text className="text-background font-bold">Start</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

          {activeTab === "completed" &&
            completedChallenges.map((challenge) => (
              <View key={challenge.id} className="bg-card border border-border rounded-2xl p-6 mb-4">
                <View className="flex-row items-start">
                  <LinearGradient
                    colors={challenge.color}
                    className="rounded-full w-12 h-12 items-center justify-center mr-4"
                  >
                    <Ionicons name={challenge.icon as any} size={24} color="#fff" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{challenge.title}</Text>
                    <Text className="text-muted-foreground mb-2">{challenge.description}</Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="gift" size={16} color="#7ED957" />
                        <Text className="text-primary font-bold ml-1">{challenge.reward} credits earned</Text>
                      </View>
                      <Text className="text-muted-foreground text-sm">{challenge.completedDate}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
