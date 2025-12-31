/**
 * CourtStatusCard - Waze-Style Status Display
 * 
 * Shows real-time court status with:
 * - Traffic light color (green/yellow/orange/red)
 * - Crowd level and label
 * - Last updated timestamp
 * - Confidence indicator
 * - Best time to visit
 * - Current conditions
 */

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { CourtStatus } from "@/lib/services/court-status-service"

interface CourtStatusCardProps {
    status: CourtStatus
    onReportPress?: () => void
    showDetails?: boolean
    compact?: boolean
}

export function CourtStatusCard({
    status,
    onReportPress,
    showDetails = true,
    compact = false,
}: CourtStatusCardProps) {
    const {
        crowdIcon,
        crowdColor,
        crowdLabel,
        dataFreshness,
        minutesSinceUpdate,
        confidence,
        confidenceLabel,
        activeCheckIns,
        predictedWait,
        bestTimeToVisit,
        trend,
        conditions,
        hasIssues,
        weatherScore,
        weatherSummary,
    } = status

    const getTrendIcon = () => {
        switch (trend) {
            case "increasing": return "📈"
            case "decreasing": return "📉"
            default: return "➡️"
        }
    }

    const getUpdateText = () => {
        if (dataFreshness === "live") return "Live now"
        if (dataFreshness === "no_data") return "No reports yet"
        if (minutesSinceUpdate === null) return "Predicted"
        if (minutesSinceUpdate < 1) return "Just now"
        if (minutesSinceUpdate < 60) return `${minutesSinceUpdate}m ago`
        return `${Math.floor(minutesSinceUpdate / 60)}h ago`
    }

    const getConfidenceColor = () => {
        if (confidence >= 70) return "#22C55E"
        if (confidence >= 40) return "#EAB308"
        return "#6B7280"
    }

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={[styles.compactIndicator, { backgroundColor: crowdColor }]} />
                <Ionicons name={crowdIcon as any} size={20} color={crowdColor} style={{ marginRight: 4 }} />
                <Text style={styles.compactLabel}>{crowdLabel}</Text>
                {dataFreshness === "live" && (
                    <View style={styles.liveDot} />
                )}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Main Status Row */}
            <View style={styles.mainRow}>
                {/* Crowd Level Badge */}
                <View style={[styles.statusBadge, { backgroundColor: crowdColor + "20" }]}>
                    <Ionicons name={crowdIcon as any} size={32} color={crowdColor} />
                    <View>
                        <Text style={[styles.statusLabel, { color: crowdColor }]}>
                            {crowdLabel.toUpperCase()}
                        </Text>
                        <Text style={styles.waitTime}>{predictedWait}</Text>
                    </View>
                </View>

                {/* Trend & Update Info */}
                <View style={styles.infoColumn}>
                    <View style={styles.updateRow}>
                        {dataFreshness === "live" && (
                            <View style={styles.livePulse}>
                                <View style={styles.liveInner} />
                            </View>
                        )}
                        <Text style={styles.updateText}>{getUpdateText()}</Text>
                    </View>
                    <Text style={styles.trendText}>{getTrendIcon()} {trend === "steady" ? "Steady" : trend === "increasing" ? "Getting busier" : "Slowing down"}</Text>
                </View>
            </View>

            {/* Details Section */}
            {showDetails && (
                <>
                    <View style={styles.divider} />

                    {/* Quick Stats Row */}
                    <View style={styles.statsRow}>
                        {/* Active Check-ins */}
                        <View style={styles.stat}>
                            <Ionicons name="people" size={16} color="#9CA3AF" />
                            <Text style={styles.statValue}>{activeCheckIns}</Text>
                            <Text style={styles.statLabel}>here now</Text>
                        </View>

                        {/* Best Time */}
                        <View style={styles.stat}>
                            <Ionicons name="time" size={16} color="#9CA3AF" />
                            <Text style={styles.statValue}>{bestTimeToVisit}</Text>
                            <Text style={styles.statLabel}>best time</Text>
                        </View>

                        {/* Weather */}
                        <View style={styles.stat}>
                            <Text style={styles.weatherEmoji}>
                                {weatherScore >= 80 ? "☀️" : weatherScore >= 50 ? "⛅" : "🌧️"}
                            </Text>
                            <Text style={styles.statValue}>{weatherScore}%</Text>
                            <Text style={styles.statLabel}>conditions</Text>
                        </View>

                        {/* Confidence */}
                        <View style={styles.stat}>
                            <View style={[styles.confidenceDot, { backgroundColor: getConfidenceColor() }]} />
                            <Text style={styles.statValue}>{confidenceLabel}</Text>
                            <Text style={styles.statLabel}>accuracy</Text>
                        </View>
                    </View>

                    {/* Conditions Row */}
                    {conditions.length > 0 && (
                        <View style={styles.conditionsRow}>
                            {conditions.map((condition, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.conditionChip,
                                        !condition.positive && styles.conditionChipNegative
                                    ]}
                                >
                                    <Text style={styles.conditionIcon}>{condition.icon}</Text>
                                    <Text style={[
                                        styles.conditionLabel,
                                        !condition.positive && styles.conditionLabelNegative
                                    ]}>
                                        {condition.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Report Button */}
                    {onReportPress && (
                        <TouchableOpacity style={styles.reportButton} onPress={onReportPress}>
                            <Ionicons name="add-circle-outline" size={18} color="#8B5CF6" />
                            <Text style={styles.reportButtonText}>Add Report</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    )
}

/**
 * Mini version for map pins
 */
export function CourtStatusPill({
    crowdIcon,
    crowdColor,
    crowdLabel,
    isLive,
}: {
    crowdIcon: string
    crowdColor: string
    crowdLabel: string
    isLive?: boolean
}) {
    return (
        <View style={[styles.pill, { backgroundColor: crowdColor + "20", borderColor: crowdColor }]}>
            <Ionicons name={crowdIcon as any} size={16} color={crowdColor} style={{ marginRight: 4 }} />
            <Text style={[styles.pillLabel, { color: crowdColor }]}>{crowdLabel}</Text>
            {isLive && <View style={styles.pillLive} />}
        </View>
    )
}

/**
 * Large hero status for venue detail page
 */
export function CourtStatusHero({ status }: { status: CourtStatus }) {
    return (
        <View style={[styles.heroContainer, { borderColor: status.crowdColor }]}>
            <Ionicons name={status.crowdIcon as any} size={64} color={status.crowdColor} style={{ marginBottom: 16 }} />
            <Text style={[styles.heroLabel, { color: status.crowdColor }]}>
                {status.crowdLabel}
            </Text>
            <Text style={styles.heroWait}>{status.predictedWait}</Text>
            <View style={styles.heroMeta}>
                <Text style={styles.heroMetaText}>
                    {status.dataFreshness === "live"
                        ? `🟢 ${status.activeCheckIns} here now`
                        : `Updated ${status.minutesSinceUpdate || "--"}m ago`
                    }
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A2E",
        borderRadius: 16,
        padding: 16,
    },
    mainRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 10,
    },
    statusEmoji: {
        fontSize: 28,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 1,
    },
    waitTime: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    infoColumn: {
        alignItems: "flex-end",
    },
    updateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    livePulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(34, 197, 94, 0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    liveInner: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#22C55E",
    },
    updateText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    trendText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: 12,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    stat: {
        alignItems: "center",
        gap: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
    statLabel: {
        fontSize: 10,
        color: "#6B7280",
    },
    weatherEmoji: {
        fontSize: 16,
    },
    confidenceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    conditionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    conditionChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(34, 197, 94, 0.15)",
    },
    conditionChipNegative: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
    },
    conditionIcon: {
        fontSize: 12,
    },
    conditionLabel: {
        fontSize: 12,
        color: "#22C55E",
        fontWeight: "500",
    },
    conditionLabelNegative: {
        color: "#EF4444",
    },
    reportButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
    },
    reportButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    // Compact
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    compactIndicator: {
        width: 4,
        height: 16,
        borderRadius: 2,
    },
    compactEmoji: {
        fontSize: 14,
    },
    compactLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    // Pill
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    pillEmoji: {
        fontSize: 12,
    },
    pillLabel: {
        fontSize: 11,
        fontWeight: "700",
    },
    pillLive: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    // Hero
    heroContainer: {
        alignItems: "center",
        padding: 24,
        borderRadius: 20,
        backgroundColor: "#1A1A2E",
        borderWidth: 2,
    },
    heroEmoji: {
        fontSize: 64,
        marginBottom: 8,
    },
    heroLabel: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 2,
    },
    heroWait: {
        fontSize: 16,
        color: "#9CA3AF",
        marginTop: 4,
    },
    heroMeta: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    heroMetaText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
})
