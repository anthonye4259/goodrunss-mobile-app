
import { View, Text, TouchableOpacity, Modal } from "react-native"
import { Calendar } from "react-native-calendars"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { format } from "date-fns"

interface CalendarPickerProps {
  visible: boolean
  onClose: () => void
  onSelectDate: (date: string) => void
  selectedDate?: string
  minDate?: string
  maxDate?: string
}

export function CalendarPicker({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  minDate,
  maxDate,
}: CalendarPickerProps) {
  const [selected, setSelected] = useState(selectedDate || "")

  const handleDayPress = (day: any) => {
    setSelected(day.dateString)
  }

  const handleConfirm = () => {
    if (selected) {
      onSelectDate(selected)
      onClose()
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <TouchableOpacity className="flex-1 bg-black/50" onPress={onClose} activeOpacity={1} />
        <LinearGradient colors={["#141414", "#0A0A0A"]} className="rounded-t-3xl">
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-foreground font-bold text-xl">Select Date</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Calendar
              current={selected || undefined}
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={handleDayPress}
              markedDates={{
                [selected]: { selected: true, selectedColor: "#7ED957" },
              }}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: "#7ED957",
                selectedDayBackgroundColor: "#7ED957",
                selectedDayTextColor: "#0A0A0A",
                todayTextColor: "#7ED957",
                dayTextColor: "#fff",
                textDisabledColor: "#666",
                monthTextColor: "#fff",
                textMonthFontWeight: "bold",
                textDayFontSize: 16,
                textMonthFontSize: 18,
              }}
            />

            <TouchableOpacity
              className={`rounded-xl py-4 mt-6 ${selected ? "bg-primary" : "bg-muted"}`}
              onPress={handleConfirm}
              disabled={!selected}
            >
              <Text className={`text-center font-bold ${selected ? "text-background" : "text-muted-foreground"}`}>
                Confirm {selected && `- ${format(new Date(selected), "MMM d, yyyy")}`}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  )
}
