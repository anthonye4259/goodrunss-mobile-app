
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"

export default function LeaguesIndexScreen() {
    const [filter, setFilter] = useState("All")

    // Mock Leagues
    const leagues = [
        { id: "1", name: "Premier City League", sport: "Basketball", level: "Elite", teams: 12, status: "Active" },
        { id: "2", name: "Summer 5s", sport: "Soccer", level: "Recreational", teams: 24, status: "Registering" },
        { id: "3", name: "Corporate Tennis Ladder", sport: "Tennis", level: "Mixed", teams: 40, status: "Active" }
    ]

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leagues</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={24} color="#7ED957" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search leagues..."
                    placeholderTextColor="#666"
                />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Upcoming & Active</Text>

                {leagues.map(league => (
                    <TouchableOpacity key={league.id} style={styles.leagueCard} onPress={() => router.push(`/leagues/${league.id}`)}>
                        <View style={styles.leagueIcon}>
                            <Ionicons name="trophy" size={24} color="#000" />
                        </View>
                        <View style={styles.leagueInfo}>
                            <Text style={styles.leagueName}>{league.name}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.leagueMeta}>{league.sport} • {league.level}</Text>
                                <View style={[styles.statusBadge, league.status === "Registering" && styles.statusRegistering]}>
                                    <Text style={[styles.statusText, league.status === "Registering" && styles.statusTextRegistering]}>
                                        {league.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.teamCount}>{league.teams} Teams competing</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.createBanner}>
                    <LinearGradient colors={["#7ED957", "#4ADE80"]} style={styles.createGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <View>
                            <Text style={styles.createTitle}>Organize a League</Text>
                            <Text style={styles.createDesc}>Create brackets, schedules, and standings.</Text>
                        </View>
                        <Ionicons name="arrow-forward-circle" size={32} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>
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
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        margin: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333"
    },
    searchInput: { flex: 1, color: "#FFF", fontSize: 16, marginLeft: 10 },
    content: { flex: 1, paddingHorizontal: 16 },
    sectionTitle: { color: "#999", marginBottom: 16, fontWeight: "600" },

    leagueCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#222"
    },
    leagueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#FBBF24",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16
    },
    leagueInfo: { flex: 1 },
    leagueName: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    leagueMeta: { color: "#CCC", fontSize: 13 },
    statusBadge: { backgroundColor: "rgba(126, 217, 87, 0.1)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusText: { color: "#7ED957", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
    statusRegistering: { backgroundColor: "rgba(59, 130, 246, 0.1)" },
    statusTextRegistering: { color: "#3B82F6" },
    teamCount: { color: "#666", fontSize: 12 },

    createBanner: { marginTop: 24, marginBottom: 40 },
    createGradient: {
        padding: 20,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    createTitle: { color: "#000", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
    createDesc: { color: "rgba(0,0,0,0.7)", fontSize: 13 }
})
