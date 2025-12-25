/**
 * VenueReviews Component
 * Displays reviews and ratings for a venue
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { reviewService, Review, VenueRatingSummary } from "@/lib/services/review-service"

interface Props {
    venueId: string
    venueName: string
}

export function VenueReviews({ venueId, venueName }: Props) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [reviews, setReviews] = useState<Review[]>([])
    const [summary, setSummary] = useState<VenueRatingSummary | null>(null)
    const [showWriteReview, setShowWriteReview] = useState(false)
    const [newRating, setNewRating] = useState(0)
    const [newText, setNewText] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadReviews()
    }, [venueId])

    const loadReviews = async () => {
        setLoading(true)
        try {
            const [reviewsData, summaryData] = await Promise.all([
                reviewService.getVenueReviews(venueId, { limit: 5 }),
                reviewService.getVenueRatingSummary(venueId),
            ])
            setReviews(reviewsData)
            setSummary(summaryData)
        } catch (error) {
            console.error("Error loading reviews:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!user || newRating === 0 || !newText.trim()) {
            Alert.alert("Missing Info", "Please add a rating and review text")
            return
        }

        setSubmitting(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await reviewService.createReview({
                venueId,
                venueName,
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                userPhoto: user.photoURL || undefined,
                rating: newRating,
                text: newText.trim(),
            })

            setShowWriteReview(false)
            setNewRating(0)
            setNewText("")
            loadReviews()

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert("Thank you!", "Your review has been submitted")
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to submit review")
        } finally {
            setSubmitting(false)
        }
    }

    const handleHelpful = async (reviewId: string) => {
        if (!user) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await reviewService.markHelpful(reviewId, user.uid)
        loadReviews()
    }

    const formatDate = (date: Date) => {
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const renderStars = (rating: number, size = 16, interactive = false, onPress?: (star: number) => void) => (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    disabled={!interactive}
                    onPress={() => onPress && onPress(star)}
                >
                    <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={size}
                        color={star <= rating ? "#FFD700" : "#444"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    )

    const renderRatingBar = (stars: number, count: number, total: number) => {
        const percentage = total > 0 ? (count / total) * 100 : 0
        return (
            <View key={stars} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{stars}</Text>
                <Ionicons name="star" size={12} color="#FFD700" />
                <View style={styles.ratingBarTrack}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.ratingBarCount}>{count}</Text>
            </View>
        )
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Reviews</Text>
                <TouchableOpacity
                    style={styles.writeBtn}
                    onPress={() => setShowWriteReview(!showWriteReview)}
                >
                    <Ionicons name="create-outline" size={18} color="#7ED957" />
                    <Text style={styles.writeBtnText}>Write Review</Text>
                </TouchableOpacity>
            </View>

            {/* Summary */}
            {summary && summary.totalReviews > 0 && (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryLeft}>
                        <Text style={styles.summaryRating}>
                            {summary.averageRating.toFixed(1)}
                        </Text>
                        {renderStars(Math.round(summary.averageRating))}
                        <Text style={styles.summaryCount}>
                            {summary.totalReviews} review{summary.totalReviews !== 1 ? "s" : ""}
                        </Text>
                    </View>
                    <View style={styles.summaryRight}>
                        {[5, 4, 3, 2, 1].map((stars) =>
                            renderRatingBar(stars, summary.distribution[stars] || 0, summary.totalReviews)
                        )}
                    </View>
                </View>
            )}

            {/* Write Review Form */}
            {showWriteReview && (
                <View style={styles.writeForm}>
                    <Text style={styles.writeFormTitle}>Your Rating</Text>
                    {renderStars(newRating, 32, true, setNewRating)}

                    <TextInput
                        style={styles.reviewInput}
                        value={newText}
                        onChangeText={setNewText}
                        placeholder="Share your experience..."
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitBtn, (newRating === 0 || submitting) && styles.submitBtnDisabled]}
                        onPress={handleSubmitReview}
                        disabled={newRating === 0 || submitting}
                    >
                        <Text style={styles.submitBtnText}>
                            {submitting ? "Submitting..." : "Submit Review"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="chatbubble-outline" size={32} color="#333" />
                    <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
                </View>
            ) : (
                reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewerInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {review.userName?.charAt(0).toUpperCase() || "?"}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.reviewerName}>{review.userName}</Text>
                                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                                </View>
                            </View>
                            {renderStars(review.rating)}
                        </View>

                        <Text style={styles.reviewText}>{review.text}</Text>

                        {review.hasVerifiedBooking && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#7ED957" />
                                <Text style={styles.verifiedText}>Verified Booking</Text>
                            </View>
                        )}

                        {review.ownerResponse && (
                            <View style={styles.ownerResponse}>
                                <Text style={styles.ownerResponseLabel}>Owner Response:</Text>
                                <Text style={styles.ownerResponseText}>{review.ownerResponse}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.helpfulBtn}
                            onPress={() => handleHelpful(review.id)}
                        >
                            <Ionicons name="thumbs-up-outline" size={14} color="#888" />
                            <Text style={styles.helpfulText}>
                                Helpful ({review.helpfulCount || 0})
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { marginTop: 24 },
    loadingContainer: { padding: 40, alignItems: "center" },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
    writeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    writeBtnText: { color: "#7ED957", fontSize: 14, fontWeight: "600" },

    summaryCard: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    summaryLeft: { alignItems: "center", paddingRight: 20, borderRightWidth: 1, borderRightColor: "#333" },
    summaryRating: { color: "#FFF", fontSize: 48, fontWeight: "bold" },
    summaryCount: { color: "#888", fontSize: 12, marginTop: 8 },
    summaryRight: { flex: 1, paddingLeft: 20, justifyContent: "center" },
    starsRow: { flexDirection: "row", gap: 2 },

    ratingBarRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
    ratingBarLabel: { color: "#888", fontSize: 12, width: 12 },
    ratingBarTrack: {
        flex: 1,
        height: 6,
        backgroundColor: "#333",
        borderRadius: 3,
        marginHorizontal: 8,
    },
    ratingBarFill: { height: "100%", backgroundColor: "#7ED957", borderRadius: 3 },
    ratingBarCount: { color: "#888", fontSize: 11, width: 24, textAlign: "right" },

    writeForm: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    writeFormTitle: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },
    reviewInput: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        minHeight: 100,
        marginTop: 16,
    },
    submitBtn: {
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 16,
        alignItems: "center",
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },

    emptyState: { alignItems: "center", paddingVertical: 32 },
    emptyText: { color: "#666", fontSize: 16, marginTop: 12 },

    reviewCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    reviewerInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    reviewerName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    reviewDate: { color: "#888", fontSize: 12, marginTop: 2 },
    reviewText: { color: "#CCC", fontSize: 15, lineHeight: 22 },

    verifiedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 12,
    },
    verifiedText: { color: "#7ED957", fontSize: 12 },

    ownerResponse: {
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    ownerResponseLabel: { color: "#7ED957", fontSize: 12, fontWeight: "600", marginBottom: 4 },
    ownerResponseText: { color: "#AAA", fontSize: 14 },

    helpfulBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 12,
        alignSelf: "flex-start",
    },
    helpfulText: { color: "#888", fontSize: 13 },
})
