/**
 * Pending Bookings Badge
 * 
 * Quick indicator of bookings needing approval.
 * One-tap to review pending requests.
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Props = {
    pendingCount: number
    onPress: () => void
    variant?: "badge" | "card"
}

export function PendingBookingsBadge({ pendingCount, onPress, variant = "badge" }: Props) {
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        if (pendingCount > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start()
        }
    }, [pendingCount])

    if (pendingCount === 0 && variant === "badge") return null

    if (variant === "badge") {
        return (
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    onPress()
                }}
            >
                <Animated.View
                    style={[
                        styles.badge,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                >
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                </Animated.View>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity
            style={[styles.card, pendingCount > 0 && styles.cardActive]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                onPress()
            }}
        >
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, pendingCount > 0 && styles.iconActive]}>
                    <Ionicons
                        name="time"
                        size={20}
                        color={pendingCount > 0 ? "#F59E0B" : "#666"}
                    />
                </View>
                <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>Pending Bookings</Text>
                    <Text style={[styles.cardSubtitle, pendingCount > 0 && styles.subtitleActive]}>
                        {pendingCount === 0
                            ? "No pending requests"
                            : `${pendingCount} request${pendingCount > 1 ? "s" : ""} waiting`
                        }
                    </Text>
                </View>
            </View>
            {pendingCount > 0 && (
                <View style={styles.countCircle}>
                    <Text style={styles.countText}>{pendingCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    badge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#F59E0B",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    badgeText: {
        color: "#000",
        fontSize: 12,
        fontWeight: "800",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    cardActive: {
        borderColor: "#F59E0B40",
        backgroundColor: "#F59E0B08",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#252525",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    iconActive: {
        backgroundColor: "#F59E0B20",
    },
    cardText: {},
    cardTitle: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    cardSubtitle: {
        color: "#666",
        fontSize: 12,
        marginTop: 2,
    },
    subtitleActive: {
        color: "#F59E0B",
    },
    countCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F59E0B",
        alignItems: "center",
        justifyContent: "center",
    },
    countText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "800",
    },
})

export default PendingBookingsBadge
