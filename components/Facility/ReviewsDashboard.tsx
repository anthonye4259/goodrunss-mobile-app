/**
 * Reviews Dashboard
 * 
 * Quick view of recent reviews with ratings.
 * Option to respond to reviews.
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

type Review = {
    id: string
    customerName: string
    rating: number
    text: string
    createdAt: Date
    responded: boolean
    courtUsed?: string
}

type Props = {
    reviews: Review[]
    averageRating: number
    totalReviews: number
    onRespond: (reviewId: string) => void
    onViewAll: () => void
}

export function ReviewsDashboard({ reviews, averageRating, totalReviews, onRespond, onViewAll }: Props) {
    const recentReviews = reviews.slice(0, 3)
    const unrepliedCount = reviews.filter(r => !r.responded).length

    const formatDate = (date: Date) => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        if (diff === 0) return "Today"
        if (diff === 1) return "Yesterday"
        if (diff < 7) return `${diff}d ago`
        return date.toLocaleDateString()
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "#22C55E"
        if (rating >= 4) return "#7ED957"
        if (rating >= 3) return "#F59E0B"
        return "#EF4444"
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="star" size={20} color="#FBBF24" />
                    <Text style={styles.title}>Reviews</Text>
                </View>

                <View style={styles.ratingDisplay}>
                    <Text style={[styles.ratingNumber, { color: getRatingColor(averageRating) }]}>
                        {averageRating.toFixed(1)}
                    </Text>
                    <View style={styles.starsRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < Math.round(averageRating) ? "star" : "star-outline"}
                                size={10}
                                color="#FBBF24"
                            />
                        ))}
                    </View>
                    <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
                </View>
            </View>

            {unrepliedCount > 0 && (
                <View style={styles.unrepliedAlert}>
                    <Ionicons name="chatbubble-outline" size={14} color="#3B82F6" />
                    <Text style={styles.unrepliedText}>
                        {unrepliedCount} review{unrepliedCount > 1 ? "s" : ""} waiting for response
                    </Text>
                </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.reviewsRow}>
                    {recentReviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.starsRow}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Ionicons
                                            key={i}
                                            name={i < review.rating ? "star" : "star-outline"}
                                            size={12}
                                            color="#FBBF24"
                                        />
                                    ))}
                                </View>
                                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                            </View>

                            <Text style={styles.reviewerName}>{review.customerName}</Text>
                            <Text style={styles.reviewText} numberOfLines={3}>{review.text}</Text>

                            {!review.responded && (
                                <TouchableOpacity
                                    style={styles.respondButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                        onRespond(review.id)
                                    }}
                                >
                                    <Ionicons name="chatbubble" size={12} color="#3B82F6" />
                                    <Text style={styles.respondText}>Respond</Text>
                                </TouchableOpacity>
                            )}

                            {review.responded && (
                                <View style={styles.respondedBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                                    <Text style={styles.respondedText}>Responded</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    onViewAll()
                }}
            >
                <Text style={styles.viewAllText}>View All Reviews</Text>
                <Ionicons name="chevron-forward" size={14} color="#FBBF24" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#FBBF2430",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    ratingDisplay: {
        alignItems: "flex-end",
    },
    ratingNumber: {
        fontSize: 24,
        fontWeight: "800",
    },
    starsRow: {
        flexDirection: "row",
        gap: 1,
    },
    totalReviews: {
        color: "#666",
        fontSize: 10,
        marginTop: 2,
    },
    unrepliedAlert: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#3B82F620",
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
    },
    unrepliedText: {
        color: "#3B82F6",
        fontSize: 12,
        fontWeight: "500",
    },
    reviewsRow: {
        flexDirection: "row",
        gap: 12,
    },
    reviewCard: {
        width: 220,
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        padding: 14,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    reviewDate: {
        color: "#666",
        fontSize: 10,
    },
    reviewerName: {
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
    },
    reviewText: {
        color: "#888",
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 10,
    },
    respondButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        backgroundColor: "#3B82F620",
        paddingVertical: 8,
        borderRadius: 8,
    },
    respondText: {
        color: "#3B82F6",
        fontSize: 11,
        fontWeight: "600",
    },
    respondedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    respondedText: {
        color: "#22C55E",
        fontSize: 10,
        fontWeight: "500",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingTop: 14,
        marginTop: 4,
    },
    viewAllText: {
        color: "#FBBF24",
        fontSize: 13,
        fontWeight: "600",
    },
})

export default ReviewsDashboard
