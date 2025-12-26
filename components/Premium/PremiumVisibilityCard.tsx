/**
 * Premium Visibility Card
 * 
 * Shows facilities and trainers the value of premium visibility.
 * Trainers: $29/mo with AI SaaS
 * Facilities: $50/mo with AI Slot Filling
 */

import React from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

interface PremiumVisibilityCardProps {
    userType: "facility" | "trainer"
    onUpgrade: () => void
}

export function PremiumVisibilityCard({ userType, onUpgrade }: PremiumVisibilityCardProps) {
    const isFacility = userType === "facility"
    const price = isFacility ? 50 : 29

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                onUpgrade()
            }}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={isFacility ? ["#FFD700", "#FF8C00", "#FF6347"] : ["#8B5CF6", "#6366F1", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* #1 Badge */}
                <View style={styles.numberOneBadge}>
                    <Text style={styles.numberOneText}>#1</Text>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>Get Priority Visibility</Text>
                    <Text style={styles.subtitle}>
                        Be the first {isFacility ? "venue" : "trainer"} players see
                    </Text>

                    {/* Benefits - Different for trainers vs facilities */}
                    <View style={styles.benefits}>
                        <View style={styles.benefitRow}>
                            <Ionicons name="eye" size={16} color="#FFF" />
                            <Text style={styles.benefitText}>
                                Appear first in search results
                            </Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <Ionicons name="star" size={16} color="#FFF" />
                            <Text style={styles.benefitText}>
                                Featured in "Top {isFacility ? "Venues" : "Trainers"}"
                            </Text>
                        </View>
                        {isFacility ? (
                            <>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="flash" size={16} color="#FFF" />
                                    <Text style={styles.benefitText}>
                                        AI Slot Filling (auto-fill empty slots)
                                    </Text>
                                </View>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="cash" size={16} color="#FFF" />
                                    <Text style={styles.benefitText}>
                                        Reduced 5% fees (save 3%)
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="sparkles" size={16} color="#FFF" />
                                    <Text style={styles.benefitText}>
                                        AI SaaS Dashboard (CRM + analytics)
                                    </Text>
                                </View>
                                <View style={styles.benefitRow}>
                                    <Ionicons name="chatbubbles" size={16} color="#FFF" />
                                    <Text style={styles.benefitText}>
                                        GIA AI Assistant for business
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>3x</Text>
                            <Text style={styles.statLabel}>More views</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>2x</Text>
                            <Text style={styles.statLabel}>More {isFacility ? "bookings" : "clients"}</Text>
                        </View>
                    </View>
                </View>

                {/* CTA */}
                <View style={styles.ctaContainer}>
                    <View style={styles.ctaButton}>
                        <Text style={styles.ctaText}>Upgrade Now</Text>
                        <Ionicons name="arrow-forward" size={16} color={isFacility ? "#FFD700" : "#8B5CF6"} />
                    </View>
                    <Text style={styles.ctaPrice}>${price}/month</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    gradient: {
        padding: 20,
    },
    numberOneBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "#000",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    numberOneText: {
        color: "#FFD700",
        fontSize: 18,
        fontWeight: "bold",
    },
    content: {
        paddingRight: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginBottom: 16,
    },
    benefits: {
        gap: 8,
        marginBottom: 16,
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    benefitText: {
        fontSize: 13,
        color: "#FFF",
        fontWeight: "500",
    },
    statsRow: {
        flexDirection: "row",
        gap: 24,
        marginBottom: 16,
    },
    stat: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFF",
    },
    statLabel: {
        fontSize: 11,
        color: "rgba(255,255,255,0.8)",
    },
    ctaContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        gap: 8,
    },
    ctaText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    ctaPrice: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
})

export default PremiumVisibilityCard
