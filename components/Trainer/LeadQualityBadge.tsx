/**
 * Lead Quality Badge
 * 
 * Visual indicator of lead quality based on engagement signals.
 * Hot / Warm / Cold classification.
 */

import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type LeadQuality = "hot" | "warm" | "cold"

type Props = {
    quality: LeadQuality
    signals?: string[]
    variant?: "badge" | "card"
}

const QUALITY_CONFIG = {
    hot: {
        label: "Hot Lead 🔥",
        color: "#EF4444",
        bg: "#EF444420",
        icon: "flame",
        description: "High intent - respond immediately",
    },
    warm: {
        label: "Warm Lead",
        color: "#F97316",
        bg: "#F9731620",
        icon: "sunny",
        description: "Interested - follow up within 24hrs",
    },
    cold: {
        label: "Cold Lead",
        color: "#6B7280",
        bg: "#6B728020",
        icon: "snow",
        description: "Low engagement - nurture over time",
    },
}

export function LeadQualityBadge({ quality, signals, variant = "badge" }: Props) {
    const config = QUALITY_CONFIG[quality]

    if (variant === "badge") {
        return (
            <View style={[styles.badge, { backgroundColor: config.bg }]}>
                <Ionicons name={config.icon as any} size={12} color={config.color} />
                <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
        )
    }

    return (
        <View style={[styles.card, { borderColor: config.color + "40" }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as any} size={20} color={config.color} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.qualityLabel, { color: config.color }]}>{config.label}</Text>
                    <Text style={styles.description}>{config.description}</Text>
                </View>
            </View>

            {signals && signals.length > 0 && (
                <View style={styles.signals}>
                    <Text style={styles.signalsTitle}>Signals</Text>
                    <View style={styles.signalsList}>
                        {signals.map((signal, index) => (
                            <View key={index} style={styles.signalItem}>
                                <Ionicons name="checkmark-circle" size={14} color={config.color} />
                                <Text style={styles.signalText}>{signal}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    )
}

// Helper function to calculate lead quality from engagement data
export function calculateLeadQuality(engagement: {
    viewedProfile?: boolean
    messaged?: boolean
    clickedBooking?: boolean
    timeOnProfile?: number // seconds
    referredBy?: string
}): LeadQuality {
    let score = 0

    if (engagement.clickedBooking) score += 40
    if (engagement.messaged) score += 30
    if (engagement.referredBy) score += 20
    if (engagement.viewedProfile) score += 5
    if (engagement.timeOnProfile && engagement.timeOnProfile > 30) score += 5

    if (score >= 50) return "hot"
    if (score >= 20) return "warm"
    return "cold"
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    cardInfo: {
        flex: 1,
    },
    qualityLabel: {
        fontSize: 16,
        fontWeight: "700",
    },
    description: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    signals: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    signalsTitle: {
        color: "#666",
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    signalsList: {
        gap: 6,
    },
    signalItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    signalText: {
        color: "#CCC",
        fontSize: 12,
    },
})

export default LeadQualityBadge
