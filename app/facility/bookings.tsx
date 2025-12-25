/**
 * Facility Bookings Screen
 * Shows all incoming bookings for facility owner
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams, useFocusEffect } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase-config"

type TabType = "upcoming" | "today" | "past"

interface Booking {
    id: string
    courtName?: string
    userName: string
    userEmail?: string
    date: string
    startTime: string
    endTime: string
    durationMinutes: number
    totalCharged: number
    facilityPayout: number
    status: string
    createdAt: Date
}

export default function FacilityBookingsScreen() {
    const { user } = useAuth()
    const { facilityId } = useLocalSearchParams<{ facilityId: string }>()
    const [activeTab, setActiveTab] = useState<TabType>("upcoming")
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [facilityName, setFacilityName] = useState("")

    useFocusEffect(
        useCallback(() => {
            loadBookings()
        }, [facilityId])
    )

    const loadBookings = async () => {
        if (!db || !facilityId) return
        setLoading(true)

        try {
            const { collection, query, where, orderBy, getDocs, doc, getDoc } = await import("firebase/firestore")

            // Get facility name
            const facilityDoc = await getDoc(doc(db, "claimed_facilities", facilityId))
            if (facilityDoc.exists()) {
                setFacilityName(facilityDoc.data().businessName || "Your Facility")
            }

            // Get bookings
            const bookingsQuery = query(
                collection(db, "court_bookings"),
                where("facilityId", "==", facilityId),
                orderBy("date", "desc"),
                orderBy("startTime", "desc")
            )

            const snapshot = await getDocs(bookingsQuery)
            const fetchedBookings = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate?.() || new Date(),
            })) as Booking[]

            setBookings(fetchedBookings)
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

    const upcomingBookings = bookings.filter(b => b.date > today && b.status !== "cancelled")
    const todayBookings = bookings.filter(b => b.date === today && b.status !== "cancelled")
    const pastBookings = bookings.filter(b => b.date < today || b.status === "cancelled")

    const getDisplayBookings = () => {
        switch (activeTab) {
            case "upcoming": return upcomingBookings
            case "today": return todayBookings
            case "past": return pastBookings
            default: return []
        }
    }

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":")
        const h = parseInt(hours)
        const ampm = h >= 12 ? "PM" : "AM"
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
        return `${displayHour}:${minutes} ${ampm}`
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T12:00:00")
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }

    const renderBookingCard = (booking: Booking) => {
        const isPast = booking.date < today || booking.status === "cancelled"

        return (
            <View key={booking.id} style={[styles.bookingCard, isPast && styles.bookingCardPast]}>
                <View style={styles.bookingHeader}>
                    <View>
                        <Text style={styles.playerName}>{booking.userName}</Text>
                        {booking.userEmail && (
                            <Text style={styles.playerEmail}>{booking.userEmail}</Text>
                        )}
                    </View>
                    <View style={styles.payoutBadge}>
                        <Text style={styles.payoutAmount}>
                            ${(booking.facilityPayout / 100).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color="#7ED957" />
                        <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color="#7ED957" />
                        <Text style={styles.detailText}>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </Text>
                    </View>
                    {booking.courtName && (
                        <View style={styles.detailRow}>
                            <Ionicons name="tennisball" size={16} color="#7ED957" />
                            <Text style={styles.detailText}>{booking.courtName}</Text>
                        </View>
                    )}
                </View>

                {booking.status === "cancelled" && (
                    <View style={styles.cancelledBadge}>
                        <Text style={styles.cancelledText}>Cancelled</Text>
                    </View>
                )}
            </View>
        )
    }

    // Calculate stats
    const totalRevenue = upcomingBookings.reduce((sum, b) => sum + (b.facilityPayout || 0), 0)
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.facilityPayout || 0), 0)

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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTitles}>
                        <Text style={styles.headerTitle}>Bookings</Text>
                        <Text style={styles.headerSubtitle}>{facilityName}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{todayBookings.length}</Text>
                        <Text style={styles.statLabel}>Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{upcomingBookings.length}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardHighlight]}>
                        <Text style={[styles.statValue, { color: "#7ED957" }]}>
                            ${(totalRevenue / 100).toFixed(0)}
                        </Text>
                        <Text style={styles.statLabel}>Revenue</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {(["today", "upcoming", "past"] as TabType[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                setActiveTab(tab)
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === "today" ? `Today (${todayBookings.length})` :
                                    tab === "upcoming" ? `Upcoming (${upcomingBookings.length})` :
                                        `Past (${pastBookings.length})`}
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
                    {getDisplayBookings().length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name={activeTab === "today" ? "today-outline" : "calendar-outline"}
                                size={48}
                                color="#333"
                            />
                            <Text style={styles.emptyText}>
                                {activeTab === "today" ? "No bookings today" :
                                    activeTab === "upcoming" ? "No upcoming bookings" :
                                        "No past bookings"}
                            </Text>
                        </View>
                    ) : (
                        getDisplayBookings().map(renderBookingCard)
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

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitles: { alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    headerSubtitle: { color: "#888", fontSize: 14, marginTop: 2 },

    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
    },
    statCardHighlight: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(126, 217, 87, 0.3)",
    },
    statValue: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

    tabs: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 16 },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: "#7ED957" },
    tabText: { color: "#888", fontSize: 13 },
    tabTextActive: { color: "#7ED957", fontWeight: "600" },

    content: { paddingHorizontal: 20, paddingBottom: 100 },

    bookingCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    bookingCardPast: { opacity: 0.6 },
    bookingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    playerName: { color: "#FFF", fontSize: 18, fontWeight: "600" },
    playerEmail: { color: "#888", fontSize: 14, marginTop: 2 },
    payoutBadge: {
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    payoutAmount: { color: "#7ED957", fontSize: 16, fontWeight: "bold" },

    bookingDetails: { gap: 8 },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    detailText: { color: "#AAA", fontSize: 14 },

    cancelledBadge: {
        alignSelf: "flex-start",
        marginTop: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        borderRadius: 8,
    },
    cancelledText: { color: "#FF6B6B", fontSize: 12, fontWeight: "600" },

    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyText: { color: "#666", fontSize: 18, marginTop: 16 },
})
