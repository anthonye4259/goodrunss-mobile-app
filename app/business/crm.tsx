import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { trainerDashboardService, type Client } from "@/lib/services/trainer-dashboard-service"

export default function CRMScreen() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        try {
            const data = await trainerDashboardService.getClients()
            // Sort: Active first, then by last session
            const sorted = data.sort((a, b) => {
                if (a.status === "active" && b.status !== "active") return -1
                if (a.status !== "active" && b.status === "active") return 1
                return new Date(b.lastSessionAt || 0).getTime() - new Date(a.lastSessionAt || 0).getTime()
            })
            setClients(sorted)
        } catch (error) {
            console.error("Failed to load clients", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCall = (phone?: string) => {
        if (phone) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            Linking.openURL(`tel:${phone}`)
        }
    }

    const handleMessage = (phone?: string) => {
        if (phone) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            Linking.openURL(`sms:${phone}`)
        }
    }

    const handleEmail = (email?: string) => {
        if (email) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            Linking.openURL(`mailto:${email}`)
        }
    }

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const renderClient = ({ item }: { item: Client }) => (
        <TouchableOpacity style={styles.clientCard} activeOpacity={0.7} >
            <View style={styles.clientInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: item.status === "active" ? "#7ED957" : "#666" }]} />
                        <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
                        {item.lastSessionAt && (
                            <Text style={styles.lastSeen}>• Last: {new Date(item.lastSessionAt).toLocaleDateString()}</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleMessage(item.phone)}>
                    <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(item.phone)}>
                    <Ionicons name="call-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]} onPress={() => router.push(`/business/invoices/new?client=${item.id}`)}>
                    <Ionicons name="receipt-outline" size={20} color="#EAB308" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/business/crm/${item.id}`)}>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity >
    )

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>My Clients ({clients.length})</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color="#7ED957" />
                </View>
            ) : (
                <FlatList
                    data={filteredClients}
                    renderItem={renderClient}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color="#333" />
                            <Text style={styles.emptyText}>No clients found.</Text>
                        </View>
                    }
                />
            )}

            {/* Quick Add FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => router.push("/business/clients/add")}>
                <LinearGradient colors={['#7ED957', '#5CB33D']} style={styles.fabGradient}>
                    <Ionicons name="person-add" size={24} color="#000" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        margin: 16,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: "#FFF",
        fontSize: 16,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    clientCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#222",
    },
    clientInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    avatarText: {
        color: "#7ED957",
        fontSize: 20,
        fontWeight: "bold",
    },
    textContainer: {
        flex: 1,
    },
    name: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        color: "#999",
        fontSize: 12,
    },
    lastSeen: {
        color: "#666",
        fontSize: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        color: "#FFF",
        marginTop: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        shadowColor: "#7ED957",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
