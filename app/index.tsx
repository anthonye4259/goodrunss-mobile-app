"use client"

import { useEffect } from "react"
import { useRouter } from "expo-router"
import { View, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    checkFirstLaunch()
  }, [])

  const checkFirstLaunch = async () => {
    try {
      const selectedLanguage = await AsyncStorage.getItem("selectedLanguage")
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenGIAIntro")
      const isAuthenticated = await AsyncStorage.getItem("isAuthenticated")
      const guestMode = await AsyncStorage.getItem("guestMode")

      setTimeout(() => {
        if (!selectedLanguage) {
          router.replace("/language-selection")
        } else if (!hasSeenIntro) {
          router.replace("/onboarding/gia-intro")
        } else {
          router.replace("/(tabs)")
        }
      }, 1000)
    } catch (error) {
      console.error("[v0] Error checking first launch:", error)
      router.replace("/language-selection")
    }
  }

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#84CC16" />
    </View>
  )
}
