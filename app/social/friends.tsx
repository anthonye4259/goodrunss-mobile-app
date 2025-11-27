"use client"

import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import { SkeletonLoader } from "@/components/skeleton-loader"

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "find">("friends")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const friends = [
    { id: 1, name: "Sarah Johnson", username: "@sarahj", activity: "Basketball", mutualFriends: 12, avatar: "SJ" },
    { id: 2, name: "Mike Chen", username: "@mikechen", activity: "Tennis", mutualFriends: 8, avatar: "MC" },
    { id: 3, name: "Emma Davis", username: "@emmad", activity: "Yoga", mutualFriends: 15, avatar: "ED" },
  ]

  const requests = [
    { id: 4, name: "Alex Martinez", username: "@alexm", activity: "Golf", mutualFriends: 5, avatar: "AM" },
    { id: 5, name: "Lisa Wong", username: "@lisaw", activity: "Pilates", mutualFriends: 3, avatar: "LW" },
  ]

  const suggestions = [
    { id: 6, name: "Tom Anderson", username: "@toma", activity: "Basketball", mutualFriends: 7, avatar: "TA" },
    { id: 7, name: "Rachel Green", username: "@rachelg", activity: "Tennis", mutualFriends: 4, avatar: "RG" },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Friends</Text>
            <TouchableOpacity onPress={() => console.log("Settings")}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "friends" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("friends")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "friends" ? "text-background" : "text-muted-foreground"}`}
              >
                Friends ({friends.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "requests" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("requests")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "requests" ? "text-background" : "text-muted-foreground"}`}
              >
                Requests ({requests.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "find" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("find")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "find" ? "text-background" : "text-muted-foreground"}`}
              >
                Find
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === "find" && (
          <View className="px-6 mb-6">
            <View className="bg-card border border-border rounded-xl flex-row items-center px-4 py-3">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 text-foreground"
                placeholder="Search by name or username..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        <View className="px-6">
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : (
            <>
              {activeTab === "friends" &&
                friends.map((friend) => (
                  <View key={friend.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                          <Text className="text-primary font-bold text-lg">{friend.avatar}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-bold text-lg">{friend.name}</Text>
                          <Text className="text-muted-foreground text-sm">{friend.username}</Text>
                          <Text className="text-muted-foreground text-xs mt-1">
                            {friend.activity} • {friend.mutualFriends} mutual friends
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        className="bg-primary rounded-xl px-4 py-2"
                        onPress={() => router.push(`/chat/${friend.id}`)}
                      >
                        <Text className="text-background font-bold">Message</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

              {activeTab === "requests" &&
                requests.map((request) => (
                  <View key={request.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                        <Text className="text-primary font-bold text-lg">{request.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg">{request.name}</Text>
                        <Text className="text-muted-foreground text-sm">{request.username}</Text>
                        <Text className="text-muted-foreground text-xs mt-1">
                          {request.activity} • {request.mutualFriends} mutual friends
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity className="flex-1 bg-primary rounded-xl py-3">
                        <Text className="text-background font-bold text-center">Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-card border border-border rounded-xl py-3">
                        <Text className="text-muted-foreground font-bold text-center">Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

              {activeTab === "find" &&
                suggestions.map((suggestion) => (
                  <View key={suggestion.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                          <Text className="text-primary font-bold text-lg">{suggestion.avatar}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-bold text-lg">{suggestion.name}</Text>
                          <Text className="text-muted-foreground text-sm">{suggestion.username}</Text>
                          <Text className="text-muted-foreground text-xs mt-1">
                            {suggestion.activity} • {suggestion.mutualFriends} mutual friends
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity className="bg-primary rounded-xl px-4 py-2">
                        <Text className="text-background font-bold">Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
