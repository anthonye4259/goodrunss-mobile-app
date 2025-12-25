
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { trainerDashboardService, type Client } from "@/lib/services/trainer-dashboard-service"
import { LinearGradient } from "expo-linear-gradient"

export default function ClientDetailScreen() {
    const { id } = useLocalSearchParams()
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadClient()
    }, [id])

    const loadClient = async () => {
        const clients = await trainerDashboardService.getClients()
        const found = clients.find(c => c.id === id)
        setClient(found || null)
        setLoading(false)
    }

    if (loading) return <View style={styles.center}><ActivityIndicator color="#7ED957" /></View>
    if (!client) return <View style={styles.center}><Text style={{ color: '#FFF' }}>Client not found</Text></View>

    const handleCall = () => { if (client.phone) Linking.openURL(`tel:${client.phone}`) }
    const handleMessage = () => { if (client.phone) Linking.openURL(`sms:${client.phone}`) }
    const handleEmail = () => { if (client.email) Linking.openURL(`mailto:${client.email}`) }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push(`/business/clients/edit?id=${client.id}`)}>
                    <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{client.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.clientName}>{client.name}</Text>
                    {client.status === 'active' && <View style={styles.statusBadge}><Text style={styles.statusText}>Active Client</Text></View>}

                    <View style={styles.contactRow}>
                        <TouchableOpacity style={styles.contactBtn} onPress={handleMessage}>
                            <Ionicons name="chatbubble" size={20} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                            <Ionicons name="call" size={20} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                            <Ionicons name="mail" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Lifetime Value</Text>
                        <Text style={styles.statValue}>${client.totalSpent}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Sessions</Text>
                        <Text style={styles.statValue}>{client.totalSessions}</Text>
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <View style={styles.card}>
                        <Text style={styles.noteText}>{client.notes || "No notes yet."}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => router.push(`/business/invoices/new?client=${client.id}`)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                            <Ionicons name="receipt" size={20} color="#EAB308" />
                        </View>
                        <Text style={styles.actionText}>Create Invoice</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <Ionicons name="calendar" size={20} color="#3B82F6" />
                        </View>
                        <Text style={styles.actionText}>Book Session</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    backBtn: { padding: 8 },
    editLink: { color: '#7ED957', fontWeight: 'bold' },
    content: { paddingBottom: 40 },

    profileHeader: { alignItems: 'center', marginBottom: 30 },
    avatarLarge: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#222', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, borderWidth: 1, borderColor: '#333'
    },
    avatarTextLarge: { fontSize: 32, fontWeight: 'bold', color: '#7ED957' },
    clientName: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
    statusBadge: {
        backgroundColor: 'rgba(126, 217, 87, 0.15)',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 20
    },
    statusText: { color: '#7ED957', fontSize: 12, fontWeight: 'bold' },
    contactRow: { flexDirection: 'row', gap: 20 },
    contactBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#333', alignItems: 'center', justifyContent: 'center'
    },

    statsGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 30 },
    statCard: {
        flex: 1, backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: '#333', alignItems: 'center'
    },
    statLabel: { color: '#666', fontSize: 12, marginBottom: 4 },
    statValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },

    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { color: '#999', fontSize: 12, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase' },
    card: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16 },
    noteText: { color: '#CCC', lineHeight: 22 },

    actionRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16, marginBottom: 10
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginRight: 16
    },
    actionText: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '600' }
})
