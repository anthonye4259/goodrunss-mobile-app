/**
 * SportStatusCard - Minimal Premium Display
 * 
 * Clean. Sophisticated. No emojis.
 * Says everything with less.
 */

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import type { SportContext, Sport } from "@/lib/services/sport-intelligence-service"

// ============================================
// TYPES
// ============================================

interface SportStatusCardProps {
    context: SportContext
    venueName?: string
    onReportPress?: () => void
    variant?: "full" | "compact" | "minimal"
}

// Sport accent colors (subtle, premium)
const SPORT_COLORS: Record<Sport, string> = {
    basketball: "#F97316",
    tennis: "#22C55E",
    pickleball: "#8B5CF6",
    volleyball: "#EAB308",
    golf: "#16A34A",
    swimming: "#0EA5E9",
    soccer: "#22C55E",
    padel: "#06B6D4",
    racquetball: "#EF4444",
}

// Sport icons
const SPORT_ICONS: Record<Sport, string> = {
    basketball: "basketball-outline",
    tennis: "tennisball-outline",
    pickleball: "tennisball-outline",
    volleyball: "football-outline",
    golf: "golf-outline",
    swimming: "water-outline",
    soccer: "football-outline",
    padel: "tennisball-outline",
    racquetball: "tennisball-outline",
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SportStatusCard({
    context,
    venueName,
    onReportPress,
    variant = "full",
}: SportStatusCardProps) {
    const {
        sport,
        activityLevel,
        activityColor,
        headline,
        bestTime,
        waitTime,
        weatherScore,
        shouldCome,
    } = context

    const accentColor = SPORT_COLORS[sport] || "#8B5CF6"
    const sportIcon = SPORT_ICONS[sport] || "fitness-outline"

    // Get minimal status text
    const statusText = getStatusText(activityLevel)
    const statusLabel = shouldCome ? "Good time" : "Check later"

    if (variant === "minimal") {
        return (
            <View style={styles.minimalCard}>
                <View style={styles.minimalLeft}>
                    <View style={[styles.statusDot, { backgroundColor: activityColor }]} />
                    <Text style={styles.minimalStatus}>{statusText}</Text>
                </View>
                {waitTime && (
                    <Text style={styles.minimalWait}>{waitTime}</Text>
                )}
            </View>
        )
    }

    if (variant === "compact") {
        return (
            <View style={styles.compactCard}>
                <View style={styles.compactTop}>
                    <View style={styles.compactLeft}>
                        <View style={[styles.statusDot, { backgroundColor: activityColor }]} />
                        <Text style={styles.compactStatus}>{statusText}</Text>
                    </View>
                    <Text style={[styles.compactLabel, { color: shouldCome ? "#22C55E" : "#F97316" }]}>
                        {statusLabel}
                    </Text>
                </View>
                <View style={styles.compactStats}>
                    <View style={styles.compactStat}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.compactStatText}>{bestTime}</Text>
                    </View>
                    {waitTime && (
                        <View style={styles.compactStat}>
                            <Ionicons name="hourglass-outline" size={14} color="#6B7280" />
                            <Text style={styles.compactStatText}>{waitTime}</Text>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    // Full variant
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.sportIcon, { backgroundColor: accentColor + "15" }]}>
                        <Ionicons name={sportIcon as any} size={18} color={accentColor} />
                    </View>
                    {venueName && (
                        <Text style={styles.venueName} numberOfLines={1}>{venueName}</Text>
                    )}
                </View>
                {onReportPress && (
                    <TouchableOpacity style={styles.reportButton} onPress={onReportPress}>
                        <Ionicons name="flag-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Status */}
            <View style={styles.statusSection}>
                <View style={[styles.statusIndicator, { backgroundColor: activityColor }]} />
                <View style={styles.statusContent}>
                    <Text style={styles.statusHeadline}>{headline}</Text>
                    <Text style={[styles.statusVerdict, { color: shouldCome ? "#22C55E" : "#F97316" }]}>
                        {statusLabel}
                    </Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <StatItem icon="time-outline" label="Best time" value={bestTime} />
                <View style={styles.statDivider} />
                <StatItem icon="partly-sunny-outline" label="Conditions" value={`${weatherScore}%`} />
                {waitTime && (
                    <>
                        <View style={styles.statDivider} />
                        <StatItem icon="hourglass-outline" label="Wait" value={waitTime} />
                    </>
                )}
            </View>
        </View>
    )
}

// ============================================
// STAT ITEM
// ============================================

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.statItem}>
            <Ionicons name={icon as any} size={16} color="#6B7280" />
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    )
}

// ============================================
// STATUS PILL (for map pins)
// ============================================

export function SportStatusPill({ context }: { context: SportContext }) {
    const statusText = getStatusText(context.activityLevel)

    return (
        <View style={[styles.pill, { backgroundColor: context.activityColor + "15" }]}>
            <View style={[styles.pillDot, { backgroundColor: context.activityColor }]} />
            <Text style={[styles.pillText, { color: context.activityColor }]}>{statusText}</Text>
        </View>
    )
}

// ============================================
// HELPERS
// ============================================

function getStatusText(level: string): string {
    const labels: Record<string, string> = {
        dead: "Empty",
        quiet: "Quiet",
        active: "Active",
        busy: "Busy",
        packed: "Full",
    }
    return labels[level] || "—"
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    // Full card
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    sportIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    venueName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        flex: 1,
    },
    reportButton: {
        padding: 8,
    },
    statusSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
        marginBottom: 20,
    },
    statusIndicator: {
        width: 4,
        height: 48,
        borderRadius: 2,
        marginTop: 2,
    },
    statusContent: {
        flex: 1,
    },
    statusHeadline: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        lineHeight: 28,
        marginBottom: 4,
    },
    statusVerdict: {
        fontSize: 14,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        color: "#6B7280",
    },
    statValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: "#333",
    },
    // Compact
    compactCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
    },
    compactTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    compactLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    compactStatus: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    compactLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    compactStats: {
        flexDirection: "row",
        gap: 16,
    },
    compactStat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    compactStatText: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    // Minimal
    minimalCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 10,
        padding: 12,
    },
    minimalLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    minimalStatus: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    minimalWait: {
        fontSize: 13,
        color: "#6B7280",
    },
    // Common
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    // Pill
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    pillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    pillText: {
        fontSize: 12,
        fontWeight: "600",
    },
})
