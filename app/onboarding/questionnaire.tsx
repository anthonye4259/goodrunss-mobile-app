import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { Ionicons } from "@expo/vector-icons"
import { RATING_CONFIGS } from "@/lib/player-rating-types"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"

const REC_ACTIVITIES = ["Basketball", "Tennis", "Pickleball", "Padel", "Racquetball", "Volleyball", "Golf", "Soccer", "Swimming"]
const STUDIO_ACTIVITIES = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"]
const ALL_ACTIVITIES = [...REC_ACTIVITIES, ...STUDIO_ACTIVITIES]

type UserType = "player" | "practitioner" | "trainer" | "instructor" | "both"

// Map user types to their relevant activities
const getActivitiesForUserType = (userType: UserType): string[] => {
  switch (userType) {
    case "player":
      return REC_ACTIVITIES
    case "practitioner":
      return STUDIO_ACTIVITIES
    case "trainer":
      return REC_ACTIVITIES
    case "instructor":
      return STUDIO_ACTIVITIES
    case "both":
      return ALL_ACTIVITIES
    default:
      return ALL_ACTIVITIES
  }
}

// Get the appropriate title based on user type
const getTitleForUserType = (userType: UserType): { title: string; subtitle: string } => {
  switch (userType) {
    case "player":
      return { title: "What sports do you play?", subtitle: "Select all that apply" }
    case "practitioner":
      return { title: "What do you practice?", subtitle: "Select all that apply" }
    case "trainer":
      return { title: "What do you teach?", subtitle: "Select your specialty" }
    case "instructor":
      return { title: "What do you teach?", subtitle: "Select your specialty" }
    case "both":
      return { title: "What activities are you into?", subtitle: "Select all that apply" }
    default:
      return { title: "What activities do you enjoy?", subtitle: "Select all that apply" }
  }
}

// Check if user type is a teaching role
const isTeachingRole = (userType: UserType): boolean => {
  return userType === "trainer" || userType === "instructor"
}

