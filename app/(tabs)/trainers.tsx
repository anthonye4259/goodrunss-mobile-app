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

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

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
                        <Text style={styles.sectionTitle}>Top {content.trainerTitle}s</Text>

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
                            <Text style={styles.browseButtonText}>Browse All {content.trainerTitle}s</Text>
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
})
