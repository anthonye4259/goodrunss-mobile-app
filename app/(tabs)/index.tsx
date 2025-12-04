import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent } from "@/lib/activity-content"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/lib/auth-context"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
  const { preferences } = useUserPreferences()
  const { isGuest } = useAuth()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptFeature, setLoginPromptFeature] = useState("")
  const [loginPromptDescription, setLoginPromptDescription] = useState("")
  const primaryActivity = preferences.primaryActivity || "Basketball"
  const content = getActivityContent(primaryActivity as any)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {isGuest && (
          <View style={styles.guestBanner}>
            <View style={styles.guestBannerContent}>
              <View style={styles.guestBannerText}>
                <Text style={styles.guestModeLabel}>GUEST MODE</Text>
                <Text style={styles.guestModeDesc}>Sign up to unlock all features</Text>
              </View>
              <TouchableOpacity style={styles.signUpButton} onPress={() => router.push("/auth")}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Animated.ScrollView
          style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              {isGuest ? "Welcome to GoodRunss!" : "Welcome back!"}
            </Text>
            <Text style={styles.subText}>
              {isGuest ? "Discover trainers and courts near you" : `Ready to play ${primaryActivity.toLowerCase()}?`}
            </Text>
          </View>

          {/* For You Card */}
          <TouchableOpacity
            style={styles.forYouCard}
            onPress={() => handlePress(() => router.push("/for-you"))}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={["#84CC16", "#65A30D"]} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.forYouGradient}
            >
              <View style={styles.forYouContent}>
                <View style={styles.forYouTextContainer}>
                  <View style={styles.aiLabel}>
                    <Ionicons name="sparkles" size={20} color="#000" />
                    <Text style={styles.aiLabelText}>AI POWERED</Text>
                  </View>
                  <Text style={styles.forYouTitle}>For You Feed</Text>
                  <Text style={styles.forYouDesc}>Personalized trainers based on your preferences</Text>
                </View>
                <Ionicons name="chevron-forward" size={28} color="#000" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Row */}
          {!isGuest && (
            <View style={styles.statsContainer}>
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                <View style={[styles.statItem, styles.statItemBorder]}>
                  <Text style={[styles.statNumber, { color: "#6DD5C3" }]}>5</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: "#FFF" }]}>8</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
              </View>
            </View>
          )}

          {/* Upcoming Session */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity
              style={styles.upcomingCard}
              activeOpacity={0.7}
              onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}
            >
              <View style={styles.upcomingHeader}>
                <View style={styles.upcomingIcon}>
                  <Ionicons name="calendar" size={24} color="#84CC16" />
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>{content.sampleSessions[0]?.title || "Next Session"}</Text>
                  <Text style={styles.upcomingLocation}>{content.sampleSessions[0]?.location || "TBD"}</Text>
                </View>
              </View>
              <View style={styles.upcomingFooter}>
                <Text style={styles.upcomingTime}>{content.sampleSessions[0]?.time || "Schedule soon"}</Text>
                <TouchableOpacity style={styles.startButton} onPress={() => router.push("/(tabs)/bookings")}>
                  <Text style={styles.startButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Find Trainers */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Find {content.trainerTitle}s</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={272}
            >
              {content.sampleTrainers.map((trainer, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trainerCard}
                  activeOpacity={0.8}
                  onPress={() => handlePress(() => router.push(`/trainers/${index}`))}
                >
                  <View style={styles.trainerHeader}>
                    <View style={styles.trainerAvatar}>
                      <Text style={styles.trainerInitial}>{trainer.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.trainerInfo}>
                      <Text style={styles.trainerName}>{trainer.name}</Text>
                      <View style={styles.trainerRating}>
                        <Ionicons name="star" size={14} color="#84CC16" />
                        <Text style={styles.trainerRatingText}>
                          {trainer.rating} ({trainer.reviews})
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.trainerLocation}>{trainer.location}</Text>
                  <View style={styles.trainerFooter}>
                    <Text style={styles.trainerPrice}>${trainer.price}/hr</Text>
                    <TouchableOpacity style={styles.bookButton} onPress={() => router.push(`/trainers/${index}`)}>
                      <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/explore")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(132, 204, 22, 0.2)" }]}>
                  <Ionicons name="search" size={24} color="#84CC16" />
                </View>
                <Text style={styles.quickActionText}>Find Courts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/gia")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(139, 92, 246, 0.2)" }]}>
                  <Ionicons name="sparkles" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.quickActionText}>Ask GIA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/messages")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(14, 165, 233, 0.2)" }]}>
                  <Ionicons name="chatbubbles" size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/profile")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(249, 115, 22, 0.2)" }]}>
                  <Ionicons name="person" size={24} color="#F97316" />
                </View>
                <Text style={styles.quickActionText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature={loginPromptFeature}
        description={loginPromptDescription}
      />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  guestBanner: {
    backgroundColor: "rgba(132, 204, 22, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(132, 204, 22, 0.2)",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  guestBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guestBannerText: {
    flex: 1,
  },
  guestModeLabel: {
    color: "#84CC16",
    fontWeight: "bold",
    fontSize: 12,
  },
  guestModeDesc: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  signUpButton: {
    backgroundColor: "#84CC16",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signUpButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  forYouCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  forYouGradient: {
    padding: 24,
  },
  forYouContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forYouTextContainer: {
    flex: 1,
  },
  aiLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiLabelText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 8,
  },
  forYouTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 4,
  },
  forYouDesc: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 14,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#333",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#84CC16",
  },
  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  upcomingCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(132, 204, 22, 0.3)",
  },
  upcomingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  upcomingIcon: {
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    borderRadius: 50,
    padding: 12,
    marginRight: 16,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  upcomingLocation: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  upcomingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upcomingTime: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  startButton: {
    backgroundColor: "#84CC16",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  startButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  trainerCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    width: 256,
    marginRight: 16,
  },
  trainerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  trainerAvatar: {
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  trainerInitial: {
    color: "#84CC16",
    fontWeight: "bold",
    fontSize: 18,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  trainerRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  trainerRatingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginLeft: 4,
  },
  trainerLocation: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 12,
  },
  trainerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trainerPrice: {
    color: "#84CC16",
    fontWeight: "bold",
    fontSize: 18,
  },
  bookButton: {
    backgroundColor: "#84CC16",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    width: "47%",
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
})
