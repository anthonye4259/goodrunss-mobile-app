
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { socialService } from "@/lib/services/social-service"

export default function GroupsListScreen() {
    const [activeTab, setActiveTab] = useState<"my-groups" | "discover">("my-groups")
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadData()
    }, [activeTab])

    const loadData = async () => {
        setLoading(true)
        try {
            // TODO: Replace with real service call
            // const data = activeTab === "my-groups" ? await socialService.getMyGroups() : await socialService.getRecommendedGroups()

            // Mock Data
            const mockGroups = activeTab === "my-groups" ? [
                { id: "1", name: "Saturday Run Club", members: 12, sport: "Running", nextEvent: "Sat, 8am" },
                { id: "2", name: "Downtown Hoopers", members: 45, sport: "Basketball", nextEvent: "Tonight, 7pm" }
            ] : [
                { id: "3", name: "Yoga for Beginners", members: 8, sport: "Yoga", description: "Easy flow for new yogis." },
                { id: "4", name: "Tennis Doubles", members: 22, sport: "Tennis", description: "Looking for 3.5+ players." }
            ]

            setGroups(mockGroups)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        setRefreshing(true)
        loadData()
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Groups</Text>
                <TouchableOpacity onPress={() => router.push("/groups/create")}>
                    <Ionicons name="add-circle" size={28} color="#7ED957" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "my-groups" && styles.activeTab]}
                    onPress={() => setActiveTab("my-groups")}
                >
                    <Text style={[styles.tabText, activeTab === "my-groups" && styles.activeTabText]}>My Groups</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "discover" && styles.activeTab]}
                    onPress={() => setActiveTab("discover")}
                >
                    <Text style={[styles.tabText, activeTab === "discover" && styles.activeTabText]}>Discover</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7ED957" />}
            >
                {groups.map((group) => (
                    <TouchableOpacity key={group.id} style={styles.groupCard} onPress={() => router.push(`/groups/${group.id}`)}>
                        <View style={styles.groupIcon}>
                            <Ionicons name={getSportIcon(group.sport)} size={24} color="#000" />
                        </View>
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            <Text style={styles.groupMeta}>{group.members} members • {group.sport}</Text>
                            {group.nextEvent && (
                                <View style={styles.eventBadge}>
                                    <Ionicons name="calendar" size={12} color="#7ED957" />
                                    <Text style={styles.eventText}>{group.nextEvent}</Text>
                                </View>
                            )}
                            {group.description && (
                                <Text style={styles.groupDesc} numberOfLines={1}>{group.description}</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                ))}

                {activeTab === "my-groups" && groups.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color="#333" />
                        <Text style={styles.emptyText}>You haven't joined any groups yet.</Text>
                        <TouchableOpacity style={styles.createBtn} onPress={() => router.push("/groups/create")}>
                            <Text style={styles.createBtnText}>Create a Group</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    )
}

function getSportIcon(sport: string) {
    switch (sport) {
        case "Running": return "walk";
        case "Basketball": return "basketball";
        case "Tennis": return "tennisball";
        case "Yoga": return "body";
        default: return "people";
    }
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
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: "transparent"
    },
    activeTab: { borderBottomColor: "#7ED957" },
    tabText: { color: "#666", fontWeight: "600", fontSize: 16 },
    activeTabText: { color: "#FFF" },
    content: { flex: 1, padding: 16 },
    groupCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#222"
    },
    groupIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#7ED957",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16
    },
    groupInfo: { flex: 1 },
    groupName: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    groupMeta: { color: "#999", fontSize: 13, marginBottom: 4 },
    groupDesc: { color: "#666", fontSize: 13 },
    eventBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8
    },
    eventText: { color: "#7ED957", fontSize: 12, fontWeight: "bold" },
    emptyState: { alignItems: "center", marginTop: 40, padding: 20 },
    emptyText: { color: "#666", marginTop: 12, marginBottom: 20 },
    createBtn: { backgroundColor: "#7ED957", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    createBtnText: { fontWeight: "bold" }
})
