import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

interface TeacherDashboardProps {
    userType: "trainer" | "instructor"
    name?: string
}

// Mock data - in production, this would come from backend
const MOCK_DATA = {
    earnings: {
        today: 145,
        thisWeek: 892,
        thisMonth: 3420,
    },
    upcomingSessions: [
        { id: "1", clientName: "Sarah M.", time: "2:00 PM", activity: "Tennis", duration: "1 hr" },
        { id: "2", clientName: "Mike J.", time: "4:30 PM", activity: "Basketball", duration: "1.5 hr" },
        { id: "3", clientName: "Emily R.", time: "6:00 PM", activity: "Yoga", duration: "1 hr" },
    ],
    pendingRequests: 3,
    unreadMessages: 5,
    rating: 4.9,
    totalClients: 28,
}

export function TeacherDashboard({ userType, name }: TeacherDashboardProps) {
    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    const isInstructor = userType === "instructor"
    const roleTitle = isInstructor ? "Instructor" : "Coach"
    const clientLabel = isInstructor ? "Students" : "Clients"

    return (
        <View style={styles.container}>
            {/* Welcome Banner */}
            <LinearGradient
                colors={isInstructor ? ["#8B5CF6", "#7C3AED"] : ["#7ED957", "#65A30D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.welcomeBanner}
            >
                <View style={styles.welcomeContent}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back, {roleTitle}!</Text>
                        <Text style={styles.welcomeSubtext}>You have {MOCK_DATA.pendingRequests} pending requests</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{MOCK_DATA.rating}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Earnings Row */}
            <View style={styles.earningsContainer}>
                <View style={styles.earningsCard}>
                    <Text style={styles.earningsLabel}>Today</Text>
                    <Text style={styles.earningsAmount}>${MOCK_DATA.earnings.today}</Text>
                </View>
                <View style={[styles.earningsCard, styles.earningsCardMiddle]}>
                    <Text style={styles.earningsLabel}>This Week</Text>
                    <Text style={styles.earningsAmount}>${MOCK_DATA.earnings.thisWeek}</Text>
                </View>
                <View style={styles.earningsCard}>
                    <Text style={styles.earningsLabel}>This Month</Text>
                    <Text style={styles.earningsAmount}>${MOCK_DATA.earnings.thisMonth.toLocaleString()}</Text>
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handlePress(() => router.push("/(tabs)/messages"))}
                >
                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                        <Ionicons name="chatbubbles" size={20} color="#EF4444" />
                        {MOCK_DATA.unreadMessages > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{MOCK_DATA.unreadMessages}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.statLabel}>Messages</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handlePress(() => router.push("/bookings"))}
                >
                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(126, 217, 87, 0.1)" }]}>
                        <Ionicons name="calendar" size={20} color="#7ED957" />
                        {MOCK_DATA.pendingRequests > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{MOCK_DATA.pendingRequests}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.statLabel}>Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handlePress(() => router.push("/(tabs)/stats"))}
                >
                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(139, 92, 246, 0.1)" }]}>
                        <Ionicons name="people" size={20} color="#8B5CF6" />
                    </View>
                    <Text style={styles.statLabel}>{MOCK_DATA.totalClients} {clientLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handlePress(() => router.push("/(tabs)/trainer"))}
                >
                    <View style={[styles.statIconContainer, { backgroundColor: "rgba(6, 182, 212, 0.1)" }]}>
                        <Ionicons name="settings" size={20} color="#06B6D4" />
                    </View>
                    <Text style={styles.statLabel}>Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Upcoming Sessions */}
            <View style={styles.sessionsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                    <TouchableOpacity onPress={() => handlePress(() => router.push("/bookings"))}>
                        <Text style={styles.seeAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {MOCK_DATA.upcomingSessions.map((session) => (
                    <TouchableOpacity
                        key={session.id}
                        style={styles.sessionCard}
                        onPress={() => handlePress(() => router.push(`/booking/${session.id}`))}
                    >
                        <View style={styles.sessionTime}>
                            <Text style={styles.sessionTimeText}>{session.time}</Text>
                            <Text style={styles.sessionDuration}>{session.duration}</Text>
                        </View>
                        <View style={styles.sessionDetails}>
                            <Text style={styles.sessionClient}>{session.clientName}</Text>
                            <Text style={styles.sessionActivity}>{session.activity}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: isInstructor ? "#8B5CF6" : "#7ED957" }]}
                    onPress={() => handlePress(() => router.push("/(tabs)/trainer"))}
                >
                    <Ionicons name="add-circle" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Set Availability</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonOutline]}
                    onPress={() => handlePress(() => router.push("/referrals"))}
                >
                    <Ionicons name="share-social" size={20} color="#7ED957" />
                    <Text style={[styles.actionButtonText, { color: "#7ED957" }]}>Invite {clientLabel}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    welcomeBanner: {
        borderRadius: 16,
        padding: 16,
    },
    welcomeContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    welcomeSubtext: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    ratingText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    earningsContainer: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
    },
    earningsCard: {
        flex: 1,
        alignItems: "center",
    },
    earningsCardMiddle: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "#333",
    },
    earningsLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    earningsAmount: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#7ED957",
    },
    quickStats: {
        flexDirection: "row",
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        gap: 8,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#EF4444",
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "bold",
    },
    statLabel: {
        fontSize: 11,
        color: "#9CA3AF",
        textAlign: "center",
    },
    sessionsSection: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    seeAllText: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "500",
    },
    sessionCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
    },
    sessionTime: {
        width: 70,
    },
    sessionTimeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
    sessionDuration: {
        fontSize: 12,
        color: "#666",
    },
    sessionDetails: {
        flex: 1,
        marginLeft: 12,
    },
    sessionClient: {
        fontSize: 15,
        fontWeight: "500",
        color: "#FFF",
    },
    sessionActivity: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonOutline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#7ED957",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
})
