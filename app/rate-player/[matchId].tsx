"use client"

import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

export default function RatePlayerScreen() {
  const { matchId } = useLocalSearchParams()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    console.log("[v0] Submitting player rating:", { matchId, rating, review })
    router.back()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Rate Your Partner</Text>
            <View className="w-6" />
          </View>
        </View>

        {/* Player Info */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-border rounded-2xl p-4 items-center">
            <View className="bg-primary/20 rounded-full w-20 h-20 items-center justify-center mb-3">
              <Text className="text-primary font-bold text-2xl">MJ</Text>
            </View>
            <Text className="text-foreground font-bold text-xl mb-1">Mike Johnson</Text>
            <Text className="text-muted-foreground">Basketball • Rucker Park</Text>
          </View>
        </View>

        {/* Rating */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3 text-center">How was your experience?</Text>
          <View className="flex-row justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setRating(star)
                }}
              >
                <Ionicons name={star <= rating ? "star" : "star-outline"} size={48} color="#FFD700" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Write a Review (Optional)</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <TextInput
              className="text-foreground min-h-[120px]"
              placeholder="Share your experience..."
              placeholderTextColor="#666"
              multiline
              value={review}
              onChangeText={setReview}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="px-6 mb-10">
          <TouchableOpacity
            className={`rounded-2xl py-4 ${rating > 0 ? "bg-primary" : "bg-muted/30"}`}
            disabled={rating === 0}
            onPress={handleSubmit}
          >
            <Text
              className={`text-center font-bold text-lg ${rating > 0 ? "text-background" : "text-muted-foreground"}`}
            >
              Submit Rating
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
