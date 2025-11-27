"use client"

import { View, Text, TouchableOpacity, Modal, ScrollView, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { CalendarPicker } from "./calendar-picker"
import * as Haptics from "expo-haptics"
import type { WaitlistTimePreference, WaitlistNotificationChannel } from "@/lib/waitlist-types"

type WaitlistJoinModalProps = {
  visible: boolean
  onClose: () => void
  onJoin: (preferences: {
    preferredDate?: string
    timePreference: WaitlistTimePreference
    notificationChannels: WaitlistNotificationChannel[]
  }) => void
  type: "trainer" | "facility"
  name: string
}

export function WaitlistJoinModal({ visible, onClose, onJoin, type, name }: WaitlistJoinModalProps) {
  const [preferredDate, setPreferredDate] = useState<string>()
  const [timePreference, setTimePreference] = useState<WaitlistTimePreference>("flexible")
  const [showCalendar, setShowCalendar] = useState(false)
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [pushNotif, setPushNotif] = useState(true)

  const timeOptions: { value: WaitlistTimePreference; label: string; icon: string }[] = [
    { value: "morning", label: "Morning", icon: "sunny" },
    { value: "afternoon", label: "Afternoon", icon: "partly-sunny" },
    { value: "evening", label: "Evening", icon: "moon" },
    { value: "flexible", label: "Flexible", icon: "time" },
  ]

  const handleJoin = () => {
    const channels: WaitlistNotificationChannel[] = []
    if (emailNotif) channels.push("email")
    if (smsNotif) channels.push("sms")
    if (pushNotif) channels.push("push")

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onJoin({ preferredDate, timePreference, notificationChannels: channels })
    onClose()
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <LinearGradient colors={["#0A0A0A", "#141414"]} className="rounded-t-3xl max-h-[90%]">
            <ScrollView className="flex-1" contentContainerClassName="p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-2xl mb-1">Join Waitlist</Text>
                  <Text className="text-muted-foreground">We'll notify you when a spot opens up with {name}</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Preferred Date */}
              <View className="mb-6">
                <Text className="text-foreground font-bold text-lg mb-3">Preferred Date (Optional)</Text>
                <TouchableOpacity
                  className="bg-card border border-border rounded-xl p-4"
                  onPress={() => setShowCalendar(true)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">{preferredDate || "Any date"}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Time Preference */}
              <View className="mb-6">
                <Text className="text-foreground font-bold text-lg mb-3">Time Preference</Text>
                <View className="flex-row flex-wrap gap-3">
                  {timeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      className={`flex-1 min-w-[45%] rounded-xl p-4 border ${
                        timePreference === option.value ? "bg-primary/20 border-primary" : "bg-card border-border"
                      }`}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setTimePreference(option.value)
                      }}
                    >
                      <View className="items-center">
                        <Ionicons
                          name={option.icon as any}
                          size={24}
                          color={timePreference === option.value ? "#7ED957" : "#666"}
                        />
                        <Text
                          className={`mt-2 font-semibold ${
                            timePreference === option.value ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notification Preferences */}
              <View className="mb-6">
                <Text className="text-foreground font-bold text-lg mb-3">Notification Preferences</Text>
                <View className="bg-card border border-border rounded-xl p-4 gap-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="mail" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">Email</Text>
                    </View>
                    <Switch
                      value={emailNotif}
                      onValueChange={setEmailNotif}
                      trackColor={{ false: "#333", true: "#7ED957" }}
                      thumbColor="#fff"
                    />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="chatbubble" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">SMS</Text>
                    </View>
                    <Switch
                      value={smsNotif}
                      onValueChange={setSmsNotif}
                      trackColor={{ false: "#333", true: "#7ED957" }}
                      thumbColor="#fff"
                    />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="notifications" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">Push Notification</Text>
                    </View>
                    <Switch
                      value={pushNotif}
                      onValueChange={setPushNotif}
                      trackColor={{ false: "#333", true: "#7ED957" }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              </View>

              {/* Info Box */}
              <View className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#7ED957" />
                  <View className="flex-1 ml-3">
                    <Text className="text-primary font-semibold mb-1">How it works</Text>
                    <Text className="text-primary/80 text-sm">
                      You'll be notified in priority order (first-come, first-served) when a spot opens. Your waitlist
                      entry expires after 30 days.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Join Button */}
              <TouchableOpacity
                className="bg-primary rounded-2xl py-4"
                onPress={handleJoin}
                disabled={!emailNotif && !smsNotif && !pushNotif}
              >
                <Text className="text-black text-center font-bold text-lg">Join Waitlist</Text>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      <CalendarPicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={setPreferredDate}
        selectedDate={preferredDate}
        minDate={new Date().toISOString().split("T")[0]}
      />
    </>
  )
}
