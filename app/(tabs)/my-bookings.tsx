/**
 * My Bookings Screen
 * Shows all user's court bookings, class bookings, trainer rentals, and waitlist entries
 */

import React, { useState, useEffect, useCallback } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Calendar from "expo-calendar"

import { useAuth } from "@/lib/auth-context"
import { courtBookingService, CourtBooking } from "@/lib/services/court-booking-service"
import { classService, ClassBooking } from "@/lib/services/class-service"
import { trainerRentalService, TrainerRental } from "@/lib/services/trainer-rental-service"
import { waitlistService, WaitlistEntry } from "@/lib/services/waitlist-service"
import { getClientBookings } from "@/lib/services/private-booking-service"
import type { PrivateBooking } from "@/lib/types/wellness-instructor"

type TabType = "upcoming" | "past" | "waitlist"

export default function MyBookingsScreen() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>("upcoming")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [courtBookings, setCourtBookings] = useState<CourtBooking[]>([])
    const [classBookings, setClassBookings] = useState<ClassBooking[]>([])
    const [trainerRentals, setTrainerRentals] = useState<TrainerRental[]>([])
    const [trainerSessions, setTrainerSessions] = useState<PrivateBooking[]>([])
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])

    useFocusEffect(
        useCallback(() => {
            loadBookings()
        }, [user])
    )

    const loadBookings = async () => {
        if (!user) return
        setLoading(true)

        try {
            const [courts, classes, rentals, sessions, waitlist] = await Promise.all([
                courtBookingService.getPlayerBookings(user.uid),
                classService.getPlayerClassBookings(user.uid),
                trainerRentalService.getTrainerAllRentals(user.uid),
                getClientBookings(user.uid),
                waitlistService.getUserWaitlist(user.uid),
            ])

            setCourtBookings(courts)
            setClassBookings(classes)
            setTrainerRentals(rentals)
            setTrainerSessions(sessions)
            setWaitlistEntries(waitlist)
        } catch (error) {
            console.error("Error loading bookings:", error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadBookings()
        setRefreshing(false)
    }

    const today = new Date().toISOString().split("T")[0]

    // Combine all bookings into unified list
    type UnifiedBooking = {
        id: string
        type: "court" | "class" | "rental" | "session"
        date: string
        time: string
        title: string
        subtitle: string
        status: string
        amount: number
        original: CourtBooking | ClassBooking | TrainerRental | PrivateBooking
    }

    const allBookings: UnifiedBooking[] = [
        ...courtBookings.map(b => ({
            id: b.id,
            type: "court" as const,
            date: b.date,
            time: b.startTime,
            title: `Court Booking`,
            subtitle: `${b.startTime} - ${b.endTime}`,
            status: b.status,
            amount: b.totalCharged,
            original: b,
        })),
        ...classBookings.map(b => ({
            id: b.id,
            type: "class" as const,
            date: b.classDate,
            time: b.classTime,
            title: b.className,
            subtitle: b.instructor ? `with ${b.instructor}` : "",
            status: b.status,
            amount: b.totalCharged,
            original: b,
        })),
        ...trainerRentals.map(b => ({
            id: b.id,
            type: "rental" as const,
            date: b.date,
            time: b.startTime,
            title: `${b.courtOrStudioName} Rental`,
            subtitle: `${b.startTime} - ${b.endTime}`,
            status: b.status,
            amount: b.totalCharged,
            original: b,
        })),
        ...trainerSessions.map(b => {
            const sessionDate = b.startTime instanceof Date ? b.startTime : new Date(b.startTime)
            return {
                id: b.id,
                type: "session" as const,
                date: sessionDate.toISOString().split("T")[0],
                time: sessionDate.toTimeString().substring(0, 5),
                title: `Trainer Session`,
                subtitle: `${b.duration} min session`,
                status: b.status,
                amount: b.totalAmount,
                original: b,
            }
        }),
    ].sort((a, b) => {
        const dateA = `${a.date}${a.time}`
        const dateB = `${b.date}${b.time}`
        return activeTab === "past"
            ? dateB.localeCompare(dateA)
            : dateA.localeCompare(dateB)
    })

    const upcomingBookings = allBookings.filter(
        b => b.date >= today && b.status !== "cancelled"
    )
    const pastBookings = allBookings.filter(
        b => b.date < today || b.status === "cancelled"
    )

    const handleCancel = async (booking: UnifiedBooking) => {
        Alert.alert(
            "Cancel Booking",
            "Are you sure you want to cancel this booking?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

                        let success = false
                        if (booking.type === "court" && user) {
                            success = await courtBookingService.cancelBooking(booking.id, user.uid)
                        } else if (booking.type === "class" && user) {
                            success = await classService.cancelBooking(booking.id, user.uid)
                        } else if (booking.type === "rental" && user) {
                            success = await trainerRentalService.cancelRental(booking.id, user.uid)
                        }

                        if (success) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                            loadBookings()
                        } else {
                            Alert.alert("Error", "Could not cancel booking")
                        }
                    },
                },
            ]
        )
    }

    const addToCalendar = async (booking: UnifiedBooking) => {
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission Required", "Calendar access is needed to add events")
                return
            }

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
            const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0]

            if (!defaultCalendar) {
                Alert.alert("Error", "No calendar available")
                return
            }

            const startDate = new Date(`${booking.date}T${booking.time}:00`)
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 hour

            await Calendar.createEventAsync(defaultCalendar.id, {
                title: booking.title,
                startDate,
                endDate,
                notes: `Booked via GoodRunss`,
            })

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert("Added!", "Event added to your calendar")
        } catch (error) {
            console.error("Calendar error:", error)
            Alert.alert("Error", "Could not add to calendar")
        }
    }

    const handleLeaveWaitlist = async (entryId: string) => {
        if (!user) return

        Alert.alert(
            "Leave Waitlist",
            "Remove yourself from this waitlist?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        const success = await waitlistService.leaveWaitlist(entryId, user.uid)
                        if (success) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                            loadBookings()
                        }
                    },
                },
            ]
        )
    }

    const renderBookingCard = (booking: UnifiedBooking) => {
        const isPast = booking.date < today || booking.status === "cancelled"
        const typeColors = {
            court: "#7ED957",
            class: "#FF6B9D",
            rental: "#FFD700",
            session: "#8B5CF6",
        }
        const typeLabels = {
            court: "Court",
            class: "Class",
            rental: "Rental",
            session: "Session",
        }

        return (
            <View key={booking.id} style={[styles.bookingCard, isPast && styles.bookingCardPast]}>
                <View style={[styles.typeIndicator, { backgroundColor: typeColors[booking.type] }]} />

                <View style={styles.bookingContent}>
                    <View style={styles.bookingHeader}>
                        <View>
                            <Text style={styles.bookingTitle}>{booking.title}</Text>
                            <Text style={styles.bookingSubtitle}>{booking.subtitle}</Text>
                        </View>
                        <View style={styles.bookingTypeBadge}>
                            <Text style={[styles.bookingTypeText, { color: typeColors[booking.type] }]}>
                                {typeLabels[booking.type]}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bookingDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={16} color="#888" />
                            <Text style={styles.detailText}>{booking.date}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="time" size={16} color="#888" />
                            <Text style={styles.detailText}>{booking.time}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="card" size={16} color="#888" />
                            <Text style={styles.detailText}>${(booking.amount / 100).toFixed(2)}</Text>
                        </View>
                    </View>

                    {booking.status === "cancelled" && (
                        <View style={styles.cancelledBadge}>
                            <Text style={styles.cancelledText}>Cancelled</Text>
                        </View>
                    )}

                    {!isPast && booking.status !== "cancelled" && (
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => addToCalendar(booking)}
                            >
                                <Ionicons name="calendar-outline" size={18} color="#7ED957" />
                                <Text style={styles.actionText}>Add to Calendar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => handleCancel(booking)}
                            >
                                <Ionicons name="close-circle-outline" size={18} color="#FF6B6B" />
                                <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    const renderWaitlistCard = (entry: WaitlistEntry) => (
        <View key={entry.id} style={styles.waitlistCard}>
            <View style={styles.waitlistInfo}>
                <Text style={styles.waitlistTitle}>Waiting for {entry.timeSlot}</Text>
                <Text style={styles.waitlistSubtitle}>{entry.date}</Text>
            </View>
            <TouchableOpacity
                style={styles.leaveBtn}
                onPress={() => handleLeaveWaitlist(entry.id)}
            >
                <Ionicons name="close" size={20} color="#FF6B6B" />
            </TouchableOpacity>
        </View>
    )

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {(["upcoming", "past", "waitlist"] as TabType[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                setActiveTab(tab)
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === "upcoming" ? `Upcoming (${upcomingBookings.length})` :
                                    tab === "past" ? `Past (${pastBookings.length})` :
                                        `Waitlist (${waitlistEntries.length})`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7ED957" />
                    }
                >
                    {activeTab === "upcoming" && (
                        upcomingBookings.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color="#333" />
                                <Text style={styles.emptyText}>No upcoming bookings</Text>
                                <TouchableOpacity
                                    style={styles.browseBtn}
                                    onPress={() => router.push("/(tabs)/explore")}
                                >
                                    <Text style={styles.browseBtnText}>Find Courts & Classes</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            upcomingBookings.map(renderBookingCard)
                        )
                    )}

                    {activeTab === "past" && (
                        pastBookings.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={48} color="#333" />
                                <Text style={styles.emptyText}>No past bookings</Text>
                            </View>
                        ) : (
                            pastBookings.map(renderBookingCard)
                        )
                    )}

                    {activeTab === "waitlist" && (
                        waitlistEntries.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="hourglass-outline" size={48} color="#333" />
                                <Text style={styles.emptyText}>Not on any waitlists</Text>
                                <Text style={styles.emptySubtext}>
                                    When a slot is full, join the waitlist to get notified if it opens up!
                                </Text>
                            </View>
                        ) : (
                            waitlistEntries.map(renderWaitlistCard)
                        )
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: { paddingHorizontal: 20, paddingVertical: 16 },
    headerTitle: { color: "#FFF", fontSize: 28, fontWeight: "bold" },

    tabs: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 16 },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: "#7ED957" },
    tabText: { color: "#888", fontSize: 14 },
    tabTextActive: { color: "#7ED957", fontWeight: "600" },

    content: { paddingHorizontal: 20, paddingBottom: 100 },

    bookingCard: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
    },
    bookingCardPast: { opacity: 0.6 },
    typeIndicator: { width: 4 },
    bookingContent: { flex: 1, padding: 16 },
    bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    bookingTitle: { color: "#FFF", fontSize: 18, fontWeight: "600" },
    bookingSubtitle: { color: "#888", fontSize: 14, marginTop: 2 },
    bookingTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 8,
    },
    bookingTypeText: { fontSize: 12, fontWeight: "600" },

    bookingDetails: { flexDirection: "row", marginTop: 12, gap: 16 },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    detailText: { color: "#888", fontSize: 14 },

    cancelledBadge: {
        alignSelf: "flex-start",
        marginTop: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        borderRadius: 8,
    },
    cancelledText: { color: "#FF6B6B", fontSize: 12, fontWeight: "600" },

    actions: { flexDirection: "row", marginTop: 16, gap: 12 },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    cancelBtn: {},
    actionText: { color: "#7ED957", fontSize: 14 },

    waitlistCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    waitlistInfo: {},
    waitlistTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    waitlistSubtitle: { color: "#888", fontSize: 14, marginTop: 2 },
    leaveBtn: { padding: 8 },

    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyText: { color: "#666", fontSize: 18, marginTop: 16 },
    emptySubtext: { color: "#555", fontSize: 14, textAlign: "center", marginTop: 8, paddingHorizontal: 40 },
    browseBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#7ED957",
        borderRadius: 24,
    },
    browseBtnText: { color: "#000", fontSize: 16, fontWeight: "600" },
})
