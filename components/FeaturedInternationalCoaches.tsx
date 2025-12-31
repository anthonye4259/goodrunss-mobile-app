/**
 * Featured International Coaches Section
 * 
 * Displays international trainers for U.S. players
 * "Train with coaches from Spain, Dubai, UK"
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { trainerProService } from "@/lib/services/trainer-pro-service"

type InternationalTrainer = {
    id: string
    name: string
    avatar: string | null
    city: string
    country: string
    countryFlag: string
    sport: string
    rating: number
    reviewCount: number
    isVerified: boolean
    tagline: string
    languages: string[]
    priceRange: string
    specialties: string[]
}

type Props = {
    limit?: number
    sport?: string
}

export function FeaturedInternationalCoaches({ limit = 5, sport }: Props) {
    const [trainers, setTrainers] = useState<InternationalTrainer[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTrainers()
    }, [sport])

    const loadTrainers = async () => {
        try {
            const featured = await trainerProService.getFeaturedInternationalTrainers({ sport, limit })
            setTrainers(featured)
        } catch (error) {
            console.error("Error loading international trainers:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTrainerPress = (trainer: InternationalTrainer) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push({
            pathname: "/trainers/[id]",
            params: { id: trainer.id },
        })
    }

    const handleSeeAll = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/remote-training/train-abroad")
    }

    if (loading || trainers.length === 0) return null

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>🌍 Train with International Pros</Text>
                    <Text style={styles.subtitle}>
                        Remote coaching from Spain, Dubai, UK & more
                    </Text>
                </View>
                <TouchableOpacity onPress={handleSeeAll}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            {/* Trainers Carousel */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
            >
                {trainers.map(trainer => (
                    <TouchableOpacity
                        key={trainer.id}
                        style={styles.trainerCard}
                        onPress={() => handleTrainerPress(trainer)}
                    >
                        <LinearGradient
                            colors={["#1A1A1A", "#0F0F0F"]}
                            style={styles.cardGradient}
                        >
                            {/* Flag + Location */}
                            <View style={styles.locationRow}>
                                <Text style={styles.flag}>{trainer.countryFlag}</Text>
                                <Text style={styles.location}>
                                    {trainer.city}, {trainer.country}
                                </Text>
                                {trainer.isVerified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#6B9B5A" />
                                    </View>
                                )}
                            </View>

                            {/* Avatar */}
                            <View style={styles.avatar}>
                                <Text style={styles.avatarInitial}>
                                    {trainer.name.charAt(0)}
                                </Text>
                            </View>

                            {/* Name & Sport */}
                            <Text style={styles.trainerName}>{trainer.name}</Text>
                            <View style={styles.sportBadge}>
                                <Text style={styles.sportText}>{trainer.sport}</Text>
                            </View>

                            {/* Tagline */}
                            <Text style={styles.tagline} numberOfLines={2}>
                                {trainer.tagline}
                            </Text>

                            {/* Rating */}
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={12} color="#FBBF24" />
                                <Text style={styles.rating}>
                                    {trainer.rating} ({trainer.reviewCount})
                                </Text>
                            </View>

                            {/* Price */}
                            <Text style={styles.price}>{trainer.priceRange}</Text>

                            {/* Languages */}
                            <View style={styles.languagesRow}>
                                <Ionicons name="language" size={12} color="#888" />
                                <Text style={styles.languages}>
                                    {trainer.languages.join(", ")}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}

                {/* CTA Card */}
                <TouchableOpacity style={styles.ctaCard} onPress={handleSeeAll}>
                    <LinearGradient
                        colors={["#6B9B5A20", "#0F0F0F"]}
                        style={styles.ctaGradient}
                    >
                        <Ionicons name="globe-outline" size={32} color="#6B9B5A" />
                        <Text style={styles.ctaTitle}>Browse All</Text>
                        <Text style={styles.ctaSubtitle}>
                            Explore 50+ international coaches
                        </Text>
                        <View style={styles.ctaButton}>
                            <Text style={styles.ctaButtonText}>View Directory</Text>
                            <Ionicons name="arrow-forward" size={14} color="#6B9B5A" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    subtitle: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    seeAll: {
        fontSize: 14,
        color: "#6B9B5A",
        fontWeight: "600",
    },
    carousel: {
        paddingHorizontal: 16,
        gap: 12,
    },
    trainerCard: {
        width: 200,
        borderRadius: 16,
        overflow: "hidden",
    },
    cardGradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
        height: 260,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    flag: {
        fontSize: 16,
        marginRight: 6,
    },
    location: {
        fontSize: 11,
        color: "#888",
        flex: 1,
    },
    verifiedBadge: {
        marginLeft: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    trainerName: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#FFF",
    },
    sportBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#2A2A2A",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
    },
    sportText: {
        fontSize: 10,
        color: "#6B9B5A",
        fontWeight: "600",
    },
    tagline: {
        fontSize: 11,
        color: "#AAA",
        marginTop: 8,
        lineHeight: 16,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 4,
    },
    rating: {
        fontSize: 11,
        color: "#AAA",
    },
    price: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#6B9B5A",
        marginTop: 4,
    },
    languagesRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        gap: 4,
    },
    languages: {
        fontSize: 10,
        color: "#666",
    },
    ctaCard: {
        width: 160,
        borderRadius: 16,
        overflow: "hidden",
    },
    ctaGradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#6B9B5A40",
        borderRadius: 16,
        height: 260,
        alignItems: "center",
        justifyContent: "center",
    },
    ctaTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 12,
    },
    ctaSubtitle: {
        fontSize: 11,
        color: "#888",
        textAlign: "center",
        marginTop: 4,
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#6B9B5A20",
        borderRadius: 8,
    },
    ctaButtonText: {
        fontSize: 12,
        color: "#6B9B5A",
        fontWeight: "600",
    },
})

export default FeaturedInternationalCoaches
