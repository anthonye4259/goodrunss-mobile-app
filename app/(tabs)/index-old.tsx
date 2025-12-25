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
import { ActivityHeatMap } from "@/components/ActivityHeatMap"
import { MovementScoreWidget } from "@/components/MovementScoreWidget"
import { NearestVenueWidget } from "@/components/NearestVenueWidget"
import { FavoritesWidget } from "@/components/FavoritesWidget"
import { TeacherDashboard } from "@/components/TeacherDashboard"
import { PartnerCityBadge } from "@/components/partner-city-badge"
import { NearMeBadge } from "@/components/NearMeBadge"
import { ProactiveGIA } from "@/components/ProactiveGIA"

export default function HomeScreen() {
  const { preferences } = useUserPreferences()
  const { isGuest } = useAuth()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptFeature, setLoginPromptFeature] = useState("")
  const [loginPromptDescription, setLoginPromptDescription] = useState("")
  const primaryActivity = preferences.primaryActivity || "Basketball"
  const content = getActivityContent(primaryActivity as any)

  // Check if user is a teaching role (trainer or instructor)
  const isTeachingRole = preferences.userType === "trainer" || preferences.userType === "instructor"

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
          {/* Partner City Badge - Shows for Myrtle Beach users */}
          <PartnerCityBadge />

          {/* Header with Profile & Notifications */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.welcomeText}>
                  {isGuest ? "Welcome to GoodRunss!" : "Welcome back!"}
                </Text>
                <Text style={styles.subText}>
                  {isGuest ? "Discover trainers and courts near you" : `Ready to play ${primaryActivity.toLowerCase()}?`}
                </Text>
              </View>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => handlePress(() => router.push("/(tabs)/activity"))}
                >
                  <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerIconButton}
                  onPress={() => handlePress(() => router.push("/(tabs)/profile"))}
                >
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileInitial}>
                      {isGuest ? "G" : "U"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Show Teacher Dashboard for trainers/instructors, otherwise show player widgets */}
          {isTeachingRole && !isGuest ? (
            <TeacherDashboard userType={preferences.userType as "trainer" | "instructor"} />
          ) : (
            <>
              {/* Proactive GIA Suggestions */}
              <ProactiveGIA compact />

              {/* Near Me Badge - Courts within 1 mile */}
              <NearMeBadge />

              {/* Movement Score Widget - Daily Check-in */}
              {!isGuest && <MovementScoreWidget />}

              {/* Nearest Venue with Live Traffic + GR Predict */}
              <NearestVenueWidget />

              {/* Favorites */}
              {!isGuest && <FavoritesWidget />}
            </>
          )}

          {/* Quick Report - Environmental Impact */}
          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => handlePress(() => router.push("/report-facility/quick"))}
            activeOpacity={0.8}
          >
            <View style={styles.reportCardContent}>
              <View style={styles.reportIconContainer}>
                <Ionicons name="leaf" size={32} color="#7ED957" />
              </View>
              <View style={styles.reportTextContainer}>
                <Text style={styles.reportTitle}>Report Court Condition</Text>
                <View style={styles.reportDescRow}>
                  <Text style={styles.reportDesc}>Save gas, time & help the planet</Text>
                  <Ionicons name="earth" size={14} color="#7ED957" />
                </View>
                <View style={styles.reportDescRow}>
                  <Ionicons name="cash-outline" size={12} color="#7ED957" />
                  <Text style={styles.reportEarnings}> Earn $5 per report!</Text>
                </View>
              </View>
              <View style={styles.reportBadge}>
                <Ionicons name="cash" size={16} color="#7ED957" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Live Activity Heat Map */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flame" size={18} color="#F97316" />
                <Text style={styles.sectionTitle}>Live Activity</Text>
              </View>
              <TouchableOpacity onPress={() => handlePress(() => router.push("/activity-map"))}>
                <Text style={styles.seeAllText}>View Map</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heatMapContainer}>
              <ActivityHeatMap height={200} />
            </View>
          </View>

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
                  <Ionicons name="calendar" size={24} color="#7ED957" />
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

          {/* Quick Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/explore")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(132, 204, 22, 0.2)" }]}>
                  <Ionicons name="map" size={24} color="#7ED957" />
                </View>
                <Text style={styles.quickActionText}>Find Courts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/bookings")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(251, 191, 36, 0.2)" }]}>
                  <Ionicons name="calendar" size={24} color="#FBBF24" />
                </View>
                <Text style={styles.quickActionText}>Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/messages")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(14, 165, 233, 0.2)" }]}>
                  <Ionicons name="chatbubbles" size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/invite")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(236, 72, 153, 0.2)" }]}>
                  <Ionicons name="person-add" size={24} color="#EC4899" />
                </View>
                <Text style={styles.quickActionText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Find Leagues Banner */}
          <TouchableOpacity
            style={styles.leaguesBanner}
            onPress={() => handlePress(() => router.push("/leagues"))}
            activeOpacity={0.8}
          >
            <View style={styles.leaguesBannerContent}>
              <View style={styles.leaguesBannerIcon}>
                <Ionicons name="trophy" size={28} color="#EF4444" />
              </View>
              <View style={styles.leaguesBannerText}>
                <Text style={styles.leaguesBannerTitle}>Join a League</Text>
                <Text style={styles.leaguesBannerDesc}>Find competitive & rec leagues near you</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
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
    color: "#7ED957",
    fontWeight: "bold",
    fontSize: 12,
  },
  guestModeDesc: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  signUpButton: {
    backgroundColor: "#7ED957",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconButton: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#7ED957",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7ED957",
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
  viewStatsLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    gap: 4,
  },
  viewStatsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7ED957",
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
    color: "#7ED957",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7ED957",
  },
  heatMapContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#252525",
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
    backgroundColor: "#7ED957",
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
    color: "#7ED957",
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
    color: "#7ED957",
    fontWeight: "bold",
    fontSize: 18,
  },
  bookButton: {
    backgroundColor: "#7ED957",
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
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  reportCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    borderWidth: 2,
    borderColor: "#7ED957",
    overflow: "hidden",
  },
  reportCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  reportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  reportTextContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  reportDescRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  reportEarnings: {
    fontSize: 12,
    color: "#7ED957",
    fontWeight: "600",
  },
  reportBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  leaguesBanner: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#252525",
  },
  leaguesBannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  leaguesBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  leaguesBannerText: {
    flex: 1,
  },
  leaguesBannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  leaguesBannerDesc: {
    fontSize: 14,
    color: "#9CA3AF",
  },
})
