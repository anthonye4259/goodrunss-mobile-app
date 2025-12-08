import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"

// Mock player data
const mockPlayers: Record<string, any> = {
    "1": {
        id: "1",
        name: "Mike Johnson",
        avatar: "MJ",
        level: "Advanced",
        sport: "Basketball",
        location: "Manhattan, NY",
        rating: 4.8,
        totalGames: 156,
        winRate: 68,
        bio: "Competitive basketball player. Love running pick-up games at Rucker Park. Always looking for good competition!",
        stats: {
            gamesPlayed: 156,
            wins: 106,
            losses: 50,
            avgPointsPerGame: 18.5,
            bestStreak: 12,
        },
        recentMatches: [
            { opponent: "You", result: "Won 21-18", date: "2 days ago" },
            { opponent: "Alex R.", result: "Won 21-15", date: "1 week ago" },
            { opponent: "Chris T.", result: "Lost 18-21", date: "2 weeks ago" },
        ],
        availability: ["Weekday evenings", "Weekend mornings"],
        badges: ["🏀 50+ Games", "🔥 10 Win Streak", "⭐ Top Rated"],
    },
    "2": {
        id: "2",
        name: "Sarah Chen",
        avatar: "SC",
        level: "Intermediate",
        sport: "Tennis",
        location: "Brooklyn, NY",
        rating: 4.6,
        totalGames: 84,
        winRate: 55,
        bio: "Tennis enthusiast working on my backhand. Love doubles matches!",
        stats: {
            gamesPlayed: 84,
            wins: 46,
            losses: 38,
            avgPointsPerGame: 0,
            bestStreak: 5,
        },
        recentMatches: [
            { opponent: "You", result: "Lost 6-4, 3-6, 4-6", date: "1 week ago" },
        ],
        availability: ["Weekend afternoons"],
        badges: ["🎾 Tennis Pro", "🤝 Great Sport"],
    },
}

export default function PlayerProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [showChallengeModal, setShowChallengeModal] = useState(false)

    const player = mockPlayers[id || "1"] || mockPlayers["1"]

    const handleChallenge = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        // In production, this would send a match request
        router.push("/(tabs)/messages")
    }

    const handleMessage = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)/messages")
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner": return "#22C55E"
            case "Intermediate": return "#FBBF24"
            case "Advanced": return "#F97316"
            case "Pro": return "#EF4444"
            default: return "#7ED957"
        }
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Player Profile</Text>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{player.avatar}</Text>
                            </View>
                            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(player.level) }]}>
                                <Text style={styles.levelText}>{player.level}</Text>
                            </View>
                        </View>

                        <Text style={styles.playerName}>{player.name}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                            <Text style={styles.locationText}>{player.location}</Text>
                        </View>

                        {/* Rating & Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={18} color="#7ED957" />
                                    <Text style={styles.ratingValue}>{player.rating}</Text>
                                </View>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{player.totalGames}</Text>
                                <Text style={styles.statLabel}>Games</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{player.winRate}%</Text>
                                <Text style={styles.statLabel}>Win Rate</Text>
                            </View>
                        </View>

                        {/* Badges */}
                        <View style={styles.badgesRow}>
                            {player.badges.map((badge: string, index: number) => (
                                <View key={index} style={styles.badge}>
                                    <Text style={styles.badgeText}>{badge}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <View style={styles.bioCard}>
                            <Text style={styles.bioText}>{player.bio}</Text>
                        </View>
                    </View>

                    {/* Availability */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        <View style={styles.availabilityContainer}>
                            {player.availability.map((time: string, index: number) => (
                                <View key={index} style={styles.availabilityChip}>
                                    <Ionicons name="time-outline" size={14} color="#7ED957" />
                                    <Text style={styles.availabilityText}>{time}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Recent Matches */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Matches</Text>
                        {player.recentMatches.map((match: any, index: number) => (
                            <View key={index} style={styles.matchCard}>
                                <View style={styles.matchInfo}>
                                    <Text style={styles.matchOpponent}>vs {match.opponent}</Text>
                                    <Text style={styles.matchDate}>{match.date}</Text>
                                </View>
                                <Text style={[
                                    styles.matchResult,
                                    { color: match.result.startsWith("Won") ? "#7ED957" : "#EF4444" }
                                ]}>
                                    {match.result}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.challengeButton} onPress={handleChallenge}>
                            <Ionicons name="flash" size={20} color="#000" />
                            <Text style={styles.challengeButtonText}>Challenge to Match</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                            <Ionicons name="chatbubble-outline" size={20} color="#7ED957" />
                            <Text style={styles.messageButtonText}>Message</Text>
                        </TouchableOpacity>
                    </View>

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
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    profileCard: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#7ED957",
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#7ED957",
    },
    levelBadge: {
        position: "absolute",
        bottom: 0,
        right: -10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#000",
    },
    playerName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 20,
    },
    locationText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#252525",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 16,
        justifyContent: "center",
    },
    badge: {
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        fontSize: 12,
        color: "#7ED957",
        fontWeight: "600",
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 12,
    },
    bioCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#252525",
    },
    bioText: {
        fontSize: 14,
        color: "#D1D5DB",
        lineHeight: 22,
    },
    availabilityContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    availabilityChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#252525",
    },
    availabilityText: {
        fontSize: 14,
        color: "#FFFFFF",
    },
    matchCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#252525",
    },
    matchInfo: {
        flex: 1,
    },
    matchOpponent: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    matchDate: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    matchResult: {
        fontSize: 14,
        fontWeight: "bold",
    },
    actionsContainer: {
        marginTop: 24,
        paddingHorizontal: 16,
        gap: 12,
    },
    challengeButton: {
        backgroundColor: "#7ED957",
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    challengeButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000000",
    },
    messageButton: {
        backgroundColor: "transparent",
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#7ED957",
    },
    messageButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#7ED957",
    },
})
