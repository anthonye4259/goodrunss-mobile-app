/**
 * Favorites Widget
 * 
 * Shows user's favorite venues/trainers with quick access
 * and LIVE traffic status from Firestore (pre-computed every 30 min)
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useState, useEffect } from "react"
import { useVenueTraffic, getTrafficColor } from "@/lib/hooks/useVenueTraffic"

interface FavoriteItem {
    id: string
    name: string
    type: "venue" | "trainer"
    distance?: string
    traffic?: { level: string; emoji?: string; color?: string }
    rating?: number
    sport?: string
}

const trafficColors: Record<string, string> = {
    empty: "#22C55E",
    quiet: "#84CC16",
    low: "#84CC16",
    moderate: "#FBBF24",
    busy: "#F97316",
    packed: "#EF4444",
}

export function FavoritesWidget() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([])

    // Fetch real traffic data from Firestore
    const { venues, loading } = useVenueTraffic({ limit: 5 })

    useEffect(() => {
        // Transform Firestore venues into favorite items with live traffic
        if (venues.length > 0) {
            const venueItems: FavoriteItem[] = venues.slice(0, 3).map(v => ({
                id: v.id,
                name: v.name,
                type: "venue" as const,
                distance: v.distance || "Nearby",
                traffic: v.traffic ? {
                    level: v.traffic.level,
                    emoji: v.traffic.emoji,
                    color: v.traffic.color,
                } : undefined,
            }))

            // Add a sample trainer (trainers don't have traffic)
            const trainerItem: FavoriteItem = {
                id: "trainer_1",
                name: "Coach Mike",
                type: "trainer",
                rating: 4.9,
                sport: "Basketball",
            }

            setFavorites([...venueItems, trainerItem])
        } else {
            // Fallback mock data if no venues in Firestore
            setFavorites([
                { id: "1", name: "Rucker Park", type: "venue", distance: "0.3 mi", traffic: { level: "moderate" }, sport: "Basketball" },
                { id: "2", name: "Central Park Courts", type: "venue", distance: "0.8 mi", traffic: { level: "quiet" }, sport: "Tennis" },
                { id: "3", name: "Coach Mike", type: "trainer", rating: 4.9, sport: "Basketball" },
            ])
        }
    }, [venues])

    const handlePress = (fav: FavoriteItem) => {
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

                        {/* Traffic or Rating - NOW USES LIVE DATA */}
                        {fav.type === "venue" && fav.traffic && (
                            <View style={styles.trafficRow}>
                                <View style={[styles.trafficDot, { backgroundColor: fav.traffic.color || trafficColors[fav.traffic.level] }]} />
                                <Text style={[styles.trafficText, { color: fav.traffic.color || trafficColors[fav.traffic.level] }]}>
                                    {fav.traffic.level.charAt(0).toUpperCase() + fav.traffic.level.slice(1)}
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
