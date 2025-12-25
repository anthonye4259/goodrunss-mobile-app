/**
 * Nearby Courts Card
 * Shows courts near user's location with activity levels
 */

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { colors, spacing, borderRadius } from "@/lib/theme"

interface Court {
    id: string
    name: string
    sport: string
    distance?: number
    activityLevel?: "quiet" | "active" | "busy" | "packed"
}

interface NearbyCourtsCardProps {
    courts: Court[]
    userLocation?: { lat: number; lng: number }
}

const ACTIVITY_COLORS = {
    quiet: "#22C55E",
    active: "#EAB308",
    busy: "#F97316",
    packed: "#EF4444",
}

export function NearbyCourtsCard({ courts }: NearbyCourtsCardProps) {
    const handlePress = (courtId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push(`/venues/${courtId}`)
    }

    const handleViewAll = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)/explore")
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Nearby Courts</Text>
                <TouchableOpacity onPress={handleViewAll}>
                    <Text style={styles.viewAll}>View Map →</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {courts.slice(0, 5).map((court) => {
                    const level = court.activityLevel || "quiet"
                    return (
                        <TouchableOpacity
                            key={court.id}
                            style={styles.courtCard}
                            onPress={() => handlePress(court.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.courtHeader}>
                                <View style={[styles.activityDot, { backgroundColor: ACTIVITY_COLORS[level] }]} />
                                <Text style={styles.activityLabel}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </Text>
                            </View>
                            <Text style={styles.courtName} numberOfLines={1}>
                                {court.name}
                            </Text>
                            <View style={styles.courtMeta}>
                                <Ionicons name="basketball-outline" size={14} color={colors.text.muted} />
                                <Text style={styles.courtSport}>{court.sport}</Text>
                                {court.distance !== undefined && (
                                    <Text style={styles.courtDistance}>
                                        • {court.distance.toFixed(1)} mi
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: "700",
    },
    viewAll: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "500",
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    courtCard: {
        width: 160,
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    courtHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activityLabel: {
        color: colors.text.secondary,
        fontSize: 12,
    },
    courtName: {
        color: colors.text.primary,
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 6,
    },
    courtMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    courtSport: {
        color: colors.text.muted,
        fontSize: 12,
    },
    courtDistance: {
        color: colors.text.muted,
        fontSize: 12,
    },
})
