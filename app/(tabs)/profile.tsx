
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { router } from "expo-router"
import { ShareProfileCard } from "@/components/share-profile-card"
import { RATING_CONFIGS, getRatingLevel } from "@/lib/player-rating-types"

export default function ProfileScreen() {
  const { preferences, clearPreferences } = useUserPreferences()
  const { location } = useLocation()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)
  const [showWrapped, setShowWrapped] = useState(false)
  const [showShareableStats, setShowShareableStats] = useState(false)

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = primaryActivity ? getActivityContent(primaryActivity) : null

  const playerRating = primaryActivity && RATING_CONFIGS[primaryActivity] ? { rating: 3.5, matches: 24 } : null
  const ratingLevel = playerRating && primaryActivity ? getRatingLevel(primaryActivity, playerRating.rating) : null

  const handleLogout = async () => {
    await clearPreferences()
    router.replace("/auth")
  }

  const workoutStats = {
    totalSessions: 47,
    totalHours: 62,
    favoriteActivity: primaryActivity || "Basketball",
    streak: 12,
    topTrainer: content?.trainers[0]?.name || "Alex Johnson",
    topAchievement: "Completed 30-Day Challenge",
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="items-center mb-6">
            <View className="bg-primary/20 rounded-full w-24 h-24 items-center justify-center mb-4">
              <Text className="text-primary font-bold text-4xl">
                {preferences.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-foreground font-bold text-2xl mb-1">{preferences.name || "User"}</Text>
            <Text className="text-muted-foreground">@{preferences.name?.toLowerCase().replace(" ", "") || "user"}</Text>
            {location && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="location" size={16} color="#7ED957" />
                <Text className="text-muted-foreground ml-1">
                  {location.city}, {location.state}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-primary">{workoutStats.totalSessions}</Text>
                <Text className="text-muted-foreground text-sm">Sessions</Text>
              </View>
              <View className="items-center flex-1 border-l border-r border-border">
                <Text className="text-3xl font-bold text-accent">{workoutStats.streak}</Text>
                <Text className="text-muted-foreground text-sm">Streak</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-foreground">{preferences.credits || 0}</Text>
                <Text className="text-muted-foreground text-sm">Credits</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Personas section */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/personas")}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="bg-purple-500/30 rounded-full w-12 h-12 items-center justify-center mr-3">
                  <Ionicons name="sparkles" size={24} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg mb-1">Discover AI Personas</Text>
                  <Text className="text-zinc-400 text-sm">Train with AI-powered coaches 24/7</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#a855f7" />
            </View>

            <View className="flex-row gap-2">
              <View className="bg-purple-500/20 rounded-lg px-3 py-1">
                <Text className="text-purple-400 text-xs font-medium">Browse Coaches</Text>
              </View>
              <View className="bg-purple-500/20 rounded-lg px-3 py-1">
                <Text className="text-purple-400 text-xs font-medium">Voice Enabled</Text>
              </View>
              <View className="bg-purple-500/20 rounded-lg px-3 py-1">
                <Text className="text-purple-400 text-xs font-medium">Pay Per Use</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Premium Upgrade */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/paywall")}
            className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={20} color="#000" />
                  <Text className="text-black font-bold text-lg ml-2">Upgrade to Premium</Text>
                </View>
                <Text className="text-black/80 text-sm">
                  Unlock AI court finder, unlimited bookings, and exclusive features
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Refer Friends */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/referrals")}
            className="bg-card border border-primary rounded-2xl p-6"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="gift" size={20} color="#7ED957" />
                  <Text className="text-foreground font-bold text-lg ml-2">Refer Friends</Text>
                </View>
                <Text className="text-muted-foreground text-sm">Earn up to 200 credits for each friend who joins</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#7ED957" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Player Rating */}
        {playerRating && ratingLevel && primaryActivity && (
          <View className="px-6 mb-6">
            <TouchableOpacity
              onPress={() => router.push(`/rating/${primaryActivity}`)}
              className="bg-card border border-border rounded-2xl p-6"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-foreground">Your {primaryActivity} Rating</Text>
                <Ionicons name="chevron-forward" size={20} color="#7ED957" />
              </View>

              <View className="flex-row items-end mb-4">
                <Text className="text-5xl font-bold text-primary mr-3">{playerRating.rating}</Text>
                <View className="bg-primary/20 rounded-full px-4 py-1 mb-2">
                  <Text className="text-primary font-bold">{ratingLevel.label}</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-muted-foreground text-sm">{RATING_CONFIGS[primaryActivity]?.systemName}</Text>
                  <Text className="text-muted-foreground text-sm">{playerRating.matches} matches played</Text>
                </View>
                <View className="bg-primary/10 rounded-full px-4 py-2">
                  <Text className="text-primary font-semibold">Track Progress →</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Trainer Profile Share */}
        {preferences.userType === "trainer" || preferences.userType === "instructor" ? (
          <ShareProfileCard
            trainerName={preferences.name || "Trainer"}
            trainerId="123"
            activity={primaryActivity || "Training"}
          />
        ) : null}

        {/* Community Programs section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Community Programs</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-border"
              onPress={() => router.push("/facility-reports/dashboard")}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="clipboard-outline" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">Facility Reporting</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full px-2 py-1 mr-2">
                  <Text className="text-primary text-xs font-bold">Earn $1-31</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => router.push("/ambassador/dashboard")}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="star-outline" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">Ambassador Program</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-accent/20 rounded-full px-2 py-1 mr-2">
                  <Text className="text-accent text-xs font-bold">3 Roles</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social & Gamification section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Social & Challenges</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-border"
              onPress={() => router.push("/social/friends")}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="people-outline" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">Friends</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full px-2 py-1 mr-2">
                  <Text className="text-primary text-xs font-bold">3 new</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-border"
              onPress={() => router.push("/social/feed")}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="newspaper-outline" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">Activity Feed</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full px-2 py-1 mr-2">
                  <Text className="text-primary text-xs font-bold">2 active</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-border"
              onPress={() => router.push("/challenges")}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="trophy-outline" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">Challenges</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full px-2 py-1 mr-2">
                  <Text className="text-primary text-xs font-bold">2 active</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => router.push("/favorites")}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="heart-outline" size={20} color="#7ED957" />
                <Text className="text-foreground ml-3">Favorites</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Activities */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">My Activities</Text>
          <View className="flex-row flex-wrap gap-2">
            {preferences.activities.map((activity, index) => (
              <View key={index} className="bg-primary/20 border border-primary rounded-xl px-4 py-2">
                <Text className="text-primary font-semibold">{activity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Sections */}
        <View className="px-6">
          {/* Account */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Account</Text>
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-border"
                onPress={() => router.push("/settings/edit-profile")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="person-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-border"
                onPress={() => router.push("/settings/payment-methods")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="card-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Payment Methods</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => router.push("/settings/privacy")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Privacy & Security</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Preferences</Text>
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <View className="flex-row items-center justify-between p-4 border-b border-border">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="notifications-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Push Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
              <View className="flex-row items-center justify-between p-4 border-b border-border">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="eye-outline" size={20} color="#7ED957" />
                    <Text className="text-foreground ml-3 font-semibold">Public Profile</Text>
                  </View>
                  <Text className="text-muted-foreground text-xs ml-8">
                    When enabled, other players get notified when you check in to courts (anonymous)
                  </Text>
                </View>
                <Switch
                  value={publicProfile}
                  onValueChange={setPublicProfile}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-border"
                onPress={() => router.push("/settings/location")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="location-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Location Services</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => router.push("/settings/language-region")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="globe-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Language & Region</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-muted-foreground mr-2">English</Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Support</Text>
            <View className="bg-card border border-border rounded-2xl overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-border"
                onPress={() => router.push("/settings/help")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="help-circle-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Help Center</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-border"
                onPress={() => router.push("/(tabs)/messages")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="chatbubble-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Contact Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => router.push("/settings/terms")}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="document-text-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">Terms & Privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            className="bg-destructive/10 border border-destructive rounded-2xl p-4 flex-row items-center justify-center"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-destructive font-bold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