export default function QuestionnaireScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const userType = (params.userType as UserType) || "player"

  const { setPreferences } = useUserPreferences()
  const { requestLocation, loading: locationLoading, error: locationError } = useLocation()

  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [step, setStep] = useState<"activity" | "skill" | "location">("activity")
  const [activityRatings, setActivityRatings] = useState<Record<string, number>>({})
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0)

  const availableActivities = getActivitiesForUserType(userType)
  const { title: stepTitle, subtitle: stepSubtitle } = getTitleForUserType(userType)
  const isSingleSelect = isTeachingRole(userType)

  const toggleActivity = (activity: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (isSingleSelect) {
      // Single select for trainers/instructors
      if (selectedActivities.includes(activity)) {
        setSelectedActivities([])
      } else {
        setSelectedActivities([activity])
      }
    } else {
      // Multi select for players/practitioners/both
      if (selectedActivities.includes(activity)) {
        setSelectedActivities(prev => prev.filter(a => a !== activity))
      } else {
        setSelectedActivities(prev => [...prev, activity])
      }
    }
  }

  const handleActivityContinue = () => {
    if (selectedActivities.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // Find all activities that need rating (only for non-teaching roles)
      const activitiesToRate = isTeachingRole(userType)
        ? []
        : selectedActivities.filter(a => RATING_CONFIGS[a])

      if (activitiesToRate.length > 0) {
        setCurrentRatingIndex(0)
        setStep("skill")
      } else {
        setStep("location")
      }
    }
  }

  const handleSkillSelect = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await requestLocation()
    handleComplete()
  }

  const handleSkipLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleComplete()
  }

  const handleComplete = () => {
    if (selectedActivities.length > 0) {
      const primaryActivity = selectedActivities[0]
      const isStudio = selectedActivities.some(a => STUDIO_ACTIVITIES.includes(a))
      const isRec = selectedActivities.some(a => REC_ACTIVITIES.includes(a))

      // Determine activityType
      let activityType: "studio" | "rec" | "both" = "rec"
      if (isStudio && isRec) {
        activityType = "both"
      } else if (isStudio) {
        activityType = "studio"
      }

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
        activityType: activityType,
        playerRating: playerRating,
      })
      // Navigate to feature discovery slides
      router.replace("/onboarding/features")
    }
  }

  // Get the current activity we are rating
  const activitiesToRate = selectedActivities.filter(a => RATING_CONFIGS[a])
  const currentActivityToRate = activitiesToRate[currentRatingIndex]

  // Skill rating step
  if (step === "skill" && currentActivityToRate && RATING_CONFIGS[currentActivityToRate]) {
    const config = RATING_CONFIGS[currentActivityToRate]

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

            <Text style={styles.title}>
              {config.system === "HANDICAP"
                ? `What's your Golf Handicap?`
                : config.system === "UTR"
                  ? `What's your Tennis UTR?`
                  : config.system === "DUPR"
                    ? `What's your Pickleball DUPR?`
                    : `What's your ${currentActivityToRate} skill level?`}
            </Text>
            <Text style={styles.subtitle}>{config.systemName}</Text>

            <View style={styles.optionsList}>
              {config.levels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => handleSkillSelect(level.value)}
                  style={styles.skillCard}
                >
                  <View style={styles.skillContent}>
                    <Text style={styles.skillName}>{level.name}</Text>
                    <Text style={styles.skillRange}>{level.range}</Text>
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

  // Location step
  if (step === "location") {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.locationContainer}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Almost Done!</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "100%" }]} />
              </View>
            </View>

            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={80} color="#7ED957" />
            </View>

            <Text style={styles.locationTitle}>Enable Location</Text>
            <Text style={styles.locationDescription}>
              {isTeachingRole(userType)
                ? "Allow location access so clients can find you and you can see nearby venues."
                : "Allow location access to find nearby courts, studios, and trainers in your area."}
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

  // Separate activities into REC and STUDIO for display
  const recActivitiesToShow = availableActivities.filter(a => REC_ACTIVITIES.includes(a))
  const studioActivitiesToShow = availableActivities.filter(a => STUDIO_ACTIVITIES.includes(a))

  // Activity selection step
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

          <Text style={styles.title}>{stepTitle}</Text>
          <Text style={styles.subtitle}>{stepSubtitle}</Text>

          {/* Rec Activities Section */}
          {recActivitiesToShow.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>🏀</Text>
                <Text style={styles.sectionTitle}>Sports & Recreation</Text>
              </View>
              <View style={styles.activityGrid}>
                {recActivitiesToShow.map((activity) => (
                  <TouchableOpacity
                    key={activity}
                    onPress={() => toggleActivity(activity)}
                    style={[
                      styles.activityCard,
                      selectedActivities.includes(activity) && styles.cardSelected
                    ]}
                  >
                    <Text style={[
                      styles.activityText,
                      selectedActivities.includes(activity) && styles.activityTextSelected
                    ]}>{activity}</Text>
                    {selectedActivities.includes(activity) && (
                      <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Studio Activities Section */}
          {studioActivitiesToShow.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>🧘</Text>
                <Text style={styles.sectionTitle}>Studio & Wellness</Text>
              </View>
              <View style={styles.activityGrid}>
                {studioActivitiesToShow.map((activity) => (
                  <TouchableOpacity
                    key={activity}
                    onPress={() => toggleActivity(activity)}
                    style={[
                      styles.activityCard,
                      selectedActivities.includes(activity) && styles.cardSelected
                    ]}
                  >
                    <Text style={[
                      styles.activityText,
                      selectedActivities.includes(activity) && styles.activityTextSelected
                    ]}>{activity}</Text>
                    {selectedActivities.includes(activity) && (
                      <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedActivities.length > 0 && (
            <TouchableOpacity onPress={handleActivityContinue} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7ED957",
    borderRadius: 2,
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
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333",
    minWidth: "47%",
    flexGrow: 1,
  },
  cardSelected: {
    borderColor: "#7ED957",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
  },
  activityText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  activityTextSelected: {
    color: "#7ED957",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    gap: 8,
  },
  continueButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Skill rating styles
  optionsList: {
    gap: 12,
  },
  skillCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#333",
  },
  skillContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  skillName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  skillRange: {
    fontSize: 14,
    color: "#7ED957",
    fontWeight: "600",
  },
  skillDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  // Location styles
  locationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "center",
  },
  locationIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  locationTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  locationDescription: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
  },
  locationButton: {
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
})
