
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import { CalendarPicker } from "@/components/calendar-picker"
import { TimeSlotPicker } from "@/components/time-slot-picker"

export default function MatchRequestScreen() {
  const { playerId } = useLocalSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)

  const venues = [
    { id: "1", name: "Rucker Park", distance: "0.8 mi" },
    { id: "2", name: "West 4th Street Courts", distance: "1.2 mi" },
    { id: "3", name: "Chelsea Piers", distance: "2.1 mi" },
  ]

  const handleSendRequest = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Send match request to backend
    console.log("[v0] Sending match request:", {
      playerId,
      date: selectedDate,
      time: selectedTime,
      venue: selectedVenue,
      message,
    })
    router.back()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Send Match Request</Text>
            <View className="w-6" />
          </View>
        </View>

        {/* Select Date */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Select Date</Text>
          <CalendarPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </View>

        {/* Select Time */}
        {selectedDate && (
          <View className="px-6 mb-6">
            <Text className="text-foreground font-bold mb-3">Select Time</Text>
            <TimeSlotPicker selectedTime={selectedTime} onSelectTime={setSelectedTime} />
          </View>
        )}

        {/* Select Venue */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Select Venue</Text>
          {venues.map((venue) => (
            <TouchableOpacity
              key={venue.id}
              className={`bg-card border rounded-2xl p-4 mb-3 ${selectedVenue === venue.id ? "border-primary" : "border-border"}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setSelectedVenue(venue.id)
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-lg">{venue.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="navigate" size={14} color="#666" />
                    <Text className="text-muted-foreground text-sm ml-1">{venue.distance} away</Text>
                  </View>
                </View>
                {selectedVenue === venue.id && <Ionicons name="checkmark-circle" size={24} color="#7ED957" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        <View className="px-6 mb-6">
          <Text className="text-foreground font-bold mb-3">Add Message (Optional)</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <TextInput
              className="text-foreground min-h-[100px]"
              placeholder="Hey! Want to play a match?"
              placeholderTextColor="#666"
              multiline
              value={message}
              onChangeText={setMessage}
            />
          </View>
        </View>

        {/* Send Button */}
        <View className="px-6 mb-10">
          <TouchableOpacity
            className={`rounded-2xl py-4 ${selectedDate && selectedTime && selectedVenue ? "bg-primary" : "bg-muted/30"}`}
            disabled={!selectedDate || !selectedTime || !selectedVenue}
            onPress={handleSendRequest}
          >
            <Text
              className={`text-center font-bold text-lg ${selectedDate && selectedTime && selectedVenue ? "text-background" : "text-muted-foreground"}`}
            >
              Send Match Request
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
