import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { View, ActivityIndicator, Text, Image, StyleSheet } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Index() {
  const router = useRouter()
  const [status, setStatus] = useState("Loading...")

  useEffect(() => {
    checkFirstLaunch()
  }, [])

  const checkFirstLaunch = async () => {
    try {
      setStatus("Checking settings...")
      const selectedLanguage = await AsyncStorage.getItem("selectedLanguage")
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenGIAIntro")

      setTimeout(() => {
        if (!selectedLanguage) {
          setStatus("Going to language selection...")
          router.replace("/language-selection")
        } else if (!hasSeenIntro) {
          setStatus("Going to intro...")
          router.replace("/onboarding/gia-intro")
        } else {
          setStatus("Going to home...")
          router.replace("/(tabs)")
        }
      }, 1500)
    } catch (error) {
      console.error("[GoodRunss] Error checking first launch:", error)
      setStatus("Error - redirecting...")
      router.replace("/language-selection")
    }
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require("../assets/icon.png")} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>GoodRunss</Text>
      <ActivityIndicator size="large" color="#84CC16" style={styles.loader} />
      <Text style={styles.status}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
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
  loader: {
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    color: "#888888",
  },
})
