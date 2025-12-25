
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { socialService } from "@/lib/services/social-service"

export default function FriendsListScreen() {
    const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends")
    const [friends, setFriends] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await socialService.getFriends()
            setFriends(data)
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Connections</Text>
                <TouchableOpacity onPress={() => router.push("/friends/add")}>
                    <Ionicons name="person-add" size={24} color="#7ED957" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "friends" && styles.activeTab]}
                    onPress={() => setActiveTab("friends")}
                >
                    <Text style={[styles.tabText, activeTab === "friends" && styles.activeTabText]}>Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "requests" && styles.activeTab]}
                    onPress={() => setActiveTab("requests")}
                >
                    <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>Requests</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7ED957" />}
            >
                {activeTab === "friends" ? (
                    <>
                        <Text style={styles.sectionTitle}>{friends.length} Friends</Text>
                        {friends.map((friend) => (
                            <TouchableOpacity key={friend.id} style={styles.friendCard} onPress={() => router.push(`/chat/${friend.id}`)}>
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatarText}>{friend.avatar}</Text>
                                    {/* In real app use Image source={{ uri: friend.avatarUrl }} */}
                                </View>
                                <View style={styles.friendInfo}>
                                    <Text style={styles.friendName}>{friend.name}</Text>
                                    <Text style={[styles.statusText, { color: friend.status === "online" ? "#7ED957" : "#666" }]}>
                                        {friend.status === "online" ? "Online Now" : "Offline"}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.messageBtn}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <View style={styles.requestsContainer}>
                        {/* Mock Requests */}
                        <View style={styles.requestCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>JD</Text>
                            </View>
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendName}>John Doe</Text>
                                <Text style={styles.statusText}>Wants to connect</Text>
                            </View>
                            <View style={styles.requestActions}>
                                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                                    <Text style={styles.btnText}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]}>
                                    <Ionicons name="close" size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.requestCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>AK</Text>
                            </View>
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendName}>Anna Kim</Text>
                                <Text style={styles.statusText}>Wants to connect</Text>
                            </View>
                            <View style={styles.requestActions}>
                                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                                    <Text style={styles.btnText}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]}>
                                    <Ionicons name="close" size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#7ED957",
    },
    tabText: {
        color: "#666",
        fontWeight: "600",
        fontSize: 16,
    },
    activeTabText: {
        color: "#FFF",
    },
    badge: {
        backgroundColor: "#EF4444",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "bold"
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        color: "#999",
        marginBottom: 12,
        fontWeight: "600"
    },
    friendCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#222"
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#333"
    },
    avatarText: {
        color: "#7ED957",
        fontWeight: "bold",
        fontSize: 18
    },
    friendInfo: {
        flex: 1
    },
    friendName: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2
    },
    statusText: {
        fontSize: 12,
    },
    messageBtn: {
        padding: 8,
        backgroundColor: "#222",
        borderRadius: 20
    },
    requestsContainer: {
        gap: 12
    },
    requestCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#222"
    },
    requestActions: {
        flexDirection: "row",
        gap: 8
    },
    actionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center"
    },
    acceptBtn: {
        backgroundColor: "#7ED957",
    },
    declineBtn: {
        backgroundColor: "#333",
        width: 32
    },
    btnText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 12
    }
})
