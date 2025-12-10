import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type UserTypeOption = "player" | "trainer" | "instructor" | "both"

const USER_TYPE_OPTIONS = [
  {
    id: "player" as UserTypeOption,
    title: "Player",
    subtitle: "Find Games & Courts",
    description: "Check conditions, join games, compete",
    icon: "basketball" as const,
    color: "#FF6B35",
    category: "play",
  },
  {
    id: "trainer" as UserTypeOption,
    title: "Trainer",
    subtitle: "Sports Coach",
    description: "Coach athletes, manage clients",
    icon: "fitness" as const,
    color: "#7ED957",
    category: "teach",
  },
  {
    id: "instructor" as UserTypeOption,
    title: "Instructor",
    subtitle: "Wellness Teacher",
    description: "Teach wellness, host sessions",
    icon: "sparkles" as const,
    color: "#EC4899",
    category: "teach",
  },
  {
    id: "both" as UserTypeOption,
    title: "I Do Both",
    subtitle: "Play & Teach",
    description: "I both play AND teach",
    icon: "sync" as const,
    color: "#06B6D4",
    category: "both",
  },
]


export default function OnboardingScreen() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserTypeOption | null>(null)

  const handleSelect = (type: UserTypeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setUserType(type)
  }

  const handleContinue = () => {
    if (userType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      router.push({
        pathname: "/onboarding/questionnaire",
        params: { userType }
      })
    }
  }

  const playOptions = USER_TYPE_OPTIONS.filter(o => o.category === "play")
  const teachOptions = USER_TYPE_OPTIONS.filter(o => o.category === "teach")
  const bothOption = USER_TYPE_OPTIONS.find(o => o.category === "both")!

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to GoodRunss</Text>
            <Text style={styles.subtitle}>What brings you here?</Text>
          </View>

          {/* Play/Practice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>🎯</Text>
              <Text style={styles.sectionTitle}>I PLAY / PRACTICE</Text>
            </View>
            <View style={styles.optionRow}>
              {playOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  style={[
                    styles.optionCard,
                    userType === option.id && styles.optionCardSelected,
                    { borderColor: userType === option.id ? option.color : "#333" }
                  ]}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: `${option.color}20` }]}>
                    <Ionicons name={option.icon} size={28} color={option.color} />
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                  {userType === option.id && (
                    <View style={[styles.checkBadge, { backgroundColor: option.color }]}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Teach/Train Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>👨‍🏫</Text>
              <Text style={styles.sectionTitle}>I TEACH / TRAIN</Text>
            </View>
            <View style={styles.optionRow}>
              {teachOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  style={[
                    styles.optionCard,
                    userType === option.id && styles.optionCardSelected,
                    { borderColor: userType === option.id ? option.color : "#333" }
                  ]}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: `${option.color}20` }]}>
                    <Ionicons name={option.icon} size={28} color={option.color} />
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                  {userType === option.id && (
                    <View style={[styles.checkBadge, { backgroundColor: option.color }]}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Both Option */}
          <TouchableOpacity
            onPress={() => handleSelect(bothOption.id)}
            style={[
              styles.bothCard,
              userType === bothOption.id && styles.bothCardSelected,
              { borderColor: userType === bothOption.id ? bothOption.color : "#333" }
            ]}
          >
            <View style={[styles.bothIconContainer, { backgroundColor: `${bothOption.color}20` }]}>
              <Ionicons name={bothOption.icon} size={24} color={bothOption.color} />
            </View>
            <View style={styles.bothTextContainer}>
              <Text style={styles.bothTitle}>{bothOption.title}</Text>
              <Text style={styles.bothDescription}>{bothOption.description}</Text>
            </View>
            {userType === bothOption.id && (
              <View style={[styles.checkBadge, { backgroundColor: bothOption.color }]}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Continue Button */}
          {userType && (
            <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
              <Text style={styles.continueText}>Continue</Text>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  section: {
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
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#1A1A1A",
    position: "relative",
  },
  optionCardSelected: {
    backgroundColor: "rgba(126, 217, 87, 0.05)",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#7ED957",
    fontWeight: "600",
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bothCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#1A1A1A",
    marginTop: 8,
    position: "relative",
  },
  bothCardSelected: {
    backgroundColor: "rgba(6, 182, 212, 0.05)",
  },
  bothIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bothTextContainer: {
    flex: 1,
  },
  bothTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  bothDescription: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  continueText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },
})
