/**
 * HistoricalComparison
 * 
 * Shows how current court activity compares to historical averages:
 * - "Quieter than usual for Friday 5pm"
 * - "About average for this time"
 * - "Busier than usual"
 */

import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface HistoricalComparisonProps {
    playersNow: number
    historicalAverage: number
    dayName?: string
    timeLabel?: string // e.g., "5pm", "afternoon"
}

type ComparisonResult = "quieter" | "average" | "busier"

function getComparison(current: number, average: number): ComparisonResult {
    const diff = current - average
    const percentDiff = average > 0 ? (diff / average) * 100 : 0

    if (percentDiff < -20) return "quieter"
    if (percentDiff > 20) return "busier"
    return "average"
}

const COMPARISON_CONFIG: Record<ComparisonResult, {
    icon: string
    color: string
    bgColor: string
    prefix: string
}> = {
    quieter: {
        icon: "trending-down",
        color: "#22C55E",
        bgColor: "rgba(34, 197, 94, 0.1)",
        prefix: "Quieter than usual",
    },
    average: {
        icon: "remove",
        color: "#6B7280",
        bgColor: "rgba(107, 114, 128, 0.1)",
        prefix: "About average",
    },
    busier: {
        icon: "trending-up",
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        prefix: "Busier than usual",
    },
}

export function HistoricalComparison({
    playersNow,
    historicalAverage,
    dayName,
    timeLabel
}: HistoricalComparisonProps) {
    const comparison = getComparison(playersNow, historicalAverage)
    const config = COMPARISON_CONFIG[comparison]

    // Build context string
    let contextStr = ""
    if (dayName && timeLabel) {
        contextStr = ` for ${dayName} ${timeLabel}`
    } else if (dayName) {
        contextStr = ` for ${dayName}`
    } else if (timeLabel) {
        contextStr = ` for ${timeLabel}`
    }

    return (
        <View style={[styles.container, { backgroundColor: config.bgColor }]}>
            <Ionicons
                name={config.icon as any}
                size={14}
                color={config.color}
            />
            <Text style={[styles.text, { color: config.color }]}>
                {config.prefix}{contextStr}
            </Text>
        </View>
    )
}

/**
 * Compact inline version
 */
export function HistoricalComparisonInline({
    playersNow,
    historicalAverage
}: Pick<HistoricalComparisonProps, "playersNow" | "historicalAverage">) {
    const comparison = getComparison(playersNow, historicalAverage)
    const config = COMPARISON_CONFIG[comparison]

    return (
        <View style={styles.inlineContainer}>
            <Ionicons
                name={config.icon as any}
                size={10}
                color={config.color}
            />
            <Text style={[styles.inlineText, { color: config.color }]}>
                {comparison === "quieter" ? "↓ Less busy" :
                    comparison === "busier" ? "↑ More busy" :
                        "≈ Average"}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    text: {
        fontSize: 12,
        fontWeight: "500",
    },
    inlineContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    inlineText: {
        fontSize: 10,
        fontWeight: "600",
    },
})

export default HistoricalComparison
