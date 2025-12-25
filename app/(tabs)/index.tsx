import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { router } from "expo-router"
import { useState, useMemo, useEffect } from "react"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/lib/auth-context"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { SafeAreaView } from "react-native-safe-area-context"
import { TeacherDashboard } from "@/components/TeacherDashboard"
import { useUserLocation } from "@/lib/services/location-service"
import { FriendActivityRail } from "@/components/Live/FriendActivityRail"

const { width } = Dimensions.get("window")

// Design tokens
const colors = {
  bg: "#0A0A0A",
  card: "#141414",
  cardBorder: "#1F1F1F",
  primary: "#7ED957",
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
}

// Activity level colors
const ACTIVITY_COLORS = {
  quiet: "#22C55E",
  active: "#EAB308",
  busy: "#F97316",
  packed: "#EF4444",
}

// Sample courts (in production, fetch from Firebase)
const SAMPLE_COURTS = [
  { id: "1", name: "Central Park Courts", sport: "Basketball", lat: 40.7829, lng: -73.9654 },
  { id: "2", name: "Riverside Tennis Center", sport: "Tennis", lat: 40.8010, lng: -73.9712 },
  { id: "3", name: "Oak Street Park", sport: "Basketball", lat: 40.7580, lng: -73.9855 },
  { id: "4", name: "Downtown Rec Center", sport: "Pickleball", lat: 40.7128, lng: -74.0060 },
  { id: "5", name: "Harlem Courts", sport: "Basketball", lat: 40.8116, lng: -73.9465 },
]

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

