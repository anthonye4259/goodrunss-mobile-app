
import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

import { socialService } from "@/lib/services/social-service"
import { useUserLocation } from "@/lib/services/location-service"

export default function LeadsScreen() {
    const { location } = useUserLocation()
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLeads()
    }, [location])

    const loadLeads = async () => {
        if (!location) return
        setLoading(true)
        try {
            // "Leads" are essentially nearby players looking for coaching/games
            // We fetch nearby players and filter for those likely to need a trainer (mock filter for now)
            const nearby = await socialService.getNearbyPlayers(
                location.lat,
                location.lng,
                15 // 15km radius
            )

            // Transform to "Lead" format
            const naturalLeads = nearby.map(p => ({
                id: p.id,
                name: p.name || "Unknown User",
                goal: p.bio || "Fitness Enthusiast", // Use bio as goal
                location: `${p.distance?.toFixed(1)} km away`,
                status: 'new',
                match: Math.floor(Math.random() * 15) + 85 // Mock match score algorithm
            })).slice(0, 3) // Take top 3

            setLeads(naturalLeads)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleGiaContact = (id: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setLeads(current => current.map(l =>
            l.id === id ? { ...l, status: 'contacted' } : l
        ))

        // In real app: Call socialService.sendMessage(id, "...")

        Alert.alert(
            "Gia is on it! 🤖",
            "I'm sending a personalized intro to this lead. I'll notify you when they reply.",
            [{ text: "Great" }]
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#000", "#111"]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Daily Leads</Text>
                        <Text style={styles.subtitle}>3 New Matches Today</Text>
                    </View>
                    <View style={styles.proBadge}>
                        <Text style={styles.proText}>PRO</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Hero Section */}
                    <View style={styles.hero}>
                        <LinearGradient
                            colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
                            style={styles.heroGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.heroHeader}>
                                <Ionicons name="sparkles" size={20} color="#60A5FA" />
                                <Text style={styles.heroTitle}>Gia's Picks for You</Text>
                            </View>
                            <Text style={styles.heroDesc}>
                                I found 3 people looking for your specific expertise in your area. They are highly likely to convert.
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Leads List */}
                    <View style={styles.list}>
                        {leads.map((lead, index) => (
                            <View key={lead.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{lead.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardName}>{lead.name}</Text>
                                        <Text style={styles.cardDetail}>{lead.goal} • {lead.location}</Text>
                                    </View>
                                    <View style={styles.matchBadge}>
                                        <Text style={styles.matchText}>{lead.match}% Match</Text>
                                    </View>
                                </View>

                                {lead.status === 'new' ? (
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleGiaContact(lead.id)}
                                    >
                                        <LinearGradient
                                            colors={['#3B82F6', '#2563EB']}
                                            style={styles.btnGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Ionicons name="chatbubbles" size={18} color="#FFF" />
                                            <Text style={styles.btnText}>Auto-Contact with Gia</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.contactedState}>
                                        <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                        <Text style={styles.contactedText}>Gia contacted. Waiting for reply.</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Upsell / Info */}
                    <View style={styles.footer}>
                        <Ionicons name="infinite" size={24} color="#666" />
                        <Text style={styles.footerText}>Pro members get 3 high-quality leads daily.</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1A",
        alignItems: "center", justifyContent: "center"
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
    subtitle: { fontSize: 12, color: "#9CA3AF" },
    proBadge: {
        backgroundColor: "#FFF", paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 6
    },
    proText: { fontSize: 10, fontWeight: "bold", color: "#000" },

    content: { paddingHorizontal: 20 },

    hero: {
        marginBottom: 24, borderRadius: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    heroGradient: { padding: 20 },
    heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    heroTitle: { fontSize: 16, fontWeight: 'bold', color: '#60A5FA' },
    heroDesc: { color: '#BFDBFE', fontSize: 14, lineHeight: 20 },

    list: { gap: 16 },
    card: {
        backgroundColor: "#111", borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: "#222"
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    avatar: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: "#222",
        alignItems: 'center', justifyContent: 'center'
    },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: "#FFF" },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 16, fontWeight: 'bold', color: "#FFF", marginBottom: 2 },
    cardDetail: { fontSize: 12, color: "#999" },
    matchBadge: {
        backgroundColor: 'rgba(126, 217, 87, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
    },
    matchText: { color: '#7ED957', fontSize: 12, fontWeight: 'bold' },

    actionBtn: { borderRadius: 12, overflow: 'hidden' },
    btnGradient: {
        paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    contactedState: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 12, backgroundColor: '#1A1A1A', borderRadius: 12
    },
    contactedText: { color: '#999', fontSize: 14 },

    footer: {
        marginTop: 40, alignItems: 'center', gap: 8, paddingBottom: 40
    },
    footerText: { color: '#666', fontSize: 12 }
})
