/**
 * Instructor Card Component
 * 
 * Display card for wellness instructors with:
 * - Photo, name, tagline
 * - Modalities they teach
 * - Rating and follower count
 * - Follow button
 */

import React from "react"
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { FollowButton } from "@/components/FollowButton"
import type { Instructor } from "@/lib/types/wellness-instructor"
import { MODALITY_DISPLAY_NAMES, getModalityEmoji } from "@/lib/types/wellness-instructor"

interface InstructorCardProps {
    instructor: Instructor
    variant?: "full" | "compact"
    showFollowButton?: boolean
}

export function InstructorCard({
    instructor,
    variant = "full",
    showFollowButton = true,
}: InstructorCardProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push(`/instructors/${instructor.id}`)
    }

    if (variant === "compact") {
        return (
            <TouchableOpacity
                style={styles.compactCard}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: instructor.photoUrl || "https://via.placeholder.com/60" }}
                    style={styles.compactPhoto}
                />
                <View style={styles.compactInfo}>
                    <Text style={styles.compactName} numberOfLines={1}>
                        {instructor.displayName}
                    </Text>
                    <Text style={styles.compactTagline} numberOfLines={1}>
                        {instructor.tagline}
                    </Text>
                </View>
                {showFollowButton && (
                    <FollowButton instructorId={instructor.id} size="small" variant="outlined" />
                )}
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Header with photo and basic info */}
            <View style={styles.header}>
                <Image
                    source={{ uri: instructor.photoUrl || "https://via.placeholder.com/80" }}
                    style={styles.photo}
                />
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{instructor.displayName}</Text>
                    <Text style={styles.tagline}>{instructor.tagline}</Text>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text style={styles.statText}>{instructor.rating.toFixed(1)}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                            <Ionicons name="people-outline" size={14} color="#9CA3AF" />
                            <Text style={styles.statText}>
                                {formatFollowers(instructor.followerCount)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Modalities */}
            <View style={styles.modalities}>
                {instructor.modalities.slice(0, 3).map((modality, index) => (
                    <View key={index} style={styles.modalityBadge}>
                        <Text style={styles.modalityEmoji}>
                            {getModalityEmoji(modality)}
                        </Text>
                        <Text style={styles.modalityText}>
                            {MODALITY_DISPLAY_NAMES[modality]}
                        </Text>
                    </View>
                ))}
                {instructor.modalities.length > 3 && (
                    <View style={styles.modalityBadge}>
                        <Text style={styles.modalityText}>
                            +{instructor.modalities.length - 3}
                        </Text>
                    </View>
                )}
            </View>

            {/* Studios they teach at */}
            {instructor.studioNames && instructor.studioNames.length > 0 && (
                <View style={styles.studiosRow}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.studiosText} numberOfLines={1}>
                        {instructor.studioNames.slice(0, 2).join(" · ")}
                        {instructor.studioNames.length > 2 && ` +${instructor.studioNames.length - 2}`}
                    </Text>
                </View>
            )}

            {/* Follow button */}
            {showFollowButton && (
                <View style={styles.footer}>
                    <FollowButton instructorId={instructor.id} size="medium" />
                </View>
            )}
        </TouchableOpacity>
    )
}

function formatFollowers(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    header: {
        flexDirection: "row",
        marginBottom: 12,
    },
    photo: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#252525",
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    tagline: {
        fontSize: 14,
        color: "#7ED957",
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    statDivider: {
        width: 1,
        height: 12,
        backgroundColor: "#333",
        marginHorizontal: 8,
    },
    modalities: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    modalityBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#252525",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    modalityEmoji: {
        fontSize: 14,
    },
    modalityText: {
        fontSize: 12,
        color: "#D1D5DB",
    },
    studiosRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    studiosText: {
        fontSize: 13,
        color: "#6B7280",
        flex: 1,
    },
    footer: {
        alignItems: "flex-start",
    },
    // Compact variant
    compactCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    compactPhoto: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#252525",
    },
    compactInfo: {
        flex: 1,
        marginLeft: 12,
    },
    compactName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    compactTagline: {
        fontSize: 13,
        color: "#7ED957",
    },
})

export default InstructorCard
