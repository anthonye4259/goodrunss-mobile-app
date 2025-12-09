/**
 * Pool Conditions Badge
 * 
 * Displays water temperature, UV index, and swim rating
 * for pool/swimming venues. Shows "Perfect for swimming!" etc.
 */

import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { getPoolConditions, getPoolQuickStats, type PoolConditions } from "@/lib/services/pool-conditions-service"

interface PoolConditionsBadgeProps {
    lat?: number
    lon?: number
    isHeated?: boolean
    isOutdoor?: boolean
    compact?: boolean
}

// Colors for swim ratings
const ratingColors = {
    perfect: "#22C55E",
    good: "#84CC16",
    okay: "#FBBF24",
    cold: "#3B82F6",
    closed: "#EF4444",
}

const ratingEmojis = {
    perfect: "🏊",
    good: "👍",
    okay: "🤔",
    cold: "🥶",
    closed: "⛔",
}

export function PoolConditionsBadge({
    lat = 40.7,
    lon = -74.0,
    isHeated = false,
    isOutdoor = true,
    compact = false,
}: PoolConditionsBadgeProps) {
    const [conditions, setConditions] = useState<PoolConditions | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConditions()
    }, [lat, lon])

    const fetchConditions = async () => {
        try {
            const data = await getPoolConditions(lat, lon, isHeated, isOutdoor)
            setConditions(data)
        } catch (error) {
            console.error("[PoolConditions] Error:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !conditions) {
        return (
            <View style={styles.compactBadge}>
                <Text style={styles.loadingText}>🌡️ Loading...</Text>
            </View>
        )
    }

    const color = ratingColors[conditions.swimRating]
    const emoji = ratingEmojis[conditions.swimRating]

    // Compact view for venue cards
    if (compact) {
        return (
            <View style={[styles.compactBadge, { backgroundColor: `${color}15` }]}>
                <Text style={styles.tempText}>{conditions.waterTempDisplay}</Text>
                <Text style={styles.compactEmoji}>{emoji}</Text>
            </View>
        )
    }

    // Full view with all details
    return (
        <View style={styles.container}>
            {/* Main swim rating */}
            <View style={[styles.ratingBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
                <Text style={styles.ratingEmoji}>{emoji}</Text>
                <Text style={[styles.ratingText, { color }]}>{conditions.swimMessage}</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
                {/* Water temp */}
                <View style={styles.stat}>
                    <Ionicons name="water" size={16} color="#3B82F6" />
                    <Text style={styles.statValue}>{conditions.waterTempDisplay}</Text>
                    <Text style={styles.statLabel}>Water</Text>
                </View>

                {/* Air temp */}
                <View style={styles.stat}>
                    <Ionicons name="thermometer" size={16} color="#F97316" />
                    <Text style={styles.statValue}>{conditions.airTempDisplay}</Text>
                    <Text style={styles.statLabel}>Air</Text>
                </View>

                {/* UV Index */}
                <View style={styles.stat}>
                    <Ionicons name="sunny" size={16} color="#FBBF24" />
                    <Text style={styles.statValue}>{conditions.uvIndex}</Text>
                    <Text style={styles.statLabel}>UV</Text>
                </View>

                {/* Crowd */}
                <View style={styles.stat}>
                    <Ionicons name="people" size={16} color="#8B5CF6" />
                    <Text style={styles.statValue}>{conditions.crowdLevel}</Text>
                    <Text style={styles.statLabel}>Crowd</Text>
                </View>
            </View>

            {/* UV Warning if needed */}
            {conditions.uvWarning && (
                <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>{conditions.uvWarning}</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    compactBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    loadingText: {
        fontSize: 12,
        color: "#666",
    },
    tempText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#3B82F6",
    },
    compactEmoji: {
        fontSize: 12,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    ratingEmoji: {
        fontSize: 20,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    stat: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 4,
    },
    statLabel: {
        fontSize: 10,
        color: "#666",
    },
    warningBadge: {
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    warningText: {
        fontSize: 12,
        color: "#F97316",
        textAlign: "center",
    },
})

export default PoolConditionsBadge
