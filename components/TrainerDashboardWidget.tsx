/**
 * Trainer Dashboard Widget
 * 
 * Quick stats widget for trainer home screen
 * Shows today's sessions, revenue, unread messages, waitlist
 */

import React from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useDashboardQuickStats } from "@/lib/hooks/useDashboard"

interface TrainerDashboardWidgetProps {
    onOpenDashboard?: () => void
}

export function TrainerDashboardWidget({ onOpenDashboard }: TrainerDashboardWidgetProps) {
    const { stats, loading, refresh } = useDashboardQuickStats()

    const handleOpenDashboard = () => {
        if (onOpenDashboard) {
            onOpenDashboard()
        } else {
            // Deep link to web dashboard
            router.push("/pro-dashboard")
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="briefcase" size={20} color="#7ED957" />
                    <Text style={styles.title}>Your Business</Text>
                </View>
                <TouchableOpacity onPress={refresh}>
                    <Ionicons name="refresh" size={18} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatBox
                    icon="calendar"
                    label="Today"
                    value={stats.todaySessions}
                    suffix="sessions"
                    color="#7ED957"
                />
                <StatBox
                    icon="cash"
                    label="This Month"
                    value={`$${(stats.weekRevenue / 100).toFixed(0)}`}
                    suffix=""
                    color="#22C55E"
                />
                <StatBox
                    icon="people"
                    label="Active"
                    value={stats.activeClients}
                    suffix="clients"
                    color="#3B82F6"
                />
                <StatBox
                    icon="hourglass"
                    label="Waitlist"
                    value={stats.waitlistCount}
                    suffix="pending"
                    color="#F59E0B"
                />
            </View>

            {/* Unread Messages */}
            {stats.unreadMessages > 0 && (
                <TouchableOpacity style={styles.messagesAlert}>
                    <Ionicons name="chatbubble" size={16} color="#FFF" />
                    <Text style={styles.messagesText}>
                        {stats.unreadMessages} unread message{stats.unreadMessages > 1 ? "s" : ""}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
            )}

            {/* Open Dashboard Button */}
            <TouchableOpacity style={styles.dashboardButton} onPress={handleOpenDashboard}>
                <Text style={styles.dashboardButtonText}>Open Full Dashboard</Text>
                <Ionicons name="open-outline" size={16} color="#7ED957" />
            </TouchableOpacity>
        </View>
    )
}

interface StatBoxProps {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    value: string | number
    suffix: string
    color: string
}

function StatBox({ icon, label, value, suffix, color }: StatBoxProps) {
    return (
        <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
        </View>
    )
}

// ============================================
// TRAINER SUBSCRIPTION CARD
// ============================================

interface SubscriptionCardProps {
    isSubscribed: boolean
    currentPlan?: "monthly" | "quarterly" | "biannual"
    onSubscribe?: () => void
}

export function TrainerSubscriptionCard({ isSubscribed, currentPlan, onSubscribe }: SubscriptionCardProps) {
    if (isSubscribed) {
        return (
            <View style={styles.subscriptionCard}>
                <View style={styles.proBadge}>
                    <Ionicons name="star" size={14} color="#0A0A0A" />
                    <Text style={styles.proBadgeText}>PRO</Text>
                </View>
                <Text style={styles.planText}>
                    {currentPlan === "biannual" ? "6 Month Plan" :
                        currentPlan === "quarterly" ? "3 Month Plan" : "Monthly Plan"}
                </Text>
            </View>
        )
    }

    return (
        <TouchableOpacity style={styles.upgradeCard} onPress={onSubscribe}>
            <View style={styles.upgradeContent}>
                <View>
                    <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                    <Text style={styles.upgradeSubtitle}>
                        Full automations, GIA AI, analytics
                    </Text>
                </View>
                <View style={styles.upgradePricing}>
                    <Text style={styles.upgradePrice}>$15</Text>
                    <Text style={styles.upgradePeriod}>/month</Text>
                </View>
            </View>
            <View style={styles.upgradePlans}>
                <View style={styles.planOption}>
                    <Text style={styles.planOptionLabel}>3 months</Text>
                    <Text style={styles.planOptionPrice}>$40</Text>
                </View>
                <View style={styles.planOption}>
                    <Text style={styles.planOptionLabel}>6 months</Text>
                    <Text style={styles.planOptionPrice}>$75</Text>
                    <View style={styles.bestValue}>
                        <Text style={styles.bestValueText}>Best Value</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

// ============================================
// CLIENT PRO CARD
// ============================================

interface ClientProCardProps {
    isPro: boolean
    onSubscribe?: () => void
}

export function ClientProCard({ isPro, onSubscribe }: ClientProCardProps) {
    if (isPro) {
        return (
            <View style={styles.clientProCard}>
                <View style={styles.clientProBadge}>
                    <Ionicons name="flash" size={14} color="#7ED957" />
                    <Text style={styles.clientProBadgeText}>PRO MEMBER</Text>
                </View>
                <Text style={styles.clientProBenefit}>Priority Waitlist</Text>
            </View>
        )
    }

    return (
        <TouchableOpacity style={styles.clientUpgradeCard} onPress={onSubscribe}>
            <View style={styles.clientUpgradeLeft}>
                <Ionicons name="flash" size={20} color="#7ED957" />
                <View>
                    <Text style={styles.clientUpgradeTitle}>Skip the Waitlist</Text>
                    <Text style={styles.clientUpgradeSubtitle}>Get priority booking</Text>
                </View>
            </View>
            <View style={styles.clientUpgradeRight}>
                <Text style={styles.clientUpgradePrice}>$10</Text>
                <Text style={styles.clientUpgradePeriod}>/mo</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    statBox: {
        width: "48%",
        backgroundColor: "#252525",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    statSuffix: {
        fontSize: 10,
        color: "#6B7280",
    },
    messagesAlert: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3B82F620",
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
        gap: 8,
    },
    messagesText: {
        flex: 1,
        fontSize: 13,
        color: "#FFFFFF",
    },
    dashboardButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#7ED957",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        gap: 6,
    },
    dashboardButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7ED957",
    },

    // Subscription Card
    subscriptionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#7ED957",
        gap: 10,
    },
    proBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#7ED957",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    proBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0A0A0A",
    },
    planText: {
        fontSize: 14,
        color: "#FFFFFF",
    },

    // Upgrade Card
    upgradeCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    upgradeContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    upgradeTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    upgradeSubtitle: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 2,
    },
    upgradePricing: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    upgradePrice: {
        fontSize: 24,
        fontWeight: "700",
        color: "#7ED957",
    },
    upgradePeriod: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    upgradePlans: {
        flexDirection: "row",
        gap: 10,
    },
    planOption: {
        flex: 1,
        backgroundColor: "#252525",
        borderRadius: 10,
        padding: 12,
        alignItems: "center",
    },
    planOptionLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    planOptionPrice: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 2,
    },
    bestValue: {
        backgroundColor: "#7ED957",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
    },
    bestValueText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#0A0A0A",
    },

    // Client Pro
    clientProCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        gap: 10,
    },
    clientProBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    clientProBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#7ED957",
    },
    clientProBenefit: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    clientUpgradeCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    clientUpgradeLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    clientUpgradeTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    clientUpgradeSubtitle: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    clientUpgradeRight: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    clientUpgradePrice: {
        fontSize: 20,
        fontWeight: "700",
        color: "#7ED957",
    },
    clientUpgradePeriod: {
        fontSize: 12,
        color: "#9CA3AF",
    },
})

export default TrainerDashboardWidget
