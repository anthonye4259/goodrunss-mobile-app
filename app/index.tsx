import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, Image, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "@/lib/auth-context"

export default function Index() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem("hasCompletedOnboarding")
        const hasSeenLanguageSelection = await AsyncStorage.getItem("hasSeenLanguageSelection")
        const hasSeenGIAIntro = await AsyncStorage.getItem("hasSeenGIAIntro")

        // Small delay for splash screen
        await new Promise((resolve) => setTimeout(resolve, 1500))

        if (!hasSeenLanguageSelection) {
          // Step 1: Language selection
          router.replace("/language-selection")
        } else if (!isAuthenticated) {
          // Step 2: Authentication
          router.replace("/auth")
        } else if (!hasSeenGIAIntro) {
          // Step 3: GIA Introduction
          router.replace("/onboarding/gia-intro")
        } else if (!hasCompletedOnboarding) {
          // Step 4: User type selection → Questionnaire → Features
          router.replace("/onboarding")
        } else {
          // All done, go to main app
          router.replace("/(tabs)")
        }
      } catch (error) {
        console.error("Error checking onboarding:", error)
        router.replace("/language-selection")
      }
    }

    checkOnboarding()
  }, [isAuthenticated])

  return (
    <LinearGradient colors={["#0A0A0A", "#141414", "#0A0A0A"]} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/goodrunss-logo-white.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Text style={styles.title}>GoodRunss</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>g0</Text>
          </View>
        </View>
        <Text style={styles.tagline}>Where the World Plays</Text>
        <ActivityIndicator size="large" color="#7ED957" style={styles.loader} />
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  tagline: {
    fontSize: 18,
    color: "#9CA3AF",
    marginBottom: 48,
  },
  versionBadge: {
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7ED957",
  },
  loader: {
    marginTop: 24,
  },
  status: {
    fontSize: 14,
    color: "#888888",
  },
})
