
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function WearablesScreen() {
  const [connections, setConnections] = useState({
    appleWatch: true,
    whoop: false,
    garmin: false,
    fitbit: false,
    oura: false,
  })

  const toggleConnection = (device: keyof typeof connections) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setConnections((prev) => ({ ...prev, [device]: !prev[device] }))
  }

  const devices = [
    { id: "appleWatch", name: "Apple Watch", icon: "watch", color: "#000000" },
    { id: "whoop", name: "WHOOP", icon: "fitness", color: "#FF0000" },
    { id: "garmin", name: "Garmin", icon: "stopwatch", color: "#007CC3" },
    { id: "fitbit", name: "Fitbit", icon: "pulse", color: "#00B0B9" },
    { id: "oura", name: "Oura Ring", icon: "radio-button-on", color: "#000000" },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Connect Wearables</Text>
          </View>
          <Text className="text-muted-foreground">Sync your devices for real-time health data</Text>
        </View>

        <View className="px-6">
          {devices.map((device) => {
            const isConnected = connections[device.id as keyof typeof connections]
            return (
              <View key={device.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="rounded-full w-12 h-12 items-center justify-center mr-4"
                      style={{ backgroundColor: `${device.color}20` }}
                    >
                      <Ionicons name={device.icon as any} size={24} color={device.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-lg">{device.name}</Text>
                      <Text className="text-muted-foreground text-sm">
                        {isConnected ? "Connected" : "Not connected"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isConnected}
                    onValueChange={() => toggleConnection(device.id as keyof typeof connections)}
                    trackColor={{ false: "#3e3e3e", true: "#7ED957" }}
                    thumbColor={isConnected ? "#fff" : "#f4f3f4"}
                  />
                </View>

                {isConnected && (
                  <View className="mt-4 bg-primary/10 rounded-xl p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                      <Text className="text-primary text-sm ml-2">Syncing data automatically</Text>
                    </View>
                  </View>
                )}
              </View>
            )
          })}
        </View>

        <View className="px-6 mt-4">
          <View className="bg-card border border-border rounded-2xl p-6">
            <Ionicons name="information-circle" size={24} color="#7ED957" className="mb-3" />
            <Text className="text-foreground font-bold text-lg mb-2">Why Connect Wearables?</Text>
            <Text className="text-muted-foreground text-sm">
              • Automatic activity tracking{"\n"}• Real-time heart rate monitoring{"\n"}• Sleep quality analysis{"\n"}•
              Personalized workout recommendations
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
