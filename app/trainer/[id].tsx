/**
 * Trainer Public Profile
 * 
 * What players see when they click on a trainer card.
 * Shows bio, reviews, services, availability preview, and book CTA.
 */

import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import * as Haptics from "expo-haptics"

// Mock trainer data
const MOCK_TRAINER = {
    id: "trainer-1",
    name: "Coach Mike",
    tagline: "Former D1 Player • 10+ Years Experience",
    sport: "Basketball",
    rating: 4.9,
    reviewCount: 47,
    hourlyRate: 75,
    bio: "I help players of all skill levels improve their game through personalized training. Specializing in shooting mechanics, ball handling, and basketball IQ.",
    certifications: ["NASM Certified", "First Aid/CPR", "Youth Coaching License"],
    services: [
        { id: "1", name: "1-on-1 Training", duration: 60, price: 75 },
        { id: "2", name: "Group Session (2-4)", duration: 90, price: 50 },
        { id: "3", name: "Video Analysis", duration: 30, price: 35 },
    ],
    availability: ["Mon 6-9pm", "Wed 6-9pm", "Sat 9am-2pm"],
    reviews: [
        { id: "1", userName: "Marcus T.", rating: 5, text: "Coach Mike transformed my shooting form. Highly recommend!", date: "2 weeks ago" },
        { id: "2", userName: "Sarah L.", rating: 5, text: "Great with kids. My son loves his sessions.", date: "1 month ago" },
    ],
    images: ["/trainer-placeholder.png"],
    responseTime: "Usually responds in 1 hour",
    totalSessions: 240,
}

export default function TrainerProfileScreen() {
    const { id } = useLocalSearchParams()
    const [loading, setLoading] = useState(true)
    const [trainer, setTrainer] = useState<typeof MOCK_TRAINER | null>(null)

    useEffect(() => {
        // TODO: Fetch real trainer data
        setTimeout(() => {
            setTrainer(MOCK_TRAINER)
            setLoading(false)
        }, 500)
    }, [id])

    if (loading || !trainer) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0A0A0A", "#111", "#0A0A0A"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Ionicons name="share-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarWrap}>
                            <LinearGradient colors={["#7ED957", "#22C55E"]} style={styles.avatarRing}>
                                <View style={styles.avatarInner}>
                                    <Text style={styles.avatarText}>{trainer.name.charAt(0)}</Text>
                                </View>
                            </LinearGradient>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
                            </View>
                        </View>

                        <Text style={styles.trainerName}>{trainer.name}</Text>
                        <Text style={styles.tagline}>{trainer.tagline}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <View style={styles.ratingBadge}>
                                    <Ionicons name="star" size={14} color="#FBBF24" />
                                    <Text style={styles.ratingText}>{trainer.rating}</Text>
                                </View>
                                <Text style={styles.statLabel}>{trainer.reviewCount} reviews</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{trainer.totalSessions}</Text>
                                <Text style={styles.statLabel}>Sessions</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>${trainer.hourlyRate}</Text>
                                <Text style={styles.statLabel}>per hour</Text>
                            </View>
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bioText}>{trainer.bio}</Text>
                    </View>

                    {/* Certifications */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        <View style={styles.certList}>
                            {trainer.certifications.map((cert, i) => (
                                <View key={i} style={styles.certBadge}>
                                    <Ionicons name="ribbon" size={14} color="#7ED957" />
                                    <Text style={styles.certText}>{cert}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Services */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Services</Text>
                        {trainer.services.map((service) => (
                            <View key={service.id} style={styles.serviceCard}>
                                <View style={styles.serviceLeft}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                                </View>
                                <Text style={styles.servicePrice}>${service.price}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Availability Preview */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        <View style={styles.availList}>
                            {trainer.availability.map((slot, i) => (
                                <View key={i} style={styles.availChip}>
                                    <Text style={styles.availText}>{slot}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.responseTime}>⏱️ {trainer.responseTime}</Text>
                    </View>

                    {/* Reviews */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Reviews</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {trainer.reviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.userName}</Text>
                                    <View style={styles.reviewRating}>
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Ionicons key={i} name="star" size={12} color="#FBBF24" />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>{review.text}</Text>
                                <Text style={styles.reviewDate}>{review.date}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Fixed Book CTA */}
                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        <Text style={styles.footerPrice}>${trainer.hourlyRate}</Text>
                        <Text style={styles.footerPriceLabel}>per hour</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            router.push({
                                pathname: "/book/[id]",
                                params: { id: trainer.id, name: trainer.name }
                            })
                        }}
                    >
                        <Text style={styles.bookBtnText}>Book Session</Text>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
    shareBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: 20 },

    // Profile Header
    profileHeader: { alignItems: "center", paddingVertical: 20 },
    avatarWrap: { marginBottom: 16 },
    avatarRing: { width: 100, height: 100, borderRadius: 50, padding: 3, justifyContent: "center", alignItems: "center" },
    avatarInner: { width: 94, height: 94, borderRadius: 47, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
    avatarText: { fontSize: 36, fontWeight: "700", color: "#FFF" },
    verifiedBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#0A0A0A", borderRadius: 12 },
    trainerName: { fontSize: 24, fontWeight: "700", color: "#FFF", marginBottom: 4 },
    tagline: { fontSize: 14, color: "#888", marginBottom: 16 },
    statsRow: { flexDirection: "row", alignItems: "center" },
    statItem: { alignItems: "center", paddingHorizontal: 16 },
    statDivider: { width: 1, height: 30, backgroundColor: "#333" },
    ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { fontSize: 18, fontWeight: "700", color: "#FFF" },
    statValue: { fontSize: 18, fontWeight: "700", color: "#FFF" },
    statLabel: { fontSize: 12, color: "#666", marginTop: 2 },

    // Sections
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#FFF", marginBottom: 12 },
    seeAll: { fontSize: 14, fontWeight: "600", color: "#7ED957" },
    bioText: { fontSize: 14, color: "#CCC", lineHeight: 22 },

    // Certifications
    certList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    certBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(126,217,87,0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    certText: { fontSize: 12, fontWeight: "600", color: "#7ED957" },

    // Services
    serviceCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#141414", padding: 16, borderRadius: 12, marginBottom: 8 },
    serviceLeft: {},
    serviceName: { fontSize: 14, fontWeight: "600", color: "#FFF" },
    serviceDuration: { fontSize: 12, color: "#666", marginTop: 2 },
    servicePrice: { fontSize: 18, fontWeight: "700", color: "#7ED957" },

    // Availability
    availList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    availChip: { backgroundColor: "#1A1A1A", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#333" },
    availText: { fontSize: 12, fontWeight: "600", color: "#FFF" },
    responseTime: { fontSize: 12, color: "#888" },

    // Reviews
    reviewCard: { backgroundColor: "#141414", padding: 16, borderRadius: 12, marginBottom: 8 },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    reviewerName: { fontSize: 14, fontWeight: "600", color: "#FFF" },
    reviewRating: { flexDirection: "row", gap: 2 },
    reviewText: { fontSize: 13, color: "#CCC", lineHeight: 18, marginBottom: 6 },
    reviewDate: { fontSize: 11, color: "#666" },

    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.95)",
        borderTopWidth: 1,
        borderTopColor: "#1A1A1A",
    },
    footerLeft: {},
    footerPrice: { fontSize: 20, fontWeight: "700", color: "#FFF" },
    footerPriceLabel: { fontSize: 12, color: "#666" },
    bookBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 28,
    },
    bookBtnText: { fontSize: 16, fontWeight: "700", color: "#000" },
})
