import { useState } from "react"
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

const INTRO_STEPS = [
  {
    title: "Meet GIA",
    subtitle: "Your Personal AI Assistant",
    description: "GIA is your intelligent fitness companion, designed to help you achieve your goals faster.",
    gradient: ["#0EA5E9", "#0369A1", "#0A0A0A"] as const,
    icon: "sparkles" as const,
  },
  {
    title: "What GIA Can Do",
    subtitle: "Your All-in-One Fitness Partner",
    features: [
      { icon: "location" as const, text: "Find nearby courts and facilities" },
      { icon: "barbell" as const, text: "Generate personalized workouts" },
      { icon: "calendar" as const, text: "Book trainers and classes instantly" },
      { icon: "stats-chart" as const, text: "Track your progress and stats" },
      { icon: "people" as const, text: "Connect with players near you" },
      { icon: "chatbubbles" as const, text: "Get instant answers to fitness questions" },
    ],
    gradient: ["#8B5CF6", "#6D28D9", "#0A0A0A"] as const,
  },
  {
    title: "Seamless Integrations",
    subtitle: "Connect Your Favorite Apps",
    integrations: [
      { icon: "fitness" as const, text: "Apple Health & HealthKit" },
      { icon: "watch" as const, text: "Apple Watch" },
      { icon: "bicycle" as const, text: "Strava" },
      { icon: "heart" as const, text: "Fitbit" },
      { icon: "analytics" as const, text: "MyFitnessPal" },
      { icon: "calendar" as const, text: "Google Calendar" },
    ],
    gradient: ["#7ED957", "#65A30D", "#0A0A0A"] as const,
  },
]

export default function GIAIntroScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const step = INTRO_STEPS[currentStep]

  const handleNext = async () => {
    if (currentStep < INTRO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await AsyncStorage.setItem("hasSeenGIAIntro", "true")
      router.push("/onboarding")
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasSeenGIAIntro", "true")
    router.push("/onboarding")
  }

  return (
    <LinearGradient colors={[...step.gradient]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Skip Button */}
          {currentStep < INTRO_STEPS.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            {step.icon && (
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name={step.icon} size={48} color="white" />
                </View>
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.subtitle}>{step.subtitle}</Text>

            {/* Description */}
            {step.description && (
              <Text style={styles.description}>{step.description}</Text>
            )}

            {/* Features List */}
            {step.features && (
              <View style={styles.featuresList}>
                {step.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name={feature.icon} size={24} color="white" />
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Integrations Grid */}
            {step.integrations && (
              <View style={styles.integrationsGrid}>
                {step.integrations.map((integration, index) => (
                  <View key={index} style={styles.integrationItem}>
                    <View style={styles.integrationIcon}>
                      <Ionicons name={integration.icon} size={24} color="white" />
                    </View>
                    <Text style={styles.integrationText}>{integration.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {INTRO_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep ? styles.dotActive : styles.dotInactive
                ]}
              />
            ))}
          </View>

          {/* Get Started Button */}
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {currentStep === INTRO_STEPS.length - 1 ? "Get Started" : "Continue"}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          {currentStep === INTRO_STEPS.length - 1 && (
            <TouchableOpacity onPress={() => router.push("/auth")} style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginBold}>Log In</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    paddingTop: 16,
  },
  skipButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 26,
  },
  featuresList: {
    width: "100%",
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureText: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
  integrationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  integrationItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: (width - 60) / 2 - 6,
  },
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  integrationText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
  },
  nextButtonText: {
    textAlign: "center",
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
  loginLink: {
    marginTop: 16,
  },
  loginText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: 16,
  },
  loginBold: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
})
