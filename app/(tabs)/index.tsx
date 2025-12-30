import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native"

import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { router } from "expo-router"
import { useState, useMemo, useEffect } from "react"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/lib/auth-context"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { SafeAreaView } from "react-native-safe-area-context"
import { TeacherDashboard } from "@/components/TeacherDashboard"
import { useUserLocation } from "@/lib/location-context"
import { FriendActivityRail } from "@/components/Live/FriendActivityRail"
import { SEED_VENUES } from "@/lib/services/smart-data-service"
import { PlayRequestModal } from "@/components/Social/PlayRequest"
import { MiniCourtCardSkeleton } from "@/components/ui/Skeleton"
import { WeeklyCalendar } from "@/components/WeeklyCalendar"
import { VenueTrafficCard } from "@/components/VenueTrafficCard"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

// Design tokens
const colors = {
  bg: "#0A0A0A",
  card: "#141414",
  cardBorder: "#1F1F1F",
  primary: "#6B9B5A", // Updated to matte sage
  textPrimary: "#F0F0F0",
  textSecondary: "#8A8A8A",
  textMuted: "#666666",
}

// Courts from smart data service (blends real + seed data)
const SAMPLE_COURTS = SEED_VENUES.map(v => ({
  id: v.id,
  name: v.name,
  sport: v.sport,
  lat: v.lat,
  lng: v.lng,
  distance: 0 // will be calculated
}))

