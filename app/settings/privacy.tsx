"use client"

import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"

export default function PrivacySettingsScreen() {
  const [publicProfile, setPublicProfile] = useState(true)
  const [showActivity, setShowActivity] = useState(true)
  const [allowMessages, setAllowMessages] = useState(true)

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Privacy & Security</Text>
        </View>

        {/* Settings */}
        <View className="px-6">
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground font-semibold mb-1">Public Profile</Text>
                  <Text className="text-muted-foreground text-sm">Allow others to see your profile</Text>
                </View>
                <Switch
                  value={publicProfile}
                  onValueChange={setPublicProfile}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View className="p-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground font-semibold mb-1">Show Activity</Text>
                  <Text className="text-muted-foreground text-sm">Let others see when you're active</Text>
                </View>
                <Switch
                  value={showActivity}
                  onValueChange={setShowActivity}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground font-semibold mb-1">Allow Messages</Text>
                  <Text className="text-muted-foreground text-sm">Receive messages from other users</Text>
                </View>
                <Switch
                  value={allowMessages}
                  onValueChange={setAllowMessages}
                  trackColor={{ false: "#252525", true: "#7ED957" }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
