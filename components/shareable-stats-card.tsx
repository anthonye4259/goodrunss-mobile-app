"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import * as Sharing from "expo-sharing"
import { captureRef } from "react-native-view-shot"
import { useRef } from "react"

interface ShareableStatsCardProps {
  userName: string
  stats: {
    totalSessions: number
    totalHours: number
    favoriteActivity: string
    streak: number
    topAchievement?: string
  }
  year?: number
}

export function ShareableStatsCard({ userName, stats, year = 2025 }: ShareableStatsCardProps) {
  const viewRef = useRef(null)

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      // Capture the card as an image
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      })

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `${userName}'s ${year} GoodRunss Stats`,
      })
    } catch (error) {
      console.error("[v0] Error sharing stats:", error)
    }
  }

  return (
    <View className="px-6 mb-6">
      <View ref={viewRef} collapsable={false}>
        <LinearGradient
          colors={["#7ED957", "#5FB83D", "#4A9930"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-3xl p-6"
        >
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-black/60 text-sm font-semibold mb-1">GoodRunss {year}</Text>
            <Text className="text-black font-bold text-3xl mb-2">{userName}'s Year</Text>
            <View className="bg-black/10 rounded-full px-4 py-1">
              <Text className="text-black font-semibold">{stats.favoriteActivity}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="bg-black/10 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 items-center">
                <Text className="text-black font-bold text-4xl mb-1">{stats.totalSessions}</Text>
                <Text className="text-black/70 text-sm">Sessions</Text>
              </View>
              <View className="w-px bg-black/20" />
              <View className="flex-1 items-center">
                <Text className="text-black font-bold text-4xl mb-1">{stats.totalHours}</Text>
                <Text className="text-black/70 text-sm">Hours</Text>
              </View>
            </View>
            <View className="h-px bg-black/20 mb-4" />
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-black font-bold text-4xl mb-1">{stats.streak}</Text>
                <Text className="text-black/70 text-sm">Day Streak</Text>
              </View>
              <View className="w-px bg-black/20" />
              <View className="flex-1 items-center">
                <Ionicons name="trophy" size={32} color="#000" />
                <Text className="text-black/70 text-sm mt-1">Top 10%</Text>
              </View>
            </View>
          </View>

          {/* Achievement */}
          {stats.topAchievement && (
            <View className="bg-black/10 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="star" size={24} color="#000" />
                <View className="flex-1 ml-3">
                  <Text className="text-black/70 text-xs mb-1">Top Achievement</Text>
                  <Text className="text-black font-bold">{stats.topAchievement}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Footer */}
          <View className="items-center">
            <Text className="text-black/60 text-xs">goodrunss.com</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Share Button */}
      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 mt-4 flex-row items-center justify-center"
        onPress={handleShare}
      >
        <Ionicons name="share-social" size={20} color="#000" />
        <Text className="text-black font-bold ml-2">Share Your Stats</Text>
      </TouchableOpacity>
    </View>
  )
}
