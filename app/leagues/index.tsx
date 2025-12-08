import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent } from "@/lib/activity-content"

// Mock league data
const mockLeagues = [
    {
        id: 1,
        name: "NYC Basketball League",
        sport: "Basketball",
        level: "Intermediate",
        schedule: "Sundays 10am",
        location: "Central Park Courts",
        members: 156,
        fee: "$120/season",
        image: null,
        openSpots: 8,
    },
    {
        id: 2,
        name: "Manhattan Rec League",
        sport: "Basketball",
        level: "Beginner-Intermediate",
        schedule: "Saturdays 2pm",
        location: "Chelsea Piers",
        members: 84,
        fee: "$150/season",
        image: null,
        openSpots: 12,
    },
    {
        id: 3,
        name: "Brooklyn Hoops",
        sport: "Basketball",
        level: "Advanced",
        schedule: "Weeknights 7pm",
        location: "Barclays Center Area",
        members: 200,
        fee: "$200/season",
        image: null,
        openSpots: 4,
    },
    {
        id: 4,
        name: "Queens Pick-Up League",
        sport: "Basketball",
        level: "All Levels",
        schedule: "Flexible",
        location: "Various Courts",
        members: 320,
        fee: "Free",
        image: null,
        openSpots: 50,
    },
]

const levelColors: Record<string, string> = {
    "Beginner": "#22C55E",
    "Beginner-Intermediate": "#84CC16",
    "Intermediate": "#FBBF24",
    "Advanced": "#F97316",
    "All Levels": "#8B5CF6",
}

export default function LeaguesScreen() {
    const { preferences } = useUserPreferences()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

    const primaryActivity = preferences.primaryActivity || "Basketball"
    const content = getActivityContent(primaryActivity as any)

    const handlePress = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        action()
    }

    const filteredLeagues = mockLeagues.filter(league => {
        const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            league.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesLevel = !selectedLevel || league.level === selectedLevel
        return matchesSearch && matchesLevel
    })

    const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Find Leagues</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#9CA3AF" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search leagues..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Level Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {levels.map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.filterChip,
                                    selectedLevel === level && styles.filterChipActive
                                ]}
                                onPress={() => setSelectedLevel(selectedLevel === level ? null : level)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    selectedLevel === level && styles.filterChipTextActive
                                ]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Results Count */}
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsCount}>
                            {filteredLeagues.length} leagues found
                        </Text>
                    </View>

                    {/* League Cards */}
                    <View style={styles.leaguesContainer}>
                        {filteredLeagues.map((league) => (
                            <TouchableOpacity
                                key={league.id}
                                style={styles.leagueCard}
                                onPress={() => handlePress(() => { })}
                                activeOpacity={0.8}
                            >
                                <View style={styles.leagueHeader}>
                                    <View style={styles.leagueIcon}>
                                        <Ionicons name="trophy" size={24} color="#7ED957" />
                                    </View>
                                    <View style={styles.leagueInfo}>
                                        <Text style={styles.leagueName}>{league.name}</Text>
                                        <View style={styles.leagueMeta}>
                                            <View style={[
                                                styles.levelBadge,
                                                { backgroundColor: `${levelColors[league.level] || "#7ED957"}20` }
                                            ]}>
                                                <Text style={[
                                                    styles.levelText,
                                                    { color: levelColors[league.level] || "#7ED957" }
                                                ]}>
                                                    {league.level}
                                                </Text>
                                            </View>
                                            <Text style={styles.memberCount}>
                                                {league.members} members
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.leagueDetails}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                                        <Text style={styles.detailText}>{league.schedule}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                                        <Text style={styles.detailText}>{league.location}</Text>
                                    </View>
                                </View>

                                <View style={styles.leagueFooter}>
                                    <View>
                                        <Text style={styles.feeLabel}>Season Fee</Text>
                                        <Text style={styles.feeAmount}>{league.fee}</Text>
                                    </View>
                                    <View style={styles.spotsContainer}>
                                        <Text style={styles.spotsText}>
                                            {league.openSpots} spots open
                                        </Text>
                                        <TouchableOpacity style={styles.joinButton}>
                                            <Text style={styles.joinButtonText}>Join</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Create League CTA */}
                    <TouchableOpacity style={styles.createCta}>
                        <View style={styles.createCtaIcon}>
                            <Ionicons name="add-circle" size={28} color="#7ED957" />
                        </View>
                        <View style={styles.createCtaText}>
                            <Text style={styles.createCtaTitle}>Start Your Own League</Text>
                            <Text style={styles.createCtaDesc}>
                                Organize games, manage teams, and build your community
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
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
        marginLeft: 12,
        fontSize: 16,
        color: "#FFFFFF",
    },
    filterScroll: {
        marginBottom: 16,
    },
    filterContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#252525",
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    filterChipText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    filterChipTextActive: {
        color: "#000000",
        fontWeight: "600",
    },
    resultsHeader: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    resultsCount: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    leaguesContainer: {
        paddingHorizontal: 16,
    },
    leagueCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    leagueHeader: {
        flexDirection: "row",
        marginBottom: 16,
    },
    leagueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    leagueInfo: {
        flex: 1,
    },
    leagueName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    leagueMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    levelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        fontSize: 12,
        fontWeight: "600",
    },
    memberCount: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    leagueDetails: {
        marginBottom: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    leagueFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    feeLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    feeAmount: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#7ED957",
    },
    spotsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    spotsText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    joinButton: {
        backgroundColor: "#7ED957",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    joinButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000000",
    },
    createCta: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    createCtaIcon: {
        marginRight: 12,
    },
    createCtaText: {
        flex: 1,
    },
    createCtaTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    createCtaDesc: {
        fontSize: 14,
        color: "#9CA3AF",
    },
})
