/**
 * Local Trainer Spotlight
 * 
 * Horizontal scroll wheel featuring top-rated local trainers
 * Only shown in priority launch cities
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { PRIORITY_LAUNCH_CITIES, getLaunchCity, isPriorityCity } from "@/lib/launch-cities"

type Trainer = {
    id: string
    name: string
    avatar?: string
    sport: string
    rating: number
    reviewCount: number
    price: number
    cityId: string
}

type Props = {
    trainers: Trainer[]
    cityId?: string
    onTrainerPress?: (trainerId: string) => void
}

// City display names
const CITY_NAMES: Record<string, string> = {
    "new-york": "NYC",
    "san-francisco": "SF",
    "myrtle-beach": "Myrtle Beach",
}

export function LocalTrainerSpotlight({ trainers, cityId, onTrainerPress }: Props) {
    // Only show in priority cities
    if (!cityId || !isPriorityCity(cityId)) return null
    if (trainers.length === 0) return null

    const cityName = CITY_NAMES[cityId] || "Local"

    const handlePress = (trainerId: string) => {
        if (onTrainerPress) {
            onTrainerPress(trainerId)
        } else {
            router.push(`/trainers/${trainerId}`)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="star" size={18} color="#FBBF24" />
                    <Text style={styles.title}>Featured in {cityName}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/trainers")}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {trainers.map((trainer) => (
                    <TouchableOpacity
                        key={trainer.id}
                        style={styles.trainerCard}
                        onPress={() => handlePress(trainer.id)}
                    >
                        <View style={styles.avatarContainer}>
                            {trainer.avatar ? (
                                <Image source={{ uri: trainer.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={32} color="#666" />
                                </View>
                            )}
                            <View style={styles.featuredBadge}>
                                <Ionicons name="ribbon" size={12} color="#FFF" />
                            </View>
                        </View>

                        <Text style={styles.trainerName} numberOfLines={1}>
                            {trainer.name}
                        </Text>
                        <Text style={styles.trainerSport}>{trainer.sport}</Text>

                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={12} color="#FBBF24" />
                            <Text style={styles.ratingText}>
                                {trainer.rating.toFixed(1)} ({trainer.reviewCount})
                            </Text>
                        </View>

                        <Text style={styles.priceText}>${trainer.price}/hr</Text>
                    </TouchableOpacity>
                ))}
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
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    seeAll: {
        fontSize: 14,
        color: "#6B9B5A",
        fontWeight: "600",
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    trainerCard: {
        width: 140,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 8,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
    featuredBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#6B9B5A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#1A1A1A",
    },
    trainerName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
        textAlign: "center",
    },
    trainerSport: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 6,
    },
    ratingText: {
        fontSize: 12,
        color: "#AAA",
    },
    priceText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#6B9B5A",
        marginTop: 4,
    },
})

export default LocalTrainerSpotlight
