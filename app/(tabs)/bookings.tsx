"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { useRouter } from "expo-router"
import { EmptyState } from "@/components/empty-state"
import { AnimatedButton } from "@/components/animated-button"
import * as Haptics from "expo-haptics"

export default function BookingsScreen() {
  const { preferences } = useUserPreferences()
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "waitlists">("upcoming")
  const router = useRouter()

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = getActivityContent(primaryActivity)

  const upcomingBookings = [
    {
      id: 1,
      type: "trainer",
      title: content.sampleSessions[0].title,
      trainer: content.sampleTrainers[0].name,
      location: content.sampleSessions[0].location,
      date: "Tomorrow",
      time: "3:00 PM - 4:00 PM",
      price: content.sampleTrainers[0].price,
      status: "confirmed",
    },
    {
      id: 2,
      type: "venue",
      title: `${content.locationPrefix} Booking`,
      location: content.sampleSessions[1]?.location || "Downtown Location",
      date: "Saturday",
      time: "10:00 AM - 11:00 AM",
      price: 25,
      status: "confirmed",
    },
  ]

  const pastBookings = [
    {
      id: 3,
      type: "trainer",
      title: content.sampleSessions[0].title,
      trainer: content.sampleTrainers[0].name,
      location: content.sampleSessions[0].location,
      date: "Yesterday",
      time: "3:00 PM - 4:00 PM",
      price: content.sampleTrainers[0].price,
      status: "completed",
    },
  ]

  const myWaitlists = [
    {
      id: "w1",
      type: "trainer",
      name: "Coach Mike",
      preferredDate: "2024-02-15",
      timePreference: "morning",
      joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      position: 3,
      status: "active",
    },
  ]

  const bookings = activeTab === "upcoming" ? upcomingBookings : pastBookings

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">My Bookings</Text>
          <Text className="text-muted-foreground">Manage your sessions and reservations</Text>
        </View>

        {/* Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "upcoming" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "upcoming" ? "text-background" : "text-muted-foreground"}`}
              >
                Upcoming
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "past" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("past")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "past" ? "text-background" : "text-muted-foreground"}`}
              >
                Past
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "waitlists" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("waitlists")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "waitlists" ? "text-background" : "text-muted-foreground"}`}
              >
                Waitlists
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bookings List */}
        <View className="px-6">
          {activeTab === "waitlists" ? (
            myWaitlists.length === 0 ? (
              <EmptyState
                icon="list-outline"
                title="No active waitlists"
                description="Join a waitlist when your favorite trainer or facility is fully booked"
              />
            ) : (
              myWaitlists.map((waitlist) => (
                <View key={waitlist.id} className="bg-card border border-border rounded-xl p-4 mb-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-lg mb-1">{waitlist.name}</Text>
                      <View className="flex-row items-center mb-2">
                        <View className="bg-primary rounded-full w-6 h-6 items-center justify-center mr-2">
                          <Text className="text-black font-bold text-xs">#{waitlist.position}</Text>
                        </View>
                        <Text className="text-muted-foreground text-sm">Position in queue</Text>
                      </View>
                    </View>
                    <View className="bg-primary/20 rounded-lg px-3 py-1">
                      <Text className="text-primary text-xs font-semibold capitalize">{waitlist.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {waitlist.preferredDate && (
                      <View className="bg-muted/30 rounded-lg px-3 py-1 flex-row items-center">
                        <Ionicons name="calendar-outline" size={14} color="#7ED957" />
                        <Text className="text-foreground text-xs ml-1">{waitlist.preferredDate}</Text>
                      </View>
                    )}
                    <View className="bg-muted/30 rounded-lg px-3 py-1 flex-row items-center">
                      <Ionicons name="time" size={14} color="#7ED957" />
                      <Text className="text-foreground text-xs ml-1 capitalize">{waitlist.timePreference}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-muted-foreground text-xs">
                      Joined {Math.floor((Date.now() - waitlist.joinedDate.getTime()) / (24 * 60 * 60 * 1000))} days ago
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        Alert.alert("Leave Waitlist", "Are you sure you want to leave this waitlist?", [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Leave",
                            style: "destructive",
                            onPress: () => console.log("[v0] Leaving waitlist:", waitlist.id),
                          },
                        ])
                      }}
                    >
                      <Text className="text-destructive font-semibold text-sm">Leave</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          ) : activeTab === "upcoming" ? (
            bookings.map((booking) => (
              <TouchableOpacity key={booking.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-start mb-3">
                  <View className="bg-primary/20 rounded-xl w-14 h-14 items-center justify-center mr-4">
                    <Ionicons name={booking.type === "trainer" ? "person" : "location"} size={24} color="#7ED957" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{booking.title}</Text>
                    {booking.trainer && (
                      <Text className="text-muted-foreground text-sm mb-1">with {booking.trainer}</Text>
                    )}
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text className="text-muted-foreground text-sm ml-1">{booking.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text className="text-muted-foreground text-sm ml-1">
                        {booking.date} • {booking.time}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary font-bold text-xl">${booking.price}</Text>
                    {booking.status === "confirmed" && (
                      <View className="bg-primary/20 rounded-lg px-2 py-1 mt-1">
                        <Text className="text-primary text-xs font-medium">Confirmed</Text>
                      </View>
                    )}
                    {booking.status === "completed" && (
                      <View className="bg-muted rounded-lg px-2 py-1 mt-1">
                        <Text className="text-muted-foreground text-xs font-medium">Completed</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <AnimatedButton
                      onPress={() => router.push(`/booking/${booking.id}`)}
                      title="View Details"
                      variant="primary"
                    />
                  </View>
                  <TouchableOpacity
                    className="bg-card border border-destructive rounded-xl px-4 py-3"
                    onPress={() => router.push(`/booking/${booking.id}`)}
                  >
                    <Text className="text-destructive font-bold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            bookings.map((booking) => (
              <TouchableOpacity key={booking.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-start mb-3">
                  <View className="bg-primary/20 rounded-xl w-14 h-14 items-center justify-center mr-4">
                    <Ionicons name={booking.type === "trainer" ? "person" : "location"} size={24} color="#7ED957" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg mb-1">{booking.title}</Text>
                    {booking.trainer && (
                      <Text className="text-muted-foreground text-sm mb-1">with {booking.trainer}</Text>
                    )}
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="location-outline" size={14} color="#666" />
                      <Text className="text-muted-foreground text-sm ml-1">{booking.location}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text className="text-muted-foreground text-sm ml-1">
                        {booking.date} • {booking.time}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary font-bold text-xl">${booking.price}</Text>
                    {booking.status === "confirmed" && (
                      <View className="bg-primary/20 rounded-lg px-2 py-1 mt-1">
                        <Text className="text-primary text-xs font-medium">Confirmed</Text>
                      </View>
                    )}
                    {booking.status === "completed" && (
                      <View className="bg-muted rounded-lg px-2 py-1 mt-1">
                        <Text className="text-muted-foreground text-xs font-medium">Completed</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <AnimatedButton
                      onPress={() => router.push(`/trainers/${booking.id}`)}
                      title="Book Again"
                      variant="primary"
                    />
                  </View>
                  <TouchableOpacity
                    className="bg-card border border-primary rounded-xl px-4 py-3"
                    onPress={() => router.push(`/review/${booking.id}`)}
                  >
                    <Text className="text-primary font-bold">Review</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
