"use client"

import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"

export default function ReviewScreen() {
  const { id } = useLocalSearchParams()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
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
          <Text className="text-3xl font-bold text-foreground mb-2">Leave a Review</Text>
          <Text className="text-muted-foreground">Share your experience with Alex Johnson</Text>
        </View>

        {/* Rating */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">How was your session?</Text>
          <View className="flex-row justify-center gap-4 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setRating(star)
                }}
              >
                <Ionicons name={star <= rating ? "star" : "star-outline"} size={48} color="#7ED957" />
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-center text-muted-foreground">
            {rating === 0 && "Tap to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </Text>
        </View>

        {/* Review Text */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Tell us more (optional)</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <TextInput
              className="text-foreground min-h-[120px]"
              placeholder="What did you like? What could be improved?"
              placeholderTextColor="#666"
              multiline
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit */}
        <View className="px-6">
          <TouchableOpacity
            className={`rounded-xl py-4 ${rating > 0 ? "bg-primary" : "bg-muted"}`}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text className={`font-bold text-center ${rating > 0 ? "text-background" : "text-muted-foreground"}`}>
              Submit Review
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
