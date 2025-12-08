/**
 * Favorites Widget
 * 
 * Shows user's favorite venues/trainers with quick access
 * and live traffic status for venues
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useState, useEffect } from "react"

interface FavoriteVenue {
    id: string
    name: string
    type: "venue" | "trainer"
    distance?: string
    traffic?: "empty" | "quiet" | "moderate" | "busy" | "packed"
    rating?: number
    sport?: string
}

// Mock favorites - in production, fetch from user data
const mockFavorites: FavoriteVenue[] = [
    {
        id: "1",
        name: "Rucker Park",
        type: "venue",
        distance: "0.3 mi",
        traffic: "moderate",
        sport: "Basketball",
    },
    {
        id: "2",
        name: "Central Park Courts",
        type: "venue",
        distance: "0.8 mi",
        traffic: "quiet",
        sport: "Tennis",
    },
    {
        id: "3",
        name: "Coach Mike",
        type: "trainer",
        rating: 4.9,
        sport: "Basketball",
    },
]

const trafficColors: Record<string, string> = {
    empty: "#22C55E",
    quiet: "#84CC16",
    moderate: "#FBBF24",
    busy: "#F97316",
    packed: "#EF4444",
}

export function FavoritesWidget() {
    const [favorites, setFavorites] = useState<FavoriteVenue[]>([])

    useEffect(() => {
        setFavorites(mockFavorites)
    }, [])

    const handlePress = (fav: FavoriteVenue) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (fav.type === "venue") {
            router.push(`/venues/${fav.id}`)
        } else {
            router.push(`/trainers/${fav.id}`)
        }
    }

    if (favorites.length === 0) return null

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>❤️ Favorites</Text>
                <TouchableOpacity onPress={() => router.push("/favorites")}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Horizontal scroll of favorites */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {favorites.map((fav) => (
                    <TouchableOpacity
                        key={`${fav.type}-${fav.id}`}
                        style={styles.favoriteCard}
                        onPress={() => handlePress(fav)}
                        activeOpacity={0.8}
                    >
                        {/* Icon */}
                        <View style={[
                            styles.iconContainer,
                            { backgroundColor: fav.type === "venue" ? "rgba(126, 217, 87, 0.2)" : "rgba(139, 92, 246, 0.2)" }
                        ]}>
                            <Ionicons
                                name={fav.type === "venue" ? "location" : "person"}
                                size={24}
                                color={fav.type === "venue" ? "#7ED957" : "#8B5CF6"}
                            />
                        </View>

                        {/* Info */}
                        <Text style={styles.favName} numberOfLines={1}>{fav.name}</Text>

                        {/* Traffic or Rating */}
                        {fav.type === "venue" && fav.traffic && (
                            <View style={styles.trafficRow}>
                                <View style={[styles.trafficDot, { backgroundColor: trafficColors[fav.traffic] }]} />
                                <Text style={[styles.trafficText, { color: trafficColors[fav.traffic] }]}>
                                    {fav.traffic.charAt(0).toUpperCase() + fav.traffic.slice(1)}
                                </Text>
                            </View>
                        )}

                        {fav.type === "trainer" && fav.rating && (
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={12} color="#FBBF24" />
                                <Text style={styles.ratingText}>{fav.rating}</Text>
                            </View>
                        )}

                        {/* Distance */}
                        {fav.distance && (
                            <Text style={styles.distance}>{fav.distance}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Add Favorite Button */}
                <TouchableOpacity
                    style={styles.addCard}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        router.push("/(tabs)/explore")
                    }}
                >
                    <View style={styles.addIcon}>
                        <Ionicons name="add" size={28} color="#666" />
                    </View>
                    <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    seeAll: {
        fontSize: 14,
        fontWeight: "600",
        color: "#7ED957",
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 12,
    },
    favoriteCard: {
        width: 110,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    favName: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 6,
    },
    trafficRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    trafficDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    trafficText: {
        fontSize: 10,
        fontWeight: "600",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FBBF24",
    },
    distance: {
        fontSize: 10,
        color: "#666",
        marginTop: 4,
    },
    addCard: {
        width: 80,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#252525",
        borderStyle: "dashed",
    },
    addIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 8,
    },
    addText: {
        fontSize: 12,
        color: "#666",
    },
})

export default FavoritesWidget
