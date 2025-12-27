/**
 * Add to Calendar Button
 * 
 * Adds booking to device calendar with all details.
 */

import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Calendar from "expo-calendar"
import * as Haptics from "expo-haptics"

type BookingDetails = {
    courtName: string
    venueName: string
    date: Date
    durationMinutes: number
    courtNumber?: string
    address?: string
}

type Props = {
    booking: BookingDetails
    variant?: "button" | "icon"
    onSuccess?: () => void
}

export function AddToCalendarButton({ booking, variant = "button", onSuccess }: Props) {
    const handleAddToCalendar = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            // Request calendar permission
            const { status } = await Calendar.requestCalendarPermissionsAsync()

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Calendar access is needed to add your booking",
                    [{ text: "OK" }]
                )
                return
            }

            // Get default calendar
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
            const defaultCalendar = calendars.find(
                cal => cal.allowsModifications && cal.type === "local"
            ) || calendars[0]

            if (!defaultCalendar) {
                Alert.alert("Error", "No calendar available")
                return
            }

            // Create event
            const endDate = new Date(booking.date)
            endDate.setMinutes(endDate.getMinutes() + booking.durationMinutes)

            const eventDetails = {
                title: `🎾 ${booking.courtName} Booking`,
                notes: `Court reservation at ${booking.venueName}${booking.courtNumber ? `\nCourt: ${booking.courtNumber}` : ""}\n\nBooked via GoodRunss`,
                startDate: booking.date,
                endDate: endDate,
                location: booking.address || booking.venueName,
                alarms: [{ relativeOffset: -60 }], // 1 hour reminder
            }

            await Calendar.createEventAsync(defaultCalendar.id, eventDetails)

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert(
                "Added! 📅",
                "Booking added to your calendar with a 1-hour reminder",
                [{ text: "Great!" }]
            )

            onSuccess?.()
        } catch (error) {
            console.error("Calendar error:", error)
            Alert.alert("Error", "Failed to add to calendar. Please try again.")
        }
    }

    if (variant === "icon") {
        return (
            <TouchableOpacity onPress={handleAddToCalendar} style={styles.iconButton}>
                <Ionicons name="calendar-outline" size={22} color="#7ED957" />
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handleAddToCalendar} activeOpacity={0.8}>
            <Ionicons name="calendar" size={18} color="#000" />
            <Text style={styles.buttonText}>Add to Calendar</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
})

export default AddToCalendarButton
