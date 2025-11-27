"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function MatchRequestsScreen() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  const receivedRequests = [
    {
      id: "1",
      playerName: "Mike Johnson",
      sport: "Basketball",
      venue: "Rucker Park",
      date: "Tomorrow",
      time: "3:00 PM",
      message: "Hey! Want to play a pickup game?",
      avatar: "MJ",
    },
    {
      id: "2",
      playerName: "Sarah Chen",
      sport: "Tennis",
      venue: "Chelsea Piers",
      date: "Saturday",
      time: "10:00 AM",
      message: "Looking for a doubles partner!",
      avatar: "SC",
    },
  ]

  const sentRequests = [
    {
      id: "3",
      playerName: "Alex Rivera",
      sport: "Pickleball",
      venue: "West 4th Street Courts",
      date: "Friday",
      time: "6:00 PM",
      status: "pending",
      avatar: "AR",
    },
  ]

  const handleAccept = (requestId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    console.log("[v0] Accepting match request:", requestId)
  }

  const handleDecline = (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    console.log("[v0] Declining match request:", requestId)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Match Requests</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "received" ? "bg-primary" : ""}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setActiveTab("received")
              }}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "received" ? "text-background" : "text-muted-foreground"}`}
              >
                Received ({receivedRequests.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "sent" ? "bg-primary" : ""}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setActiveTab("sent")
              }}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "sent" ? "text-background" : "text-muted-foreground"}`}
              >
                Sent ({sentRequests.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {activeTab === "received"
            ? receivedRequests.map((request) => (
                <View key={request.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                  <View className="flex-row items-start mb-3">
                    <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                      <Text className="text-primary font-bold text-lg">{request.avatar}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-lg mb-1">{request.playerName}</Text>
                      <Text className="text-muted-foreground text-sm">{request.sport}</Text>
                    </View>
                  </View>

                  <View className="bg-muted/20 rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={16} color="#7ED957" />
                      <Text className="text-foreground ml-2">{request.venue}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar" size={16} color="#7ED957" />
                      <Text className="text-foreground ml-2">
                        {request.date} at {request.time}
                      </Text>
                    </View>
                    {request.message && (
                      <View className="flex-row items-start mt-2">
                        <Ionicons name="chatbubble" size={16} color="#7ED957" />
                        <Text className="text-muted-foreground ml-2 flex-1">{request.message}</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 bg-primary rounded-xl py-3"
                      onPress={() => handleAccept(request.id)}
                    >
                      <Text className="text-background font-bold text-center">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-card border border-border rounded-xl py-3"
                      onPress={() => handleDecline(request.id)}
                    >
                      <Text className="text-muted-foreground font-bold text-center">Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            : sentRequests.map((request) => (
                <View key={request.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-start flex-1">
                      <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                        <Text className="text-primary font-bold text-lg">{request.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg mb-1">{request.playerName}</Text>
                        <Text className="text-muted-foreground text-sm">{request.sport}</Text>
                      </View>
                    </View>
                    <View className="bg-accent/20 rounded-full px-3 py-1">
                      <Text className="text-accent font-bold text-xs capitalize">{request.status}</Text>
                    </View>
                  </View>

                  <View className="bg-muted/20 rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location" size={16} color="#7ED957" />
                      <Text className="text-foreground ml-2">{request.venue}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="calendar" size={16} color="#7ED957" />
                      <Text className="text-foreground ml-2">
                        {request.date} at {request.time}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity className="bg-card border border-border rounded-xl py-3">
                    <Text className="text-muted-foreground font-bold text-center">Cancel Request</Text>
                  </TouchableOpacity>
                </View>
              ))}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
