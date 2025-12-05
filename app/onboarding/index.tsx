import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function OnboardingScreen() {
  const router = useRouter()
  const [userType, setUserType] = useState<"player" | "trainer" | null>(null)

  const handleContinue = () => {
    if (userType) {
      router.push({
        pathname: "/onboarding/questionnaire",
        params: { userType }
      })
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to GoodRunss</Text>
            <Text style={styles.subtitle}>Let's get you set up. What brings you here?</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => setUserType("player")}
              style={[
                styles.optionCard,
                userType === "player" && styles.optionCardSelected
              ]}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons
                  name="basketball"
                  size={32}
                  color={userType === "player" ? "#7ED957" : "#888"}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>I'm a Player</Text>
                <Text style={styles.optionDescription}>Find courts, trainers, and join games</Text>
              </View>
              {userType === "player" && (
                <Ionicons name="checkmark-circle" size={28} color="#7ED957" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUserType("trainer")}
              style={[
                styles.optionCard,
                userType === "trainer" && styles.optionCardSelected
              ]}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons
                  name="fitness"
                  size={32}
                  color={userType === "trainer" ? "#7ED957" : "#888"}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>I'm a Trainer/Instructor</Text>
                <Text style={styles.optionDescription}>Manage clients and grow your business</Text>
              </View>
              {userType === "trainer" && (
                <Ionicons name="checkmark-circle" size={28} color="#7ED957" />
              )}
            </TouchableOpacity>
          </View>

          {userType && (
            <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#9CA3AF",
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#1A1A1A",
  },
  optionCardSelected: {
    borderColor: "#7ED957",
    backgroundColor: "rgba(132, 204, 22, 0.1)",
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
    gap: 8,
  },
  continueText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
})
