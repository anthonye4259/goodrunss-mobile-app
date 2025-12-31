import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"

export default function ReferralScreen() {
    const router = useRouter()
    const { preferences } = useUserPreferences()
    const [activeTab, setActiveTab] = useState<"partner" | "peer">("partner")

    // Determine user context (Trainer vs Instructor)
    const isInstructor = preferences.userType === "instructor" ||
        (preferences.userType === "both" && preferences.activeMode === "trainer" && preferences.isStudioUser)

    const roleTerm = isInstructor ? "Instructor" : "Trainer"
    const venueTerm = isInstructor ? "Studio" : "Facility"
    const venuePlural = isInstructor ? "Studios" : "Facilities"

    const referralCode = (preferences.name || "USER").split(" ")[0].toUpperCase() + "2024"

    const handleShare = async (type: "partner" | "peer") => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const message = type === "partner"
            ? `Hey! I'm using GoodRunss to manage my ${roleTerm.toLowerCase()} business. You should list your ${venueTerm.toLowerCase()} to get more bookings. Use my code ${referralCode} for a free month!`
            : `Join me on GoodRunss! It's the best app for ${roleTerm.toLowerCase()}s to find clients and courts. Use code ${referralCode}.`

        try {
            await Share.share({
                message,
                title: "Join GoodRunss"
            })
        } catch (error) {
            console.error(error)
        }
    }

    const copyCode = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        Alert.alert("Copied!", `Referral code ${referralCode} copied to clipboard.`)
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#141414"]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Refer & Earn</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "partner" && styles.activeTab]}
                        onPress={() => setActiveTab("partner")}
                    >
                        <Text style={[styles.tabText, activeTab === "partner" && styles.activeTabText]}>
                            Refer {venuePlural}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "peer" && styles.activeTab]}
                        onPress={() => setActiveTab("peer")}
                    >
                        <Text style={[styles.tabText, activeTab === "peer" && styles.activeTabText]}>
                            Refer {roleTerm}s
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Ambassador Ladder (Gamification) */}
                    <View style={styles.ladderCard}>
                        <View style={styles.ladderHeader}>
                            <Text style={styles.ladderTitle}>Your Status: <Text style={{ color: "#7ED957" }}>Scout</Text></Text>
                            <Text style={styles.ladderLevel}>Level 1</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: "33%" }]} />
                        </View>
                        <Text style={styles.progressText}>1/3 Referrals to unlock <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Partner Status</Text></Text>

                        <View style={styles.nextReward}>
                            <Ionicons name="lock-open" size={14} color="#888" />
                            <Text style={styles.nextRewardText}>Next Unlock: 20% Recurring Commissions</Text>
                        </View>
                    </View>

                    {activeTab === "partner" ? (
                        <View style={styles.programCard}>
                            <LinearGradient
                                colors={["rgba(126, 217, 87, 0.15)", "rgba(126, 217, 87, 0.05)"]}
                                style={styles.gradientCard}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons name="business" size={32} color="#7ED957" />
                                </View>
                                <Text style={styles.programTitle}>Partner Program</Text>
                                <Text style={styles.programDesc}>
                                    Bring your favorite {venueTerm.toLowerCase()} to GoodRunss.
                                    Help them fill empty slots and earn big rewards.
                                </Text>

                                <View style={styles.rewardBox}>
                                    <Text style={styles.rewardLabel}>YOU EARN</Text>
                                    <Text style={styles.rewardValue}>20% Recurring</Text>
                                    <Text style={styles.rewardSub}>~$120/year per facility</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleShare("partner")}
                                >
                                    <LinearGradient
                                        colors={["#7ED957", "#4CAF50"]}
                                        style={styles.btnGradient}
                                    >
                                        <Text style={styles.btnText}>Sell Subscription</Text>
                                        <Ionicons name="cash-outline" size={20} color="#000" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ) : (
                        <View style={styles.programCard}>
                            <LinearGradient
                                colors={["rgba(59, 130, 246, 0.15)", "rgba(59, 130, 246, 0.05)"]}
                                style={styles.gradientCard}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: "rgba(59, 130, 246, 0.2)" }]}>
                                    <Ionicons name="people" size={32} color="#60A5FA" />
                                </View>
                                <Text style={styles.programTitle}>Community Growth</Text>
                                <Text style={styles.programDesc}>
                                    Know other {roleTerm.toLowerCase()}s? Invite them to join the
                                    fastest growing network of sports pros.
                                </Text>

                                <View style={styles.rewardBox}>
                                    <Text style={styles.rewardLabel}>YOU GET</Text>
                                    <Text style={[styles.rewardValue, { color: "#60A5FA" }]}>$25 Credit</Text>
                                    <Text style={styles.rewardSub}>Per active referral</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => handleShare("peer")}
                                >
                                    <LinearGradient
                                        colors={["#3B82F6", "#2563EB"]}
                                        style={styles.btnGradient}
                                    >
                                        <Text style={styles.btnText}>Invite {roleTerm}s</Text>
                                        <Ionicons name="share-outline" size={20} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Referral Code */}
                    <View style={styles.codeSection}>
                        <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                        <TouchableOpacity style={styles.codeBox} onPress={copyCode}>
                            <Text style={styles.codeText}>{referralCode}</Text>
                            <Ionicons name="copy-outline" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* How it works */}
                    <Text style={styles.sectionTitle}>How it works</Text>
                    <View style={styles.steps}>
                        <View style={styles.stepRow}>
                            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                            <Text style={styles.stepText}>Share your unique link or code</Text>
                        </View>
                        <View style={styles.stepRow}>
                            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                            <Text style={styles.stepText}>They sign up and complete verification</Text>
                        </View>
                        <View style={styles.stepRow}>
                            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                            <Text style={styles.stepText}>You automatically get your reward!</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

    tabs: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    tab: {
        marginRight: 24,
        paddingBottom: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#7ED957",
    },
    tabText: {
        color: "#888",
        fontSize: 16,
        fontWeight: "600",
    },
    activeTabText: {
        color: "#FFF",
    },

    // Ladder Styles
    ladderCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#333",
    },
    ladderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    ladderTitle: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    ladderLevel: {
        backgroundColor: "#333",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        color: "#BBB",
        fontSize: 12,
        fontWeight: "bold",
    },
    progressBarBg: {
        height: 6,
        backgroundColor: "#333",
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#7ED957",
        borderRadius: 3,
    },
    progressText: {
        color: "#888",
        fontSize: 12,
        marginBottom: 12,
    },
    nextReward: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        padding: 8,
        borderRadius: 8,
    },
    nextRewardText: {
        color: "#7ED957",
        fontSize: 12,
        fontWeight: "600",
    },

    content: {
        paddingHorizontal: 20,
    },
    programCard: {
        marginBottom: 32,
        borderRadius: 24,
        overflow: "hidden",
    },
    gradientCard: {
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(126, 217, 87, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    programTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 8,
        textAlign: "center",
    },
    programDesc: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    rewardBox: {
        backgroundColor: "#0A0A0A",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 24,
        width: "100%",
    },
    rewardLabel: {
        color: "#666",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
        letterSpacing: 1,
    },
    rewardValue: {
        color: "#7ED957",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 2,
    },
    rewardSub: {
        color: "#888",
        fontSize: 12,
    },
    actionBtn: {
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
    },
    btnGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 8,
    },
    btnText: {
        color: "#000", // or #FFF for peer
        fontSize: 16,
        fontWeight: "bold",
    },

    codeSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    codeLabel: {
        color: "#666",
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
        letterSpacing: 1,
    },
    codeBox: {
        backgroundColor: "#1A1A1A",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    codeText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 2,
    },

    sectionTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    steps: {
        gap: 16,
        marginBottom: 40,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    stepNum: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
    },
    stepNumText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    stepText: {
        color: "#9CA3AF",
        fontSize: 16,
    },
})