// Generate hourly predictions
function generateHourlyPredictions(currentHour: number) {
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
  const predictions = []

  for (let i = 0; i < 6; i++) {
    const h = (currentHour + i) % 24
    let level: 'quiet' | 'active' | 'busy' | 'packed' = 'quiet'

    // Simple prediction logic
    if (isWeekend) {
      if (h >= 10 && h <= 17) level = Math.random() > 0.5 ? 'busy' : 'active'
      else if (h >= 18 && h <= 20) level = 'active'
    } else {
      if ((h >= 6 && h <= 9) || (h >= 17 && h <= 20)) level = Math.random() > 0.5 ? 'busy' : 'packed'
      else if (h >= 12 && h <= 14) level = 'active'
    }

    const hourStr = i === 0 ? "Now" :
      h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`

    predictions.push({
      hour: hourStr,
      level,
      color: ACTIVITY_COLORS[level],
      isNow: i === 0,
      isBest: level === 'quiet' && i > 0
    })
  }

  // Find best time
  const bestIndex = predictions.findIndex((p, i) => i > 0 && p.level === 'quiet')
  if (bestIndex > 0) predictions[bestIndex].isBest = true

  return predictions
}

export default function HomeScreen() {
  const { preferences, setPreferences } = useUserPreferences()
  const { isGuest, user } = useAuth()
  const { location } = useUserLocation()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [currentHour] = useState(new Date().getHours())

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

  // Generate predictions
  const predictions = useMemo(() => generateHourlyPredictions(currentHour), [currentHour])
  const bestTimeIndex = predictions.findIndex(p => p.isBest)
  const bestTime = bestTimeIndex > 0 ? predictions[bestTimeIndex].hour : "Now"

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
      <LinearGradient colors={[colors.bg, "#141414"]} style={styles.container}>
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
              <Ionicons name="swap-horizontal" size={16} color="#7ED957" />
              <Text style={styles.modeToggleText}>Switch to Player Mode</Text>
            </TouchableOpacity>
          )}
          <TeacherDashboard userType={preferences.userType === "both" ? "trainer" : preferences.userType as "trainer" | "instructor"} />
        </SafeAreaView>
      </LinearGradient>
    )
  }

  // Player view - also handle "both" users in player mode
  const showBothModeToggle = isBothUser && viewMode === "player"

  return (
    <LinearGradient colors={[colors.bg, "#141414"]} style={styles.container}>
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
              <Ionicons name="swap-horizontal" size={16} color="#7ED957" />
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

          {/* ===== HERO CARD - GIA PREDICTION (WOW FACTOR) ===== */}
          <TouchableOpacity
            style={styles.heroCard}
            onPress={() => handlePress(() => router.push("/(tabs)/live"))}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#0D1F0A", "#0A0A0A", "#1A0A2E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              {/* Top Row: Badge + Live Indicator */}
              <View style={styles.heroTopRow}>
                <View style={styles.giaBadge}>
                  <Ionicons name="sparkles" size={14} color="#8B5CF6" />
                  <Text style={styles.giaBadgeText}>GIA</Text>
                </View>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              {/* Main Content: Venue-Specific Prediction */}
              <View style={styles.heroMain}>
                <View style={styles.venueRow}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={styles.venueName}>{nearestCourt.name}</Text>
                  <Text style={styles.venueDistance}>
                    {nearestCourt.distance ? `${nearestCourt.distance.toFixed(1)} mi` : "nearby"}
                  </Text>
                </View>
                <Text style={styles.heroBigText}>
                  {predictions[0]?.level === 'quiet' ? "QUIET" :
                    predictions[0]?.level === 'active' ? "ACTIVE" :
                      predictions[0]?.level === 'busy' ? "BUSY" : "PACKED"}
                </Text>
                <Text style={styles.heroConfidence}>
                  {predictions[0]?.level === 'quiet' ? '2 players • Perfect for pickup' :
                    predictions[0]?.level === 'active' ? '5 players • Games happening' :
                      predictions[0]?.level === 'busy' ? '8 players • Getting crowded' :
                        '12+ players • Full courts'}
                </Text>
              </View>

              {/* Activity Timeline - Horizontal bars */}
              <View style={styles.heroTimeline}>
                <Text style={styles.timelineTitle}>Next 6 hours</Text>
                <View style={styles.timelineBars}>
                  {predictions.map((pred, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={[
                        styles.timelineBar,
                        {
                          height: pred.level === 'quiet' ? 20 :
                            pred.level === 'active' ? 28 :
                              pred.level === 'busy' ? 38 : 48,
                          backgroundColor: pred.color,
                          opacity: pred.isNow ? 1 : 0.7,
                        },
                        pred.isNow && styles.timelineBarNow,
                      ]} />
                      <Text style={[
                        styles.timelineLabel,
                        pred.isNow && styles.timelineLabelNow
                      ]}>{pred.hour}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bottom: Tap hint */}
              <View style={styles.heroBottom}>
                <Ionicons name="map-outline" size={16} color={colors.textMuted} />
                <Text style={styles.heroHint}>Tap to see live court map</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

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
              {[
                { name: "Riverside Park", distance: "0.3 mi", activity: "high" },
                { name: "Central Courts", distance: "0.7 mi", activity: "medium" },
                { name: "Oak Street Park", distance: "1.2 mi", activity: "low" },
              ].map((court, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.courtItem, i === 2 && { borderBottomWidth: 0 }]}
                  onPress={() => handlePress(() => router.push("/(tabs)/live"))}
                >
                  <View style={styles.courtLeft}>
                    <View style={[
                      styles.activityIndicator,
                      {
                        backgroundColor: court.activity === "high" ? "#7ED957" :
                          court.activity === "medium" ? "#FBBF24" : "#6B7280"
                      }
                    ]} />
                    <View>
                      <Text style={styles.courtName}>{court.name}</Text>
                      <Text style={styles.courtDistance}>{court.distance}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
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
    </LinearGradient >
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

  // Hero Card
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  heroGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    borderRadius: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  giaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  giaBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#8B5CF6",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#EF4444",
    letterSpacing: 1,
  },
  heroMain: {
    alignItems: "center",
    marginBottom: 24,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  venueName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.textPrimary,
  },
  venueDistance: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.textMuted,
  },
  heroBigText: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
    letterSpacing: -2,
  },
  heroConfidence: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: colors.textSecondary,
    marginTop: 8,
  },
  heroTimeline: {
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: colors.textMuted,
    marginBottom: 12,
  },
  timelineBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
    gap: 6,
  },
  timelineItem: {
    flex: 1,
    alignItems: "center",
  },
  timelineBar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 20,
  },
  timelineBarNow: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  timelineLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: colors.textMuted,
    marginTop: 8,
  },
  timelineLabelNow: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  heroHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.textMuted,
  },


  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: colors.primary,
  },

  // Court List
  courtList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
  },
  courtItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  courtLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  courtName: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: colors.textPrimary,
  },
  courtDistance: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.textMuted,
    marginTop: 2,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: colors.textPrimary,
  },

  // Earn Banner
  earnBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
  },
  earnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  earnIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(126, 217, 87, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  earnTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: colors.textPrimary,
  },
  earnSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: colors.textMuted,
    marginTop: 2,
  },

  // Guest Banner
  guestBanner: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.2)",
  },
  guestLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary,
  },
  guestDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
  },
  signUpButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
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
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.2)",
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7ED957",
  },
})
