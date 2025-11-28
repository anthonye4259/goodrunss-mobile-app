
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import type { WaitlistEntry, WaitlistStats } from "@/lib/waitlist-types"

export default function ManageWaitlistScreen() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([
    {
      id: "1",
      userId: "user1",
      userName: "Alex Johnson",
      userEmail: "alex@example.com",
      userPhone: "+1234567890",
      trainerId: "trainer1",
      preferredDate: "2024-02-15",
      timePreference: "morning",
      notificationChannels: ["email", "sms", "push"],
      status: "active",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      priority: 1,
    },
    {
      id: "2",
      userId: "user2",
      userName: "Sarah Williams",
      userEmail: "sarah@example.com",
      timePreference: "flexible",
      notificationChannels: ["email", "push"],
      status: "active",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
      priority: 2,
    },
  ])

  const stats: WaitlistStats = {
    totalEntries: waitlistEntries.length,
    activeEntries: waitlistEntries.filter((e) => e.status === "active").length,
    notifiedToday: 0,
    bookedFromWaitlist: 3,
  }

  const handleNotifyWaitlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert("Notify Waitlist", "This will notify the next person on the waitlist. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Notify",
        onPress: () => {
          // Call backend API to notify next person
          console.log("[v0] Notifying next person on waitlist")
          Alert.alert("Success", "The next person on the waitlist has been notified!")
        },
      },
    ])
  }

  const handleNotifyAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert("Notify All", `This will notify all ${stats.activeEntries} people on the waitlist. Continue?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Notify All",
        style: "destructive",
        onPress: () => {
          console.log("[v0] Notifying all waitlist entries")
          Alert.alert("Success", `All ${stats.activeEntries} people have been notified!`)
        },
      },
    ])
  }

  const getTimePreferenceIcon = (pref: string) => {
    const icons: Record<string, string> = {
      morning: "sunny",
      afternoon: "partly-sunny",
      evening: "moon",
      flexible: "time",
    }
    return icons[pref] || "time"
  }

  const getDaysAgo = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000))
    return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
            className="mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Manage Waitlist</Text>
          <Text className="text-muted-foreground">Notify players when spots open up</Text>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-muted-foreground text-sm mb-1">Active</Text>
              <Text className="text-foreground text-2xl font-bold">{stats.activeEntries}</Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-muted-foreground text-sm mb-1">Notified Today</Text>
              <Text className="text-foreground text-2xl font-bold">{stats.notifiedToday}</Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-muted-foreground text-sm mb-1">Booked</Text>
              <Text className="text-foreground text-2xl font-bold">{stats.bookedFromWaitlist}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-primary rounded-xl py-4"
              onPress={handleNotifyWaitlist}
              disabled={stats.activeEntries === 0}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="notifications" size={20} color="#000" />
                <Text className="text-black font-bold ml-2">Notify Next</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-card border border-primary rounded-xl py-4"
              onPress={handleNotifyAll}
              disabled={stats.activeEntries === 0}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="megaphone" size={20} color="#7ED957" />
                <Text className="text-primary font-bold ml-2">Notify All</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Waitlist Entries */}
        <View className="px-6">
          <Text className="text-foreground font-bold text-xl mb-4">Waitlist Queue</Text>
          {waitlistEntries.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-8 items-center">
              <Ionicons name="list-outline" size={48} color="#666" />
              <Text className="text-muted-foreground text-center mt-4">No one on the waitlist yet</Text>
            </View>
          ) : (
            waitlistEntries.map((entry, index) => (
              <View key={entry.id} className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-primary rounded-full w-8 h-8 items-center justify-center mr-3">
                        <Text className="text-black font-bold">#{entry.priority}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg">{entry.userName}</Text>
                        <Text className="text-muted-foreground text-sm">{entry.userEmail}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="bg-primary/20 rounded-lg px-3 py-1">
                    <Text className="text-primary text-xs font-semibold capitalize">{entry.status}</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2 mb-3">
                  {entry.preferredDate && (
                    <View className="bg-muted/30 rounded-lg px-3 py-1 flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color="#7ED957" />
                      <Text className="text-foreground text-xs ml-1">{entry.preferredDate}</Text>
                    </View>
                  )}
                  <View className="bg-muted/30 rounded-lg px-3 py-1 flex-row items-center">
                    <Ionicons name={getTimePreferenceIcon(entry.timePreference) as any} size={14} color="#7ED957" />
                    <Text className="text-foreground text-xs ml-1 capitalize">{entry.timePreference}</Text>
                  </View>
                  {entry.notificationChannels.map((channel) => (
                    <View key={channel} className="bg-muted/30 rounded-lg px-3 py-1 flex-row items-center">
                      <Ionicons
                        name={
                          channel === "email" ? "mail" : channel === "sms" ? "chatbubble" : ("notifications" as any)
                        }
                        size={14}
                        color="#7ED957"
                      />
                      <Text className="text-foreground text-xs ml-1 capitalize">{channel}</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-xs">Joined {getDaysAgo(entry.createdAt)}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      Alert.alert("Notify Player", `Send notification to ${entry.userName}?`, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Notify",
                          onPress: () => {
                            console.log("[v0] Notifying player:", entry.id)
                            Alert.alert("Success", `${entry.userName} has been notified!`)
                          },
                        },
                      ])
                    }}
                  >
                    <View className="bg-primary/20 rounded-lg px-4 py-2">
                      <Text className="text-primary font-semibold text-sm">Notify</Text>
                    </View>
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
