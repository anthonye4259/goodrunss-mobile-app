import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { Ionicons } from "@expo/vector-icons"
import { RATING_CONFIGS } from "@/lib/player-rating-types"
import { SafeAreaView } from "react-native-safe-area-context"

const REC_ACTIVITIES = ["Basketball", "Tennis", "Pickleball", "Golf", "Soccer", "Volleyball", "Swimming"]
const STUDIO_ACTIVITIES = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]

export default function QuestionnaireScreen() {
  const router = useRouter()
  const { setPreferences } = useUserPreferences()
  const { requestLocation, loading: locationLoading, error: locationError } = useLocation()
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [step, setStep] = useState<"activity" | "skill" | "location">("activity")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<number | null>(null)

  const handleActivitySelect = () => {
    if (selectedActivity) {
      if (RATING_CONFIGS[selectedActivity]) {
        setStep("skill")
      } else {
        setStep("location")
      }
    }
  }

  const handleSkillSelect = () => {
    if (selectedSkillLevel !== null) {
      setStep("location")
    }
  }

  const handleLocationRequest = async () => {
    await requestLocation()
    handleComplete()
  }

  const handleSkipLocation = () => {
    handleComplete()
  }

  const handleComplete = () => {
    if (selectedActivity) {
      const isStudio = STUDIO_ACTIVITIES.includes(selectedActivity)
      setPreferences({
        activities: [selectedActivity],
        isStudioUser: isStudio,
        isRecUser: !isStudio,
        userType: "player",
        primaryActivity: selectedActivity,
        playerRating:
          selectedSkillLevel !== null
            ? {
                sport: selectedActivity,
                rating: selectedSkillLevel,
                matches: 0,
              }
            : undefined,
      })
      router.replace("/(tabs)")
    }
  }

  if (step === "skill" && selectedActivity && RATING_CONFIGS[selectedActivity]) {
    const config = RATING_CONFIGS[selectedActivity]

    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Question 2 of 3</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "66%" }]} />
              </View>
            </View>

            <Text style={styles.title}>What's your {selectedActivity} skill level?</Text>
            <Text style={styles.subtitle}>{config.description}</Text>

            <View style={styles.optionsList}>
              {config.levels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => setSelectedSkillLevel(level.value)}
                  style={[
                    styles.skillCard,
                    selectedSkillLevel === level.value && styles.cardSelected
                  ]}
                >
                  <View style={styles.skillHeader}>
                    <View style={styles.skillLabelRow}>
                      <View style={[styles.skillDot, { backgroundColor: level.color }]} />
                      <Text style={styles.skillLabel}>{level.label}</Text>
                    </View>
                    <Text style={styles.skillValue}>{level.value}</Text>
                  </View>
                  <Text style={styles.skillDescription}>{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedSkillLevel !== null && (
              <TouchableOpacity onPress={handleSkillSelect} style={styles.continueButton}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (step === "location") {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={80} color="#84CC16" />
            <Text style={styles.locationTitle}>Enable Location</Text>
            <Text style={styles.locationSubtitle}>
              Allow GoodRunss to access your location to show nearby trainers, courts, and studios in your area.
            </Text>

            {locationError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{locationError}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLocationRequest}
              disabled={locationLoading}
              style={styles.locationButton}
            >
              {locationLoading ? (
                <ActivityIndicator color="#0A0A0A" />
              ) : (
                <Text style={styles.continueText}>Enable Location</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkipLocation} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Question 1 of 3</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "33%" }]} />
            </View>
          </View>

          <Text style={styles.title}>What activities do you enjoy?</Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>GoodRunss Rec</Text>
            <View style={styles.optionsList}>
              {REC_ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity}
                  onPress={() => setSelectedActivity(activity)}
                  style={[
                    styles.activityCard,
                    selectedActivity === activity && styles.cardSelected
                  ]}
                >
                  <Text style={styles.activityText}>{activity}</Text>
                  {selectedActivity === activity && (
                    <Ionicons name="checkmark-circle" size={24} color="#84CC16" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: "#8B5CF6" }]}>GoodRunss Studios</Text>
            <View style={styles.optionsList}>
              {STUDIO_ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity}
                  onPress={() => setSelectedActivity(activity)}
                  style={[
                    styles.activityCard,
                    selectedActivity === activity && styles.cardSelected
                  ]}
                >
                  <Text style={styles.activityText}>{activity}</Text>
                  {selectedActivity === activity && (
                    <Ionicons name="checkmark-circle" size={24} color="#84CC16" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedActivity && (
            <TouchableOpacity onPress={handleActivitySelect} style={styles.continueButton}>
              <Text style={styles.continueText}>Continue</Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    color: "#84CC16",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#84CC16",
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 24,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#84CC16",
    marginBottom: 16,
  },
  optionsList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#1A1A1A",
  },
  skillCard: {
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#1A1A1A",
  },
  cardSelected: {
    borderColor: "#84CC16",
    backgroundColor: "rgba(132, 204, 22, 0.1)",
  },
  activityText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  skillHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  skillLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skillDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  skillLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  skillValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#84CC16",
  },
  skillDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#84CC16",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  continueText: {
    textAlign: "center",
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
  locationContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  locationTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 32,
    marginBottom: 16,
    textAlign: "center",
  },
  locationSubtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
  },
  locationButton: {
    backgroundColor: "#84CC16",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 16,
  },
})
