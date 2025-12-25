import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Share, Alert, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import { router } from "expo-router"
import { socialService, BADGES } from "@/lib/services/social-service"

export default function InviteScreen() {
    const [referralCode, setReferralCode] = useState("GR-ANTH-882") // Mock code
    const [stats, setStats] = useState({ referrals: 0, xpEarned: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        // In real app, fetch from socialService
        // const s = await socialService.getReferralStats() 
        // For now, mock or direct socialService access if available
        setStats({ referrals: 12, xpEarned: 1200 })
        setLoading(false)
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join me on GoodRunss! Use my VIP code ${referralCode} to skip the waitlist: https://goodrunss.com/invite/${referralCode}`,
            })
            // Simulate tracking a share event
            // await socialService.trackShare()
        } catch (error) {
            console.error(error)
        }
    }

    const handleCopy = async () => {
        await Clipboard.setStringAsync(referralCode)
        Alert.alert("Copied!", "Referral code copied to clipboard.")
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#000", "#111"]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Invite Friends</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* GOLDEN TICKET CARD */}
                    <View style={styles.ticketContainer}>
                        <LinearGradient
                            colors={['#FFD700', '#FDB931', '#FFD700']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ticketBorder}
                        >
                            <View style={styles.ticketInner}>
                                <View style={styles.ticketHeader}>
                                    <Text style={styles.ticketLabel}>GOLDEN TICKET</Text>
                                    <Ionicons name="sparkles" size={16} color="#B8860B" />
                                </View>
                                <Text style={styles.ticketDisc}>VIP ACCESS PASS</Text>

                                <View style={styles.codeContainer}>
                                    <Text style={styles.codeText}>{referralCode}</Text>
                                    <TouchableOpacity onPress={handleCopy}>
                                        <Ionicons name="copy-outline" size={20} color="#B8860B" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.ticketFooter}>Share for +100 XP per invite</Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* ACTIONS */}
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            style={styles.shareGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="share-social" size={20} color="#FFF" />
                            <Text style={styles.shareText}>Send Invite</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* REWARDS STATUS */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>{stats.referrals}</Text>
                            <Text style={styles.statLabel}>Friends Invited</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>{stats.xpEarned}</Text>
                            <Text style={styles.statLabel}>XP Earned</Text>
                        </View>
                    </View>

                    {/* NEXT REWARD */}
                    <View style={styles.rewardCard}>
                        <View style={styles.rewardHeader}>
                            <Text style={styles.rewardTitle}>Next Milestone</Text>
                            <Text style={styles.rewardProgress}>12 / 20</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '60%' }]} />
                        </View>
                        <View style={styles.rewardInfo}>
                            <View style={[styles.badgeIcon, { backgroundColor: '#EC4899' }]}>
                                <Ionicons name="heart" size={24} color="#FFF" />
                            </View>
                            <View>
                                <Text style={styles.badgeName}>Socialite Badge</Text>
                                <Text style={styles.badgeDesc}>Invite 8 more friends to unlock</Text>
                            </View>
                        </View>
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 10
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
        alignItems: 'center', justifyContent: 'center'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    content: { padding: 20, alignItems: 'center' },

    ticketContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 30,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    ticketBorder: {
        padding: 2,
        borderRadius: 20
    },
    ticketInner: {
        backgroundColor: '#000',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center'
    },
    ticketHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8
    },
    ticketLabel: {
        color: '#B8860B', fontWeight: 'bold', letterSpacing: 2, fontSize: 12
    },
    ticketDisc: {
        color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 24, fontStyle: 'italic'
    },
    codeContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 12, borderWidth: 1, borderColor: '#333',
        marginBottom: 20
    },
    codeText: {
        color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 1
    },
    ticketFooter: {
        color: '#666', fontSize: 12
    },

    shareBtn: {
        width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 40
    },
    shareGradient: {
        paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    shareText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    statsRow: {
        flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-around',
        marginBottom: 40
    },
    statItem: { alignItems: 'center' },
    statVal: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#666', fontSize: 12 },
    divider: { width: 1, height: 40, backgroundColor: '#222' },

    rewardCard: {
        width: '100%', backgroundColor: '#111', borderRadius: 16, padding: 20,
        borderWidth: 1, borderColor: '#222'
    },
    rewardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12
    },
    rewardTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    rewardProgress: { color: '#666', fontSize: 12 },
    progressBarBg: {
        height: 6, backgroundColor: '#222', borderRadius: 3, marginBottom: 16
    },
    progressBarFill: {
        height: '100%', backgroundColor: '#EC4899', borderRadius: 3
    },
    rewardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    badgeIcon: {
        width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center'
    },
    badgeName: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
    badgeDesc: { color: '#999', fontSize: 12 }
})
