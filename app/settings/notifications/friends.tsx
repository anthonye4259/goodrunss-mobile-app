
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"

export default function FriendsNotificationSettings() {
  // Global friend notification settings
  const [friendsEnabled, setFriendsEnabled] = useState(true)
  const [friendRequests, setFriendRequests] = useState(true)
  const [nearbyFriends, setNearbyFriends] = useState(true)
  const [friendActivity, setFriendActivity] = useState(true)
  const [friendAchievements, setFriendAchievements] = useState(true)
  const [friendBookings, setFriendBookings] = useState(false)
  const [friendCheckins, setFriendCheckins] = useState(true)
  const [friendChallenges, setFriendChallenges] = useState(true)

  // Notification radius for nearby alerts
  const [nearbyRadius, setNearbyRadius] = useState(10)

  const handleSaveSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/users/settings/notifications/friends', {
      //   method: 'PATCH',
      //   body: JSON.stringify({
      //     friendsEnabled,
      //     friendRequests,
      //     nearbyFriends,
      //     friendActivity,
      //     friendAchievements,
      //     friendBookings,
      //     friendCheckins,
      //     friendChallenges,
      //     nearbyRadius,
      //   })
      // })
      console.log("Friend notification settings saved")
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Friend Notifications</Text>
          <Text className="text-muted-foreground">Manage how you get notified about friend activity</Text>
        </View>

        {/* Master Toggle */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-primary/50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="people" size={20} color="#7ED957" />
                  <Text className="text-foreground font-bold text-lg ml-2">All Friend Notifications</Text>
                </View>
                <Text className="text-muted-foreground text-sm">Turn off to disable all friend notifications</Text>
              </View>
              <Switch
                value={friendsEnabled}
                onValueChange={(value) => {
                  setFriendsEnabled(value)
                  handleSaveSettings()
                }}
                trackColor={{ false: "#252525", true: "#7ED957" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Connection Notifications */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Connections</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="person-add" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Friend Requests</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">When someone sends you a friend request</Text>
                </View>
                <Switch
                  value={friendRequests}
                  onValueChange={(value) => {
                    setFriendRequests(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location-Based Notifications */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Location-Based</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="navigate" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Nearby Friends</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Get notified when friends are at facilities near you
                  </Text>
                </View>
                <Switch
                  value={nearbyFriends}
                  onValueChange={(value) => {
                    setNearbyFriends(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled}
                />
              </View>

              {nearbyFriends && (
                <View className="mt-2">
                  <Text className="text-muted-foreground text-sm mb-2">Notification Radius</Text>
                  <View className="flex-row gap-2">
                    {[5, 10, 20, 50].map((radius) => (
                      <TouchableOpacity
                        key={radius}
                        className={`flex-1 py-2 px-3 rounded-lg border ${
                          nearbyRadius === radius ? "bg-primary border-primary" : "bg-background border-border"
                        }`}
                        onPress={() => {
                          setNearbyRadius(radius)
                          handleSaveSettings()
                        }}
                      >
                        <Text
                          className={`text-center text-sm font-semibold ${
                            nearbyRadius === radius ? "text-black" : "text-muted-foreground"
                          }`}
                        >
                          {radius} mi
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Check-ins</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">When friends check in at facilities</Text>
                </View>
                <Switch
                  value={friendCheckins}
                  onValueChange={(value) => {
                    setFriendCheckins(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Activity Notifications */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Activity Updates</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="flash" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">All Activity</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">General friend activity updates</Text>
                </View>
                <Switch
                  value={friendActivity}
                  onValueChange={(value) => {
                    setFriendActivity(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled}
                />
              </View>
            </View>

            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="calendar" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Bookings</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">When friends book training sessions</Text>
                </View>
                <Switch
                  value={friendBookings}
                  onValueChange={(value) => {
                    setFriendBookings(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled || !friendActivity}
                />
              </View>
            </View>

            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="trophy" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Achievements</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">When friends earn badges or complete milestones</Text>
                </View>
                <Switch
                  value={friendAchievements}
                  onValueChange={(value) => {
                    setFriendAchievements(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled || !friendActivity}
                />
              </View>
            </View>

            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="flame" size={18} color="#7ED957" />
                    <Text className="text-foreground font-semibold ml-2">Challenge Updates</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">When friends join or complete challenges</Text>
                </View>
                <Switch
                  value={friendChallenges}
                  onValueChange={(value) => {
                    setFriendChallenges(value)
                    handleSaveSettings()
                  }}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                  disabled={!friendsEnabled || !friendActivity}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View className="px-6 mb-6">
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#7ED957" />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">Individual Friend Settings</Text>
                <Text className="text-muted-foreground text-sm">
                  You can customize notifications for each friend individually from their settings page
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
