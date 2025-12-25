/**
 * Facility Dashboard
 * Owner dashboard to manage courts, bookings, and earnings
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService, ClaimedFacility, Court } from "@/lib/services/facility-service"
import { courtBookingService, CourtBooking } from "@/lib/services/court-booking-service"

export default function FacilityDashboardScreen() {
    const { user } = useAuth()

    // State
    const [facility, setFacility] = useState<ClaimedFacility | null>(null)
    const [courts, setCourts] = useState<Court[]>([])
    const [bookings, setBookings] = useState<CourtBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"bookings" | "courts" | "earnings">("bookings")

    // Add court modal state
    const [showAddCourt, setShowAddCourt] = useState(false)
    const [newCourtName, setNewCourtName] = useState("")
    const [newCourtType, setNewCourtType] = useState("Outdoor")
    const [newCourtRate, setNewCourtRate] = useState("40")

    useEffect(() => {
        loadFacilityData()
    }, [user])

    const loadFacilityData = async () => {
        if (!user) return
        setLoading(true)

        try {
            // Get user's facilities
            const facilities = await facilityService.getFacilitiesByOwner(user.uid)
            if (facilities.length > 0) {
                const fac = facilities[0]
                setFacility(fac)

                // Load courts
                const facilityCourtsList = await facilityService.getCourts(fac.id)
                setCourts(facilityCourtsList)

                // Load recent bookings
                const recentBookings = await courtBookingService.getFacilityBookings(fac.id)
                setBookings(recentBookings)
            }
        } catch (error) {
            console.error("Error loading facility:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCourt = async () => {
        if (!newCourtName || !facility) return

        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const courtId = await facilityService.addCourt(facility.id, {
                name: newCourtName,
                type: newCourtType,
                hourlyRate: parseInt(newCourtRate) * 100, // Convert to cents
            })

            if (courtId) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setShowAddCourt(false)
                setNewCourtName("")
                setNewCourtRate("40")
                loadFacilityData()
            }
        } catch (error) {
            console.error("Error adding court:", error)
            Alert.alert("Error", "Failed to add court")
        } finally {
            setLoading(false)
        }
    }

    // Calculate earnings
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.facilityPayout || 0), 0)
    const pendingEarnings = bookings
        .filter(b => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.facilityPayout || 0), 0)
    const completedEarnings = bookings
        .filter(b => b.status === "completed")
        .reduce((sum, b) => sum + (b.facilityPayout || 0), 0)

    if (loading && !facility) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    if (!facility) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.emptyState}>
                        <Ionicons name="business-outline" size={64} color="#666" />
                        <Text style={styles.emptyTitle}>No Facilities</Text>
                        <Text style={styles.emptySubtext}>
                            You haven't claimed any facilities yet. Find your facility and claim it to start receiving bookings.
                        </Text>
                        <TouchableOpacity
                            style={styles.findBtn}
                            onPress={() => router.push("/venues/map")}
                        >
                            <Text style={styles.findBtnText}>Find Your Facility</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{facility.businessName}</Text>
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#7ED957" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push(`/facility/settings?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="settings-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{courts.length}</Text>
                        <Text style={styles.statLabel}>Courts</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{bookings.filter(b => b.status === "confirmed").length}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: "#7ED957" }]}>
                            ${(totalEarnings / 100).toFixed(0)}
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => router.push(`/facility/bookings?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="calendar" size={24} color="#7ED957" />
                        <Text style={styles.quickActionText}>View All Bookings</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => router.push(`/facility/insights?facilityId=${facility.id}`)}
                    >
                        <Ionicons name="analytics" size={24} color="#FFD700" />
                        <Text style={styles.quickActionText}>AI Insights</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {(["bookings", "courts", "earnings"] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Bookings Tab */}
                    {activeTab === "bookings" && (
                        <>
                            {bookings.length === 0 ? (
                                <View style={styles.emptyTabState}>
                                    <Ionicons name="calendar-outline" size={48} color="#666" />
                                    <Text style={styles.emptyTabText}>No bookings yet</Text>
                                </View>
                            ) : (
                                bookings.slice(0, 10).map((booking) => (
                                    <View key={booking.id} style={styles.bookingCard}>
                                        <View style={styles.bookingHeader}>
                                            <View>
                                                <Text style={styles.bookingDate}>{booking.date}</Text>
                                                <Text style={styles.bookingTime}>
                                                    {booking.startTime} - {booking.endTime}
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.statusBadge,
                                                booking.status === "confirmed" && styles.statusConfirmed,
                                                booking.status === "completed" && styles.statusCompleted,
                                                booking.status === "cancelled" && styles.statusCancelled,
                                            ]}>
                                                <Text style={styles.statusText}>{booking.status}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.bookingBody}>
                                            <Text style={styles.bookingPlayer}>{booking.userName}</Text>
                                            <Text style={styles.bookingEarning}>
                                                +${(booking.facilityPayout / 100).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </>
                    )}

                    {/* Courts Tab */}
                    {activeTab === "courts" && (
                        <>
                            {courts.map((court) => (
                                <View key={court.id} style={styles.courtCard}>
                                    <View style={styles.courtInfo}>
                                        <Text style={styles.courtName}>{court.name}</Text>
                                        <Text style={styles.courtType}>{court.type}</Text>
                                    </View>
                                    <Text style={styles.courtRate}>${(court.hourlyRate / 100).toFixed(0)}/hr</Text>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addCourtBtn}
                                onPress={() => setShowAddCourt(true)}
                            >
                                <Ionicons name="add-circle" size={24} color="#7ED957" />
                                <Text style={styles.addCourtText}>Add Court</Text>
                            </TouchableOpacity>

                            {/* Add Court Form */}
                            {showAddCourt && (
                                <View style={styles.addCourtForm}>
                                    <Text style={styles.formLabel}>Court Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newCourtName}
                                        onChangeText={setNewCourtName}
                                        placeholder="e.g., Court 3"
                                        placeholderTextColor="#666"
                                    />

                                    <Text style={styles.formLabel}>Type</Text>
                                    <View style={styles.typeRow}>
                                        {["Outdoor", "Indoor"].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.typeChip,
                                                    newCourtType === type && styles.typeChipSelected,
                                                ]}
                                                onPress={() => setNewCourtType(type)}
                                            >
                                                <Text style={[
                                                    styles.typeChipText,
                                                    newCourtType === type && styles.typeChipTextSelected,
                                                ]}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.formLabel}>Hourly Rate ($)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newCourtRate}
                                        onChangeText={setNewCourtRate}
                                        placeholder="40"
                                        placeholderTextColor="#666"
                                        keyboardType="number-pad"
                                    />

                                    <TouchableOpacity
                                        style={styles.saveCourtBtn}
                                        onPress={handleAddCourt}
                                    >
                                        <LinearGradient
                                            colors={["#7ED957", "#4C9E29"]}
                                            style={styles.saveCourtBtnGradient}
                                        >
                                            <Text style={styles.saveCourtBtnText}>Save Court</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Earnings Tab */}
                    {activeTab === "earnings" && (
                        <>
                            <View style={styles.earningsCard}>
                                <Text style={styles.earningsLabel}>Total Earnings</Text>
                                <Text style={styles.earningsValue}>${(totalEarnings / 100).toFixed(2)}</Text>
                            </View>

                            <View style={styles.earningsBreakdown}>
                                <View style={styles.earningsRow}>
                                    <Text style={styles.earningsRowLabel}>Completed</Text>
                                    <Text style={styles.earningsRowValue}>${(completedEarnings / 100).toFixed(2)}</Text>
                                </View>
                                <View style={styles.earningsRow}>
                                    <Text style={styles.earningsRowLabel}>Pending</Text>
                                    <Text style={[styles.earningsRowValue, { color: "#FFA500" }]}>
                                        ${(pendingEarnings / 100).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.stripeSection}>
                                <Ionicons name="card" size={24} color={facility.stripeAccountId ? "#7ED957" : "#635BFF"} />
                                <Text style={styles.stripeText}>
                                    {facility.stripeAccountId
                                        ? "Stripe Connected ✓"
                                        : "Connect Stripe to receive payouts"}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.stripeBtn, facility.stripeAccountId && { backgroundColor: "#635BFF" }]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        router.push(`/facility/stripe-onboarding?facilityId=${facility.id}`)
                                    }}
                                >
                                    <Text style={[styles.stripeBtnText, facility.stripeAccountId && { color: "#FFF" }]}>
                                        {facility.stripeAccountId ? "View" : "Connect"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
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
    headerTitleContainer: { alignItems: "center" },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    verifiedBadge: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    verifiedText: { color: "#7ED957", fontSize: 12, marginLeft: 4 },
    settingsBtn: { padding: 8 },

    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    statValue: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

    tabBar: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 8,
    },
    tabActive: { backgroundColor: "#7ED957" },
    tabText: { color: "#888", fontSize: 14, fontWeight: "600" },
    tabTextActive: { color: "#000" },

    quickActionsRow: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    quickActionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    quickActionText: { flex: 1, color: "#FFF", fontSize: 16, marginLeft: 12 },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 16 },
    emptySubtext: { color: "#888", fontSize: 14, textAlign: "center", marginTop: 8 },
    findBtn: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#7ED957",
        borderRadius: 12,
    },
    findBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

    emptyTabState: { alignItems: "center", paddingTop: 40 },
    emptyTabText: { color: "#888", fontSize: 14, marginTop: 12 },

    bookingCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    bookingDate: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    bookingTime: { color: "#888", fontSize: 14, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#333" },
    statusConfirmed: { backgroundColor: "rgba(126, 217, 87, 0.2)" },
    statusCompleted: { backgroundColor: "rgba(126, 217, 87, 0.4)" },
    statusCancelled: { backgroundColor: "rgba(255, 107, 107, 0.2)" },
    statusText: { color: "#FFF", fontSize: 12, textTransform: "capitalize" },
    bookingBody: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    bookingPlayer: { color: "#CCC", fontSize: 14 },
    bookingEarning: { color: "#7ED957", fontSize: 16, fontWeight: "600" },

    courtCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    courtInfo: {},
    courtName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    courtType: { color: "#888", fontSize: 14, marginTop: 2 },
    courtRate: { color: "#7ED957", fontSize: 18, fontWeight: "bold" },

    addCourtBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#333",
        borderStyle: "dashed",
        borderRadius: 12,
        marginBottom: 16,
    },
    addCourtText: { color: "#7ED957", fontSize: 16, fontWeight: "600", marginLeft: 8 },

    addCourtForm: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
    },
    formLabel: { color: "#888", fontSize: 12, marginBottom: 8, marginTop: 12 },
    input: {
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        padding: 12,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    typeRow: { flexDirection: "row", gap: 8 },
    typeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    typeChipSelected: { backgroundColor: "#7ED957", borderColor: "#7ED957" },
    typeChipText: { color: "#888" },
    typeChipTextSelected: { color: "#000" },
    saveCourtBtn: { marginTop: 16, borderRadius: 12, overflow: "hidden" },
    saveCourtBtnGradient: { paddingVertical: 14, alignItems: "center" },
    saveCourtBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },

    earningsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
    },
    earningsLabel: { color: "#888", fontSize: 14 },
    earningsValue: { color: "#7ED957", fontSize: 40, fontWeight: "bold", marginTop: 8 },

    earningsBreakdown: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    earningsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    earningsRowLabel: { color: "#888", fontSize: 14 },
    earningsRowValue: { color: "#FFF", fontSize: 16, fontWeight: "600" },

    stripeSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    stripeText: { flex: 1, color: "#CCC", fontSize: 14 },
    stripeBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#7ED957",
        borderRadius: 8,
    },
    stripeBtnText: { color: "#000", fontSize: 14, fontWeight: "600" },
})
