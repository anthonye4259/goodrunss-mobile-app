"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { useState } from "react"

export default function FeedScreen() {
  const [loading, setLoading] = useState(false)

  const feedItems = [
    {
      id: 1,
      user: { name: "Sarah Johnson", avatar: "SJ" },
      type: "check-in",
      activity: "Basketball",
      location: "Downtown Courts",
      time: "2 hours ago",
      likes: 24,
      comments: 5,
    },
    {
      id: 2,
      user: { name: "Mike Chen", avatar: "MC" },
      type: "achievement",
      achievement: "10 Day Streak",
      activity: "Tennis",
      time: "5 hours ago",
      likes: 42,
      comments: 8,
    },
    {
      id: 3,
      user: { name: "Emma Davis", avatar: "ED" },
      type: "booking",
      trainer: "Alex Martinez",
      activity: "Yoga",
      time: "1 day ago",
      likes: 18,
      comments: 3,
    },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Activity Feed</Text>
            <TouchableOpacity>
              <Ionicons name="filter-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : (
            feedItems.map((item) => (
              <View key={item.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                    <Text className="text-primary font-bold">{item.user.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold">{item.user.name}</Text>
                    <Text className="text-muted-foreground text-xs">{item.time}</Text>
                  </View>
                </View>

                {item.type === "check-in" && (
                  <View className="mb-3">
                    <Text className="text-foreground mb-2">
                      Checked in at <Text className="text-primary font-bold">{item.location}</Text> for {item.activity}
                    </Text>
                  </View>
                )}

                {item.type === "achievement" && (
                  <View className="bg-primary/10 border border-primary rounded-xl p-4 mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="trophy" size={32} color="#7ED957" />
                      <View className="ml-3">
                        <Text className="text-primary font-bold text-lg">{item.achievement}</Text>
                        <Text className="text-muted-foreground text-sm">{item.activity}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {item.type === "booking" && (
                  <View className="mb-3">
                    <Text className="text-foreground">
                      Booked a session with <Text className="text-primary font-bold">{item.trainer}</Text> for{" "}
                      {item.activity}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="heart-outline" size={20} color="#7ED957" />
                    <Text className="text-muted-foreground ml-2">{item.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="chatbubble-outline" size={20} color="#7ED957" />
                    <Text className="text-muted-foreground ml-2">{item.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="share-outline" size={20} color="#7ED957" />
                    <Text className="text-muted-foreground ml-2">Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
