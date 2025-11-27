"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { TrainerBookingModal } from "@/components/trainer-booking-modal"
import { ShareProfileCard } from "@/components/share-profile-card"
import { useState } from "react"

export default function TrainerDetailScreen() {
  const { id } = useLocalSearchParams()
  const { preferences } = useUserPreferences()
  const { calculateDistance } = useLocation()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = getActivityContent(primaryActivity)
  const trainer = content.sampleTrainers[0]

  const distance = calculateDistance(40.7589, -73.9851)

  const isOwnProfile = preferences.role === "trainer"

  const startChat = async () => {
    // Create or get existing conversation
    router.push(`/chat/${id}`)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="items-center mb-6">
            <View className="bg-primary/20 rounded-full w-32 h-32 items-center justify-center mb-4">
              <Text className="text-primary font-bold text-5xl">{trainer.name.charAt(0)}</Text>
            </View>
            <Text className="text-foreground font-bold text-2xl mb-2">{trainer.name}</Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={20} color="#7ED957" />
              <Text className="text-foreground ml-2 text-lg">
                {trainer.rating} ({trainer.reviews} reviews)
              </Text>
            </View>
            {distance && (
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text className="text-muted-foreground ml-1">{distance.toFixed(1)} miles away</Text>
              </View>
            )}
          </View>
        </View>

        {/* About */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">About</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <Text className="text-muted-foreground leading-6">{trainer.bio}</Text>
          </View>
        </View>

        {/* Specialties */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">Specialties</Text>
          <View className="flex-row flex-wrap gap-2">
            {trainer.specialties.map((specialty, index) => (
              <View key={index} className="bg-primary/20 border border-primary rounded-xl px-4 py-2">
                <Text className="text-primary font-semibold">{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Certifications */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">Certifications</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            {trainer.certifications.map((cert, index) => (
              <View
                key={index}
                className={`flex-row items-center p-4 ${index < trainer.certifications.length - 1 ? "border-b border-border" : ""}`}
              >
                <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">Pricing</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-muted-foreground mb-1">Per Session</Text>
                <Text className="text-primary font-bold text-3xl">${trainer.price}</Text>
              </View>
              <View className="items-end">
                <Text className="text-muted-foreground text-sm">60 minutes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">Recent Reviews</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <View className="flex-row items-start mb-4">
              <View className="bg-primary/20 rounded-full w-10 h-10 items-center justify-center mr-3">
                <Text className="text-primary font-bold">J</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-foreground font-bold">John D.</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#7ED957" />
                    <Text className="text-foreground ml-1">5.0</Text>
                  </View>
                </View>
                <Text className="text-muted-foreground text-sm mb-2">
                  Excellent {content.trainerTitle.toLowerCase()}! Really helped improve my technique.
                </Text>
                <Text className="text-muted-foreground text-xs">2 days ago</Text>
              </View>
            </View>
          </View>
        </View>

        {isOwnProfile && (
          <ShareProfileCard trainerName={trainer.name} trainerId={id as string} activity={primaryActivity} />
        )}

        {!isOwnProfile && (
          <View className="px-6 mb-6">
            <View className="bg-card border border-primary rounded-2xl p-6 items-center">
              <Text className="text-primary font-bold text-lg mb-2">Book Me on GoodRunss</Text>
              <Text className="text-muted-foreground text-center text-sm mb-4">
                Find local trainers, studios, and courts in your area
              </Text>
              <TouchableOpacity className="bg-primary rounded-xl px-6 py-3">
                <Text className="text-background font-bold">Download GoodRunss</Text>
              </TouchableOpacity>
              <Text className="text-muted-foreground text-xs mt-4">Powered by GoodRunss</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-6 pb-8 bg-background border-t border-border">
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 bg-card border border-border rounded-2xl py-4 flex-row items-center justify-center"
            onPress={startChat}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#7ED957" />
            <Text className="text-primary font-bold ml-2">Message</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-[2] bg-primary rounded-2xl py-4" onPress={() => setShowBookingModal(true)}>
            <Text className="text-background font-bold text-center text-lg">Book - ${trainer.price}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Modal */}
      <TrainerBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        trainer={{
          name: trainer.name,
          price: trainer.price,
          activity: primaryActivity,
        }}
      />
    </LinearGradient>
  )
}
