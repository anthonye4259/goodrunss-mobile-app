import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Share, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useUserPreferences } from "@/lib/user-preferences"
import { useAuth } from "@/lib/auth-context"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { preferences } = useUserPreferences()
  const { user } = useAuth()

  const isTeachingRole = preferences.userType === "trainer" || preferences.userType === "instructor"

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(route as any)
  }

  const handleShareProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const profileUrl = `https://goodrunss.com/coach/${user?.id || "me"}`
    try {
      await Share.share({
        message: `Book a session with me on GoodRunss! 🏀\n\n${profileUrl}`,
        url: profileUrl,
        title: "My GoodRunss Profile",
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const menuItems = [
    { icon: "options-outline", label: "My Preferences", route: "/settings/preferences", highlight: true },
    { icon: "person-outline", label: "Edit Profile", route: "/settings/edit-profile" },
    { icon: "card-outline", label: "Payment Methods", route: "/settings/payment-methods" },
    { icon: "notifications-outline", label: "Notifications", route: "/settings/notifications/friends" },
    { icon: "location-outline", label: "Location", route: "/settings/location" },
    { icon: "language-outline", label: "Language & Region", route: "/settings/language-region" },
    { icon: "lock-closed-outline", label: "Privacy", route: "/settings/privacy" },
    { icon: "help-circle-outline", label: "Help & Support", route: "/settings/help" },
    { icon: "document-text-outline", label: "Terms of Service", route: "/settings/terms" },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.title')}</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {preferences.userType === "trainer" ? "T" : "P"}
                </Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>GoodRunss User</Text>
            <Text style={styles.userType}>
              {preferences.userType === "trainer" ? "Trainer" : "Player"} • {preferences.primaryActivity || "Basketball"}
            </Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={[styles.statItem, styles.statBorder]}>
                <Text style={styles.statNumber}>4.9</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>23</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
            </View>

            {/* Share Profile Button - For Trainers/Instructors */}
            {isTeachingRole && (
              <TouchableOpacity style={styles.shareProfileButton} onPress={handleShareProfile}>
                <Ionicons name="share-social" size={18} color="#7ED957" />
                <Text style={styles.shareProfileText}>Share Booking Link</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handlePress(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon as any} size={22} color="#7ED957" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/auth")}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.version}>GoodRunss v1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#7ED957",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#333",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7ED957",
  },
  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  menuContainer: {
    marginHorizontal: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(132, 204, 22, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  version: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  shareProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.3)",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  shareProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7ED957",
  },
})
