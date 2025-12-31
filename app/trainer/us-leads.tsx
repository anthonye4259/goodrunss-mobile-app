/**
 * U.S. Player Leads Screen
 * 
 * Dashboard for trainers to view and manage leads from U.S. players
 * Part of $29/mo Trainer Pro subscription
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import {
    trainerProService,
    USPlayerLead,
    TrainerAnalytics,
} from "@/lib/services/trainer-pro-service"

export default function USPlayerLeadsScreen() {
    const [leads, setLeads] = useState<USPlayerLead[]>([])
    const [analytics, setAnalytics] = useState<TrainerAnalytics | null>(null)
    const [isPro, setIsPro] = useState(false)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [proStatus, leadsData, analyticsData] = await Promise.all([
                trainerProService.isProTrainer(),
                trainerProService.getLeads(),
                trainerProService.getAnalytics(),
            ])
            setIsPro(proStatus)
            setLeads(leadsData)
            setAnalytics(analyticsData)
        } catch (error) {
            console.error("Error loading leads:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        setRefreshing(true)
        loadData()
    }

    const handleLeadPress = async (lead: USPlayerLead) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        if (!lead.viewed) {
            await trainerProService.markLeadViewed(lead.id)
            setLeads(leads.map(l =>
                l.id === lead.id ? { ...l, viewed: true } : l
            ))
        }

        Alert.alert(
            `${lead.playerName}`,
            `From ${lead.playerCity}\nSearched for trainers in ${lead.searchedCity}\nInterested in: ${lead.sport}`,
            [
                { text: "Close", style: "cancel" },
                {
                    text: "Send Message",
                    onPress: () => handleContact(lead),
                },
            ]
        )
    }

    const handleContact = async (lead: USPlayerLead) => {
        await trainerProService.markLeadContacted(lead.id)
        setLeads(leads.map(l =>
            l.id === lead.id ? { ...l, contacted: true } : l
        ))

        // In production, this would open a messaging interface
        Alert.alert("Coming Soon", "Direct messaging with players will be available soon!")
    }

    const handleUpgrade = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push("/settings/trainer-pro")
    }

    const getTimeAgo = (timestamp: string) => {
        const now = new Date()
        const date = new Date(timestamp)
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diff < 1) return "Just now"
        if (diff < 24) return `${diff}h ago`
        if (diff < 48) return "Yesterday"
        return `${Math.floor(diff / 24)}d ago`
    }

    const unreadCount = leads.filter(l => !l.viewed).length

    if (!isPro) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

                <SafeAreaView style={styles.safeArea} edges={["top"]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>U.S. Player Leads</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.upgradeContainer}>
                        <Text style={styles.upgradeEmoji}>🇺🇸</Text>
                        <Text style={styles.upgradeTitle}>Get U.S. Player Leads</Text>
                        <Text style={styles.upgradeDesc}>
                            Know when U.S. players search for trainers in your city.
                            Connect with potential clients before the competition!
                        </Text>

                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="notifications" size={20} color="#6B9B5A" />
                                <Text style={styles.featureText}>
                                    Real-time lead notifications
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="person" size={20} color="#6B9B5A" />
                                <Text style={styles.featureText}>
                                    See player name, city & sport interest
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="chatbubbles" size={20} color="#6B9B5A" />
                                <Text style={styles.featureText}>
                                    Direct messaging to convert leads
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="analytics" size={20} color="#6B9B5A" />
                                <Text style={styles.featureText}>
                                    Analytics on U.S. engagement
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                            <LinearGradient
                                colors={["#6B9B5A", "#4A7A3A"]}
                                style={styles.upgradeGradient}
                            >
                                <Text style={styles.upgradeButtonText}>
                                    Upgrade to Trainer Pro - $29/mo
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.trialButton}
                            onPress={() => trainerProService.startFreeTrial().then(loadData)}
                        >
                            <Text style={styles.trialButtonText}>
                                Start 7-Day Free Trial
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>U.S. Player Leads</Text>
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount} new</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={handleRefresh}>
                        <Ionicons name="refresh" size={24} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#6B9B5A"
                        />
                    }
                >
                    {/* Analytics Cards */}
                    {analytics && (
                        <View style={styles.analyticsRow}>
                            <View style={styles.analyticsCard}>
                                <Text style={styles.analyticsValue}>
                                    {analytics.profileViewsFromUS}
                                </Text>
                                <Text style={styles.analyticsLabel}>U.S. Views</Text>
                            </View>
                            <View style={styles.analyticsCard}>
                                <Text style={styles.analyticsValue}>
                                    {analytics.leadCount}
                                </Text>
                                <Text style={styles.analyticsLabel}>Total Leads</Text>
                            </View>
                            <View style={styles.analyticsCard}>
                                <Text style={styles.analyticsValue}>
                                    {analytics.conversionRate}%
                                </Text>
                                <Text style={styles.analyticsLabel}>Conversion</Text>
                            </View>
                        </View>
                    )}

                    {/* Top U.S. Cities */}
                    {analytics && analytics.topViewingCities.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Top Viewing Cities</Text>
                            <View style={styles.citiesRow}>
                                {analytics.topViewingCities.slice(0, 5).map((city, index) => (
                                    <View key={city.city} style={styles.cityChip}>
                                        <Text style={styles.cityRank}>#{index + 1}</Text>
                                        <Text style={styles.cityName}>{city.city}</Text>
                                        <Text style={styles.cityCount}>{city.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Leads List */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Leads</Text>

                        {leads.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color="#666" />
                                <Text style={styles.emptyTitle}>No leads yet</Text>
                                <Text style={styles.emptyText}>
                                    When U.S. players search for trainers in your area, you'll see them here.
                                </Text>
                            </View>
                        ) : (
                            leads.map(lead => (
                                <TouchableOpacity
                                    key={lead.id}
                                    style={[
                                        styles.leadCard,
                                        !lead.viewed && styles.leadCardUnread,
                                    ]}
                                    onPress={() => handleLeadPress(lead)}
                                >
                                    <LinearGradient
                                        colors={lead.viewed ? ["#1A1A1A", "#0F0F0F"] : ["#6B9B5A20", "#0F0F0F"]}
                                        style={styles.leadGradient}
                                    >
                                        {!lead.viewed && (
                                            <View style={styles.newDot} />
                                        )}

                                        <View style={styles.leadAvatar}>
                                            <Text style={styles.leadInitial}>
                                                {lead.playerName.charAt(0)}
                                            </Text>
                                        </View>

                                        <View style={styles.leadInfo}>
                                            <Text style={styles.leadName}>{lead.playerName}</Text>
                                            <Text style={styles.leadLocation}>
                                                From {lead.playerCity} 🇺🇸
                                            </Text>
                                            <Text style={styles.leadInterest}>
                                                Searched: {lead.searchedCity} • {lead.sport}
                                            </Text>
                                        </View>

                                        <View style={styles.leadMeta}>
                                            <Text style={styles.leadTime}>
                                                {getTimeAgo(lead.timestamp)}
                                            </Text>
                                            {lead.contacted && (
                                                <Ionicons name="checkmark-done" size={16} color="#6B9B5A" />
                                            )}
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    badge: {
        backgroundColor: "#6B9B5A",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#FFF",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    analyticsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    analyticsCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    analyticsValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    analyticsLabel: {
        fontSize: 11,
        color: "#888",
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 12,
    },
    citiesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    cityChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#1A1A1A",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    cityRank: {
        fontSize: 10,
        color: "#6B9B5A",
        fontWeight: "bold",
    },
    cityName: {
        fontSize: 12,
        color: "#FFF",
    },
    cityCount: {
        fontSize: 10,
        color: "#888",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
    },
    leadCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    leadCardUnread: {
        borderWidth: 1,
        borderColor: "#6B9B5A",
    },
    leadGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
    },
    newDot: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6B9B5A",
    },
    leadAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
    leadInitial: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    leadInfo: {
        flex: 1,
        marginLeft: 12,
    },
    leadName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
    },
    leadLocation: {
        fontSize: 12,
        color: "#6B9B5A",
        marginTop: 2,
    },
    leadInterest: {
        fontSize: 11,
        color: "#888",
        marginTop: 4,
    },
    leadMeta: {
        alignItems: "flex-end",
    },
    leadTime: {
        fontSize: 11,
        color: "#666",
    },
    // Upgrade Screen
    upgradeContainer: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    upgradeEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    upgradeTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
    },
    upgradeDesc: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 22,
    },
    featureList: {
        marginTop: 32,
        width: "100%",
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    featureText: {
        fontSize: 14,
        color: "#FFF",
    },
    upgradeButton: {
        marginTop: 32,
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
    },
    upgradeGradient: {
        paddingVertical: 16,
        alignItems: "center",
    },
    upgradeButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    trialButton: {
        marginTop: 16,
        paddingVertical: 12,
    },
    trialButtonText: {
        fontSize: 14,
        color: "#6B9B5A",
        fontWeight: "600",
    },
})
