
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"

export default function LeagueDetailScreen() {
    const { id } = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState<"standings" | "fixtures">("standings")

    // Mock Standings
    const standings = [
        { rank: 1, team: "Lakers", played: 12, won: 10, lost: 2, points: 22 },
        { rank: 2, team: "Celtics", played: 12, won: 9, lost: 3, points: 21 },
        { rank: 3, team: "Warriors", played: 12, won: 9, lost: 3, points: 21 },
        { rank: 4, team: "Bulls", played: 11, won: 6, lost: 5, points: 17 },
        { rank: 5, team: "Heat", played: 12, won: 5, lost: 7, points: 17 },
    ]

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Premier City League</Text>
                <TouchableOpacity>
                    <Ionicons name="share-social-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === "standings" && styles.activeTab]} onPress={() => setActiveTab("standings")}>
                    <Text style={[styles.tabText, activeTab === "standings" && styles.activeTabText]}>Standings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === "fixtures" && styles.activeTab]} onPress={() => setActiveTab("fixtures")}>
                    <Text style={[styles.tabText, activeTab === "fixtures" && styles.activeTabText]}>Schedule</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === "standings" ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.th, styles.colRank]}>#</Text>
                            <Text style={[styles.th, styles.colTeam]}>Team</Text>
                            <Text style={[styles.th, styles.colStat]}>P</Text>
                            <Text style={[styles.th, styles.colStat]}>W</Text>
                            <Text style={[styles.th, styles.colStat]}>L</Text>
                            <Text style={[styles.th, styles.colPts]}>Pts</Text>
                        </View>

                        {standings.map((row, index) => (
                            <View key={index} style={[styles.tableRow, index < 3 && styles.topRankRow]}>
                                <Text style={[styles.td, styles.colRank, styles.rankText]}>{row.rank}</Text>
                                <Text style={[styles.td, styles.colTeam, styles.teamText]}>{row.team}</Text>
                                <Text style={[styles.td, styles.colStat]}>{row.played}</Text>
                                <Text style={[styles.td, styles.colStat]}>{row.won}</Text>
                                <Text style={[styles.td, styles.colStat]}>{row.lost}</Text>
                                <Text style={[styles.td, styles.colPts, styles.ptsText]}>{row.points}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.fixturesList}>
                        <Text style={styles.dateHeader}>Saturday, Nov 25</Text>
                        <View style={styles.matchCard}>
                            <Text style={styles.matchTime}>10:00 AM</Text>
                            <View style={styles.matchTeams}>
                                <Text style={styles.teamName}>Lakers</Text>
                                <Text style={styles.vs}>vs</Text>
                                <Text style={styles.teamName}>Bulls</Text>
                            </View>
                            <TouchableOpacity style={styles.predictBtn}>
                                <Text style={styles.predictText}>Predict</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },

    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1a1a1a" },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#7ED957" },
    tabText: { color: "#666", fontWeight: "600" },
    activeTabText: { color: "#FFF" },

    content: { flex: 1, padding: 16 },

    // Table Styles
    table: { backgroundColor: "#111", borderRadius: 12, overflow: "hidden" },
    tableHeader: { flexDirection: "row", backgroundColor: "#1a1a1a", paddingVertical: 12, paddingHorizontal: 8 },
    tableRow: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#222" },
    topRankRow: { backgroundColor: "rgba(126, 217, 87, 0.05)" },

    th: { color: "#666", fontSize: 12, fontWeight: "bold", textAlign: "center" },
    td: { color: "#999", fontSize: 14, textAlign: "center" },

    colRank: { width: 30 },
    colTeam: { flex: 1, textAlign: "left", paddingLeft: 8 },
    colStat: { width: 30 },
    colPts: { width: 40 },

    rankText: { fontWeight: "bold", color: "#FFF" },
    teamText: { fontWeight: "600", color: "#FFF" },
    ptsText: { fontWeight: "bold", color: "#7ED957" },

    // Fixtures
    dateHeader: { color: "#7ED957", marginBottom: 12, fontWeight: "600", marginTop: 8 },
    fixturesList: {},
    matchCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
    },
    matchTime: { color: "#666", fontSize: 12, width: 60 },
    matchTeams: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    teamName: { color: "#FFF", fontWeight: "600" },
    vs: { color: "#666", fontSize: 12 },
    predictBtn: { backgroundColor: "#333", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    predictText: { color: "#FFF", fontSize: 12, fontWeight: "600" }
})