// Calculate distance between two coordinates in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function HomeScreen() {
  const { preferences, setPreferences } = useUserPreferences()
  const { isGuest, user } = useAuth()
  const { location } = useUserLocation()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showPlayRequest, setShowPlayRequest] = useState(false)
  const [currentHour] = useState(new Date().getHours())

  // Mock upcoming booking for player (would come from real service)
  const upcomingBooking = user ? {
    id: "1",
    venue: "Riverside Courts",
    court: "Court 2",
    date: "Today",
    time: "4:30 PM",
    duration: "1 hr",
  } : null

  // For "both" users - read from preferences for persistence across screens (including GIA)
  const viewMode = preferences.activeMode || "trainer"
  const setViewMode = (mode: "player" | "trainer") => {
    setPreferences({ ...preferences, activeMode: mode })
  }

  const primaryActivity = preferences.primaryActivity || "Basketball"

  // Include "both" in teaching role check
  const isBothUser = preferences.userType === "both"
  const isTeachingRole = preferences.userType === "trainer" || preferences.userType === "instructor" || (isBothUser && viewMode === "trainer")

  // Get nearest court based on user location
  const nearestCourt = useMemo(() => {
    if (!location) {
      return SAMPLE_COURTS[0] // Default to first court
    }

    let nearest = SAMPLE_COURTS[0]
    let minDistance = Infinity

    for (const court of SAMPLE_COURTS) {
      const distance = calculateDistance(location.lat, location.lng, court.lat, court.lng)
      if (distance < minDistance) {
        minDistance = distance
        nearest = court
      }
    }

    return { ...nearest, distance: minDistance }
  }, [location])

  // Time-based greeting
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning"
    if (currentHour < 17) return "Good afternoon"
    return "Good evening"
  }

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action()
  }

  // For teachers (including guests testing the app), show their dashboard
  if (isTeachingRole) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* Mode Toggle for "Both" Users */}
          {isBothUser && (
            <TouchableOpacity
              style={styles.modeToggle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                setViewMode("player")
              }}
            >
              <Ionicons name="swap-horizontal" size={16} color="#6B9B5A" />
              <Text style={styles.modeToggleText}>Switch to Player Mode</Text>
            </TouchableOpacity>
          )}
          <TeacherDashboard userType={preferences.userType === "both" ? "trainer" : preferences.userType as "trainer" | "instructor"} />
        </SafeAreaView>
      </View>
    )
  }

  // Player view - also handle "both" users in player mode
  const showBothModeToggle = isBothUser && viewMode === "player"

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Mode Toggle for "Both" Users in Player Mode */}
          {showBothModeToggle && (
            <TouchableOpacity
              style={styles.modeToggle}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                setViewMode("trainer")
              }}
            >
              <Ionicons name="swap-horizontal" size={16} color="#6B9B5A" />
              <Text style={styles.modeToggleText}>Switch to Trainer Mode</Text>
            </TouchableOpacity>
          )}

          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {isGuest ? "Guest" : user?.name || preferences.name || "Player"}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {/* CHAT BUTTON - Easy access to trainers & friends */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handlePress(() => router.push("/(tabs)/messages"))}
              >
                <Ionicons name="chatbubbles-outline" size={22} color={colors.textPrimary} />
                {/* Unread badge */}
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>2</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handlePress(() => router.push("/(tabs)/activity"))}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => handlePress(() => router.push("/(tabs)/profile"))}
              >
                <Text style={styles.avatarText}>
                  {isGuest ? "G" : (user?.name?.[0] || "U")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== UPCOMING BOOKING (if player has one) ===== */}
          {upcomingBooking && (
            <TouchableOpacity
              style={styles.upcomingBooking}
              onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#1A2A1A", "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upcomingGradient}
              >
                <View style={styles.upcomingLeft}>
                  <View style={styles.upcomingBadge}>
                    <Ionicons name="calendar" size={14} color="#6B9B5A" />
                    <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
                  </View>
                  <Text style={styles.upcomingVenue}>{upcomingBooking.venue}</Text>
                  <Text style={styles.upcomingDetails}>
                    {upcomingBooking.court} • {upcomingBooking.date} at {upcomingBooking.time}
                  </Text>
                </View>
                <View style={styles.upcomingRight}>
                  <Text style={styles.upcomingTime}>{upcomingBooking.time}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* ===== WEEKLY CALENDAR (New) ===== */}
          <WeeklyCalendar
            weather={{
              temp: 72, // TODO: Hook up to real weather service
              condition: "sunny",
              description: "Perfect for outdoor play"
            }}
          />

          {/* ===== RECOVERY HUB - Tap to open full screen ===== */}
          <TouchableOpacity
            style={styles.recoveryHub}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push("/recovery-hub")
            }}
            activeOpacity={0.8}
          >
            <View style={styles.recoveryHubHeader}>
              <View style={styles.recoveryHubLeft}>
                <Ionicons name="heart" size={18} color="#EF4444" />
                <Text style={styles.recoveryHubTitle}>Recovery Hub</Text>
              </View>
              <View style={styles.recoveryScoreBadge}>
                <Text style={styles.recoveryScoreText}>85</Text>
              </View>
            </View>
            <View style={styles.recoveryQuickStats}>
              <View style={styles.recoveryQuickStat}>
                <Text style={styles.recoveryQuickValue}>7.5h</Text>
                <Text style={styles.recoveryQuickLabel}>Sleep</Text>
              </View>
              <View style={styles.recoveryQuickDivider} />
              <View style={styles.recoveryQuickStat}>
                <Text style={styles.recoveryQuickValue}>92%</Text>
                <Text style={styles.recoveryQuickLabel}>Recovery</Text>
              </View>
              <View style={styles.recoveryQuickDivider} />
              <View style={styles.recoveryQuickStat}>
                <Text style={styles.recoveryQuickValue}>68</Text>
                <Text style={styles.recoveryQuickLabel}>HRV</Text>
              </View>
            </View>
            <View style={styles.recoveryTapHint}>
              <Text style={styles.recoveryTapText}>Tap to view full dashboard</Text>
              <Ionicons name="chevron-forward" size={14} color="#666" />
            </View>
          </TouchableOpacity>

          {/* ===== VENUE TRAFFIC CARD (New Premium Component) ===== */}
          <VenueTrafficCard
            venueId={nearestCourt.id}
            venueName={nearestCourt.name}
            distance={nearestCourt.distance}
            openUntil="10:00 PM" // TODO: Get from venue data
            sport={primaryActivity.toLowerCase()}
          />

          {/* ===== FRIENDS ACTIVE ===== */}
          <FriendActivityRail />

          {/* ===== NEARBY COURTS (Secondary Info) ===== */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Courts</Text>
              <TouchableOpacity onPress={() => handlePress(() => router.push("/near-me"))}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Court List */}
            <View style={styles.courtList}>
              {SAMPLE_COURTS.slice(0, 3).map((court, i) => {
                const dist = location ? calculateDistance(location.lat, location.lng, court.lat, court.lng) : 0
                return (
                  <TouchableOpacity
                    key={court.id}
                    style={[styles.courtItem, i === 2 && { borderBottomWidth: 0 }]}
                    onPress={() => handlePress(() => router.push(`/venues/${court.id}`))}
                  >
                    <View style={styles.courtLeft}>
                      <View style={[styles.activityIndicator, { backgroundColor: "#7ED957" }]} />
                      <View>
                        <Text style={styles.courtName}>{court.name}</Text>
                        <Text style={styles.courtDistance}>{dist.toFixed(1)} mi</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* ===== QUICK ACTIONS (2x2 Grid) ===== */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handlePress(() => router.push("/(tabs)/live"))}
              >
                <View style={[styles.actionIcon, { backgroundColor: "rgba(126, 217, 87, 0.15)" }]}>
                  <Ionicons name="map-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Find Courts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handlePress(() => router.push("/(tabs)/trainers"))}
              >
                <View style={[styles.actionIcon, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
                  <Ionicons name="fitness-outline" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.actionLabel}>Find Trainer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handlePress(() => router.push("/report-facility/quick"))}
              >
                <View style={[styles.actionIcon, { backgroundColor: "rgba(251, 191, 36, 0.15)" }]}>
                  <Ionicons name="camera-outline" size={24} color="#FBBF24" />
                </View>
                <Text style={styles.actionLabel}>Report Court</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}
              >
                <View style={[styles.actionIcon, { backgroundColor: "rgba(6, 182, 212, 0.15)" }]}>
                  <Ionicons name="calendar-outline" size={24} color="#06B6D4" />
                </View>
                <Text style={styles.actionLabel}>My Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== EARN BANNER ===== */}
          <TouchableOpacity
            style={styles.earnBanner}
            onPress={() => handlePress(() => router.push("/(tabs)/report"))}
            activeOpacity={0.9}
          >
            <View style={styles.earnLeft}>
              <View style={styles.earnIconContainer}>
                <Ionicons name="cash-outline" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.earnTitle}>Earn $5 per report</Text>
                <Text style={styles.earnSubtitle}>Help others, get paid</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Spacer for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Guest Banner - Fixed at bottom */}
        {isGuest && (
          <View style={styles.guestBanner}>
            <View>
              <Text style={styles.guestLabel}>Guest Mode</Text>
              <Text style={styles.guestDesc}>Sign up to unlock all features</Text>
            </View>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => router.push("/auth")}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Debug Toggle for Guest */}
            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: '#333', marginLeft: 8 }]}
              onPress={() => {
                // Toggle between trainer/player for guest demo
                // This relies on useUserPreferences exposing a setter or we hack it here
                // ideally we navigate to a screen that sets it, but for now let's just 
                // assume the user can go to Profile -> Switch View (which we should verify works for guests)
                router.push("/(tabs)/profile")
              }}
            >
              <Text style={[styles.signUpText, { color: '#FFF' }]}>Switch View</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature=""
        description=""
      />

      {/* Play Request Modal */}
      <PlayRequestModal
        sport={primaryActivity}
        visible={showPlayRequest}
        onClose={() => setShowPlayRequest(false)}
        location={nearestCourt?.name}
      />
    </View>
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
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  unreadText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
  },

  // Recovery Hub
  recoveryHub: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  recoveryHubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recoveryHubLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recoveryHubTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  recoveryScoreBadge: {
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recoveryScoreText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7ED957",
  },
  recoveryQuickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
  },
  recoveryQuickStat: {
    alignItems: "center",
  },
  recoveryQuickValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  recoveryQuickLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  recoveryQuickDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#333",
  },
  recoveryTapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  recoveryTapText: {
    fontSize: 12,
    color: "#666",
  },
  recoveryHubDesc: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  connectHealthBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7ED957",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectHealthText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },

  // Need Players Button
  needPlayersBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 24,
  },
  needPlayersText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: '#171717', // Subtle card bg
  },
  heroContent: {
    padding: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  giaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  giaBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#A78BFA",
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  heroMain: {
    alignItems: "flex-start", // Left align for more serious data feel
    marginBottom: 32,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  venueName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: '#FFF',
  },
  venueDistance: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: '#737373',
  },
  heroBigText: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    color: '#FFF', // White instead of Green for clean look
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  heroConfidence: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: '#A3A3A3',
  },
  heroTimeline: {
    marginBottom: 0,
  },
  timelineBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
    gap: 4,
  },
  timelineItem: {
    flex: 1,
    alignItems: "center",
  },
  timelineBar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },


  // Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Increased spacing
  },
  sectionTitle: {
    fontSize: 16, // Smaller, more refined headers
    fontFamily: "Inter_600SemiBold",
    color: '#FFF',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: colors.primary, // Keep actionable color
  },

  // Court List
  courtList: {
    backgroundColor: 'transparent', // Remove container background
    gap: 16, // Spacing between items instead of borders
  },
  courtItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 0, // Remove padding
    borderBottomWidth: 0, // Remove dividers
  },
  courtLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  activityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courtName: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: '#E5E5E5',
    marginBottom: 2,
  },
  courtDistance: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: '#737373',
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#171717', // Subtle card
    borderRadius: 20,
    padding: 24,
    alignItems: "flex-start", // Left align content
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: '#FFF',
  },

  // Earn Banner
  earnBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: '#171717',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  earnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  earnIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.1)", // Subtle green background
    alignItems: "center",
    justifyContent: "center",
  },
  earnTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: '#FFF',
  },
  earnSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: '#737373',
    marginTop: 2,
  },

  // Guest Banner
  guestBanner: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  guestLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: '#FFF',
  },
  guestDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: '#A3A3A3',
  },
  signUpButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signUpText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  // Mode Toggle for "Both" users
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    marginBottom: 12,
    gap: 8,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  // Upcoming Booking Card
  upcomingBooking: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  upcomingGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    backgroundColor: '#171717', // Flat subtle bg
    borderRadius: 24,
  },
  upcomingLeft: {
    flex: 1,
  },
  upcomingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 1,
  },
  upcomingVenue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  upcomingDetails: {
    fontSize: 14,
    color: "#737373",
  },
  upcomingRight: {
    alignItems: "center",
    gap: 4,
  },
  upcomingTime: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: -0.5,
  },
})
