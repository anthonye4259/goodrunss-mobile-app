
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { getPrimaryActivity } from "@/lib/activity-content"
import * as Haptics from "expo-haptics"

export default function NeedPlayersScreen() {
  const { venueId } = useLocalSearchParams()
  const { preferences } = useUserPreferences()
  const [playersNeeded, setPlayersNeeded] = useState("1")
  const [skillLevel, setSkillLevel] = useState("Any")
  const [duration, setDuration] = useState("1 hour")
  const [notes, setNotes] = useState("")

  const primaryActivity = getPrimaryActivity(preferences.activities)

  const skillLevels = ["Any", "Beginner", "Intermediate", "Advanced", "Expert"]
  const durations = ["30 min", "1 hour", "2 hours", "3+ hours"]

  const handleSendAlert = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // TODO: Call backend API to create player alert
    console.log("[v0] Sending player alert:", {
      venueId,
      playersNeeded,
      skillLevel,
      duration,
      notes,
    })
    router.back()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16">
          <TouchableOpacity
            className="mb-6"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
          >
            <Ionicons name="arrow-back" size={28} color="#7ED957" />
          </TouchableOpacity>

          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">Need Players?</Text>
            <Text className="text-muted-foreground">
              Send an alert to nearby {primaryActivity} players and get your game started!
            </Text>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Alert Details</Text>

            <View className="mb-6">
              <Text className="text-foreground font-semibold mb-2">How many players do you need?</Text>
              <View className="flex-row gap-3">
                {["1", "2", "3", "4+"].map((num) => (
                  <TouchableOpacity
                    key={num}
                    className={`flex-1 rounded-xl py-3 ${playersNeeded === num ? "bg-primary" : "bg-muted/30"}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setPlayersNeeded(num)
                    }}
                  >
                    <Text
                      className={`text-center font-bold ${playersNeeded === num ? "text-background" : "text-foreground"}`}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-semibold mb-2">Skill Level</Text>
              <View className="flex-row flex-wrap gap-2">
                {skillLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    className={`rounded-xl px-4 py-2 ${skillLevel === level ? "bg-primary" : "bg-muted/30"}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setSkillLevel(level)
                    }}
                  >
                    <Text className={`font-semibold ${skillLevel === level ? "text-background" : "text-foreground"}`}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-semibold mb-2">How long will you play?</Text>
              <View className="flex-row flex-wrap gap-2">
                {durations.map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    className={`rounded-xl px-4 py-2 ${duration === dur ? "bg-primary" : "bg-muted/30"}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setDuration(dur)
                    }}
                  >
                    <Text className={`font-semibold ${duration === dur ? "text-background" : "text-foreground"}`}>
                      {dur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-foreground font-semibold mb-2">Additional Notes (Optional)</Text>
              <TextInput
                className="bg-muted/30 rounded-xl p-4 text-foreground"
                placeholder="e.g., Looking for a competitive game, bring your own ball..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          <View className="bg-accent/10 border border-accent rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#FF6B6B" />
              <View className="flex-1 ml-3">
                <Text className="text-foreground font-semibold mb-1">How it works</Text>
                <Text className="text-muted-foreground text-sm">
                  Your alert will be sent to nearby {primaryActivity} players within a 5-mile radius. They'll see your
                  request and can respond to join your game. Alerts expire after 2 hours.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="bg-primary rounded-xl py-4 mb-6" onPress={handleSendAlert}>
            <View className="flex-row items-center justify-center">
              <Ionicons name="send" size={20} color="#000" />
              <Text className="text-background font-bold text-lg ml-2">Send Alert to Nearby Players</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
