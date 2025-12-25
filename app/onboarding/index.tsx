import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"

const { width } = Dimensions.get("window")

type UserTypeOption = "player" | "trainer" | "instructor" | "both"

// Clean options
const OPTIONS: { id: UserTypeOption; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    id: "player",
    title: "I Play",
    desc: "Find courts, check conditions, join games",
    icon: "basketball-outline",
  },
  {
    id: "trainer",
    title: "I Train",
    desc: "Coach athletes, manage bookings, get paid",
    icon: "fitness-outline",
  },
  {
    id: "instructor",
    title: "I Teach",
    desc: "Host wellness classes, build your community",
    icon: "sparkles-outline",
  },
  {
    id: "both",
    title: "I Do Both",
    desc: "I play AND teach or train others",
    icon: "swap-horizontal-outline",
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { setPreferences } = useUserPreferences()
  const [selected, setSelected] = useState<UserTypeOption | null>(null)

  const handleSelect = (type: UserTypeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected(type)
  }

  const handleContinue = () => {
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push({
        pathname: "/onboarding/questionnaire",
        params: { userType: selected }
      })
    }
  }

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPreferences({
      userType: "player",
      activities: ["Basketball"],
      primaryActivity: "Basketball",
      isStudioUser: false,
      isRecUser: true,
      onboardingComplete: false,
    })
    router.replace("/(tabs)")
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Header with Accent */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>GoodRunss</Text>
          </View>
          <Text style={styles.title}>What brings{"\n"}you here?</Text>
          <Text style={styles.subtitle}>
            Choose your primary role to personalize your experience
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option, index) => {
            const isSelected = selected === option.id
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.8}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                <View style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected
                ]}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={isSelected ? "#7ED957" : "#666"}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionTitle,
                    isSelected && styles.optionTitleSelected
                  ]}>{option.title}</Text>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </View>
                <View style={[
                  styles.radio,
                  isSelected && styles.radioSelected
                ]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selected}
            style={[
              styles.continueButton,
              selected && styles.continueButtonActive
            ]}
          >
            <Text style={[
              styles.continueText,
              selected && styles.continueTextActive
            ]}>
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={selected ? "#000" : "#444"}
            />
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            You can always change this later
          </Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#666",
  },
  header: {
    marginTop: 8,
    marginBottom: 32,
  },
  brandBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  brandText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#7ED957",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    color: "#FFFFFF",
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#888",
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#1A1A1A",
    padding: 18,
  },
  optionCardSelected: {
    borderColor: "#7ED957",
    backgroundColor: "rgba(126, 217, 87, 0.05)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: "rgba(126, 217, 87, 0.15)",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: "#7ED957",
  },
  optionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#7ED957",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7ED957",
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 18,
    gap: 8,
  },
  continueButtonActive: {
    backgroundColor: "#7ED957",
  },
  continueText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: "#444",
  },
  continueTextActive: {
    color: "#000",
  },
  footerNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    marginTop: 16,
  },
})
