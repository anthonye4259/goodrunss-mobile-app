/**
 * Quick Block Screen
 * 
 * Fast UI for facilities to block time slots.
 * Features:
 * - Tap court → Tap time → Blocked instantly
 * - Bulk block options (rest of day, entire day)
 * - Visual calendar view
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import { httpsCallable } from "firebase/functions"

import { useAuth } from "@/lib/auth-context"
import { functions } from "@/lib/firebase-config"
import { facilityService } from "@/lib/services/facility-service"
import { colors, spacing, borderRadius } from "@/lib/theme"

const TIME_SLOTS = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00",
]

const DAYS = ["Today", "Tomorrow", "In 2 Days"]

interface Court {
    id: string
    name: string
    type: string
}

export default function QuickBlockScreen() {
    const { facilityId } = useLocalSearchParams()
    const { user } = useAuth()

    const [courts, setCourts] = useState<Court[]>([])
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
    const [selectedDay, setSelectedDay] = useState(0) // 0 = Today
    const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [blocking, setBlocking] = useState(false)

    useEffect(() => {
        loadCourts()
    }, [facilityId])

    const loadCourts = async () => {
        if (!facilityId) return
        setLoading(true)

        try {
            // Get facility courts
            const facility = await facilityService.getClaimedFacility(facilityId as string)
            if (facility?.venue?.courts) {
                setCourts(facility.venue.courts.map((c: any, idx: number) => ({
                    id: c.id || `court-${idx}`,
                    name: c.name || `Court ${idx + 1}`,
                    type: c.type || "pickleball",
                })))
            } else {
                // Default courts if none configured
                setCourts([
                    { id: "court-1", name: "Court 1", type: "pickleball" },
                    { id: "court-2", name: "Court 2", type: "pickleball" },
                ])
            }
        } catch (error) {
            console.error("Error loading courts:", error)
        } finally {
            setLoading(false)
        }
    }

    const getDateForDay = (dayOffset: number): string => {
        const date = new Date()
        date.setDate(date.getDate() + dayOffset)
        return date.toISOString().split("T")[0]
    }

    const handleBlockSlot = async (time: string) => {
        if (!selectedCourt || !facilityId) {
            Alert.alert("Select a Court", "Please select a court first")
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setBlocking(true)

        const slotKey = `${selectedCourt.id}-${selectedDay}-${time}`

        try {
            const quickBlockSlot = httpsCallable(functions, "quickBlockSlot")

            // Calculate end time (1 hour later)
            const startHour = parseInt(time.split(":")[0])
            const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`

            await quickBlockSlot({
                facilityId,
                courtId: selectedCourt.id,
                courtName: selectedCourt.name,
                date: getDateForDay(selectedDay),
                startTime: time,
                endTime,
                reason: "Blocked via quick-block",
            })

            setBlockedSlots(prev => new Set([...prev, slotKey]))
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } catch (error: any) {
            console.error("Error blocking slot:", error)
            Alert.alert("Error", error.message || "Failed to block slot")
        } finally {
            setBlocking(false)
        }
    }

    const handleBlockRestOfDay = async () => {
        if (!selectedCourt || !facilityId) {
            Alert.alert("Select a Court", "Please select a court first")
            return
        }

        const currentHour = new Date().getHours()
        const remainingSlots = TIME_SLOTS.filter(t => parseInt(t.split(":")[0]) >= currentHour)

        Alert.alert(
            "Block Rest of Day?",
            `This will block ${remainingSlots.length} time slots for ${selectedCourt.name}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Block All",
                    style: "destructive",
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                        setBlocking(true)

                        const quickBlockSlot = httpsCallable(functions, "quickBlockSlot")

                        for (const time of remainingSlots) {
                            try {
                                const startHour = parseInt(time.split(":")[0])
                                const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`

                                await quickBlockSlot({
                                    facilityId,
                                    courtId: selectedCourt.id,
                                    courtName: selectedCourt.name,
                                    date: getDateForDay(selectedDay),
                                    startTime: time,
                                    endTime,
                                    reason: "Blocked rest of day",
                                })

                                const slotKey = `${selectedCourt.id}-${selectedDay}-${time}`
                                setBlockedSlots(prev => new Set([...prev, slotKey]))
                            } catch (error) {
                                console.error("Error blocking slot:", time, error)
                            }
                        }

                        setBlocking(false)
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                        Alert.alert("Done!", `Blocked ${remainingSlots.length} slots`)
                    },
                },
            ]
        )
    }

    const isSlotBlocked = (time: string): boolean => {
        if (!selectedCourt) return false
        const slotKey = `${selectedCourt.id}-${selectedDay}-${time}`
        return blockedSlots.has(slotKey)
    }

    const isPastSlot = (time: string): boolean => {
        if (selectedDay > 0) return false // Not today
        const now = new Date()
        const slotHour = parseInt(time.split(":")[0])
        return slotHour <= now.getHours()
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Quick Block</Text>
                    <TouchableOpacity
                        style={styles.blockAllBtn}
                        onPress={handleBlockRestOfDay}
                        disabled={!selectedCourt || blocking}
                    >
                        <Text style={styles.blockAllBtnText}>Block All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Instructions */}
                    <Text style={styles.instructions}>
                        Select court → Tap time slots to block
                    </Text>

                    {/* Court Selection */}
                    <Text style={styles.sectionLabel}>Select Court</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.courtRow}>
                            {courts.map(court => (
                                <TouchableOpacity
                                    key={court.id}
                                    style={[
                                        styles.courtChip,
                                        selectedCourt?.id === court.id && styles.courtChipSelected,
                                    ]}
                                    onPress={() => {
                                        Haptics.selectionAsync()
                                        setSelectedCourt(court)
                                    }}
                                >
                                    <Ionicons
                                        name="tennisball"
                                        size={16}
                                        color={selectedCourt?.id === court.id ? "#000" : "#888"}
                                    />
                                    <Text style={[
                                        styles.courtChipText,
                                        selectedCourt?.id === court.id && styles.courtChipTextSelected,
                                    ]}>
                                        {court.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Day Selection */}
                    <Text style={styles.sectionLabel}>Day</Text>
                    <View style={styles.dayRow}>
                        {DAYS.map((day, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.dayChip,
                                    selectedDay === idx && styles.dayChipSelected,
                                ]}
                                onPress={() => {
                                    Haptics.selectionAsync()
                                    setSelectedDay(idx)
                                }}
                            >
                                <Text style={[
                                    styles.dayChipText,
                                    selectedDay === idx && styles.dayChipTextSelected,
                                ]}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Time Slots Grid */}
                    <Text style={styles.sectionLabel}>Time Slots</Text>
                    {!selectedCourt ? (
                        <Text style={styles.selectCourtHint}>Select a court above to see time slots</Text>
                    ) : (
                        <View style={styles.slotsGrid}>
                            {TIME_SLOTS.map(time => {
                                const blocked = isSlotBlocked(time)
                                const past = isPastSlot(time)

                                return (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.slotButton,
                                            blocked && styles.slotButtonBlocked,
                                            past && styles.slotButtonPast,
                                        ]}
                                        onPress={() => handleBlockSlot(time)}
                                        disabled={blocked || past || blocking}
                                    >
                                        {blocking ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : blocked ? (
                                            <Ionicons name="close" size={18} color="#FF6B6B" />
                                        ) : (
                                            <Text style={[
                                                styles.slotButtonText,
                                                past && styles.slotButtonTextPast,
                                            ]}>
                                                {time}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    )}

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#333" }]} />
                            <Text style={styles.legendText}>Available</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#FF6B6B" }]} />
                            <Text style={styles.legendText}>Blocked</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#222" }]} />
                            <Text style={styles.legendText}>Past</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
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
    headerTitle: {
        flex: 1,
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 16,
    },
    blockAllBtn: {
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    blockAllBtnText: { color: "#FF6B6B", fontSize: 14, fontWeight: "600" },

    content: { paddingHorizontal: 20, paddingBottom: 40 },

    instructions: {
        color: "#888",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },

    sectionLabel: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 12,
        marginTop: 20,
    },

    courtRow: { flexDirection: "row", gap: 12 },
    courtChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#1A1A1A",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    courtChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    courtChipText: { color: "#888", fontSize: 14, fontWeight: "600" },
    courtChipTextSelected: { color: "#000" },

    dayRow: { flexDirection: "row", gap: 12 },
    dayChip: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    dayChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dayChipText: { color: "#888", fontSize: 14, fontWeight: "600" },
    dayChipTextSelected: { color: "#000" },

    selectCourtHint: {
        color: "#666",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 40,
    },

    slotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    slotButton: {
        width: "22%",
        aspectRatio: 1.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    slotButtonBlocked: {
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        borderColor: "#FF6B6B",
    },
    slotButtonPast: {
        backgroundColor: "#111",
        opacity: 0.5,
    },
    slotButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
    slotButtonTextPast: { color: "#444" },

    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { color: "#666", fontSize: 12 },
})
