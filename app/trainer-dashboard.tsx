/**
 * Trainer/Instructor Dashboard Screen
 * 
 * Universal mobile dashboard for both:
 * - Rec Trainers (sports coaches)
 * - Studio Instructors (wellness teachers)
 * 
 * Syncs with trainer dashboard web app
 */

import React, { useState } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { useTrainerSessions, useTrainerAnalytics, useTrainerWaitlist } from "@/lib/hooks/useDashboard"
import { useInstructorRevenueShare, TRAINER_PRICING } from "@/lib/services/pro-revenue-share"
import { ProPriorityToggle } from "@/components/ProPrioritySettings"
import { useAuth } from "@/lib/auth-context"

import { useUserPreferences } from "@/lib/user-preferences"

export default function TrainerDashboardScreen() {
    const { user } = useAuth()
    const { preferences } = useUserPreferences()
    const [refreshing, setRefreshing] = useState(false)

    // Determine user type for contextual display
    const isInstructor = preferences.userType === "instructor"
    const userTypeLabel = isInstructor ? "Instructor" : "Trainer"

    const {
        sessions,
        loading: sessionsLoading,
        refresh: refreshSessions,
        upcomingSessions,
    } = useTrainerSessions()

    const {
        analytics,
        loading: analyticsLoading,
        refresh: refreshAnalytics,
    } = useTrainerAnalytics()

    const {
        entries: waitlist,
        loading: waitlistLoading,
        refresh: refreshWaitlist,
        notifyClient,
        pendingCount,
    } = useTrainerWaitlist()

    const {
        pendingRevenueFormatted,
        loading: revenueLoading,
        refresh: refreshRevenue,
    } = useInstructorRevenueShare(user?.id)

    const handleRefresh = async () => {
        setRefreshing(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await Promise.all([
            refreshSessions(),
            refreshAnalytics(),
            refreshWaitlist(),
            refreshRevenue(),
        ])
        setRefreshing(false)
    }

    const openWebDashboard = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        Linking.openURL("https://studios.goodrunss.com/dashboard")
    }

    const isLoading = sessionsLoading || analyticsLoading || revenueLoading

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7ED957" />
                    <Text style={styles.loadingText}>Loading your dashboard...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#7ED957"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Business</Text>
                    <TouchableOpacity onPress={openWebDashboard}>
                        <Ionicons name="open-outline" size={22} color="#7ED957" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="calendar"
                        label="Today's Sessions"
                        value={upcomingSessions.filter(s => isToday(s.date)).length.toString()}
                        color="#7ED957"
                    />
                    <StatCard
                        icon="cash"
                        label="This Month"
                        value={`$${((analytics?.monthlyRevenue || 0) / 100).toFixed(0)}`}
                        color="#22C55E"
                    />
                    <StatCard
                        icon="people"
                        label="Active Clients"
                        value={(analytics?.activeClients || 0).toString()}
                        color="#3B82F6"
                    />
                    <StatCard
                        icon="flash"
                        label="Pro Bonus"
                        value={pendingRevenueFormatted}
                        color="#F59E0B"
                        subtitle="from Pro clients"
                    />
                </View>

                {/* Upcoming Sessions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                    {upcomingSessions.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="calendar-outline" size={32} color="#6B7280" />
                            <Text style={styles.emptyText}>No upcoming sessions</Text>
                        </View>
                    ) : (
                        upcomingSessions.slice(0, 5).map(session => (
                            <SessionCard key={session.id} session={session} />
                        ))
                    )}
                </View>

                {/* Waitlist */}
                {pendingCount > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Waitlist</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{pendingCount}</Text>
                            </View>
                        </View>
                        {waitlist.filter(w => w.status === "pending").slice(0, 3).map(entry => (
                            <WaitlistCard
                                key={entry.id}
                                entry={entry}
                                onNotify={() => notifyClient(entry.id)}
                            />
                        ))}
                    </View>
                )}

                {/* Pro Priority Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    {user?.id && <ProPriorityToggle instructorId={user.id} />}
                </View>

                {/* Earnings Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Earnings This Month</Text>
                    <View style={styles.earningsCard}>
                        <EarningsRow
                            label="Sessions"
                            value={`$${((analytics?.monthlyRevenue || 0) / 100).toFixed(2)}`}
                            icon="fitness"
                        />
                        <View style={styles.earningsDivider} />
                        <EarningsRow
                            label="Pro Client Bonus"
                            value={pendingRevenueFormatted}
                            icon="flash"
                            highlight
                        />
                        <View style={styles.earningsDivider} />
                        <EarningsRow
                            label="Total"
                            value={`$${(((analytics?.monthlyRevenue || 0) / 100) + parseFloat(pendingRevenueFormatted.replace("$", ""))).toFixed(2)}`}
                            icon="wallet"
                            bold
                        />
                    </View>
                </View>

                {/* Full Dashboard CTA */}
                <TouchableOpacity style={styles.dashboardCta} onPress={openWebDashboard}>
                    <View style={styles.dashboardCtaContent}>
                        <Ionicons name="desktop-outline" size={24} color="#7ED957" />
                        <View style={styles.dashboardCtaText}>
                            <Text style={styles.dashboardCtaTitle}>Full Dashboard</Text>
                            <Text style={styles.dashboardCtaSubtitle}>
                                Calendar, clients, analytics & more
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="open-outline" size={18} color="#6B7280" />
                </TouchableOpacity>

                {/* Subscription Status */}
                <View style={styles.subscriptionCard}>
                    <View style={styles.subscriptionHeader}>
                        <View style={styles.proBadge}>
                            <Ionicons name="star" size={12} color="#0A0A0A" />
                            <Text style={styles.proBadgeText}>PRO</Text>
                        </View>
                        <Text style={styles.subscriptionPrice}>
                            ${TRAINER_PRICING.monthly.price / 100}/mo
                        </Text>
                    </View>
                    <Text style={styles.subscriptionInfo}>
                        Or save with ${TRAINER_PRICING.quarterly.price / 100}/3mo or ${TRAINER_PRICING.biannual.price / 100}/6mo
                    </Text>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    )
}

