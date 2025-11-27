"use client"

import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useState, useEffect } from "react"
import type { Friendship } from "@/lib/friends-types"

export default function FriendSettingsScreen() {
  const { friendshipId } = useLocalSearchParams<{ friendshipId: string }>()
  const [friendship, setFriendship] = useState<Friendship | null>(null)
  const [loading, setLoading] = useState(true)

  // Friend-specific settings
  const [shareMyLocation, setShareMyLocation] = useState(true)
  const [shareMyActivity, setShareMyActivity] = useState(true)
  const [notifyWhenNearby, setNotifyWhenNearby] = useState(true)
  const [notifyActivity, setNotifyActivity] = useState(true)
  const [notifyAchievements, setNotifyAchievements] = useState(true)
  const [muteConversation, setMuteConversation] = useState(false)

  useEffect(() => {
    loadFriendship()
  }, [friendshipId])

  const loadFriendship = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/friendships/${friendshipId}`)
      // const data = await response.json()

      // Mock data
      const mockFriendship: Friendship = {
        id: friendshipId!,
        userId: "user-123",
        friendId: "friend-456",
        status: "accepted",
        createdAt: "2024-01-15",
        acceptedAt: "2024-01-15",
        friend: {
          id: "friend-456",
          userId: "friend-456",
          name: "Sarah Johnson",
          username: "sarahj",
          avatar: "/placeholder.svg?height=48&width=48",
          activities: ["Tennis", "Volleyball"],
          location: {
            city: "Myrtle Beach",
            state: "SC",
            distance: 2.3,
          },
          stats: {
            totalSessions: 89,
            streak: 15,
            credits: 1245,
          },
          privacy: {
            shareLocation: true,
            shareActivity: true,
            shareStats: true,
          },
        },
      }

      setFriendship(mockFriendship)

      // Load user's sharing preferences for this friend
      // TODO: Load from API
      setShareMyLocation(true)
      setShareMyActivity(true)
      setNotifyWhenNearby(true)
      setNotifyActivity(true)
      setNotifyAchievements(true)
      setMuteConversation(false)
    } catch (error) {
      console.error("Error loading friendship:", error)
      Alert.alert("Error", "Failed to load friend settings")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSetting = async (key: string, value: boolean) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/friendships/${friendshipId}/settings`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ [key]: value })
      // })
      console.log(`Updated ${key} to ${value}`)
    } catch (error) {
      console.error("Error updating setting:", error)
      Alert.alert("Error", "Failed to update setting")
    }
  }

  const handleUnfriend = () => {
    Alert.alert("Remove Friend", `Are you sure you want to remove ${friendship?.friend.name} from your friends?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Replace with actual API call
            // await fetch(`/api/friendships/${friendshipId}`, { method: 'DELETE' })
            Alert.alert("Success", "Friend removed")
            router.back()
          } catch (error) {
            console.error("Error removing friend:", error)
            Alert.alert("Error", "Failed to remove friend")
          }
        },
      },
    ])
  }

  const handleBlock = () => {
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${friendship?.friend.name}? They won't be able to contact you.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await fetch(`/api/friendships/${friendshipId}/block`, { method: 'POST' })
              Alert.alert("Success", "User blocked")
              router.back()
            } catch (error) {
              console.error("Error blocking user:", error)
              Alert.alert("Error", "Failed to block user")
            }
          },
        },
      ],
    )
  }

  if (loading || !friendship) {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1 items-center justify-center">
        <Text className="text-foreground">Loading...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Friend Settings</Text>
          <Text className="text-muted-foreground">Manage your connection with {friendship.friend.name}</Text>
        </View>

        {/* What I Share */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">What I Share</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="location" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Share My Location</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Allow {friendship.friend.name} to see when you're nearby
                  </Text>
                </View>
                <Switch
                  value={shareMyLocation}
                  onValueChange={(value) => {
                    setShareMyLocation(value)
                    handleUpdateSetting("shareMyLocation", value)
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="flash" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Share My Activity</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">Show your check-ins, bookings, and achievements</Text>
                </View>
                <Switch
                  value={shareMyActivity}
                  onValueChange={(value) => {
                    setShareMyActivity(value)
                    handleUpdateSetting("shareMyActivity", value)
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notifications from This Friend */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Notifications</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="navigate" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Nearby Alerts</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Get notified when {friendship.friend.name} is at a facility near you
                  </Text>
                </View>
                <Switch
                  value={notifyWhenNearby}
                  onValueChange={(value) => {
                    setNotifyWhenNearby(value)
                    handleUpdateSetting("notifyWhenNearby", value)
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="fitness" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Activity Updates</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">See when they check in or book sessions</Text>
                </View>
                <Switch
                  value={notifyActivity}
                  onValueChange={(value) => {
                    setNotifyActivity(value)
                    handleUpdateSetting("notifyActivity", value)
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="trophy" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Achievements</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Get notified when they earn badges or complete challenges
                  </Text>
                </View>
                <Switch
                  value={notifyAchievements}
                  onValueChange={(value) => {
                    setNotifyAchievements(value)
                    handleUpdateSetting("notifyAchievements", value)
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="notifications-off" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Mute Conversation</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Stop receiving message notifications from this friend
                  </Text>
                </View>
                <Switch
                  value={muteConversation}
                  onValueChange={(value) => {
                    setMuteConversation(value)
                    handleUpdateSetting("muteConversation", value)
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Danger Zone</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-border" onPress={handleUnfriend}>
              <Ionicons name="person-remove" size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold">Remove Friend</Text>
                <Text className="text-muted-foreground text-sm">You can always add them back later</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4" onPress={handleBlock}>
              <Ionicons name="ban" size={20} color="#EF4444" />
              <View className="flex-1 ml-3">
                <Text className="text-destructive font-semibold">Block User</Text>
                <Text className="text-muted-foreground text-sm">They won't be able to contact you</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
