/**
 * Instructor Profile Screen
 * 
 * Full profile page for wellness instructors showing:
 * - Cover photo and profile photo
 * - Bio, tagline, modalities
 * - Upcoming classes
 * - Private session booking
 * - Follow button
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"

import { FollowButton } from "@/components/FollowButton"
import { ErrorBoundary } from "@/components/error-boundary"
import { getInstructorById, getInstructorClasses } from "@/lib/services/instructor-service"
import type { Instructor, WellnessClass } from "@/lib/types/wellness-instructor"
import { MODALITY_DISPLAY_NAMES, getModalityEmoji, formatHourlyRate } from "@/lib/types/wellness-instructor"

export default function InstructorProfileScreen() {
    const { id } = useLocalSearchParams()
    const [instructor, setInstructor] = useState<Instructor | null>(null)
    const [classes, setClasses] = useState<WellnessClass[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof id === "string") {
            loadInstructor(id)
        }
    }, [id])

    const loadInstructor = async (instructorId: string) => {
        setLoading(true)
        const [instructorData, classesData] = await Promise.all([
            getInstructorById(instructorId),
            getInstructorClasses(instructorId, 5),
        ])
        setInstructor(instructorData)
        setClasses(classesData)
        setLoading(false)
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
            </View>
        )
    }

    if (!instructor) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                <Text style={styles.errorText}>Instructor not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })
    }

    return (
        <ErrorBoundary>
            <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header with back button */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backBtn}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    router.back()
                                }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Cover photo */}
                        <View style={styles.coverContainer}>
                            {instructor.coverPhotoUrl ? (
                                <Image
                                    source={{ uri: instructor.coverPhotoUrl }}
                                    style={styles.coverPhoto}
                                />
                            ) : (
                                <LinearGradient
                                    colors={["#252525", "#1A1A1A"]}
                                    style={styles.coverPhoto}
                                />
                            )}
                            <LinearGradient
                                colors={["transparent", "#0A0A0A"]}
                                style={styles.coverGradient}
                            />
                        </View>

                        {/* Profile photo and info */}
                        <View style={styles.profileSection}>
                            <Image
                                source={{ uri: instructor.photoUrl || "https://via.placeholder.com/100" }}
                                style={styles.profilePhoto}
                            />

                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{instructor.displayName}</Text>
                                <Text style={styles.tagline}>✨ {instructor.tagline}</Text>

                                {/* Stats */}
                                <View style={styles.statsRow}>
                                    <View style={styles.stat}>
                                        <Ionicons name="star" size={16} color="#FBBF24" />
                                        <Text style={styles.statValue}>{instructor.rating.toFixed(1)}</Text>
                                        <Text style={styles.statLabel}>({instructor.reviewCount})</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.stat}>
                                        <Ionicons name="people" size={16} color="#7ED957" />
                                        <Text style={styles.statValue}>{instructor.followerCount}</Text>
                                        <Text style={styles.statLabel}>followers</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Follow button */}
                            <View style={styles.followContainer}>
                                <FollowButton instructorId={instructor.id} size="large" />
                            </View>
                        </View>

                        {/* Bio */}
                        {instructor.bio && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>About</Text>
                                <Text style={styles.bioText}>{instructor.bio}</Text>
                            </View>
                        )}

                        {/* Modalities */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Teaches</Text>
                            <View style={styles.modalitiesGrid}>
                                {instructor.modalities.map((modality, index) => (
                                    <View key={index} style={styles.modalityChip}>
                                        <Text style={styles.modalityEmoji}>
                                            {getModalityEmoji(modality)}
                                        </Text>
                                        <Text style={styles.modalityName}>
                                            {MODALITY_DISPLAY_NAMES[modality]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Studios */}
                        {instructor.studioNames && instructor.studioNames.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Studios</Text>
                                {instructor.studioNames.map((studio, index) => (
                                    <View key={index} style={styles.studioRow}>
                                        <Ionicons name="location" size={18} color="#7ED957" />
                                        <Text style={styles.studioName}>{studio}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Upcoming Classes */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Upcoming Classes</Text>
                            {classes.length === 0 ? (
                                <Text style={styles.emptyText}>No upcoming classes</Text>
                            ) : (
                                classes.map((cls) => (
                                    <TouchableOpacity
                                        key={cls.id}
                                        style={styles.classCard}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            // router.push(`/classes/${cls.id}`)
                                        }}
                                    >
                                        <View style={styles.classTime}>
                                            <Text style={styles.classDate}>
                                                {formatDate(cls.startTime)}
                                            </Text>
                                            <Text style={styles.classHour}>
                                                {formatTime(cls.startTime)}
                                            </Text>
                                        </View>
                                        <View style={styles.classInfo}>
                                            <Text style={styles.classTitle}>{cls.title}</Text>
                                            <Text style={styles.classStudio}>
                                                {getModalityEmoji(cls.modality)} {cls.studioName || "Pop-up"}
                                            </Text>
                                        </View>
                                        <View style={styles.classCapacity}>
                                            <Text style={[
                                                styles.capacityText,
                                                cls.isFull && styles.capacityFull
                                            ]}>
                                                {cls.isFull ? "Full" : `${cls.bookedCount}/${cls.capacity}`}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>

                        {/* Private Sessions CTA */}
                        {instructor.privateSessionsEnabled && instructor.hourlyRate && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Private Sessions</Text>
                                <TouchableOpacity
                                    style={styles.privateCard}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                        // router.push(`/book-private/${instructor.id}`)
                                    }}
                                >
                                    <View style={styles.privateLeft}>
                                        <Ionicons name="person" size={24} color="#7ED957" />
                                        <View style={styles.privateInfo}>
                                            <Text style={styles.privateTitle}>
                                                Book 1-on-1 Session
                                            </Text>
                                            <Text style={styles.privatePrice}>
                                                {formatHourlyRate(instructor.hourlyRate)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Bottom padding */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </ErrorBoundary>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#0A0A0A",
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        backgroundColor: "#0A0A0A",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    errorText: {
        color: "#9CA3AF",
        fontSize: 16,
        marginTop: 12,
    },
    backButton: {
        marginTop: 24,
        backgroundColor: "#7ED957",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: "#0A0A0A",
        fontWeight: "600",
    },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    coverContainer: {
        height: 180,
        position: "relative",
    },
    coverPhoto: {
        width: "100%",
        height: "100%",
    },
    coverGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    profileSection: {
        paddingHorizontal: 20,
        marginTop: -50,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "#0A0A0A",
        backgroundColor: "#252525",
    },
    profileInfo: {
        marginTop: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    tagline: {
        fontSize: 16,
        color: "#7ED957",
        marginTop: 4,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    statLabel: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: "#333",
        marginHorizontal: 12,
    },
    followContainer: {
        marginTop: 16,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    bioText: {
        fontSize: 15,
        color: "#D1D5DB",
        lineHeight: 22,
    },
    modalitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    modalityChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#252525",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    modalityEmoji: {
        fontSize: 16,
    },
    modalityName: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    studioRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    studioName: {
        fontSize: 15,
        color: "#D1D5DB",
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
    },
    classCard: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#252525",
        alignItems: "center",
    },
    classTime: {
        width: 70,
    },
    classDate: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    classHour: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    classInfo: {
        flex: 1,
        marginLeft: 12,
    },
    classTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    classStudio: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 2,
    },
    classCapacity: {
        marginLeft: 8,
    },
    capacityText: {
        fontSize: 13,
        color: "#7ED957",
        fontWeight: "500",
    },
    capacityFull: {
        color: "#EF4444",
    },
    privateCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#7ED957",
    },
    privateLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    privateInfo: {},
    privateTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    privatePrice: {
        fontSize: 14,
        color: "#7ED957",
        marginTop: 2,
    },
})
