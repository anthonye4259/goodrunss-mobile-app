/**
 * Near Me Badge Component
 * 
 * Shows count of active courts within a radius.
 * Tapping opens the Live Map.
 */

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useUserLocation } from "@/lib/services/location-service"
import { venueService } from "@/lib/services/venue-service"

interface NearMeBadgeProps {
    radiusMiles?: number
    compact?: boolean
}

export function NearMeBadge({ radiusMiles = 1, compact = false }: NearMeBadgeProps) {
    const { location, loading: locationLoading } = useUserLocation()
    const [courtCount, setCourtCount] = useState<number | null>(null)
    const [activeCount, setActiveCount] = useState<number>(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!locationLoading && location) {
            loadNearbyCourts()
        }
    }, [locationLoading, location])

    const loadNearbyCourts = async () => {
        try {
            setLoading(true)
            // Convert miles to km for the API
            const radiusKm = radiusMiles * 1.60934
            const venues = await venueService.getVenuesNearby(location, radiusKm, undefined, 50)

            setCourtCount(venues.length)
            // Count venues with activity
            const active = venues.filter((v: any) =>
                v.currentOccupancy === "busy" ||
                v.currentOccupancy === "packed" ||
                v.needsPlayers
            ).length
            setActiveCount(active)
        } catch (error) {
            console.error("Error loading nearby courts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)/explore")
    }

    if (loading || locationLoading) {
        if (compact) return null
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color="#7ED957" />
            </View>
        )
    }

    if (compact) {
        return (
            <TouchableOpacity onPress={handlePress} style={styles.compactBadge}>
                <Ionicons name="location" size={14} color="#7ED957" />
                <Text style={styles.compactText}>
                    {courtCount} courts
                </Text>
                {activeCount > 0 && (
                    <View style={styles.activeDot} />
                )}
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="location" size={24} color="#7ED957" />
                {activeCount > 0 && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>{activeCount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    {courtCount} Courts Near You
                </Text>
                <Text style={styles.subtitle}>
                    {activeCount > 0
                        ? `${activeCount} with activity right now`
                        : `Within ${radiusMiles} mile${radiusMiles > 1 ? 's' : ''}`
                    }
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    activeBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#EF4444",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFF",
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    // Compact styles
    compactBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    compactText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#7ED957",
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#EF4444",
        marginLeft: 2,
    },
})
