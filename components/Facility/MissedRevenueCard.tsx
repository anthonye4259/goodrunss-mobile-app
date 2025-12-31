import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

interface MissedRevenueCardProps {
    monthlyRevenue?: number
    onUpgradePress: () => void
}

export function MissedRevenueCard({ monthlyRevenue = 0, onUpgradePress }: MissedRevenueCardProps) {
    // 8% (Free) vs 5% (Premium) = 3% difference
    const potentialSavings = Math.round(monthlyRevenue * 0.03)

    if (potentialSavings <= 0) return null

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onUpgradePress}
            style={styles.container}
        >
            <LinearGradient
                colors={["#1F1F1F", "#141414"]}
                style={styles.gradient}
            >
                <View style={styles.leftContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="warning" size={20} color="#FFD700" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Action Required</Text>
                        </View>
                    </View>
                    <Text style={styles.title}>You overpaid fees this month</Text>
                    <Text style={styles.subtitle}>
                        You lost <Text style={styles.highlight}>${potentialSavings}</Text> in higher transaction fees. Upgrade to lock these savings.
                    </Text>
                </View>

                <View style={styles.rightContent}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Claim ${potentialSavings}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#000" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.3)", // Subtle gold border
    },
    gradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    leftContent: {
        flex: 1,
        paddingRight: 12,
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    badge: {
        backgroundColor: "rgba(255, 215, 0, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: "#FFD700",
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: "#9CA3AF",
        lineHeight: 18,
    },
    highlight: {
        color: "#FF6B6B", // Red for "Lost Money"
        fontWeight: "700",
    },
    rightContent: {
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#FFD700",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    buttonText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "bold",
    },
})
