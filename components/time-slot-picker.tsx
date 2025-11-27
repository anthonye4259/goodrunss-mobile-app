"use client"

import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import * as Haptics from "expo-haptics"

interface TimeSlotPickerProps {
  visible: boolean
  onClose: () => void
  onSelectTime: (time: string) => void
  selectedTime?: string
  availableSlots?: string[]
}

const DEFAULT_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
]

export function TimeSlotPicker({
  visible,
  onClose,
  onSelectTime,
  selectedTime,
  availableSlots = DEFAULT_SLOTS,
}: TimeSlotPickerProps) {
  const [selected, setSelected] = useState(selectedTime || "")

  const handleSlotPress = (slot: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected(slot)
  }

  const handleConfirm = () => {
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onSelectTime(selected)
      onClose()
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <TouchableOpacity className="flex-1 bg-black/50" onPress={onClose} activeOpacity={1} />
        <LinearGradient colors={["#141414", "#0A0A0A"]} className="rounded-t-3xl max-h-[70%]">
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-foreground font-bold text-xl">Select Time</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              <View className="flex-row flex-wrap gap-3">
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    className={`rounded-xl px-6 py-4 border ${
                      selected === slot ? "bg-primary border-primary" : "bg-card border-border"
                    }`}
                    onPress={() => handleSlotPress(slot)}
                  >
                    <Text className={`font-semibold ${selected === slot ? "text-background" : "text-foreground"}`}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              className={`rounded-xl py-4 ${selected ? "bg-primary" : "bg-muted"}`}
              onPress={handleConfirm}
              disabled={!selected}
            >
              <Text className={`text-center font-bold ${selected ? "text-background" : "text-muted-foreground"}`}>
                Confirm {selected && `- ${selected}`}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}
