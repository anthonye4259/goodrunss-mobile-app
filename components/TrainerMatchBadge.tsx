/**
 * TrainerMatchBadge Component
 * 
 * Displays match score and reasons for why a trainer
 * is recommended to the user.
 */

import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

interface TrainerMatchBadgeProps {
    matchScore: number
    isPerfectMatch?: boolean
    matchReasons?: string[]
    distance?: number
    showReasons?: boolean
    size?: "small" | "medium" | "large"
}

export function TrainerMatchBadge({
    matchScore,
    isPerfectMatch = false,
    matchReasons = [],
    distance,
    showReasons = true,
    size = "medium",
}: TrainerMatchBadgeProps) {
    // Get badge color based on score
    const getBadgeColors = (): [string, string] => {
        if (matchScore >= 90) return ["#7ED957", "#4ADE80"] // Green - Perfect
        if (matchScore >= 75) return ["#8B5CF6", "#A78BFA"] // Purple - Great
        if (matchScore >= 60) return ["#3B82F6", "#60A5FA"] // Blue - Good
        return ["#6B7280", "#9CA3AF"] // Gray - Okay
    }

    const getScoreLabel = (): string => {
        if (matchScore >= 90) return "Perfect Match"
        if (matchScore >= 75) return "Great Match"
        if (matchScore >= 60) return "Good Match"
        return "Potential Match"
    }

    const [startColor, endColor] = getBadgeColors()

    const sizeStyles = {
        small: { badge: styles.badgeSmall, text: styles.textSmall },
        medium: { badge: styles.badgeMedium, text: styles.textMedium },
        large: { badge: styles.badgeLarge, text: styles.textLarge },
    }

    return (
        <View style={styles.container}>
            {/* Match Score Badge */}
            <LinearGradient
                colors={[startColor, endColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.badge, sizeStyles[size].badge]}
            >
                {isPerfectMatch && (
                    <Ionicons name="sparkles" size={size === "small" ? 10 : 14} color="#fff" style={styles.icon} />
                )}
                <Text style={[styles.scoreText, sizeStyles[size].text]}>
                    {matchScore}%
                </Text>
            </LinearGradient>

            {/* Match Reasons (pills) */}
            {showReasons && matchReasons.length > 0 && (
                <View style={styles.reasonsContainer}>
                    {matchReasons.slice(0, 3).map((reason, index) => (
                        <View key={index} style={styles.reasonPill}>
                            <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Distance indicator */}
            {distance !== undefined && (
                <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={12} color="#6B7280" />
                    <Text style={styles.distanceText}>
                        {distance < 1
                            ? `${(distance * 1000).toFixed(0)}m`
                            : `${(distance * 0.621371).toFixed(1)} mi`
                        }
                    </Text>
                </View>
            )}
        </View>
    )
}

/**
 * Compact version for trainer cards
 */
export function TrainerMatchScoreCompact({
    matchScore,
    isPerfectMatch = false,
}: {
    matchScore: number
    isPerfectMatch?: boolean
}) {
    const getColor = () => {
        if (matchScore >= 90) return "#7ED957"
        if (matchScore >= 75) return "#8B5CF6"
        if (matchScore >= 60) return "#3B82F6"
        return "#9CA3AF"
    }

    return (
        <View style={[styles.compactBadge, { backgroundColor: getColor() }]}>
            {isPerfectMatch && (
                <Ionicons name="sparkles" size={10} color="#fff" style={{ marginRight: 2 }} />
            )}
            <Text style={styles.compactText}>{matchScore}%</Text>
        </View>
    )
}

/**
 * Distance badge for trainer cards
 */
export function TrainerDistanceBadge({ distance }: { distance?: number }) {
    if (distance === undefined) return null

    const distanceMiles = distance * 0.621371

    return (
        <View style={styles.distanceBadge}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.distanceBadgeText}>
                {distanceMiles < 0.1
                    ? "Very Close"
                    : distanceMiles < 1
                        ? `${(distanceMiles * 5280).toFixed(0)} ft`
                        : `${distanceMiles.toFixed(1)} mi`
                }
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
    },
    badge: {
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    badgeSmall: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeMedium: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeLarge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    icon: {
        marginRight: 4,
    },
    scoreText: {
        color: "#fff",
        fontWeight: "700",
    },
    textSmall: {
        fontSize: 11,
    },
    textMedium: {
        fontSize: 13,
    },
    textLarge: {
        fontSize: 16,
    },
    reasonsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 6,
        gap: 4,
    },
    reasonPill: {
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    reasonText: {
        fontSize: 11,
        color: "#8B5CF6",
        fontWeight: "500",
    },
    distanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 2,
    },
    distanceText: {
        fontSize: 12,
        color: "#6B7280",
    },
    compactBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    compactText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    distanceBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    distanceBadgeText: {
        fontSize: 12,
        color: "#6B7280",
    },
})
