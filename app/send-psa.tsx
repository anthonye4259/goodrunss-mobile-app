
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function SendPSAScreen() {
  const [message, setMessage] = useState("")
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [radius, setRadius] = useState(5)

  const sports = ["Basketball", "Tennis", "Pickleball", "Golf", "Swimming", "Yoga", "All Sports"]

  const handleSend = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    console.log("[v0] Sending PSA:", { message, sport: selectedSport, radius })
    router.back()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Send PSA</Text>
            <View className="w-6" />
          </View>
          <Text className="text-muted-foreground">Broadcast to nearby players</Text>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Message</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <TextInput
              className="text-foreground min-h-[120px]"
              placeholder="What do you want to share?"
              placeholderTextColor="#666"
              multiline
              value={message}
              onChangeText={setMessage}
              maxLength={280}
            />
            <Text className="text-muted-foreground text-xs text-right mt-2">{message.length}/280</Text>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Sport (Optional)</Text>
          <View className="flex-row flex-wrap gap-2">
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport}
                className={`px-4 py-2 rounded-full ${selectedSport === sport ? "bg-primary" : "bg-card border border-border"}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedSport(sport)
                }}
              >
                <Text className={`font-semibold ${selectedSport === sport ? "text-background" : "text-foreground"}`}>
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Broadcast Radius</Text>
          <View className="flex-row gap-2">
            {[1, 5, 10, 25].map((r) => (
              <TouchableOpacity
                key={r}
                className={`flex-1 py-3 rounded-lg ${radius === r ? "bg-primary" : "bg-card border border-border"}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setRadius(r)
                }}
              >
                <Text className={`text-center font-semibold ${radius === r ? "text-background" : "text-foreground"}`}>
                  {r} mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-6 mb-10">
          <TouchableOpacity
            className={`rounded-2xl py-4 ${message.trim() ? "bg-primary" : "bg-muted/30"}`}
            disabled={!message.trim()}
            onPress={handleSend}
          >
            <Text
              className={`text-center font-bold text-lg ${message.trim() ? "text-background" : "text-muted-foreground"}`}
            >
              Send PSA
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
