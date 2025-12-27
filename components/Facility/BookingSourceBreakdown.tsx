/**
 * Booking Source Breakdown (Premium Only)
 * 
 * Shows where bookings come from.
 * Helps optimize marketing spend.
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type BookingSource = {
    source: "app" | "website" | "phone" | "walk_in" | "referral" | "social"
    count: number
    revenue: number
}

type Props = {
    sources: BookingSource[]
    totalBookings: number
    isPremium: boolean
    onUpgrade?: () => void
    currency?: string
}

const SOURCE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
    app: { icon: "phone-portrait", label: "GoodRunss App", color: "#7ED957" },
    website: { icon: "globe", label: "Website", color: "#3B82F6" },
    phone: { icon: "call", label: "Phone", color: "#8B5CF6" },
    walk_in: { icon: "walk", label: "Walk-in", color: "#F59E0B" },
    referral: { icon: "people", label: "Referral", color: "#EC4899" },
    social: { icon: "share-social", label: "Social Media", color: "#22C55E" },
}

export function BookingSourceBreakdown({ sources, totalBookings, isPremium, onUpgrade, currency = "$" }: Props) {
    // Locked state for non-premium
    if (!isPremium) {
        return (
            <TouchableOpacity
                style={styles.lockedContainer}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    onUpgrade?.()
                }}
            >
                <LinearGradient
                    colors={["#8B5CF620", "#0A0A0A"]}
                    style={styles.lockedGradient}
                >
                    <View style={styles.lockedContent}>
                        <Ionicons name="pie-chart" size={24} color="#8B5CF6" />
                        <Text style={styles.lockedTitle}>Booking Sources</Text>
                        <Text style={styles.lockedSubtitle}>
                            See where your bookings come from
                        </Text>
                    </View>
                    <View style={styles.upgradeBadge}>
                        <Ionicons name="star" size={12} color="#000" />
                        <Text style={styles.upgradeBadgeText}>Premium</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    const sortedSources = [...sources].sort((a, b) => b.count - a.count)
    const topSource = sortedSources[0]

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="analytics" size={20} color="#8B5CF6" />
                    <Text style={styles.title}>Booking Sources</Text>
                </View>
                {topSource && (
                    <View style={[styles.topBadge, { backgroundColor: SOURCE_CONFIG[topSource.source].color + "20" }]}>
                        <Text style={[styles.topText, { color: SOURCE_CONFIG[topSource.source].color }]}>
                            #{1} {SOURCE_CONFIG[topSource.source].label}
                        </Text>
                    </View>
                )}
            </View>

            {/* Source bars */}
            {sortedSources.map((source, index) => {
                const config = SOURCE_CONFIG[source.source]
                const percent = totalBookings > 0 ? Math.round((source.count / totalBookings) * 100) : 0

                return (
                    <View key={source.source} style={styles.sourceRow}>
                        <View style={[styles.sourceIcon, { backgroundColor: config.color + "20" }]}>
                            <Ionicons name={config.icon as any} size={16} color={config.color} />
                        </View>
                        <View style={styles.sourceInfo}>
                            <View style={styles.sourceHeader}>
                                <Text style={styles.sourceName}>{config.label}</Text>
                                <Text style={styles.sourceStats}>
                                    {source.count} <Text style={styles.sourcePercent}>({percent}%)</Text>
                                </Text>
                            </View>
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.barFill,
                                        { width: `${percent}%`, backgroundColor: config.color }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.sourceRevenue, { color: config.color }]}>
                                {currency}{(source.revenue / 100).toFixed(0)} revenue
                            </Text>
                        </View>
                    </View>
                )
            })}

            {/* Insight */}
            {topSource && (
                <View style={styles.insight}>
                    <Ionicons name="bulb" size={16} color="#F59E0B" />
                    <Text style={styles.insightText}>
                        💡 {Math.round((topSource.count / totalBookings) * 100)}% of bookings come from {SOURCE_CONFIG[topSource.source].label}
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#8B5CF630",
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
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    topBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    topText: {
        fontSize: 10,
        fontWeight: "700",
    },
    sourceRow: {
        flexDirection: "row",
        marginBottom: 14,
    },
    sourceIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    sourceInfo: {
        flex: 1,
    },
    sourceHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    sourceName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    sourceStats: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    sourcePercent: {
        color: "#888",
        fontSize: 11,
    },
    barBackground: {
        height: 6,
        backgroundColor: "#252525",
        borderRadius: 3,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 3,
    },
    sourceRevenue: {
        fontSize: 10,
        marginTop: 4,
    },
    insight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F59E0B10",
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    insightText: {
        color: "#F59E0B",
        fontSize: 12,
        flex: 1,
    },
    lockedContainer: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#8B5CF630",
    },
    lockedGradient: {
        padding: 24,
        alignItems: "center",
    },
    lockedContent: {
        alignItems: "center",
    },
    lockedTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        marginTop: 12,
    },
    lockedSubtitle: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    upgradeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#FFD700",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 16,
    },
    upgradeBadgeText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "700",
    },
})

export default BookingSourceBreakdown
