/**
 * Booking Confirmation Screen
 * Shows confirmation after successful court booking
 */

import React, { useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Calendar from "expo-calendar"

export default function BookingConfirmationScreen() {
  const { 
    venueName, 
    courtName, 
    date, 
    startTime, 
    endTime, 
    total,
    bookingId,
  } = useLocalSearchParams()

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  const handleAddToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Calendar access is needed to add events")
        return
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0]
      
      if (!defaultCalendar) {
        Alert.alert("Error", "No calendar found")
        return
      }

      // Parse date and time
      const [year, month, day] = (date as string).split("-").map(Number)
      const [startHour, startMin] = (startTime as string).split(":").map(Number)
      const [endHour, endMin] = (endTime as string).split(":").map(Number)
      
      const startDate = new Date(year, month - 1, day, startHour, startMin)
      const endDate = new Date(year, month - 1, day, endHour, endMin)

      // Create event
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Court Booking - ${venueName}`,
        startDate,
        endDate,
        location: venueName as string,
        notes: `${courtName}\nBooked via GoodRunss`,
      })

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert("Added!", "Event added to your calendar")
    } catch (error) {
      console.error("Calendar error:", error)
      Alert.alert("Error", "Failed to add to calendar")
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#7ED957", "#4C9E29"]}
              style={styles.iconGradient}
            >
              <Ionicons name="checkmark" size={64} color="#000" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Booking Confirmed! 🎾</Text>
          <Text style={styles.subtitle}>Your court is reserved</Text>

          {/* Booking Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#7ED957" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Venue</Text>
                <Text style={styles.detailValue}>{venueName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="tennisball" size={20} color="#7ED957" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Court</Text>
                <Text style={styles.detailValue}>{courtName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#7ED957" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{date}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#7ED957" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{startTime} - {endTime}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="card" size={20} color="#7ED957" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Total Paid</Text>
                <Text style={[styles.detailValue, { color: "#7ED957" }]}>${total}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.calendarBtn} onPress={handleAddToCalendar}>
              <Ionicons name="calendar-outline" size={20} color="#7ED957" />
              <Text style={styles.calendarBtnText}>Add to Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.replace("/(tabs)/bookings")
              }}
            >
              <LinearGradient
                colors={["#7ED957", "#4C9E29"]}
                style={styles.doneBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.doneBtnText}>View My Bookings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  iconContainer: { marginBottom: 24 },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
  },

  detailsCard: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailText: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    color: "#888",
    fontSize: 12,
  },
  detailValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },

  actions: {
    width: "100%",
    gap: 16,
  },
  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#7ED957",
    gap: 8,
  },
  calendarBtnText: {
    color: "#7ED957",
    fontSize: 16,
    fontWeight: "600",
  },
  doneBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  doneBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "800",
  },
})
