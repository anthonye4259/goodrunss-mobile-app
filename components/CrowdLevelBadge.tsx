/**
 * CrowdLevelBadge Component
 * Waze-style crowd indicator for venue cards
 * 
 * "Quiet now" / "Busy" / "Packed"
 */

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { crowdLevelService, CrowdLevel } from "@/lib/services/crowd-level-service"

interface Props {
    venueId: string
    size?: "small" | "medium" | "large"
    showLabel?: boolean
}

export function CrowdLevelBadge({ venueId, size = "small", showLabel = true }: Props) {
    const [level, setLevel] = useState<CrowdLevel>("unknown")
    const [label, setLabel] = useState("")
    const [color, setColor] = useState("#888")

    useEffect(() => {
        loadCrowdLevel()
    }, [venueId])

    const loadCrowdLevel = async () => {
        const data = await crowdLevelService.getCurrentLevel(venueId)
        setLevel(data.level)
        setLabel(data.label)
        setColor(data.color)
    }

    if (level === "unknown") return null

    const iconSize = size === "large" ? 18 : size === "medium" ? 14 : 12
    const fontSize = size === "large" ? 14 : size === "medium" ? 12 : 10
    const paddingH = size === "large" ? 12 : size === "medium" ? 10 : 8
    const paddingV = size === "large" ? 8 : size === "medium" ? 6 : 4

    const getIcon = (): string => {
        switch (level) {
            case "quiet": return "checkmark-circle"
            case "moderate": return "time"
            case "busy": return "people"
            case "packed": return "alert-circle"
            default: return "help-circle"
        }
    }

    return (
        <View style={[
            styles.badge,
            {
                backgroundColor: color + "20",
                paddingHorizontal: paddingH,
                paddingVertical: paddingV,
            }
        ]}>
            <Ionicons name={getIcon() as any} size={iconSize} color={color} />
            {showLabel && (
                <Text style={[styles.label, { fontSize, color }]}>
                    {label}
                </Text>
            )}
        </View>
    )
}

/**
 * CrowdLevelIndicator - Inline version
 */
export function CrowdLevelIndicator({ venueId }: { venueId: string }) {
    const [data, setData] = useState<{ level: CrowdLevel; label: string; color: string } | null>(null)

    useEffect(() => {
        loadData()
    }, [venueId])

    const loadData = async () => {
        const result = await crowdLevelService.getCurrentLevel(venueId)
        setData({ level: result.level, label: result.label, color: result.color })
    }

    if (!data || data.level === "unknown") return null

    return (
        <View style={styles.indicator}>
            <View style={[styles.dot, { backgroundColor: data.color }]} />
            <Text style={[styles.indicatorText, { color: data.color }]}>
                {data.label}
            </Text>
        </View>
    )
}

/**
 * CrowdLevelChart - Hourly breakdown
 */
export function CrowdLevelChart({ venueId, isWeekend = false }: { venueId: string; isWeekend?: boolean }) {
    const chartData = crowdLevelService.getHourlyCrowdChart(isWeekend)

    const getBarColor = (level: CrowdLevel): string => {
        switch (level) {
            case "quiet": return "#7ED957"
            case "moderate": return "#FFD700"
            case "busy": return "#FF9500"
            case "packed": return "#FF6B6B"
            default: return "#333"
        }
    }

    return (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Typical Crowd Levels</Text>
            <View style={styles.chartBars}>
                {chartData.filter(d => d.hour >= 6 && d.hour <= 22).map((item) => (
                    <View key={item.hour} style={styles.barWrapper}>
                        <View style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: `${item.percentage}%`,
                                        backgroundColor: getBarColor(item.level),
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.barLabel}>
                            {item.hour > 12 ? item.hour - 12 : item.hour}
                        </Text>
                    </View>
                ))}
            </View>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#7ED957" }]} />
                    <Text style={styles.legendText}>Quiet</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#FFD700" }]} />
                    <Text style={styles.legendText}>Moderate</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
                    <Text style={styles.legendText}>Busy</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
                    <Text style={styles.legendText}>Packed</Text>
                </View>
            </View>
        </View>
    )
}

/**
 * CheckInPrompt - For crowd-sourced data (Waze style)
 */
interface CheckInPromptProps {
    venueId: string
    onCheckIn: (level: CrowdLevel) => void
}

export function CheckInPrompt({ venueId, onCheckIn }: CheckInPromptProps) {
    const levels: { level: CrowdLevel; label: string; icon: string; color: string }[] = [
        { level: "quiet", label: "Quiet", icon: "checkmark-circle", color: "#7ED957" },
        { level: "moderate", label: "Moderate", icon: "time", color: "#FFD700" },
        { level: "busy", label: "Busy", icon: "people", color: "#FF9500" },
        { level: "packed", label: "Packed", icon: "alert-circle", color: "#FF6B6B" },
    ]

    return (
        <View style={styles.checkInContainer}>
            <Text style={styles.checkInTitle}>How busy is it?</Text>
            <Text style={styles.checkInSubtitle}>Help others know what to expect</Text>
            <View style={styles.checkInOptions}>
                {levels.map((item) => (
                    <TouchableOpacity
                        key={item.level}
                        style={styles.checkInOption}
                        onPress={() => onCheckIn(item.level)}
                    >
                        <View style={[styles.checkInIconBg, { backgroundColor: item.color + "20" }]}>
                            <Ionicons name={item.icon as any} size={24} color={item.color} />
                        </View>
                        <Text style={styles.checkInLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

import { TouchableOpacity } from "react-native"

const styles = StyleSheet.create({
    // Badge styles
    badge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        gap: 4,
    },
    label: { fontWeight: "600" },

    // Indicator styles
    indicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    indicatorText: { fontSize: 12, fontWeight: "500" },

    // Chart styles
    chartContainer: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    chartTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 16 },
    chartBars: {
        flexDirection: "row",
        alignItems: "flex-end",
        height: 100,
        gap: 4,
    },
    barWrapper: { flex: 1, alignItems: "center" },
    barContainer: {
        width: "100%",
        height: 80,
        backgroundColor: "#333",
        borderRadius: 4,
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    bar: {
        width: "100%",
        borderRadius: 4,
    },
    barLabel: { color: "#666", fontSize: 10, marginTop: 4 },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginTop: 12,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { color: "#888", fontSize: 11 },

    // Check-in styles
    checkInContainer: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    checkInTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
    checkInSubtitle: { color: "#888", fontSize: 13, marginTop: 4, marginBottom: 16 },
    checkInOptions: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    checkInOption: { alignItems: "center" },
    checkInIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    checkInLabel: { color: "#AAA", fontSize: 12 },
})
