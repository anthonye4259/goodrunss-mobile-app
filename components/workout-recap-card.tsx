"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import ViewShot from "react-native-view-shot"
import { useRef } from "react"
import * as Sharing from "expo-sharing"
import { SocialShare } from "@/lib/social-share"

type WorkoutRecapCardProps = {
  stats: {
    totalSessions: number
    totalHours: number
    favoriteActivity: string
    streak: number
    topTrainer: string
  }
  year: number
}

export function WorkoutRecapCard({ stats, year }: WorkoutRecapCardProps) {
  const { preferences } = useUserPreferences()
  const viewShotRef = useRef<ViewShot>(null)

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `My ${year} GoodRunss Wrapped`,
        })
      }
    } catch (error) {
      console.error("[v0] Share error:", error)
    }
  }

  const handleSnapchatShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (uri) {
        await SocialShare.shareToSnapchat({
          imageUri: uri,
          caption: `My ${year} GoodRunss Wrapped! ${stats.totalSessions} sessions 🔥`,
          deepLink: "https://goodrunss.app/download",
        })
      }
    } catch (error) {
      console.error("[v0] Snapchat share error:", error)
    }
  }

  const handleTwitterShare = async () => {
    try {
      await SocialShare.shareToTwitter({
        text: `My ${year} GoodRunss Wrapped! 🔥\n\n${stats.totalSessions} sessions | ${stats.totalHours} hours | ${stats.streak} day streak`,
        url: "https://goodrunss.app",
        hashtags: ["GoodRunss", "Wrapped" + year, stats.favoriteActivity.replace(/\s+/g, "")],
      })
    } catch (error) {
      console.error("[v0] Twitter share error:", error)
    }
  }

  const handleInstagramShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (uri) {
        await SocialShare.shareToInstagram({
          imageUri: uri,
          caption: `My ${year} GoodRunss Wrapped! ${stats.totalSessions} sessions 🔥 #GoodRunss #Wrapped${year}`,
        })
      }
    } catch (error) {
      console.error("[v0] Instagram share error:", error)
    }
  }

  return (
    <View className="mx-6 mb-6">
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
        <LinearGradient
          colors={["#7ED957", "#5FB83D", "#4A9630"]}
          className="rounded-3xl p-8"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View className="items-center mb-6">
            <Text className="text-black/60 font-bold text-lg mb-2">{year}</Text>
            <Text className="text-black font-bold text-4xl mb-1">Your Year</Text>
            <Text className="text-black font-bold text-4xl">in Motion</Text>
          </View>

          <View className="space-y-4">
            <View className="bg-black/10 rounded-2xl p-4">
              <Text className="text-black/70 text-sm mb-1">Total Sessions</Text>
              <Text className="text-black font-bold text-3xl">{stats.totalSessions}</Text>
            </View>

            <View className="bg-black/10 rounded-2xl p-4">
              <Text className="text-black/70 text-sm mb-1">Hours Trained</Text>
              <Text className="text-black font-bold text-3xl">{stats.totalHours}</Text>
            </View>

            <View className="bg-black/10 rounded-2xl p-4">
              <Text className="text-black/70 text-sm mb-1">Favorite Activity</Text>
              <Text className="text-black font-bold text-2xl">{stats.favoriteActivity}</Text>
            </View>

            <View className="bg-black/10 rounded-2xl p-4">
              <Text className="text-black/70 text-sm mb-1">Longest Streak</Text>
              <Text className="text-black font-bold text-3xl">{stats.streak} days</Text>
            </View>

            <View className="bg-black/10 rounded-2xl p-4">
              <Text className="text-black/70 text-sm mb-1">Top Trainer</Text>
              <Text className="text-black font-bold text-xl">{stats.topTrainer}</Text>
            </View>
          </View>

          <View className="mt-6 items-center">
            <Text className="text-black/60 text-xs">Powered by GoodRunss</Text>
          </View>
        </LinearGradient>
      </ViewShot>

      <TouchableOpacity
        className="bg-[#FFFC00] rounded-2xl py-4 flex-row items-center justify-center mt-4"
        onPress={handleSnapchatShare}
      >
        <Ionicons name="logo-snapchat" size={20} color="#000" />
        <Text className="text-black font-bold ml-2">Share to Snapchat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="relative rounded-2xl py-4 flex-row items-center justify-center mt-3"
        onPress={handleInstagramShare}
      >
        <LinearGradient
          colors={["#833AB4", "#C13584", "#E1306C", "#FD1D1D", "#F77737"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 rounded-2xl"
        />
        <Ionicons name="logo-instagram" size={20} color="#FFF" />
        <Text className="text-white font-bold ml-2">Share to Instagram</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-[#1DA1F2] rounded-2xl py-4 flex-row items-center justify-center mt-3"
        onPress={handleTwitterShare}
      >
        <Ionicons name="logo-twitter" size={20} color="#FFF" />
        <Text className="text-white font-bold ml-2">Share to Twitter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-card border border-border rounded-2xl py-4 flex-row items-center justify-center mt-3"
        onPress={handleShare}
      >
        <Ionicons name="share-social" size={20} color="#7ED957" />
        <Text className="text-foreground font-bold ml-2">Share Other Ways</Text>
      </TouchableOpacity>
    </View>
  )
}
