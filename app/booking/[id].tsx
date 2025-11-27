"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams()
  const [showCancelModal, setShowCancelModal] = useState(false)

  const booking = {
    id,
    type: "trainer",
    title: "Basketball Training Session",
    trainer: "Alex Johnson",
    location: "Downtown Sports Complex",
    date: "Tomorrow",
    time: "3:00 PM - 4:00 PM",
    price: 75,
    status: "confirmed",
    description: "Personalized basketball training focusing on shooting technique and defensive positioning.",
    notes: "Bring your own basketball and water bottle. Court shoes required.",
  }

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setShowCancelModal(false)
    router.back()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Booking Details</Text>
          <View className="bg-primary/20 rounded-lg px-3 py-1 self-start">
            <Text className="text-primary font-semibold capitalize">{booking.status}</Text>
          </View>
        </View>

        {/* Booking Info */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-border rounded-2xl p-6">
            <Text className="text-foreground font-bold text-2xl mb-4">{booking.title}</Text>

            <View className="flex-row items-center mb-3">
              <Ionicons name="person" size={20} color="#7ED957" />
              <Text className="text-foreground ml-3">{booking.trainer}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="location" size={20} color="#7ED957" />
              <Text className="text-foreground ml-3">{booking.location}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={20} color="#7ED957" />
              <Text className="text-foreground ml-3">{booking.date}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="time" size={20} color="#7ED957" />
              <Text className="text-foreground ml-3">{booking.time}</Text>
            </View>

            <View className="border-t border-border my-4" />

            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Total Price</Text>
              <Text className="text-primary font-bold text-2xl">${booking.price}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">About This Session</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <Text className="text-foreground leading-6">{booking.description}</Text>
          </View>
        </View>

        {/* Notes */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Important Notes</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <Text className="text-foreground leading-6">{booking.notes}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="px-6 gap-3">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push(`/chat/${booking.id}`)
            }}
          >
            <Text className="text-background font-bold text-center">Message Trainer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-card border border-destructive rounded-xl py-4"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              setShowCancelModal(true)
            }}
          >
            <Text className="text-destructive font-bold text-center">Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cancel Modal */}
      {showCancelModal && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center px-6">
          <View className="bg-card border border-border rounded-2xl p-6 w-full">
            <Text className="text-foreground font-bold text-xl mb-4">Cancel Booking?</Text>
            <Text className="text-muted-foreground mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-card border border-border rounded-xl py-3"
                onPress={() => setShowCancelModal(false)}
              >
                <Text className="text-foreground font-bold text-center">Keep Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-destructive rounded-xl py-3" onPress={handleCancel}>
                <Text className="text-white font-bold text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  )
}
