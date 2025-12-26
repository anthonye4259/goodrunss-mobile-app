/**
 * Facility Dashboard Tab
 * 
 * Full SaaS dashboard for facilities in-app
 * - Court management
 * - Today's bookings
 * - Revenue analytics
 * - AI features (premium)
 * - Team/Employee management
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    Share,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import * as Clipboard from "expo-clipboard"
import { useUserPreferences } from "@/lib/user-preferences"

// Mock data - replace with real data from services
const MOCK_COURTS = [
    { id: "1", name: "Court 1", type: "Indoor", status: "available", nextBooking: null },
    { id: "2", name: "Court 2", type: "Indoor", status: "booked", nextBooking: "2:00 PM - Alex J." },
    { id: "3", name: "Court 3", type: "Outdoor", status: "available", nextBooking: "4:30 PM - Sarah W." },
    { id: "4", name: "Court 4", type: "Indoor", status: "maintenance", nextBooking: null },
]

const MOCK_BOOKINGS = [
    { id: "1", court: "Court 2", player: "Alex Johnson", time: "2:00 PM", duration: "1hr", amount: 45, status: "confirmed" },
    { id: "2", court: "Court 3", player: "Sarah Williams", time: "4:30 PM", duration: "1.5hr", amount: 67, status: "pending" },
    { id: "3", court: "Court 1", player: "Mike Davis", time: "6:00 PM", duration: "2hr", amount: 90, status: "confirmed" },
]

const MOCK_STATS = {
    todayRevenue: 342,
    weekRevenue: 2450,
    monthRevenue: 8900,
    occupancyRate: 72,
    totalBookings: 18,
    pendingBookings: 3,
}

const MOCK_EMPLOYEES = [
    { id: "1", name: "John Manager", email: "john@facility.com", role: "manager", status: "active" },
    { id: "2", name: "Sarah Staff", email: "sarah@facility.com", role: "staff", status: "active" },
]

const EMPLOYEE_ROLES = [
    { id: "manager", label: "Manager", description: "Full access - bookings, courts, analytics" },
    { id: "staff", label: "Staff", description: "View bookings, check-in players" },
    { id: "maintenance", label: "Maintenance", description: "Court status updates only" },
]

// Generate 6-digit invite code
const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function FacilityDashboardScreen() {
    const { preferences } = useUserPreferences()
    const isPremium = preferences.isPremium || false
    const facilityName = preferences.name || "Your Facility"

    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<"overview" | "courts" | "bookings" | "analytics">("overview")

    // Invite Employee Modal
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteContact, setInviteContact] = useState("")
    const [inviteRole, setInviteRole] = useState<string>("staff")
    const [inviteCode, setInviteCode] = useState("")

    const onRefresh = async () => {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000))
        setRefreshing(false)
    }

    const handleOpenInviteModal = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setInviteCode(generateInviteCode())
        setInviteContact("")
        setInviteRole("staff")
        setShowInviteModal(true)
    }

    const handleSendInvite = async () => {
        if (!inviteContact.trim()) {
            Alert.alert("Required", "Please enter an email or phone number")
            return
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        // Copy code or share
        const message = `You've been invited to join ${facilityName} on GoodRunss!\n\nUse code: ${inviteCode}\n\nDownload the app and enter this code to get started.`

        try {
            await Share.share({ message })
        } catch (error) {
            // Fallback - just show success
        }

        Alert.alert(
            "Invite Sent! 🎉",
            `Invite code ${inviteCode} created for ${inviteContact} as ${inviteRole}`,
            [{ text: "Done", onPress: () => setShowInviteModal(false) }]
        )
    }

    const handleCopyCode = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await Clipboard.setStringAsync(inviteCode)
        Alert.alert("Copied!", `Code ${inviteCode} copied to clipboard`)
    }

    // Overview Tab
    const OverviewTab = () => (
        <View>
            {/* Quick Stats */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: "#7ED95720" }]}>
                    <Text style={styles.statValue}>${MOCK_STATS.todayRevenue}</Text>
                    <Text style={styles.statLabel}>Today</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#3B82F620" }]}>
                    <Text style={styles.statValue}>{MOCK_STATS.totalBookings}</Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: "#F9731620" }]}>
                    <Text style={styles.statValue}>{MOCK_STATS.occupancyRate}%</Text>
                    <Text style={styles.statLabel}>Occupancy</Text>
                </View>
            </View>

            {/* Pending Bookings Alert */}
            {MOCK_STATS.pendingBookings > 0 && (
                <TouchableOpacity
                    style={styles.alertBanner}
                    onPress={() => setActiveTab("bookings")}
                >
                    <Ionicons name="notifications" size={20} color="#000" />
                    <Text style={styles.alertText}>
                        {MOCK_STATS.pendingBookings} pending booking{MOCK_STATS.pendingBookings > 1 ? 's' : ''} need approval
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#000" />
                </TouchableOpacity>
            )}

            {/* Court Status */}
            <Text style={styles.sectionTitle}>Court Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtsRow}>
                {MOCK_COURTS.map(court => (
                    <View
                        key={court.id}
                        style={[
                            styles.courtCard,
                            court.status === "booked" && styles.courtBooked,
                            court.status === "maintenance" && styles.courtMaintenance,
                        ]}
                    >
                        <Text style={styles.courtName}>{court.name}</Text>
                        <Text style={styles.courtType}>{court.type}</Text>
                        <View style={[
                            styles.courtStatusBadge,
                            court.status === "available" && { backgroundColor: "#7ED957" },
                            court.status === "booked" && { backgroundColor: "#3B82F6" },
                            court.status === "maintenance" && { backgroundColor: "#F97316" },
                        ]}>
                            <Text style={styles.courtStatusText}>
                                {court.status === "available" ? "Open" :
                                    court.status === "booked" ? "In Use" : "Closed"}
                            </Text>
                        </View>
                        {court.nextBooking && (
                            <Text style={styles.courtNext}>Next: {court.nextBooking}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Today's Schedule */}
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {MOCK_BOOKINGS.slice(0, 3).map(booking => (
                <View key={booking.id} style={styles.bookingCard}>
                    <View style={styles.bookingTime}>
                        <Text style={styles.bookingTimeText}>{booking.time}</Text>
                        <Text style={styles.bookingDuration}>{booking.duration}</Text>
                    </View>
                    <View style={styles.bookingInfo}>
                        <Text style={styles.bookingPlayer}>{booking.player}</Text>
                        <Text style={styles.bookingCourt}>{booking.court}</Text>
                    </View>
                    <View style={styles.bookingAmount}>
                        <Text style={styles.bookingAmountText}>${booking.amount}</Text>
                        {booking.status === "pending" && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingText}>Pending</Text>
                            </View>
                        )}
                    </View>
                </View>
            ))}

            {/* AI Features (Premium) */}
            <Text style={styles.sectionTitle}>AI Tools</Text>
            {isPremium ? (
                <View style={styles.aiToolsGrid}>
                    <TouchableOpacity style={styles.aiTool}>
                        <Ionicons name="flash" size={24} color="#8B5CF6" />
                        <Text style={styles.aiToolText}>AI Slot Filling</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aiTool}>
                        <Ionicons name="trending-up" size={24} color="#3B82F6" />
                        <Text style={styles.aiToolText}>Demand Forecast</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aiTool}>
                        <Ionicons name="pricetag" size={24} color="#F97316" />
                        <Text style={styles.aiToolText}>Smart Pricing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.aiTool}>
                        <Ionicons name="megaphone" size={24} color="#EC4899" />
                        <Text style={styles.aiToolText}>Auto Promotions</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.premiumBanner}
                    onPress={() => router.push("/settings/subscription")}
                >
                    <LinearGradient colors={["#FFD700", "#FF8C00"]} style={styles.premiumGradient}>
                        <Ionicons name="sparkles" size={24} color="#000" />
                        <View style={styles.premiumText}>
                            <Text style={styles.premiumTitle}>Unlock AI Features</Text>
                            <Text style={styles.premiumSubtitle}>Auto-fill empty slots & boost revenue</Text>
                        </View>
                        <Text style={styles.premiumPrice}>$50/mo</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    )

    // Courts Tab
    const CourtsTab = () => (
        <View>
            <TouchableOpacity style={styles.addCourtBtn}>
                <Ionicons name="add" size={20} color="#000" />
                <Text style={styles.addCourtBtnText}>Add New Court</Text>
            </TouchableOpacity>

            {MOCK_COURTS.map(court => (
                <TouchableOpacity key={court.id} style={styles.courtFullCard}>
                    <View style={styles.courtHeader}>
                        <Text style={styles.courtFullName}>{court.name}</Text>
                        <View style={[
                            styles.courtStatusPill,
                            court.status === "available" && { backgroundColor: "#7ED95720" },
                            court.status === "booked" && { backgroundColor: "#3B82F620" },
                            court.status === "maintenance" && { backgroundColor: "#F9731620" },
                        ]}>
                            <Text style={[
                                styles.courtStatusPillText,
                                court.status === "available" && { color: "#7ED957" },
                                court.status === "booked" && { color: "#3B82F6" },
                                court.status === "maintenance" && { color: "#F97316" },
                            ]}>
                                {court.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.courtFullType}>{court.type} Court</Text>
                    {court.nextBooking && (
                        <Text style={styles.courtFullNext}>
                            <Ionicons name="time-outline" size={14} color="#888" /> {court.nextBooking}
                        </Text>
                    )}
                    <View style={styles.courtActions}>
                        <TouchableOpacity style={styles.courtActionBtn}>
                            <Ionicons name="calendar-outline" size={16} color="#7ED957" />
                            <Text style={styles.courtActionText}>Schedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.courtActionBtn}>
                            <Ionicons name="create-outline" size={16} color="#3B82F6" />
                            <Text style={[styles.courtActionText, { color: "#3B82F6" }]}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.courtActionBtn}>
                            <Ionicons name="pause-outline" size={16} color="#F97316" />
                            <Text style={[styles.courtActionText, { color: "#F97316" }]}>Block</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    )

    // Bookings Tab
    const BookingsTab = () => (
        <View>
            <View style={styles.bookingTabs}>
                <TouchableOpacity style={[styles.bookingTab, styles.bookingTabActive]}>
                    <Text style={styles.bookingTabTextActive}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookingTab}>
                    <Text style={styles.bookingTabText}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookingTab}>
                    <Text style={styles.bookingTabText}>Past</Text>
                </TouchableOpacity>
            </View>

            {MOCK_BOOKINGS.map(booking => (
                <View key={booking.id} style={styles.bookingFullCard}>
                    <View style={styles.bookingFullHeader}>
                        <View>
                            <Text style={styles.bookingFullPlayer}>{booking.player}</Text>
                            <Text style={styles.bookingFullCourt}>{booking.court} • {booking.time}</Text>
                        </View>
                        <Text style={styles.bookingFullAmount}>${booking.amount}</Text>
                    </View>
                    {booking.status === "pending" && (
                        <View style={styles.bookingActions}>
                            <TouchableOpacity style={styles.approveBtn}>
                                <Ionicons name="checkmark" size={16} color="#000" />
                                <Text style={styles.approveBtnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.declineBtn}>
                                <Ionicons name="close" size={16} color="#EF4444" />
                                <Text style={styles.declineBtnText}>Decline</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ))}
        </View>
    )

    // Analytics Tab
    const AnalyticsTab = () => (
        <View>
            {/* Revenue Cards */}
            <View style={styles.revenueGrid}>
                <View style={styles.revenueCard}>
                    <Text style={styles.revenueLabel}>This Week</Text>
                    <Text style={styles.revenueValue}>${MOCK_STATS.weekRevenue}</Text>
                </View>
                <View style={styles.revenueCard}>
                    <Text style={styles.revenueLabel}>This Month</Text>
                    <Text style={styles.revenueValue}>${MOCK_STATS.monthRevenue}</Text>
                </View>
            </View>

            {/* Chart placeholder */}
            <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart" size={48} color="#333" />
                <Text style={styles.chartPlaceholderText}>Revenue chart coming soon</Text>
            </View>

            {/* Quick Stats */}
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceRow}>
                <View style={styles.performanceItem}>
                    <Text style={styles.performanceValue}>{MOCK_STATS.occupancyRate}%</Text>
                    <Text style={styles.performanceLabel}>Occupancy Rate</Text>
                </View>
                <View style={styles.performanceItem}>
                    <Text style={styles.performanceValue}>{MOCK_STATS.totalBookings}</Text>
                    <Text style={styles.performanceLabel}>Total Bookings</Text>
                </View>
                <View style={styles.performanceItem}>
                    <Text style={styles.performanceValue}>$50</Text>
                    <Text style={styles.performanceLabel}>Avg per Booking</Text>
                </View>
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerLabel}>FACILITY DASHBOARD</Text>
                        <Text style={styles.headerName}>{facilityName}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.inviteBtn}
                            onPress={handleOpenInviteModal}
                        >
                            <Ionicons name="person-add" size={20} color="#7ED957" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => router.push("/facility/settings")}
                        >
                            <Ionicons name="settings-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {(["overview", "courts", "bookings", "analytics"] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                setActiveTab(tab)
                            }}
                        >
                            <Ionicons
                                name={
                                    tab === "overview" ? "grid" :
                                        tab === "courts" ? "tennisball" :
                                            tab === "bookings" ? "calendar" : "analytics"
                                }
                                size={20}
                                color={activeTab === tab ? "#7ED957" : "#666"}
                            />
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7ED957" />
                    }
                >
                    {activeTab === "overview" && <OverviewTab />}
                    {activeTab === "courts" && <CourtsTab />}
                    {activeTab === "bookings" && <BookingsTab />}
                    {activeTab === "analytics" && <AnalyticsTab />}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>

            {/* Invite Employee Modal */}
            <Modal visible={showInviteModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Invite Team Member</Text>
                            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Contact Input */}
                        <Text style={styles.inputLabel}>Email or Phone Number</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter email or phone..."
                            placeholderTextColor="#666"
                            value={inviteContact}
                            onChangeText={setInviteContact}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Role Selection */}
                        <Text style={styles.inputLabel}>Role</Text>
                        <View style={styles.rolesGrid}>
                            {EMPLOYEE_ROLES.map(role => (
                                <TouchableOpacity
                                    key={role.id}
                                    style={[
                                        styles.roleCard,
                                        inviteRole === role.id && styles.roleCardActive
                                    ]}
                                    onPress={() => setInviteRole(role.id)}
                                >
                                    <Text style={[
                                        styles.roleLabel,
                                        inviteRole === role.id && styles.roleLabelActive
                                    ]}>{role.label}</Text>
                                    <Text style={styles.roleDesc}>{role.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Invite Code */}
                        <View style={styles.codeBox}>
                            <View>
                                <Text style={styles.codeLabel}>Invite Code</Text>
                                <Text style={styles.codeValue}>{inviteCode}</Text>
                            </View>
                            <TouchableOpacity style={styles.copyCodeBtn} onPress={handleCopyCode}>
                                <Ionicons name="copy-outline" size={20} color="#7ED957" />
                            </TouchableOpacity>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity style={styles.sendInviteBtn} onPress={handleSendInvite}>
                            <Ionicons name="paper-plane" size={20} color="#000" />
                            <Text style={styles.sendInviteBtnText}>Send Invite</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerLabel: { color: "#666", fontSize: 12, fontWeight: "bold", letterSpacing: 1 },
    headerName: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    settingsBtn: { padding: 8 },

    // Tab bar
    tabBar: {
        flexDirection: "row",
        marginHorizontal: 20,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 4,
    },
    tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, gap: 4 },
    tabActive: { backgroundColor: "#252525" },
    tabText: { color: "#666", fontSize: 11 },
    tabTextActive: { color: "#7ED957" },

    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

    // Stats
    statsGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
    statCard: { flex: 1, padding: 16, borderRadius: 16, alignItems: "center" },
    statValue: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
    statLabel: { color: "#888", fontSize: 12, marginTop: 4 },

    // Alert banner
    alertBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 8,
    },
    alertText: { flex: 1, color: "#000", fontWeight: "600" },

    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 8 },

    // Court cards (horizontal)
    courtsRow: { marginBottom: 16, marginHorizontal: -20, paddingHorizontal: 20 },
    courtCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        width: 140,
    },
    courtBooked: { borderColor: "#3B82F640", borderWidth: 1 },
    courtMaintenance: { borderColor: "#F9731640", borderWidth: 1, opacity: 0.7 },
    courtName: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    courtType: { color: "#888", fontSize: 12, marginTop: 2 },
    courtStatusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 12,
    },
    courtStatusText: { color: "#000", fontSize: 11, fontWeight: "bold" },
    courtNext: { color: "#666", fontSize: 11, marginTop: 8 },

    // Booking cards
    bookingCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    bookingTime: { width: 60, alignItems: "center" },
    bookingTimeText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
    bookingDuration: { color: "#666", fontSize: 11 },
    bookingInfo: { flex: 1, marginLeft: 12 },
    bookingPlayer: { color: "#FFF", fontSize: 14, fontWeight: "500" },
    bookingCourt: { color: "#888", fontSize: 12 },
    bookingAmount: { alignItems: "flex-end" },
    bookingAmountText: { color: "#7ED957", fontSize: 16, fontWeight: "bold" },
    pendingBadge: { backgroundColor: "#FBBF24", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    pendingText: { color: "#000", fontSize: 10, fontWeight: "bold" },

    // AI Tools
    aiToolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    aiTool: {
        width: "48%",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        gap: 8,
    },
    aiToolText: { color: "#FFF", fontSize: 13, fontWeight: "500" },

    // Premium banner
    premiumBanner: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
    premiumGradient: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
    premiumText: { flex: 1 },
    premiumTitle: { color: "#000", fontSize: 16, fontWeight: "bold" },
    premiumSubtitle: { color: "#333", fontSize: 12 },
    premiumPrice: { color: "#000", fontSize: 18, fontWeight: "bold" },

    // Courts tab
    addCourtBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    addCourtBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },
    courtFullCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    courtHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    courtFullName: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    courtStatusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    courtStatusPillText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
    courtFullType: { color: "#888", fontSize: 14, marginTop: 4 },
    courtFullNext: { color: "#666", fontSize: 13, marginTop: 8 },
    courtActions: { flexDirection: "row", gap: 12, marginTop: 16 },
    courtActionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    courtActionText: { color: "#7ED957", fontSize: 13, fontWeight: "500" },

    // Bookings tab
    bookingTabs: { flexDirection: "row", marginBottom: 16, gap: 8 },
    bookingTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    bookingTabActive: { backgroundColor: "#7ED957" },
    bookingTabText: { color: "#666", fontSize: 14 },
    bookingTabTextActive: { color: "#000", fontSize: 14, fontWeight: "600" },
    bookingFullCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    bookingFullHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    bookingFullPlayer: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    bookingFullCourt: { color: "#888", fontSize: 13, marginTop: 2 },
    bookingFullAmount: { color: "#7ED957", fontSize: 20, fontWeight: "bold" },
    bookingActions: { flexDirection: "row", gap: 12, marginTop: 16 },
    approveBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        padding: 12,
        borderRadius: 10,
        gap: 6,
    },
    approveBtnText: { color: "#000", fontWeight: "bold" },
    declineBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#EF4444",
        padding: 12,
        borderRadius: 10,
        gap: 6,
    },
    declineBtnText: { color: "#EF4444", fontWeight: "bold" },

    // Analytics tab
    revenueGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
    revenueCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    revenueLabel: { color: "#888", fontSize: 13 },
    revenueValue: { color: "#7ED957", fontSize: 28, fontWeight: "bold", marginTop: 4 },
    chartPlaceholder: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    chartPlaceholderText: { color: "#666", marginTop: 12 },
    performanceRow: { flexDirection: "row", gap: 12 },
    performanceItem: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    performanceValue: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    performanceLabel: { color: "#888", fontSize: 11, marginTop: 4, textAlign: "center" },

    // Header actions
    headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
    inviteBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#7ED95720",
        alignItems: "center",
        justifyContent: "center",
    },

    // Invite Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    inputLabel: { color: "#888", fontSize: 13, marginBottom: 8, marginTop: 16 },
    textInput: {
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
    },
    rolesGrid: { gap: 8 },
    roleCard: {
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    roleCardActive: { borderColor: "#7ED957", backgroundColor: "#7ED95710" },
    roleLabel: { color: "#FFF", fontSize: 15, fontWeight: "600" },
    roleLabelActive: { color: "#7ED957" },
    roleDesc: { color: "#666", fontSize: 12, marginTop: 4 },
    codeBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    codeLabel: { color: "#888", fontSize: 12 },
    codeValue: { color: "#7ED957", fontSize: 24, fontWeight: "bold", letterSpacing: 2 },
    copyCodeBtn: { padding: 8 },
    sendInviteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        gap: 8,
    },
    sendInviteBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },
})
