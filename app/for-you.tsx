
import { View, Text, TouchableOpacity, Animated, Dimensions, PanResponder } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import {
  calculatePersonalizedScore,
  type PersonalizationFactors,
  type PersonalizedItem,
} from "@/lib/adaptive-algorithm-types"
import { getActivityContent } from "@/lib/activity-content"
import { formatCurrency, formatDistance } from "@/lib/global-format"

const { height, width } = Dimensions.get("window")

export default function ForYouFeedScreen() {
  const params = useLocalSearchParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAlgorithm, setShowAlgorithm] = useState(false)

  const pan = useRef(new Animated.ValueXY()).current
  const opacity = useRef(new Animated.Value(1)).current
  const likeOpacity = useRef(new Animated.Value(0)).current
  const skipOpacity = useRef(new Animated.Value(0)).current

  // Mock personalization factors
  const userFactors: PersonalizationFactors = {
    location: { lat: 40.7589, lng: -73.9851 },
    workoutPreferences: ["strength", "cardio"],
    intensityLevel: "intermediate",
    schedule: "evening",
    budget: { min: 50, max: 150 },
    pastBookings: [],
    interactions: {
      liked: [],
      skipped: [],
      viewed: [],
    },
  }

  // Generate personalized feed
  const content = getActivityContent("Basketball")
  const [feed, setFeed] = useState<PersonalizedItem[]>(() => {
    return content.sampleTrainers
      .map((trainer, index) => ({
        id: `trainer-${index}`,
        type: "trainer" as const,
        data: trainer,
        score: calculatePersonalizedScore(trainer, userFactors, "trainer"),
        distanceMiles: Math.random() * 10,
        matchReasons: [],
      }))
      .sort((a, b) => b.score.total - a.score.total)
  })

  const currentItem = feed[currentIndex]

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      pan.setValue({ x: gesture.dx, y: 0 })

      if (gesture.dx > 50) {
        likeOpacity.setValue(gesture.dx / 150)
        skipOpacity.setValue(0)
      } else if (gesture.dx < -50) {
        skipOpacity.setValue(Math.abs(gesture.dx) / 150)
        likeOpacity.setValue(0)
      } else {
        likeOpacity.setValue(0)
        skipOpacity.setValue(0)
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 120) {
        handleLike()
      } else if (gesture.dx < -120) {
        handleSkip()
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start(() => {
          likeOpacity.setValue(0)
          skipOpacity.setValue(0)
        })
      }
    },
  })

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: width, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Save like
      userFactors.interactions.liked.push(currentItem.id)

      // Move to next
      setCurrentIndex((prev) => (prev + 1) % feed.length)
      pan.setValue({ x: 0, y: 0 })
      opacity.setValue(1)
      likeOpacity.setValue(0)
    })
  }

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x: -width, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Heavy penalty for skipping
      userFactors.interactions.skipped.push(currentItem.id)

      // Move to next
      setCurrentIndex((prev) => (prev + 1) % feed.length)
      pan.setValue({ x: 0, y: 0 })
      opacity.setValue(1)
      skipOpacity.setValue(0)
    })
  }

  const handleBook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    router.push(`/trainers/${currentIndex}`)
  }

  if (!currentItem) return null

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 pt-16 px-6">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="bg-black/50 rounded-full p-2">
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAlgorithm(!showAlgorithm)}
            className="bg-black/50 rounded-full px-4 py-2 flex-row items-center"
          >
            <Ionicons name="analytics" size={16} color="#7ED957" />
            <Text className="text-white ml-2 font-semibold">Why this?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [
            { translateX: pan.x },
            {
              rotate: pan.x.interpolate({
                inputRange: [-width, 0, width],
                outputRange: ["-30deg", "0deg", "30deg"],
              }),
            },
          ],
          opacity,
        }}
        className="flex-1 mt-24 mb-32 mx-4"
      >
        <LinearGradient
          colors={["#1A1A1A", "#0F0F0F"]}
          className="flex-1 rounded-3xl overflow-hidden border border-border"
        >
          {/* Trainer Info */}
          <View className="flex-1 p-6 justify-end">
            <View className="bg-black/60 rounded-2xl p-6">
              <View className="flex-row items-start mb-4">
                <View className="bg-primary/30 rounded-full w-20 h-20 items-center justify-center mr-4">
                  <Text className="text-primary font-bold text-3xl">{currentItem.data.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-2xl mb-1">{currentItem.data.name}</Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="star" size={18} color="#7ED957" />
                    <Text className="text-white ml-1 font-semibold">{currentItem.data.rating}</Text>
                    <Text className="text-zinc-400 ml-1">({currentItem.data.reviews} reviews)</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#7ED957" />
                    <Text className="text-zinc-400 ml-1">{formatDistance(currentItem.distanceMiles)} away</Text>
                  </View>
                </View>
              </View>

              {/* Match Reasons */}
              <View className="bg-primary/10 rounded-xl p-4 mb-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="sparkles" size={16} color="#7ED957" />
                  <Text className="text-primary font-bold ml-2">Perfect Match</Text>
                </View>
                <Text className="text-white">{currentItem.score.reason}</Text>
              </View>

              {/* Specialties */}
              <View className="flex-row flex-wrap gap-2 mb-4">
                {currentItem.data.specialties.map((specialty: string, idx: number) => (
                  <View key={idx} className="bg-zinc-800 rounded-lg px-3 py-1">
                    <Text className="text-white text-sm">{specialty}</Text>
                  </View>
                ))}
              </View>

              {/* Price */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-zinc-400 text-sm">Price per session</Text>
                  <Text className="text-primary font-bold text-3xl">{formatCurrency(currentItem.data.price)}</Text>
                </View>
                <TouchableOpacity onPress={handleBook} className="bg-primary rounded-xl px-8 py-4">
                  <Text className="text-background font-bold text-lg">Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Algorithm Breakdown */}
      {showAlgorithm && (
        <View className="absolute bottom-32 left-4 right-4 bg-black/95 rounded-2xl p-6 border border-primary/30">
          <Text className="text-white font-bold text-lg mb-4">Algorithm Score Breakdown</Text>

          <View className="space-y-3">
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-zinc-400">Personal Preference (40%)</Text>
                <Text className="text-white font-bold">{currentItem.score.personalPreference.toFixed(0)}</Text>
              </View>
              <View className="bg-zinc-800 rounded-full h-2">
                <View
                  className="bg-primary rounded-full h-2"
                  style={{ width: `${currentItem.score.personalPreference}%` }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-zinc-400">Popularity (25%)</Text>
                <Text className="text-white font-bold">{currentItem.score.popularity.toFixed(0)}</Text>
              </View>
              <View className="bg-zinc-800 rounded-full h-2">
                <View className="bg-blue-500 rounded-full h-2" style={{ width: `${currentItem.score.popularity}%` }} />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-zinc-400">Recency (15%)</Text>
                <Text className="text-white font-bold">{currentItem.score.recency.toFixed(0)}</Text>
              </View>
              <View className="bg-zinc-800 rounded-full h-2">
                <View className="bg-purple-500 rounded-full h-2" style={{ width: `${currentItem.score.recency}%` }} />
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-zinc-400">Quality (20%)</Text>
                <Text className="text-white font-bold">{currentItem.score.quality.toFixed(0)}</Text>
              </View>
              <View className="bg-zinc-800 rounded-full h-2">
                <View className="bg-orange-500 rounded-full h-2" style={{ width: `${currentItem.score.quality}%` }} />
              </View>
            </View>

            <View className="border-t border-zinc-700 pt-3 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-white font-bold">Total Score</Text>
                <Text className="text-primary font-bold text-xl">{currentItem.score.total.toFixed(0)}/100</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => setShowAlgorithm(false)} className="mt-4 bg-zinc-800 rounded-xl py-3">
            <Text className="text-white text-center font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Like/Skip Overlays */}
      <Animated.View
        style={{ opacity: likeOpacity }}
        className="absolute top-1/3 left-8 bg-primary/90 rounded-3xl px-8 py-4 rotate-[-20deg]"
        pointerEvents="none"
      >
        <Text className="text-background font-bold text-3xl">LIKE</Text>
      </Animated.View>

      <Animated.View
        style={{ opacity: skipOpacity }}
        className="absolute top-1/3 right-8 bg-red-500/90 rounded-3xl px-8 py-4 rotate-[20deg]"
        pointerEvents="none"
      >
        <Text className="text-white font-bold text-3xl">SKIP</Text>
      </Animated.View>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 pb-8 px-6">
        <View className="flex-row justify-center items-center gap-6">
          <TouchableOpacity
            onPress={handleSkip}
            className="bg-red-500/20 border-2 border-red-500 rounded-full w-16 h-16 items-center justify-center"
          >
            <Ionicons name="close" size={32} color="#EF4444" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBook}
            className="bg-primary rounded-full w-20 h-20 items-center justify-center"
          >
            <Ionicons name="calendar" size={36} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLike}
            className="bg-primary/20 border-2 border-primary rounded-full w-16 h-16 items-center justify-center"
          >
            <Ionicons name="heart" size={32} color="#7ED957" />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-zinc-400 mt-4">Swipe right to like • Swipe left to skip</Text>
      </View>
    </View>
  )
}
