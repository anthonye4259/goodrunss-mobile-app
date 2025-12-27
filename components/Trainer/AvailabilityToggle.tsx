/**
 * Availability Toggle
 * 
 * Quick toggle to enable/disable bookings.
 * Shows current status and auto-responder option.
 */

import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

type Props = {
    isAvailable: boolean
    onToggle: (available: boolean) => void
    autoResponderEnabled?: boolean
    onAutoResponderToggle?: (enabled: boolean) => void
    nextAvailableDate?: Date
}

export function AvailabilityToggle({
    isAvailable,
    onToggle,
    autoResponderEnabled = false,
    onAutoResponderToggle,
    nextAvailableDate
}: Props) {
    const handleToggle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        onToggle(!isAvailable)
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.mainToggle, isAvailable ? styles.available : styles.unavailable]}
                onPress={handleToggle}
                activeOpacity={0.9}
            >
                <View style={styles.toggleContent}>
                    <View style={[styles.statusDot, isAvailable ? styles.dotActive : styles.dotInactive]} />
                    <View style={styles.textContent}>
                        <Text style={styles.statusLabel}>
                            {isAvailable ? "Accepting Bookings" : "Not Accepting"}
                        </Text>
                        <Text style={styles.statusHint}>
                            {isAvailable
                                ? "Clients can book sessions with you"
                                : nextAvailableDate
                                    ? `Back on ${formatDate(nextAvailableDate)}`
                                    : "Toggle to start accepting bookings"
                            }
                        </Text>
                    </View>
                </View>
                <View style={[styles.toggleSwitch, isAvailable && styles.switchActive]}>
                    <View style={[styles.toggleKnob, isAvailable && styles.knobActive]} />
                </View>
            </TouchableOpacity>

            {!isAvailable && onAutoResponderToggle && (
                <View style={styles.autoResponder}>
                    <View style={styles.autoResponderInfo}>
                        <Ionicons name="mail" size={16} color="#3B82F6" />
                        <View>
                            <Text style={styles.autoResponderLabel}>Auto-Responder</Text>
                            <Text style={styles.autoResponderHint}>
                                Let leads know you'll respond soon
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={autoResponderEnabled}
                        onValueChange={(val) => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            onAutoResponderToggle(val)
                        }}
                        trackColor={{ false: "#333", true: "#3B82F640" }}
                        thumbColor={autoResponderEnabled ? "#3B82F6" : "#666"}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    mainToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    available: {
        backgroundColor: "#22C55E15",
        borderColor: "#22C55E40",
    },
    unavailable: {
        backgroundColor: "#EF444415",
        borderColor: "#EF444440",
    },
    toggleContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    dotActive: {
        backgroundColor: "#22C55E",
    },
    dotInactive: {
        backgroundColor: "#EF4444",
    },
    textContent: {
        flex: 1,
    },
    statusLabel: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    statusHint: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#333",
        padding: 2,
        justifyContent: "center",
    },
    switchActive: {
        backgroundColor: "#22C55E",
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FFF",
    },
    knobActive: {
        alignSelf: "flex-end",
    },
    autoResponder: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 14,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#3B82F620",
    },
    autoResponderInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    autoResponderLabel: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    autoResponderHint: {
        color: "#666",
        fontSize: 11,
    },
})

export default AvailabilityToggle
