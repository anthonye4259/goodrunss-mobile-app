"use client"

import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function LocationSettingsScreen() {
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [backgroundLocation, setBackgroundLocation] = useState(false)
  const [highAccuracy, setHighAccuracy] = useState(true)

  const toggleLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLocationEnabled(!locationEnabled)
  }

  const toggleBackground = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setBackgroundLocation(!backgroundLocation)
  }

  const toggleAccuracy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setHighAccuracy(!highAccuracy)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Location Services</Text>
          </View>
          <Text className="text-muted-foreground">
            Control how GoodRunss uses your location to find nearby courts and players
          </Text>
        </View>

        <View className="px-6">
          {/* Location Permission */}
          <View className="bg-card border border-border rounded-2xl p-6 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-foreground font-bold text-lg mb-2">Enable Location Services</Text>
                <Text className="text-muted-foreground text-sm">
                  Allow GoodRunss to access your location to find nearby courts, trainers, and players
                </Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={toggleLocation}
                trackColor={{ false: "#3e3e3e", true: "#7ED957" }}
                thumbColor={locationEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>

            {locationEnabled && (
              <View className="bg-primary/10 rounded-xl p-3">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                  <Text className="text-primary text-sm ml-2">Location services enabled</Text>
                </View>
              </View>
            )}
          </View>

          {/* Background Location */}
          {locationEnabled && (
            <View className="bg-card border border-border rounded-2xl p-6 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground font-bold text-lg mb-2">Background Location</Text>
                  <Text className="text-muted-foreground text-sm">
                    Get notified when you're near courts you've saved, even when the app is closed
                  </Text>
                </View>
                <Switch
                  value={backgroundLocation}
                  onValueChange={toggleBackground}
                  trackColor={{ false: "#3e3e3e", true: "#7ED957" }}
                  thumbColor={backgroundLocation ? "#fff" : "#f4f3f4"}
                />
              </View>

              {backgroundLocation && (
                <View className="bg-accent/10 rounded-xl p-3">
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={16} color="#FF6B6B" className="mt-0.5" />
                    <Text className="text-accent text-xs ml-2 flex-1">
                      Background location may affect battery life. We only use it to notify you about nearby courts.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* High Accuracy */}
          {locationEnabled && (
            <View className="bg-card border border-border rounded-2xl p-6 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground font-bold text-lg mb-2">High Accuracy Mode</Text>
                  <Text className="text-muted-foreground text-sm">
                    Use GPS for more precise location. May use more battery.
                  </Text>
                </View>
                <Switch
                  value={highAccuracy}
                  onValueChange={toggleAccuracy}
                  trackColor={{ false: "#3e3e3e", true: "#7ED957" }}
                  thumbColor={highAccuracy ? "#fff" : "#f4f3f4"}
                />
              </View>
            </View>
          )}

          {/* How We Use Location */}
          <View className="bg-card border border-border rounded-2xl p-6 mb-4">
            <View className="flex-row items-center mb-4">
              <Ionicons name="shield-checkmark" size={24} color="#7ED957" />
              <Text className="text-foreground font-bold text-lg ml-3">How We Use Your Location</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-start py-2">
                <Ionicons name="navigate" size={16} color="#7ED957" className="mt-1" />
                <Text className="text-foreground text-sm ml-3 flex-1">Find courts, trainers, and players near you</Text>
              </View>
              <View className="flex-row items-start py-2">
                <Ionicons name="map" size={16} color="#7ED957" className="mt-1" />
                <Text className="text-foreground text-sm ml-3 flex-1">Show you on the map when you check in</Text>
              </View>
              <View className="flex-row items-start py-2">
                <Ionicons name="people" size={16} color="#7ED957" className="mt-1" />
                <Text className="text-foreground text-sm ml-3 flex-1">
                  Help you connect with players at the same location
                </Text>
              </View>
              <View className="flex-row items-start py-2">
                <Ionicons name="stats-chart" size={16} color="#7ED957" className="mt-1" />
                <Text className="text-foreground text-sm ml-3 flex-1">Track your workout locations and stats</Text>
              </View>
            </View>
          </View>

          {/* Privacy Note */}
          <View className="bg-muted/30 rounded-2xl p-6">
            <View className="flex-row items-start">
              <Ionicons name="lock-closed" size={20} color="#7ED957" className="mt-0.5" />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-2">Your Privacy Matters</Text>
                <Text className="text-muted-foreground text-sm">
                  Your location data is encrypted and never shared with third parties. You can disable location services
                  at any time in your device settings.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
