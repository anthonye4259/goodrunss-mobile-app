import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
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
  const params = useLocalSearchParams()
  const userType = (params.userType as "player" | "trainer") || "player"

  const { setPreferences } = useUserPreferences()
  const { requestLocation, loading: locationLoading, error: locationError } = useLocation()

  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [step, setStep] = useState<"activity" | "skill" | "location">("activity")
  const [activityRatings, setActivityRatings] = useState<Record<string, number>>({})
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0)

  const toggleActivity = (activity: string) => {
    if (userType === "trainer") {
      // Single select for trainers
      if (selectedActivities.includes(activity)) {
        setSelectedActivities([])
      } else {
        setSelectedActivities([activity])
      }
    } else {
      // Multi select for players
      if (selectedActivities.includes(activity)) {
        setSelectedActivities(prev => prev.filter(a => a !== activity))
      } else {
        setSelectedActivities(prev => [...prev, activity])
      }
    }
  }

  const handleActivityContinue = () => {
    if (selectedActivities.length > 0) {
      // Find all activities that need rating
      const activitiesToRate = selectedActivities.filter(a => RATING_CONFIGS[a])

      if (activitiesToRate.length > 0) {
        setCurrentRatingIndex(0)
        setStep("skill")
      } else {
        setStep("location")
      }
    }
  }

  const handleSkillSelect = (rating: number) => {
    const activitiesToRate = selectedActivities.filter(a => RATING_CONFIGS[a])
    const currentActivity = activitiesToRate[currentRatingIndex]

    // Save the rating for this activity
    const newRatings = { ...activityRatings, [currentActivity]: rating }
    setActivityRatings(newRatings)

    // Check if there are more activities to rate
    if (currentRatingIndex < activitiesToRate.length - 1) {
      setCurrentRatingIndex(currentRatingIndex + 1)
    } else {
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
    if (selectedActivities.length > 0) {
      const primaryActivity = selectedActivities[0]
      const isStudio = selectedActivities.some(a => STUDIO_ACTIVITIES.includes(a))
      const isRec = selectedActivities.some(a => REC_ACTIVITIES.includes(a))

      // Use the rating for the primary activity if available
      const playerRating = activityRatings[primaryActivity]
        ? {
          sport: primaryActivity,
          rating: activityRatings[primaryActivity],
          matches: 0,
        }
        : undefined

      setPreferences({
        activities: selectedActivities,
        isStudioUser: isStudio,
        isRecUser: isRec,
        userType: userType,
        primaryActivity: primaryActivity,
        playerRating: playerRating,
      })
      router.replace("/(tabs)")
    }
  }

  // Get the current activity we are rating
  const activitiesToRate = selectedActivities.filter(a => RATING_CONFIGS[a])
  const currentActivityToRate = activitiesToRate[currentRatingIndex]

  if (step === "skill" && currentActivityToRate && RATING_CONFIGS[currentActivityToRate]) {
    const config = RATING_CONFIGS[currentActivityToRate]
    const currentRating = activityRatings[currentActivityToRate]

    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {activitiesToRate.length > 1
                  ? `Rating ${currentRatingIndex + 1} of ${activitiesToRate.length}`
                  : "Question 2 of 3"}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "66%" }]} />
              </View>
            </View>

            <Text style={styles.title}>What's your {currentActivityToRate} skill level?</Text>
            <Text style={styles.subtitle}>{config.description}</Text>

            <View style={styles.optionsList}>
              {config.levels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => handleSkillSelect(level.value)}
                  style={[
                    styles.skillCard,
                    currentRating === level.value && styles.cardSelected
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
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (step === "location") {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
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
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Question 1 of 3</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "33%" }]} />
            </View>
          </View>

          <Text style={styles.title}>
            {userType === "trainer"
              ? "What's your primary specialty?"
              : "What activities do you enjoy?"}
          </Text>
          {userType === "player" && (
            <Text style={styles.subtitle}>Select all that apply</Text>
          )}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>GoodRunss Rec</Text>
            <View style={styles.optionsList}>
              {REC_ACTIVITIES.map((activity) => (
                <TouchableOpacity
                  key={activity}
                  onPress={() => toggleActivity(activity)}
                  style={[
                    styles.activityCard,
                    selectedActivities.includes(activity) && styles.cardSelected
                  ]}
                >
                  <Text style={styles.activityText}>{activity}</Text>
                  {selectedActivities.includes(activity) && (
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
                  onPress={() => toggleActivity(activity)}
                  style={[
                    styles.activityCard,
                    selectedActivities.includes(activity) && styles.cardSelected
                  ]}
                >
                  <Text style={styles.activityText}>{activity}</Text>
                  {selectedActivities.includes(activity) && (
                    <Ionicons name="checkmark-circle" size={24} color="#84CC16" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedActivities.length > 0 && (
            <TouchableOpacity onPress={handleActivityContinue} style={styles.continueButton}>
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
    marginBottom: 8,
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
