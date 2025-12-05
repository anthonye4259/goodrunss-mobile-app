import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"

type Booking = {
  id: string
  title: string
  trainer: string
  location: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  price: number
}

export default function BookingsScreen() {
  const { preferences } = useUserPreferences()
  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = getActivityContent(primaryActivity)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  const MOCK_BOOKINGS: Booking[] = [
    {
      id: "1",
      title: `${primaryActivity} Training Session`,
      trainer: content.sampleTrainers[0]?.name || "Coach",
      location: "Downtown Sports Complex",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "upcoming",
      price: content.sampleTrainers[0]?.price || 75,
    },
    {
      id: "2",
      title: `${primaryActivity} Private Lesson`,
      trainer: content.sampleTrainers[1]?.name || "Trainer",
      location: "Community Recreation Center",
      date: "Dec 8",
      time: "2:00 PM",
      status: "upcoming",
      price: content.sampleTrainers[1]?.price || 85,
    },
  ]

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/booking/${id}`)
  }

  const upcomingBookings = MOCK_BOOKINGS.filter(b => b.status === "upcoming")
  const pastBookings = MOCK_BOOKINGS.filter(b => b.status === "completed" || b.status === "cancelled")

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bookings</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
                Upcoming
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.tabActive]}
              onPress={() => setActiveTab("past")}
            >
              <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>
                Past
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bookings List */}
          {displayBookings.length > 0 ? (
            <View style={styles.bookingsContainer}>
              {displayBookings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.bookingCard}
                  onPress={() => handlePress(booking.id)}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingIcon}>
                      <Ionicons name="calendar" size={24} color="#7ED957" />
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingTitle}>{booking.title}</Text>
                      <Text style={styles.bookingTrainer}>with {booking.trainer}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {booking.status === "upcoming" ? "Upcoming" : booking.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.detailText}>{booking.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <Text style={styles.bookingPrice}>${booking.price}</Text>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#7ED957" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={64} color="#333" />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab === "upcoming" ? "Upcoming" : "Past"} Bookings</Text>
              <Text style={styles.emptyDescription}>
                {activeTab === "upcoming" 
                  ? "Book a session with a trainer to get started on your fitness journey."
                  : "Your completed sessions will appear here."}
              </Text>
              {activeTab === "upcoming" && (
                <TouchableOpacity style={styles.findButton} onPress={() => router.push("/(tabs)/explore")}>
                  <Text style={styles.findButtonText}>Find {content.trainerTitle}s</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    backgroundColor: "#1A1A1A",
  },
  tabActive: {
    backgroundColor: "#7ED957",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#000000",
  },
  bookingsContainer: {
    paddingHorizontal: 24,
  },
  bookingCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bookingTrainer: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7ED957",
  },
  bookingDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  bookingPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7ED957",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7ED957",
    marginRight: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  findButton: {
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  findButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
})