// Helper Components

function StatCard({ icon, label, value, color, subtitle }: {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    value: string
    color: string
    subtitle?: string
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
    )
}

function SessionCard({ session }: { session: any }) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }

    return (
        <View style={styles.sessionCard}>
            <View style={styles.sessionLeft}>
                <Text style={styles.sessionClient}>{session.clientName}</Text>
                <Text style={styles.sessionTime}>
                    {formatDate(session.date)} • {session.startTime}
                </Text>
            </View>
            <View style={styles.sessionRight}>
                <Text style={styles.sessionPrice}>
                    ${(session.price / 100).toFixed(0)}
                </Text>
                <View style={[
                    styles.sessionStatus,
                    session.paid ? styles.sessionPaid : styles.sessionUnpaid
                ]}>
                    <Text style={[
                        styles.sessionStatusText,
                        session.paid ? styles.sessionPaidText : styles.sessionUnpaidText
                    ]}>
                        {session.paid ? "Paid" : "Pending"}
                    </Text>
                </View>
            </View>
        </View>
    )
}

function WaitlistCard({ entry, onNotify }: { entry: any, onNotify: () => void }) {
    return (
        <View style={styles.waitlistCard}>
            <View style={styles.waitlistLeft}>
                <Text style={styles.waitlistName}>{entry.clientName}</Text>
                <Text style={styles.waitlistTime}>
                    Requested: {entry.requestedDate} at {entry.requestedTime}
                </Text>
            </View>
            <TouchableOpacity style={styles.notifyButton} onPress={onNotify}>
                <Text style={styles.notifyButtonText}>Notify</Text>
            </TouchableOpacity>
        </View>
    )
}

function EarningsRow({ label, value, icon, highlight, bold }: {
    label: string
    value: string
    icon: keyof typeof Ionicons.glyphMap
    highlight?: boolean
    bold?: boolean
}) {
    return (
        <View style={styles.earningsRow}>
            <View style={styles.earningsRowLeft}>
                <Ionicons
                    name={icon}
                    size={16}
                    color={highlight ? "#F59E0B" : "#6B7280"}
                />
                <Text style={[
                    styles.earningsLabel,
                    bold && styles.earningsLabelBold
                ]}>
                    {label}
                </Text>
            </View>
            <Text style={[
                styles.earningsValue,
                highlight && styles.earningsValueHighlight,
                bold && styles.earningsValueBold
            ]}>
                {value}
            </Text>
        </View>
    )
}

function isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split("T")[0]
    return dateStr === today
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#9CA3AF",
        marginTop: 12,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 16,
        gap: 10,
    },
    statCard: {
        width: "48%",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    statSubtitle: {
        fontSize: 10,
        color: "#6B7280",
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    badge: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0A0A0A",
    },
    emptyCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 8,
    },
    sessionCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    sessionLeft: {},
    sessionClient: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    sessionTime: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 2,
    },
    sessionRight: {
        alignItems: "flex-end",
    },
    sessionPrice: {
        fontSize: 16,
        fontWeight: "700",
        color: "#7ED957",
    },
    sessionStatus: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 4,
    },
    sessionPaid: {
        backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    sessionUnpaid: {
        backgroundColor: "rgba(245, 158, 11, 0.2)",
    },
    sessionStatusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    sessionPaidText: {
        color: "#22C55E",
    },
    sessionUnpaidText: {
        color: "#F59E0B",
    },
    waitlistCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    waitlistLeft: {},
    waitlistName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    waitlistTime: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    notifyButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    notifyButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0A0A0A",
    },
    earningsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    earningsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    earningsRowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    earningsLabel: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    earningsLabelBold: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    earningsValue: {
        fontSize: 14,
        color: "#FFFFFF",
    },
    earningsValueHighlight: {
        color: "#F59E0B",
    },
    earningsValueBold: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7ED957",
    },
    earningsDivider: {
        height: 1,
        backgroundColor: "#333",
    },
    dashboardCta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: "#7ED95740",
    },
    dashboardCtaContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    dashboardCtaText: {},
    dashboardCtaTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    dashboardCtaSubtitle: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    subscriptionCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    subscriptionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    proBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#7ED957",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    proBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0A0A0A",
    },
    subscriptionPrice: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7ED957",
    },
    subscriptionInfo: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
    },
    bottomPadding: {
        height: 40,
    },
})
