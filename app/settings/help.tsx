
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function HelpScreen() {
  const helpTopics = [
    { title: "Getting Started", icon: "rocket", articles: 8 },
    { title: "Booking & Payments", icon: "card", articles: 12 },
    { title: "Account Settings", icon: "settings", articles: 6 },
    { title: "Troubleshooting", icon: "construct", articles: 15 },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Help Center</Text>
          <Text className="text-muted-foreground">Find answers to common questions</Text>
        </View>

        {/* Help Topics */}
        <View className="px-6 gap-4">
          {helpTopics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              className="bg-card border border-border rounded-2xl p-6"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-primary/20 rounded-full p-3 mr-4">
                    <Ionicons name={topic.icon as any} size={24} color="#7ED957" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{topic.title}</Text>
                    <Text className="text-muted-foreground text-sm">{topic.articles} articles</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Support */}
        <View className="px-6 mt-6">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push("/(tabs)/messages")
            }}
          >
            <Ionicons name="chatbubble" size={20} color="#000" />
            <Text className="text-background font-bold ml-2">Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
