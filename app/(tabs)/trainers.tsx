import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity } from "@/lib/activity-content"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"

export default function TrainersScreen() {
    const { preferences } = useUserPreferences()
    const [searchQuery, setSearchQuery] = useState("")

    const primaryActivity = getPrimaryActivity(preferences.activities)
    const content = getActivityContent(primaryActivity as any)

    // Check if user is a trainer/instructor
    const isTrainer = preferences.userType === "trainer" || preferences.userType === "instructor" || preferences.userType === "both"

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    // Trainer/Instructor Dashboard View
    if (isTrainer) {
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

    // Player/Client View - Browse trainers
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

                        {content.sampleTrainers.map((trainer, index) => (
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
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#9CA3AF",
    },
    searchSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    searchBar: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: "#FFFFFF",
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 16,
    },
    trainerCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
        marginBottom: 12,
    },
    trainerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    trainerInitial: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#7ED957",
    },
    trainerInfo: {
        flex: 1,
    },
    trainerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    trainerRating: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    trainerRatingText: {
        fontSize: 14,
        color: "#9CA3AF",
        marginLeft: 4,
    },
    trainerLocation: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    trainerPricing: {
        alignItems: "flex-end",
    },
    trainerPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#7ED957",
        marginBottom: 8,
    },
    bookButton: {
        backgroundColor: "#7ED957",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    bookButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    browseButton: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#252525",
    },
    browseButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    // Trainer Dashboard Styles
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
        textAlign: "center",
    },
    actionCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#FFFFFF",
    },
    earningsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#252525",
    },
    earningsLabel: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 4,
    },
    earningsAmount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#7ED957",
    },
})
