/**
 * Court Reporting Screen
 * 
 * Dedicated full-screen experience for reporting venue status.
 * Features:
 * - Activity Status (Need Players, Match Request)
 * - Granular Crowd Levels (Ranges)
 * - Game Flow / Wait Times
 * - Sport Specific Context
 */

import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import * as Haptics from "expo-haptics"
import { BlurView } from "expo-blur"

const STATUS_LEVELS = [
    { id: "quiet", label: "Quiet", range: "0-5 players", color: "#22C55E", icon: "sunny" },
    { id: "moderate", label: "Active", range: "6-15 players", color: "#FBBF24", icon: "walk" },
    { id: "busy", label: "Busy", range: "16-30 players", color: "#F97316", icon: "people" },
    { id: "packed", label: "Packed", range: "30+ players", color: "#EF4444", icon: "flame" },
]

const WAIT_TIMES = [
    { id: "walk_on", label: "Walk On", sub: "No wait", color: "#22C55E" },
    { id: "short", label: "Short Wait", sub: "1 game", color: "#8B5CF6" },
    { id: "medium", label: "Medium", sub: "2-3 games", color: "#F59E0B" },
    { id: "long", label: "Long Wait", sub: "4+ games", color: "#EF4444" },
]

export default function ReportScreen() {
    const { id, name, sport = "Basketball" } = useLocalSearchParams()

    // State
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
    const [selectedWait, setSelectedWait] = useState<string | null>(null)
    const [needPlayers, setNeedPlayers] = useState(false)
    const [matchRequest, setMatchRequest] = useState(false)

    const handleSubmit = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        // TODO: Submit to backend
        router.back()
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0A0A0A", "#111", "#050505"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Report Status</Text>
                        <Text style={styles.headerVenue}>{name || "Venue Name"}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

                    {/* 1. PLAYER REQUESTS (Top Priority) */}
                    <Text style={styles.sectionTitle}>YOUR STATUS</Text>
                    <View style={styles.togglesRow}>
                        <TouchableOpacity
                            style={[styles.toggleCard, needPlayers && styles.toggleActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                setNeedPlayers(!needPlayers)
                            }}
                        >
                            <View style={[styles.toggleIcon, needPlayers && { backgroundColor: "#EF4444" }]}>
                                <Ionicons name="person-add" size={20} color="#FFF" />
                            </View>
                            <Text style={styles.toggleLabel}>Need Players</Text>
                            <Text style={styles.toggleSub}>Broadcast alert</Text>
                            {needPlayers && <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#FFF" /></View>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.toggleCard, matchRequest && styles.toggleActive]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                setMatchRequest(!matchRequest)
                            }}
                        >
                            <View style={[styles.toggleIcon, matchRequest && { backgroundColor: "#3B82F6" }]}>
                                <Ionicons name="trophy" size={20} color="#FFF" />
                            </View>
                            <Text style={styles.toggleLabel}>Want Match</Text>
                            <Text style={styles.toggleSub}>Looking for comp</Text>
                            {matchRequest && <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#FFF" /></View>}
                        </TouchableOpacity>
                    </View>

                    {/* 2. CROWD LEVEL */}
                    <Text style={styles.sectionTitle}>HOW BUSY IS IT?</Text>
                    <View style={styles.grid}>
                        {STATUS_LEVELS.map((level) => (
                            <TouchableOpacity
                                key={level.id}
                                style={[
                                    styles.levelCard,
                                    selectedLevel === level.id && { borderColor: level.color, backgroundColor: level.color + "15" }
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedLevel(level.id)
                                }}
                            >
                                <Ionicons name={level.icon as any} size={28} color={selectedLevel === level.id ? level.color : "#666"} />
                                <Text style={[styles.levelLabel, selectedLevel === level.id && { color: level.color }]}>
                                    {level.label}
                                </Text>
                                <Text style={styles.levelRange}>{level.range}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 3. GAME FLOW / WAIT TIME */}
                    <Text style={styles.sectionTitle}>GAME FLOW</Text>
                    <View style={styles.waitList}>
                        {WAIT_TIMES.map((wait) => (
                            <TouchableOpacity
                                key={wait.id}
                                style={[
                                    styles.waitItem,
                                    selectedWait === wait.id && { borderColor: wait.color, backgroundColor: wait.color + "10" }
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedWait(wait.id)
                                }}
                            >
                                <View style={styles.waitLeft}>
                                    <View style={[styles.dot, { backgroundColor: wait.color }]} />
                                    <View>
                                        <Text style={styles.waitLabel}>{wait.label}</Text>
                                        <Text style={styles.waitSub}>{wait.sub}</Text>
                                    </View>
                                </View>
                                {selectedWait === wait.id && (
                                    <Ionicons name="checkmark-circle" size={20} color={wait.color} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, (!selectedLevel && !needPlayers && !matchRequest) && styles.submitDisabled]}
                        disabled={!selectedLevel && !needPlayers && !matchRequest}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitText}>Post Update</Text>
                        <Ionicons name="arrow-up" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1A1A1A",
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
    },
    headerTitle: { fontSize: 12, color: "#888", textAlign: "center", fontWeight: "600", letterSpacing: 1 },
    headerVenue: { fontSize: 16, color: "#FFF", textAlign: "center", fontWeight: "700" },
    content: { padding: 20, paddingBottom: 100 },

    sectionTitle: { fontSize: 13, fontWeight: "700", color: "#666", marginBottom: 12, marginTop: 24, letterSpacing: 0.5 },

    // Toggles
    togglesRow: { flexDirection: "row", gap: 12 },
    toggleCard: {
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#222",
        alignItems: "center",
    },
    toggleActive: { borderColor: "#FFF", backgroundColor: "#1A1A1A" },
    toggleIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#222",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    toggleLabel: { fontSize: 16, fontWeight: "600", color: "#FFF", marginBottom: 4 },
    toggleSub: { fontSize: 12, color: "#666" },
    checkBadge: { position: "absolute", top: 10, right: 10, backgroundColor: "#22C55E", borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },

    // Grid (Levels)
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    levelCard: {
        width: "48%",
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#222",
        alignItems: "center",
    },
    levelLabel: { fontSize: 16, fontWeight: "700", color: "#FFF", marginTop: 12, marginBottom: 4 },
    levelRange: { fontSize: 12, color: "#666" },

    // Wait List
    waitList: { gap: 8 },
    waitItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#111",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#222",
    },
    waitLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    waitLabel: { fontSize: 14, fontWeight: "600", color: "#FFF" },
    waitSub: { fontSize: 12, color: "#666" },

    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.9)",
        borderTopWidth: 1,
        borderTopColor: "#1A1A1A",
    },
    submitBtn: {
        backgroundColor: "#7ED957",
        height: 56,
        borderRadius: 28,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    submitDisabled: { opacity: 0.5, backgroundColor: "#333" },
    submitText: { fontSize: 16, fontWeight: "700", color: "#000" },
})
