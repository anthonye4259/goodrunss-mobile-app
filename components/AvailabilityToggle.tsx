/**
 * Availability Toggle Component
 * 
 * Quick on/off toggle for trainers/instructors to indicate
 * if they're currently available for bookings.
 */

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"

interface AvailabilityToggleProps {
    compact?: boolean // Smaller version for header
    onStatusChange?: (isAvailable: boolean) => void
}

export function AvailabilityToggle({ compact = false, onStatusChange }: AvailabilityToggleProps) {
    const { user } = useAuth()
    const [isAvailable, setIsAvailable] = useState(true)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        loadAvailabilityStatus()
    }, [])

    const loadAvailabilityStatus = async () => {
        try {
            // Check local storage first
            const stored = await AsyncStorage.getItem("trainer_availability")
            if (stored !== null) {
                setIsAvailable(stored === "true")
            }
            setLoading(false)
        } catch (error) {
            console.error("Error loading availability:", error)
            setLoading(false)
        }
    }

    const toggleAvailability = async () => {
        const newStatus = !isAvailable

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setIsAvailable(newStatus)
        setSyncing(true)

        try {
            // Save locally
            await AsyncStorage.setItem("trainer_availability", String(newStatus))

            // Sync with Firebase
            if (db && user?.id) {
                await updateDoc(doc(db, "users", user.id), {
                    isAvailable: newStatus,
                    availabilityUpdatedAt: new Date().toISOString(),
                })
            }

            onStatusChange?.(newStatus)
        } catch (error) {
            console.error("Error updating availability:", error)
            // Revert on error
            setIsAvailable(!newStatus)
        } finally {
            setSyncing(false)
        }
    }

    if (loading) {
        return (
            <View style={compact ? styles.compactContainer : styles.container}>
                <ActivityIndicator size="small" color="#7ED957" />
            </View>
        )
    }

    if (compact) {
        return (
            <TouchableOpacity
                onPress={toggleAvailability}
                style={[
                    styles.compactContainer,
                    isAvailable ? styles.compactAvailable : styles.compactUnavailable,
                ]}
                disabled={syncing}
            >
                <View
                    style={[
                        styles.compactDot,
                        isAvailable ? styles.dotAvailable : styles.dotUnavailable,
                    ]}
                />
                <Text style={[
                    styles.compactText,
                    isAvailable ? styles.textAvailable : styles.textUnavailable,
                ]}>
                    {syncing ? "..." : (isAvailable ? "Available" : "Unavailable")}
                </Text>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity
            onPress={toggleAvailability}
            style={[
                styles.container,
                isAvailable ? styles.containerAvailable : styles.containerUnavailable,
            ]}
            disabled={syncing}
        >
            <View style={styles.leftContent}>
                <View
                    style={[
                        styles.statusDot,
                        isAvailable ? styles.dotAvailable : styles.dotUnavailable,
                    ]}
                />
                <View>
                    <Text style={styles.title}>Availability</Text>
                    <Text style={[
                        styles.status,
                        isAvailable ? styles.textAvailable : styles.textUnavailable,
                    ]}>
                        {isAvailable ? "✅ Taking bookings" : "⏸️ Not taking bookings"}
                    </Text>
                </View>
            </View>

            <View style={styles.toggleContainer}>
                {syncing ? (
                    <ActivityIndicator size="small" color={isAvailable ? "#7ED957" : "#6B7280"} />
                ) : (
                    <View
                        style={[
                            styles.toggle,
                            isAvailable ? styles.toggleOn : styles.toggleOff,
                        ]}
                    >
                        <View
                            style={[
                                styles.toggleKnob,
                                isAvailable ? styles.knobOn : styles.knobOff,
                            ]}
                        />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    containerAvailable: {
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderColor: "rgba(126, 217, 87, 0.3)",
    },
    containerUnavailable: {
        backgroundColor: "rgba(107, 114, 128, 0.1)",
        borderColor: "rgba(107, 114, 128, 0.3)",
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    dotAvailable: {
        backgroundColor: "#7ED957",
        shadowColor: "#7ED957",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    dotUnavailable: {
        backgroundColor: "#6B7280",
    },
    title: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 2,
    },
    status: {
        fontSize: 15,
        fontWeight: "600",
    },
    textAvailable: {
        color: "#7ED957",
    },
    textUnavailable: {
        color: "#6B7280",
    },
    toggleContainer: {
        width: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    toggle: {
        width: 48,
        height: 26,
        borderRadius: 13,
        padding: 2,
        justifyContent: "center",
    },
    toggleOn: {
        backgroundColor: "#7ED957",
    },
    toggleOff: {
        backgroundColor: "#3A3A3A",
    },
    toggleKnob: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#FFFFFF",
    },
    knobOn: {
        alignSelf: "flex-end",
    },
    knobOff: {
        alignSelf: "flex-start",
    },
    // Compact styles
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    compactAvailable: {
        backgroundColor: "rgba(126, 217, 87, 0.2)",
    },
    compactUnavailable: {
        backgroundColor: "rgba(107, 114, 128, 0.2)",
    },
    compactDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    compactText: {
        fontSize: 12,
        fontWeight: "600",
    },
})
