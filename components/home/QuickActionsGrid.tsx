/**
 * Quick Actions Grid
 * One-tap access to common functionality
 */

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { colors, spacing, borderRadius } from "@/lib/theme"

interface QuickAction {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    subtitle?: string
    route: string
    color: string
    badge?: string
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        icon: "search",
        label: "Find Courts",
        subtitle: "Near you",
        route: "/(tabs)/explore",
        color: "#7ED957",
    },
    {
        icon: "person",
        label: "Find Trainer",
        subtitle: "1-on-1 sessions",
        route: "/(tabs)/trainers",
        color: "#8B5CF6",
    },
    {
        icon: "camera",
        label: "Report Court",
        subtitle: "Earn $5",
        route: "/report-court",
        color: "#F59E0B",
        badge: "$5",
    },
    {
        icon: "calendar",
        label: "My Bookings",
        subtitle: "View all",
        route: "/(tabs)/my-bookings",
        color: "#3B82F6",
    },
]

interface QuickActionsGridProps {
    onAuthRequired?: () => void
    isGuest?: boolean
}

export function QuickActionsGrid({ onAuthRequired, isGuest }: QuickActionsGridProps) {
    const handlePress = (action: QuickAction) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        // Some actions require auth
        if (isGuest && (action.route.includes("booking") || action.route.includes("report"))) {
            onAuthRequired?.()
            return
        }

        router.push(action.route as any)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.grid}>
                {QUICK_ACTIONS.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionCard}
                        onPress={() => handlePress(action)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                            <Ionicons name={action.icon} size={24} color={action.color} />
                        </View>
                        <Text style={styles.actionLabel}>{action.label}</Text>
                        {action.subtitle && (
                            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                        )}
                        {action.badge && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{action.badge}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionTitle: {
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    actionCard: {
        width: "47%",
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    actionLabel: {
        color: colors.text.primary,
        fontSize: 15,
        fontWeight: "600",
    },
    actionSubtitle: {
        color: colors.text.muted,
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "#F59E0B",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: "#000",
        fontSize: 11,
        fontWeight: "700",
    },
})
