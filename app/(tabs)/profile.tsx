import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Share, Alert, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useUserPreferences } from "@/lib/user-preferences"
import { useAuth } from "@/lib/auth-context"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Clipboard from "expo-clipboard"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlassCard } from "@/components/Profile/GlassCard"
import { LiquidGauge } from "@/components/Profile/LiquidGauge"
import { WidgetCard } from "@/components/Profile/WidgetCard"
import { socialService } from "@/lib/services/social-service"
import { ProfileProgress } from "@/components/Widgets/ProfileProgress"
import { FavoritesBadge } from "@/components/ui/FavoritesBadge"

// Mock Data
const ACTIVITY_SCORE = 92
const RECOVERY_SCORE = 78

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { preferences } = useUserPreferences()
  const { user } = useAuth()
  // "both" users see the business profile by default
  const isTeachingRole = preferences.userType === "trainer" || preferences.userType === "instructor" || preferences.userType === "both"
  const isInstructor = preferences.userType === "instructor"

  // Booking link for trainers
  const bookingLink = `https://goodrunss.app/book/${user?.id || 'demo'}`

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push("/settings/menu" as any)
  }

  const handleCopyLink = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    await Clipboard.setStringAsync(bookingLink)
    Alert.alert("✓ Copied!", "Booking link ready to share")
  }

  const handleShareProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await Share.share({
        message: `Book a session with me on GoodRunss! 🏋️\n${bookingLink}`,
        url: bookingLink,
        title: "My GoodRunss Profile",
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  // ============================================
  // TRAINER/INSTRUCTOR PROFILE VIEW
  // ============================================
  if (isTeachingRole) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0A0A0A", "#111", "#0A0A0A"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>My Business</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Profile Card */}
            <View style={styles.trainerCard}>
              <View style={styles.trainerHeader}>
                <View style={styles.trainerAvatarWrap}>
                  <LinearGradient colors={['#7ED957', '#22C55E']} style={styles.trainerAvatarRing}>
                    <View style={styles.trainerAvatarInner}>
                      <Text style={styles.trainerAvatarText}>{isInstructor ? "I" : "T"}</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                  </View>
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerName}>{preferences.name || "Your Name"}</Text>
                  <Text style={styles.trainerRole}>{isInstructor ? "Wellness Instructor" : "Sports Coach"}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}>5.0</Text>
                    <Text style={styles.ratingCount}>(12 reviews)</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => router.push("/settings/edit-profile")}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* 🔗 BOOKING LINK - Most Important */}
            <View style={styles.bookingLinkSection}>
              <Text style={styles.sectionLabel}>YOUR BOOKING LINK</Text>
              <View style={styles.bookingLinkBox}>
                <Text style={styles.bookingLinkUrl} numberOfLines={1}>{bookingLink}</Text>
              </View>
              <View style={styles.bookingLinkActions}>
                <TouchableOpacity style={styles.copyLinkBtn} onPress={handleCopyLink}>
                  <Ionicons name="copy-outline" size={18} color="#000" />
                  <Text style={styles.copyLinkText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareLinkBtn} onPress={handleShareProfile}>
                  <Ionicons name="share-social-outline" size={18} color="#7ED957" />
                  <Text style={styles.shareLinkText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== TRAINER STATS GRID - Apple Watch Inspired ===== */}
            <View style={styles.widgetGrid}>
              {/* Row 1: Revenue & Clients */}
              <WidgetCard
                title="REVENUE"
                subtitle="This Month"
                value="$2.4K"
                gradient="green"
                visualization="bars"
                status="↑ 18% vs last month"
              />
              <WidgetCard
                title="CLIENTS"
                subtitle="Active"
                value={12}
                gradient="blue"
                visualization="dots"
                status="Growing"
              />

              {/* Row 2: Sessions & Rating */}
              <WidgetCard
                title="SESSIONS"
                subtitle="This Week"
                value={18}
                gradient="purple"
                visualization="wave"
                status="Busy"
              />
              <WidgetCard
                title="RATING"
                subtitle="Client Score"
                value="4.9"
                gradient="amber"
                visualization="pulse"
                status="⭐ Top Rated"
              />

              {/* Row 3: Bookings & Retention */}
              <WidgetCard
                title="BOOKINGS"
                subtitle="Upcoming"
                value={6}
                gradient="coral"
                visualization="bars"
                status="Next: Today 3pm"
              />
              <WidgetCard
                title="RETENTION"
                subtitle="Repeat Clients"
                value="87%"
                gradient="teal"
                visualization="wave"
                status="Excellent"
              />
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/trainer-dashboard")}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(126,217,87,0.15)' }]}>
                  <Ionicons name="stats-chart" size={20} color="#7ED957" />
                </View>
                <Text style={styles.actionLabel}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/(tabs)/bookings")}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                  <Ionicons name="calendar" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.actionLabel}>Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/business/crm")}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                  <Ionicons name="people" size={20} color="#FBBF24" />
                </View>
                <Text style={styles.actionLabel}>Clients</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/pro-dashboard")}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
                  <Ionicons name="rocket" size={20} color="#A855F7" />
                </View>
                <Text style={styles.actionLabel}>Pro Tools</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.version}>GoodRunss for {isInstructor ? "Instructors" : "Trainers"} • v1.0.0</Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    )
  }

  // ============================================
  // PLAYER PROFILE VIEW (Original)
  // ============================================
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0A0A", "#1A1A1A", "#050505"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(126, 217, 87, 0.15)', 'transparent']}
        style={[StyleSheet.absoluteFill, { height: 300 }]}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Identity Section */}
          <View style={styles.identitySection}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={['#7ED957', '#3B82F6']} style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>P</Text>
                </View>
              </LinearGradient>
              <TouchableOpacity style={styles.editBadge}>
                <Ionicons name="camera" size={12} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{preferences.name || "Player"}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>ELITE PLAYER</Text>
            </View>

            {/* Switch Mode Button for 'Both' Users */}
            {preferences.userType === "both" && (
              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  // Use a service or router param to switch mode, 
                  // for now we rely on the preference update logic in index or settings
                  // but ideally this button toggles the `activeMode` preference.
                  // Since we only have `preferences` read-only here, we'd need `setPreferences`.
                  // Assuming the user goes to Settings via the gear icon to switch, 
                  // or we add a direct toggle here if setPreferences was available.
                  router.push("/settings/menu")
                }}
              >
                <Ionicons name="swap-horizontal" size={14} color="#7ED957" />
                <Text style={styles.switchModeText}>Switch to Business View</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Completion Widget */}
          <ProfileProgress
            name={preferences.name}
            hasPhoto={false}
            hasBio={false}
            hasPreferredSport={true}
            hasLocation={true}
          />

          {/* ===== PLAYER STATS GRID - Apple Watch Inspired ===== */}
          <View style={styles.widgetGrid}>
            {/* Row 1: Performance */}
            <WidgetCard
              title="GAMES"
              subtitle="This Month"
              value={23}
              gradient="green"
              visualization="bars"
              status="🔥 On Fire"
            />
            <WidgetCard
              title="WIN STREAK"
              subtitle="Current"
              value={5}
              gradient="coral"
              visualization="wave"
              status="Hot"
            />

            {/* Row 2: Skill & Time */}
            <WidgetCard
              title="SKILL"
              subtitle="Rating"
              value="4.2"
              gradient="purple"
              visualization="pulse"
              status="Intermediate"
            />
            <WidgetCard
              title="COURT TIME"
              subtitle="This Week"
              value="8h"
              gradient="blue"
              visualization="wave"
              status="Active"
            />

            {/* Row 3: Community */}
            <WidgetCard
              title="REPORTS"
              subtitle="Made"
              value={47}
              gradient="teal"
              visualization="dots"
              status="MVP Contributor"
            />
            <WidgetCard
              title="REP"
              subtitle="Community"
              value="92"
              gradient="amber"
              visualization="bars"
              status="Trusted"
            />
          </View>

          {/* Connect Health Prompt if not connected */}
          <TouchableOpacity
            style={styles.connectHealthBanner}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push("/settings/health-sync")
            }}
          >
            <View style={styles.connectHealthLeft}>
              <Ionicons name="fitness" size={20} color="#7ED957" />
              <View>
                <Text style={styles.connectHealthTitle}>Sync Apple Health</Text>
                <Text style={styles.connectHealthSubtitle}>See real activity data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Simple Stats Row */}
          <View style={styles.simpleStatsRow}>
            <TouchableOpacity style={styles.simpleStat} onPress={() => router.push("/groups")}>
              <Text style={styles.simpleStatNum}>12</Text>
              <Text style={styles.simpleStatSub}>Groups</Text>
            </TouchableOpacity>
            <View style={styles.simpleDivider} />
            <TouchableOpacity style={styles.simpleStat} onPress={() => router.push("/leagues")}>
              <Text style={styles.simpleStatNum}>4.9</Text>
              <Text style={styles.simpleStatSub}>Leagues</Text>
            </TouchableOpacity>
            <View style={styles.simpleDivider} />
            <TouchableOpacity style={styles.simpleStat} onPress={() => router.push("/friends/" as any)}>
              <Text style={styles.simpleStatNum}>23</Text>
              <Text style={styles.simpleStatSub}>Friends</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>v1.0.0 • Player ID: #8821</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  settingsButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  identitySection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7ED957',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#CCC',
    letterSpacing: 1,
  },
  switchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(126, 217, 87, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(126, 217, 87, 0.3)',
  },
  switchModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7ED957',
  },
  // Widget Grid - Apple Watch Style
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },

  // Connect Health Banner
  connectHealthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(126, 217, 87, 0.2)',
  },
  connectHealthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectHealthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  connectHealthSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  // Legacy styles kept for backwards compat
  dashboardGrid: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 16,
    gap: 12,
  },
  mainStatCard: {
    flex: 1.2,
    padding: 16,
    justifyContent: 'space-between',
  },
  rightColumn: {
    flex: 0.8,
    gap: 12,
  },
  smallStatCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
  },
  gaugeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 10,
  },
  smallStatValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
    marginTop: 4,
  },
  smallStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#666',
    marginTop: 2,
  },
  recoveryCard: {
    padding: 20,
    marginBottom: 24,
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recoveryPercent: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#3B82F6',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  recoveryContext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Placeholder Stats
  placeholderGauge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 4,
    borderColor: 'rgba(126, 217, 87, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderScore: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#666',
  },
  placeholderLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  connectHealthInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  connectHealthInlineText: {
    fontSize: 12,
    color: '#7ED957',
    fontWeight: '500',
  },

  primaryAction: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#000',
  },
  simpleStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: 24,
  },
  simpleStat: {
    alignItems: 'center',
  },
  simpleStatNum: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
  },
  simpleStatSub: {
    fontSize: 12,
    color: '#666',
  },
  simpleDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  version: {
    textAlign: 'center',
    color: '#333',
    fontSize: 10,
    marginTop: 24,
    marginBottom: 40,
  },

  // Health Connect Card
  healthConnectCard: {
    padding: 20,
    marginBottom: 24,
  },
  healthConnectHeader: {
    marginBottom: 12,
  },
  healthConnectDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  connectHealthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7ED957',
    paddingVertical: 14,
    borderRadius: 12,
  },
  connectHealthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  // ============================================
  // TRAINER PROFILE STYLES
  // ============================================
  trainerCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerAvatarWrap: {
    marginRight: 16,
  },
  trainerAvatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerAvatarInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  trainerRole: {
    fontSize: 13,
    color: '#7ED957',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  editProfileBtn: {
    marginTop: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  bookingLinkSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 10,
  },
  bookingLinkBox: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  bookingLinkUrl: {
    fontSize: 13,
    color: '#7ED957',
    fontFamily: 'monospace',
  },
  bookingLinkActions: {
    flexDirection: 'row',
    gap: 10,
  },
  copyLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7ED957',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  copyLinkText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  shareLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(126,217,87,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(126,217,87,0.3)',
  },
  shareLinkText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#7ED957',
  },
  businessStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  bizStatCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  bizStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  bizStatLabel: {
    fontSize: 11,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionItem: {
    width: '47%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
})
