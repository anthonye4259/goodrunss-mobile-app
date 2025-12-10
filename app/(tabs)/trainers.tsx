/**
 * Trainers/Instructors Tab
 * 
 * For PLAYERS/CLIENTS: Browse and book trainers/instructors
 * For TRAINERS/INSTRUCTORS: View their dashboard
 * 
 * Uses real Firebase data for instructor marketplace
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity } from "@/lib/activity-content"
import { useState, useCallback } from "react"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { useInstructorBrowse, MODALITY_FILTERS } from "@/lib/hooks/useInstructorBrowse"
import { InstructorCard } from "@/components/InstructorCard"
import type { InstructorModality } from "@/lib/types/wellness-instructor"
import { getModalityEmoji, formatHourlyRate } from "@/lib/types/wellness-instructor"

export default function TrainersScreen() {
    const { preferences } = useUserPreferences()
    const [showFilters, setShowFilters] = useState(false)

    const primaryActivity = getPrimaryActivity(preferences.activities)
    const content = getActivityContent(primaryActivity as any)

    // Check if user is a trainer/instructor
    const isTrainer = preferences.userType === "trainer" || preferences.userType === "instructor" || preferences.userType === "both"

    // Only instructors see wellness instructor browse
    const isInstructor = preferences.userType === "instructor"

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    // Trainer/Instructor Dashboard View
    if (isTrainer) {
        return <TrainerDashboardView content={content} handlePress={handlePress} />
    }

    // Instructor sees wellness browse (for viewing other instructors)
    if (isInstructor) {
        return <InstructorBrowseView content={content} handlePress={handlePress} />
    }

    // Players always see Rec Trainers (sports coaches)
    return <RecTrainerBrowseView content={content} handlePress={handlePress} />
}


// ============================================
// INSTRUCTOR BROWSE (WELLNESS)
// ============================================

function InstructorBrowseView({ content, handlePress }: { content: any; handlePress: (action: () => void) => void }) {
    const [searchText, setSearchText] = useState("")
    const {
        instructors,
        loading,
        modalityFilter,
        filterByModality,
        search,
        clearFilters,
        refresh,
    } = useInstructorBrowse()

    // Debounce search
    const handleSearch = useCallback((text: string) => {
        setSearchText(text)
        // Simple debounce
        const timeout = setTimeout(() => {
            search(text)
        }, 300)
        return () => clearTimeout(timeout)
    }, [search])

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Find Instructors</Text>
                        <Text style={styles.subtitle}>Follow your favorite teachers</Text>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name, style..."
                                placeholderTextColor="#666"
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => {
                                    setSearchText("")
                                    search("")
                                }}>
                                    <Ionicons name="close-circle" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Modality Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {/* All Button */}
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                !modalityFilter && styles.filterChipActive
                            ]}
                            onPress={() => {
                                handlePress(() => filterByModality(null))
                            }}
                        >
                            <Text style={[
                                styles.filterChipText,
                                !modalityFilter && styles.filterChipTextActive
                            ]}>All</Text>
                        </TouchableOpacity>

                        {MODALITY_FILTERS.map(mod => (
                            <TouchableOpacity
                                key={mod.key}
                                style={[
                                    styles.filterChip,
                                    modalityFilter === mod.key && styles.filterChipActive
                                ]}
                                onPress={() => {
                                    handlePress(() => filterByModality(
                                        modalityFilter === mod.key ? null : mod.key
                                    ))
                                }}
                            >
                                <Text style={styles.filterEmoji}>{mod.emoji}</Text>
                                <Text style={[
                                    styles.filterChipText,
                                    modalityFilter === mod.key && styles.filterChipTextActive
                                ]}>{mod.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Results */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                {modalityFilter ? `${getModalityEmoji(modalityFilter)} ${modalityFilter.charAt(0).toUpperCase() + modalityFilter.slice(1)} Instructors` : "Top Instructors"}
                            </Text>
                            {instructors.length > 0 && (
                                <Text style={styles.resultCount}>{instructors.length} found</Text>
                            )}
                        </View>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#7ED957" />
                                <Text style={styles.loadingText}>Finding instructors...</Text>
                            </View>
                        ) : instructors.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={48} color="#666" />
                                <Text style={styles.emptyTitle}>No instructors found</Text>
                                <Text style={styles.emptyText}>
                                    {searchText ? "Try a different search" : "Check back soon!"}
                                </Text>
                                {(searchText || modalityFilter) && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => {
                                            setSearchText("")
                                            clearFilters()
                                        }}
                                    >
                                        <Text style={styles.clearButtonText}>Clear Filters</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <>
                                {instructors.map(instructor => (
                                    <TouchableOpacity
                                        key={instructor.id}
                                        style={styles.instructorCard}
                                        onPress={() => handlePress(() => router.push(`/instructors/${instructor.id}`))}
                                    >
                                        <Image
                                            source={{ uri: instructor.photoUrl || "https://via.placeholder.com/80" }}
                                            style={styles.instructorPhoto}
                                        />
                                        <View style={styles.instructorInfo}>
                                            <Text style={styles.instructorName}>{instructor.displayName}</Text>
                                            <Text style={styles.instructorTagline} numberOfLines={1}>
                                                {instructor.tagline}
                                            </Text>
                                            <View style={styles.instructorMeta}>
                                                <View style={styles.ratingContainer}>
                                                    <Ionicons name="star" size={14} color="#7ED957" />
                                                    <Text style={styles.ratingText}>
                                                        {instructor.rating?.toFixed(1) || "New"} ({instructor.reviewCount || 0})
                                                    </Text>
                                                </View>
                                                <Text style={styles.followerCount}>
                                                    {instructor.followerCount || 0} followers
                                                </Text>
                                            </View>
                                            <View style={styles.modalityTags}>
                                                {instructor.modalities?.slice(0, 3).map(mod => (
                                                    <View key={mod} style={styles.modalityTag}>
                                                        <Text style={styles.modalityTagText}>
                                                            {getModalityEmoji(mod)} {mod}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                        <View style={styles.priceContainer}>
                                            {instructor.privateSessionsEnabled && instructor.hourlyRate && (
                                                <>
                                                    <Text style={styles.priceLabel}>Private</Text>
                                                    <Text style={styles.priceValue}>
                                                        ${(instructor.hourlyRate / 100).toFixed(0)}/hr
                                                    </Text>
                                                </>
                                            )}
                                            <Ionicons name="chevron-forward" size={20} color="#666" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

// ============================================
// TRAINER DASHBOARD VIEW (for trainers/instructors)
// ============================================

function TrainerDashboardView({ content, handlePress }: { content: any; handlePress: (action: () => void) => void }) {
    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>My Dashboard</Text>
                        <Text style={styles.subtitle}>Manage your {content.trainerTitle.toLowerCase()} profile</Text>
                    </View>

                    {/* Stats Overview */}
                    <View style={styles.section}>
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Ionicons name="calendar" size={24} color="#7ED957" />
                                <Text style={styles.statNumber}>12</Text>
                                <Text style={styles.statLabel}>Upcoming Sessions</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="star" size={24} color="#7ED957" />
                                <Text style={styles.statNumber}>4.9</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="people" size={24} color="#7ED957" />
                                <Text style={styles.statNumber}>48</Text>
                                <Text style={styles.statLabel}>Total Clients</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <TouchableOpacity style={styles.actionCard} onPress={() => handlePress(() => router.push("/trainer-dashboard"))}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="stats-chart" size={20} color="#7ED957" />
                            </View>
                            <Text style={styles.actionText}>Full Dashboard</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard} onPress={() => handlePress(() => router.push("/settings/edit-profile"))}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="person" size={20} color="#7ED957" />
                            </View>
                            <Text style={styles.actionText}>Edit My Profile</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard} onPress={() => handlePress(() => { })}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="time" size={20} color="#7ED957" />
                            </View>
                            <Text style={styles.actionText}>Set Availability</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard} onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="calendar-outline" size={20} color="#7ED957" />
                            </View>
                            <Text style={styles.actionText}>View My Bookings</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard} onPress={() => handlePress(() => router.push("/(tabs)/messages"))}>
                            <View style={styles.actionIcon}>
                                <Ionicons name="chatbubbles" size={20} color="#7ED957" />
                            </View>
                            <Text style={styles.actionText}>Client Messages</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Earnings Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>This Month</Text>
                        <View style={styles.earningsCard}>
                            <View>
                                <Text style={styles.earningsLabel}>Total Earnings</Text>
                                <Text style={styles.earningsAmount}>$1,240</Text>
                            </View>
                            <View>
                                <Text style={styles.earningsLabel}>Sessions Completed</Text>
                                <Text style={styles.earningsAmount}>18</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

// ============================================
// REC TRAINER BROWSE (for rec players)
// ============================================

function RecTrainerBrowseView({ content, handlePress }: { content: any; handlePress: (action: () => void) => void }) {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Book a {content.trainerTitle}</Text>
                        <Text style={styles.subtitle}>Find expert {content.trainerTitle.toLowerCase()}s near you</Text>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Search ${content.trainerTitle.toLowerCase()}s...`}
                                placeholderTextColor="#666"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Trainer Cards */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top {content.trainerTitlePlural}</Text>

                        {content.sampleTrainers.map((trainer: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.trainerCard}
                                onPress={() => handlePress(() => router.push(`/trainers/${index}`))}
                            >
                                <View style={styles.trainerAvatar}>
                                    <Text style={styles.trainerInitial}>{trainer.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.trainerInfo}>
                                    <Text style={styles.trainerName}>{trainer.name}</Text>
                                    <View style={styles.trainerRating}>
                                        <Ionicons name="star" size={14} color="#7ED957" />
                                        <Text style={styles.trainerRatingText}>{trainer.rating} ({trainer.reviews} reviews)</Text>
                                    </View>
                                    <Text style={styles.trainerLocation}>
                                        <Ionicons name="location" size={14} color="#9CA3AF" /> {trainer.location}
                                    </Text>
                                </View>
                                <View style={styles.trainerPricing}>
                                    <Text style={styles.trainerPrice}>${trainer.price}/hr</Text>
                                    <TouchableOpacity
                                        style={styles.bookButton}
                                        onPress={() => handlePress(() => router.push(`/trainers/${index}`))}
                                    >
                                        <Text style={styles.bookButtonText}>Book</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Browse All */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => handlePress(() => router.push("/(tabs)/trainer"))}
                        >
                            <Text style={styles.browseButtonText}>Browse All {content.trainerTitlePlural}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#7ED957" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
        marginTop: 4,
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: "#FFFFFF",
    },
    filterScroll: {
        paddingLeft: 20,
    },
    filterContainer: {
        paddingRight: 20,
        gap: 8,
        flexDirection: "row",
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#252525",
        gap: 4,
    },
    filterChipActive: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    filterEmoji: {
        fontSize: 14,
    },
    filterChipText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "500",
    },
    filterChipTextActive: {
        color: "#0A0A0A",
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    resultCount: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        color: "#9CA3AF",
        marginTop: 12,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 4,
    },
    clearButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#252525",
        borderRadius: 8,
    },
    clearButtonText: {
        color: "#7ED957",
        fontWeight: "600",
    },
    instructorCard: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    instructorPhoto: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#252525",
    },
    instructorInfo: {
        flex: 1,
        marginLeft: 14,
    },
    instructorName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    instructorTagline: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 2,
    },
    instructorMeta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        gap: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    followerCount: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    modalityTags: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
        gap: 6,
    },
    modalityTag: {
        backgroundColor: "#252525",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    modalityTagText: {
        fontSize: 11,
        color: "#FFFFFF",
    },
    priceContainer: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    priceLabel: {
        fontSize: 10,
        color: "#9CA3AF",
    },
    priceValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#7ED957",
        marginBottom: 4,
    },
    // Trainer Dashboard Styles
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 4,
        textAlign: "center",
    },
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#252525",
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#7ED95720",
        justifyContent: "center",
        alignItems: "center",
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: "#FFFFFF",
        marginLeft: 12,
    },
    earningsCard: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: "#252525",
    },
    earningsLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "center",
    },
    earningsAmount: {
        fontSize: 24,
        fontWeight: "700",
        color: "#7ED957",
        textAlign: "center",
        marginTop: 4,
    },
    // Rec Trainer Styles
    trainerCard: {
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    trainerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#7ED95720",
        justifyContent: "center",
        alignItems: "center",
    },
    trainerInitial: {
        fontSize: 20,
        fontWeight: "700",
        color: "#7ED957",
    },
    trainerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    trainerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    trainerRating: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    trainerRatingText: {
        fontSize: 12,
        color: "#9CA3AF",
        marginLeft: 4,
    },
    trainerLocation: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
    },
    trainerPricing: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    trainerPrice: {
        fontSize: 16,
        fontWeight: "700",
        color: "#7ED957",
        marginBottom: 8,
    },
    bookButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookButtonText: {
        color: "#0A0A0A",
        fontWeight: "600",
    },
    browseButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    browseButtonText: {
        fontSize: 16,
        color: "#7ED957",
        fontWeight: "600",
    },
})
