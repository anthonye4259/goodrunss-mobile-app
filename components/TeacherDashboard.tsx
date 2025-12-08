import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useTrainerDashboard } from "@/lib/hooks/useTrainerDashboard"

interface TeacherDashboardProps {
    userType: "trainer" | "instructor"
    name?: string
}

export function TeacherDashboard({ userType, name }: TeacherDashboardProps) {
    // Use real synced data from Firebase
    const {
        clients,
        totalClients,
        activeClients,
        upcomingBookings,
        todayBookings,
        pendingCount,
        earnings,
        profile,
        isLoading,
        refreshAll,
    } = useTrainerDashboard()

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    const isInstructor = userType === "instructor"
    const roleTitle = isInstructor ? "Instructor" : "Coach"
    const clientLabel = isInstructor ? "Students" : "Clients"

    // Mock unread messages count (would come from messaging service)
    const unreadMessages = 0 // TODO: Hook up messaging service

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
                        <Text style={styles.welcomeSubtext}>You have {pendingCount} pending requests</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{profile?.rating?.toFixed(1) || "5.0"}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Earnings Row */}
            <View style={styles.earningsContainer}>
                <View style={styles.earningsCard}>
                    <Text style={styles.earningsLabel}>Today</Text>
                    <Text style={styles.earningsAmount}>${earnings.today}</Text>
                </View>
                <View style={[styles.earningsCard, styles.earningsCardMiddle]}>
                    <Text style={styles.earningsLabel}>This Week</Text>
                    <Text style={styles.earningsAmount}>${earnings.thisWeek}</Text>
                </View>
                <View style={styles.earningsCard}>
                    <Text style={styles.earningsLabel}>This Month</Text>
                    <Text style={styles.earningsAmount}>${earnings.thisMonth.toLocaleString()}</Text>
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
                        {unreadMessages > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadMessages}</Text>
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
                        {pendingCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{pendingCount}</Text>
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
                    <Text style={styles.statLabel}>{totalClients} {clientLabel}</Text>
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

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#7ED957" />
                        <Text style={styles.loadingText}>Loading schedule...</Text>
                    </View>
                ) : todayBookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={32} color="#666" />
                        <Text style={styles.emptyStateText}>No sessions scheduled for today</Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => handlePress(() => router.push("/(tabs)/trainer"))}
                        >
                            <Text style={styles.emptyStateButtonText}>Set Availability</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    todayBookings.map((booking) => (
                        <TouchableOpacity
                            key={booking.id}
                            style={styles.sessionCard}
                            onPress={() => handlePress(() => router.push(`/booking/${booking.id}`))}
                        >
                            <View style={styles.sessionTime}>
                                <Text style={styles.sessionTimeText}>{booking.time}</Text>
                                <Text style={styles.sessionDuration}>{booking.duration} min</Text>
                            </View>
                            <View style={styles.sessionDetails}>
                                <Text style={styles.sessionClient}>{booking.clientName}</Text>
                                <Text style={styles.sessionActivity}>{booking.activity}</Text>
                            </View>
                            <View style={styles.bookingStatus}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: booking.status === "confirmed" ? "#7ED957" : "#FBBF24" }
                                ]} />
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    ))
                )}
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
                    onPress={() => handlePress(() => router.push("/invite"))}
                >
                    <Ionicons name="share-social" size={20} color="#7ED957" />
                    <Text style={[styles.actionButtonText, { color: "#7ED957" }]}>Invite {clientLabel}</Text>
                </TouchableOpacity>
            </View>

            {/* Pro Dashboard Upgrade CTA */}
            <TouchableOpacity
                style={styles.proBanner}
                onPress={() => handlePress(() => {
                    // Open web dashboard in browser
                    // In production: Linking.openURL("https://dashboard.goodrunss.com/pricing")
                    router.push("/pro-dashboard")
                })}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={["#0F172A", "#1E293B"]}
                    style={styles.proBannerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.proBannerContent}>
                        <View style={styles.proBadge}>
                            <Ionicons name="sparkles" size={12} color="#7ED957" />
                            <Text style={styles.proBadgeText}>PRO DASHBOARD</Text>
                        </View>

                        <Text style={styles.proTitle}>Unlock Your Business Potential</Text>
                        <Text style={styles.proSubtitle}>AI-powered tools to grow your coaching business</Text>

                        <View style={styles.proFeatures}>
                            <View style={styles.proFeatureRow}>
                                <Ionicons name="sparkles" size={14} color="#7ED957" />
                                <Text style={styles.proFeatureText}>GIA AI Assistant - 24/7 business copilot</Text>
                            </View>
                            <View style={styles.proFeatureRow}>
                                <Ionicons name="document-text" size={14} color="#8B5CF6" />
                                <Text style={styles.proFeatureText}>Auto CRM Parser - Extract client data</Text>
                            </View>
                            <View style={styles.proFeatureRow}>
                                <Ionicons name="people" size={14} color="#06B6D4" />
                                <Text style={styles.proFeatureText}>Smart Lead Matching - AI finds clients</Text>
                            </View>
                            <View style={styles.proFeatureRow}>
                                <Ionicons name="infinite" size={14} color="#FBBF24" />
                                <Text style={styles.proFeatureText}>Unlimited Clients & Programs</Text>
                            </View>
                        </View>

                        <View style={styles.proPricing}>
                            <Text style={styles.proPriceStart}>Starting at</Text>
                            <Text style={styles.proPrice}>$15</Text>
                            <Text style={styles.proPricePeriod}>/mo</Text>
                        </View>

                        <View style={styles.proCtaButton}>
                            <Text style={styles.proCtaText}>Go Pro</Text>
                            <Ionicons name="arrow-forward" size={16} color="#000" />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
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
    // Pro Dashboard Upgrade Banner Styles
    proBanner: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#334155",
    },
    proBannerGradient: {
        padding: 20,
    },
    proBannerContent: {
        gap: 12,
    },
    proBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        gap: 4,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#7ED957",
        letterSpacing: 1,
    },
    proTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    proSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    proFeatures: {
        gap: 8,
        marginTop: 8,
    },
    proFeatureRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    proFeatureText: {
        fontSize: 13,
        color: "#E2E8F0",
    },
    proPricing: {
        flexDirection: "row",
        alignItems: "baseline",
        marginTop: 12,
    },
    proPriceStart: {
        fontSize: 13,
        color: "#9CA3AF",
        marginRight: 6,
    },
    proPrice: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#7ED957",
    },
    proPricePeriod: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    proCtaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
    },
    proCtaText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    // Loading and empty states
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    emptyStateButton: {
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    emptyStateButtonText: {
        fontSize: 13,
        color: "#7ED957",
        fontWeight: "600",
    },
    bookingStatus: {
        marginRight: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
})
