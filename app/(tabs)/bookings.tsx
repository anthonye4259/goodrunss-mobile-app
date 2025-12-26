import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity } from "@/lib/activity-content"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { courtBookingService, CourtBooking } from "@/lib/services/court-booking-service"
import { venueService } from "@/lib/services/venue-service"

export default function BookingsScreen() {
  const { t } = useTranslation()
  const { preferences } = useUserPreferences()
  const { user } = useAuth()
  const primaryActivity = getPrimaryActivity(preferences.activities)
  const content = getActivityContent(primaryActivity)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [loading, setLoading] = useState(false) // Start with false
  const [courtBookings, setCourtBookings] = useState<CourtBooking[]>([])
  const [venueNames, setVenueNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      loadBookings()
    }
    // Auto-stop loading after 3 seconds as failsafe
    const timeout = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timeout)
  }, [user])

  const loadBookings = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Timeout wrapper to prevent infinite loading
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    )

    try {
      const bookings = await Promise.race([
        courtBookingService.getPlayerBookings(user.uid),
        timeoutPromise
      ]) as CourtBooking[]

      setCourtBookings(bookings || [])

      // Load venue names in parallel (skip if no bookings)
      if (bookings && bookings.length > 0) {
        const venueIds = [...new Set(bookings.map(b => b.venueId).filter(Boolean))]
        const names: Record<string, string> = {}

        // Quick parallel fetch with individual timeouts
        await Promise.allSettled(
          venueIds.map(async (venueId) => {
            try {
              const venue = await venueService.getVenueById(venueId)
              if (venue) names[venueId] = venue.name
            } catch (e) {
              // Silently fail
            }
          })
        )
        setVenueNames(names)
      }
    } catch (error: any) {
      console.error("Error loading bookings:", error?.message || error)
      setCourtBookings([]) // Show empty state on error
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (booking: CourtBooking) => {
    Alert.alert(
      "Cancel Booking",
      `Cancel your booking at ${venueNames[booking.venueId] || "venue"} on ${booking.date} at ${booking.startTime}?`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            const success = await courtBookingService.cancelBooking(booking.id, user?.uid || "")
            if (success) {
              loadBookings()
              Alert.alert("Cancelled", "Your booking has been cancelled. Refund will be processed.")
            } else {
              Alert.alert("Error", "Failed to cancel booking")
            }
          },
        },
      ]
    )
  }

  const today = new Date().toISOString().split("T")[0]
  const upcomingBookings = courtBookings.filter(b => b.date >= today && b.status === "confirmed")
  const pastBookings = courtBookings.filter(b => b.date < today || b.status !== "confirmed")

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#7ED957"
      case "completed": return "#4CAF50"
      case "cancelled": return "#FF6B6B"
      default: return "#888"
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Bookings</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
                Upcoming ({upcomingBookings.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "past" && styles.tabActive]}
              onPress={() => setActiveTab("past")}
            >
              <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>
                Past ({pastBookings.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7ED957" />
            </View>
          ) : displayBookings.length > 0 ? (
            <View style={styles.bookingsContainer}>
              {displayBookings.map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingIcon}>
                      <Ionicons name="tennisball" size={24} color="#7ED957" />
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingTitle}>Court Booking</Text>
                      <Text style={styles.bookingTrainer}>
                        {venueNames[booking.venueId] || "Venue"}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.detailText}>{booking.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.detailText}>{booking.startTime} - {booking.endTime}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingFooter}>
                    <Text style={styles.bookingPrice}>${(booking.totalCharged / 100).toFixed(2)}</Text>
                    {booking.status === "confirmed" && activeTab === "upcoming" && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelBooking(booking)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
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
                  ? "Book a court at a tennis, pickleball, or padel facility."
                  : "Your completed court bookings will appear here."}
              </Text>
              {activeTab === "upcoming" && (
                <TouchableOpacity style={styles.findButton} onPress={() => router.push("/venues/map")}>
                  <Text style={styles.findButtonText}>Find Courts</Text>
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
  loadingContainer: {
    paddingTop: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
})
