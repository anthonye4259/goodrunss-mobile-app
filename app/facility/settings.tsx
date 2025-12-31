/**
 * Facility Settings Screen
 * Manage operating hours, blocked dates, notifications, cancellation policy
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Switch,
    Alert,
    ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams, useFocusEffect } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService } from "@/lib/services/facility-service"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const DAY_LABELS: { [key: string]: string } = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
}

interface OperatingHours {
    [key: string]: { open: string; close: string; closed: boolean }
}

interface NotificationSettings {
    notifyOnBooking: boolean
    notifyOnCancellation: boolean
    dailySummary: boolean
}

export default function FacilitySettingsScreen() {
    const { user } = useAuth()
    const { facilityId } = useLocalSearchParams<{ facilityId: string }>()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // State
    const [facilityName, setFacilityName] = useState("")
    const [autoAcceptBookings, setAutoAcceptBookings] = useState(true)
    const [operatingHours, setOperatingHours] = useState<OperatingHours>({})
    const [blockedDates, setBlockedDates] = useState<string[]>([])
    const [notifications, setNotifications] = useState<NotificationSettings>({
        notifyOnBooking: true,
        notifyOnCancellation: true,
        dailySummary: false,
    })
    const [cancellationWindowHours, setCancellationWindowHours] = useState("24")
    const [newBlockedDate, setNewBlockedDate] = useState("")

    useFocusEffect(
        useCallback(() => {
            loadSettings()
        }, [facilityId])
    )

    const loadSettings = async () => {
        if (!facilityId) return
        setLoading(true)

        try {
            const facility = await facilityService.getClaimedFacility(facilityId)
            if (facility) {
                setFacilityName(facility.businessName || "")
                setAutoAcceptBookings(facility.autoAcceptBookings ?? true)
                setOperatingHours(facility.operatingHours || getDefaultHours())
                setBlockedDates(facility.blockedDates || [])
                setNotifications({
                    notifyOnBooking: facility.notifyOnBooking ?? true,
                    notifyOnCancellation: facility.notifyOnCancellation ?? true,
                    dailySummary: facility.dailySummary ?? false,
                })
                setCancellationWindowHours(String(facility.cancellationWindowHours || 24))
            }
        } catch (error) {
            console.error("Error loading settings:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleAutoAccept = async (value: boolean) => {
        if (!facilityId) return
        setAutoAcceptBookings(value)
        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await facilityService.updateAutoAcceptSetting(facilityId, value)
        } catch (error) {
            setAutoAcceptBookings(!value) // Revert on error
            Alert.alert("Error", "Failed to update setting")
        } finally {
            setSaving(false)
        }
    }

    const getDefaultHours = (): OperatingHours => {
        const hours: OperatingHours = {}
        DAYS.forEach(day => {
            hours[day] = {
                open: day === "saturday" ? "07:00" : day === "sunday" ? "08:00" : "06:00",
                close: day === "saturday" ? "20:00" : day === "sunday" ? "18:00" : "22:00",
                closed: false,
            }
        })
        return hours
    }

    const handleSaveHours = async () => {
        if (!facilityId) return
        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await facilityService.updateOperatingHours(facilityId, operatingHours)
            Alert.alert("Success", "Operating hours updated!")
        } catch (error) {
            Alert.alert("Error", "Failed to save hours")
        } finally {
            setSaving(false)
        }
    }

    const handleSaveNotifications = async () => {
        if (!facilityId) return
        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await facilityService.updateNotificationSettings(facilityId, notifications)
            Alert.alert("Success", "Notification settings updated!")
        } catch (error) {
            Alert.alert("Error", "Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    const handleSaveCancellationPolicy = async () => {
        if (!facilityId) return
        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await facilityService.updateCancellationPolicy(facilityId, parseInt(cancellationWindowHours))
            Alert.alert("Success", "Cancellation policy updated!")
        } catch (error) {
            Alert.alert("Error", "Failed to save policy")
        } finally {
            setSaving(false)
        }
    }

    const handleAddBlockedDate = async () => {
        if (!facilityId || !newBlockedDate) return

        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(newBlockedDate)) {
            Alert.alert("Invalid Date", "Use format: YYYY-MM-DD (e.g., 2025-01-15)")
            return
        }

        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            await facilityService.addBlockedDate(facilityId, newBlockedDate)
            setBlockedDates([...blockedDates, newBlockedDate].sort())
            setNewBlockedDate("")
        } catch (error) {
            Alert.alert("Error", "Failed to add blocked date")
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveBlockedDate = async (date: string) => {
        if (!facilityId) return

        Alert.alert("Remove Date", `Remove ${date} from blocked dates?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    setSaving(true)
                    try {
                        await facilityService.removeBlockedDate(facilityId, date)
                        setBlockedDates(blockedDates.filter(d => d !== date))
                    } catch (error) {
                        Alert.alert("Error", "Failed to remove date")
                    } finally {
                        setSaving(false)
                    }
                },
            },
        ])
    }

    const toggleDayClosed = (day: string) => {
        setOperatingHours(prev => ({
            ...prev,
            [day]: { ...prev[day], closed: !prev[day].closed },
        }))
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7ED957" />
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
                    <Text style={styles.headerTitle}>Facility Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Autopilot Mode - Premium Card */}
                    <View style={styles.autopilotCard}>
                        <View style={styles.autopilotHeader}>
                            <View style={styles.autopilotBadge}>
                                <Ionicons name="flash" size={16} color="#FFD700" />
                                <Text style={styles.autopilotBadgeText}>Autopilot Mode</Text>
                            </View>
                            <Switch
                                value={autoAcceptBookings}
                                onValueChange={handleToggleAutoAccept}
                                trackColor={{ false: "#333", true: "#7ED957" }}
                                thumbColor="#FFF"
                            />
                        </View>
                        <Text style={styles.autopilotTitle}>Auto-Accept All Bookings</Text>
                        <Text style={styles.autopilotDescription}>
                            {autoAcceptBookings
                                ? "✓ Bookings are automatically confirmed. Zero work needed."
                                : "Bookings require your approval within 5 minutes."}
                        </Text>
                        {autoAcceptBookings && (
                            <View style={styles.autopilotActive}>
                                <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                                <Text style={styles.autopilotActiveText}>Running on autopilot</Text>
                            </View>
                        )}
                    </View>

                    {/* Operating Hours Section */}

                    <TouchableOpacity
                        style={[styles.section, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
                        onPress={() => router.push(`/facility/edit-profile?facilityId=${facilityId}`)}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <View style={{ backgroundColor: "#7ED95720", padding: 8, borderRadius: 8 }}>
                                <Ionicons name="images" size={20} color="#7ED957" />
                            </View>
                            <View>
                                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Edit Profile</Text>
                                <Text style={{ color: "#888", fontSize: 12 }}>Photos, Bio, Amenities</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Operating Hours</Text>
                        <Text style={styles.sectionSubtitle}>When can players book?</Text>

                        {DAYS.map(day => (
                            <View key={day} style={styles.hoursRow}>
                                <TouchableOpacity
                                    style={styles.dayToggle}
                                    onPress={() => toggleDayClosed(day)}
                                >
                                    <Ionicons
                                        name={operatingHours[day]?.closed ? "square-outline" : "checkbox"}
                                        size={24}
                                        color={operatingHours[day]?.closed ? "#666" : "#7ED957"}
                                    />
                                    <Text style={[
                                        styles.dayLabel,
                                        operatingHours[day]?.closed && { color: "#666" }
                                    ]}>
                                        {DAY_LABELS[day]}
                                    </Text>
                                </TouchableOpacity>

                                {!operatingHours[day]?.closed ? (
                                    <View style={styles.hoursInputs}>
                                        <TextInput
                                            style={styles.hoursInput}
                                            value={operatingHours[day]?.open || "06:00"}
                                            onChangeText={(text) => setOperatingHours(prev => ({
                                                ...prev,
                                                [day]: { ...prev[day], open: text },
                                            }))}
                                            placeholder="06:00"
                                            placeholderTextColor="#666"
                                        />
                                        <Text style={styles.toText}>to</Text>
                                        <TextInput
                                            style={styles.hoursInput}
                                            value={operatingHours[day]?.close || "22:00"}
                                            onChangeText={(text) => setOperatingHours(prev => ({
                                                ...prev,
                                                [day]: { ...prev[day], close: text },
                                            }))}
                                            placeholder="22:00"
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                ) : (
                                    <Text style={styles.closedText}>Closed</Text>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveHours}
                            disabled={saving}
                        >
                            <Text style={styles.saveBtnText}>
                                {saving ? "Saving..." : "Save Hours"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Blocked Dates Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Blocked Dates</Text>
                        <Text style={styles.sectionSubtitle}>Holidays, maintenance, closures</Text>

                        <View style={styles.addBlockedRow}>
                            <TextInput
                                style={[styles.hoursInput, { flex: 1 }]}
                                value={newBlockedDate}
                                onChangeText={setNewBlockedDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#666"
                            />
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={handleAddBlockedDate}
                            >
                                <Ionicons name="add" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {blockedDates.length === 0 ? (
                            <Text style={styles.noBlockedText}>No blocked dates</Text>
                        ) : (
                            blockedDates.map(date => (
                                <View key={date} style={styles.blockedDateRow}>
                                    <Text style={styles.blockedDate}>{date}</Text>
                                    <TouchableOpacity onPress={() => handleRemoveBlockedDate(date)}>
                                        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Notifications Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notifications</Text>
                        <Text style={styles.sectionSubtitle}>How do you want to be notified?</Text>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>New Booking Alerts</Text>
                                <Text style={styles.settingDesc}>Get notified for every booking</Text>
                            </View>
                            <Switch
                                value={notifications.notifyOnBooking}
                                onValueChange={(v) => setNotifications(prev => ({ ...prev, notifyOnBooking: v }))}
                                trackColor={{ false: "#333", true: "#7ED957" }}
                                thumbColor="#FFF"
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Cancellation Alerts</Text>
                                <Text style={styles.settingDesc}>Get notified when someone cancels</Text>
                            </View>
                            <Switch
                                value={notifications.notifyOnCancellation}
                                onValueChange={(v) => setNotifications(prev => ({ ...prev, notifyOnCancellation: v }))}
                                trackColor={{ false: "#333", true: "#7ED957" }}
                                thumbColor="#FFF"
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>Daily Summary</Text>
                                <Text style={styles.settingDesc}>Receive daily booking report at 9am</Text>
                            </View>
                            <Switch
                                value={notifications.dailySummary}
                                onValueChange={(v) => setNotifications(prev => ({ ...prev, dailySummary: v }))}
                                trackColor={{ false: "#333", true: "#7ED957" }}
                                thumbColor="#FFF"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveNotifications}
                            disabled={saving}
                        >
                            <Text style={styles.saveBtnText}>
                                {saving ? "Saving..." : "Save Notifications"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cancellation Policy Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                        <Text style={styles.sectionSubtitle}>How far in advance can players cancel?</Text>

                        <View style={styles.policyRow}>
                            <Text style={styles.policyLabel}>Cancellation window:</Text>
                            <View style={styles.policyInputRow}>
                                <TextInput
                                    style={styles.policyInput}
                                    value={cancellationWindowHours}
                                    onChangeText={setCancellationWindowHours}
                                    keyboardType="number-pad"
                                />
                                <Text style={styles.policyUnit}>hours before</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveCancellationPolicy}
                            disabled={saving}
                        >
                            <Text style={styles.saveBtnText}>
                                {saving ? "Saving..." : "Save Policy"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Integrations Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Integrations</Text>
                        <Text style={styles.sectionSubtitle}>Connect your booking system</Text>

                        <TouchableOpacity
                            style={styles.integrationBtn}
                            onPress={() => router.push("/facility/integrations")}
                        >
                            <View style={styles.integrationInfo}>
                                <Ionicons name="link" size={24} color="#7ED957" />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.settingLabel}>Connect Booking System</Text>
                                    <Text style={styles.settingDesc}>CourtReserve, PodPlay, OpenCourt</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#888" />
                        </TouchableOpacity>
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
    headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },

    content: { paddingHorizontal: 20, paddingBottom: 100 },

    section: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    sectionSubtitle: { color: "#888", fontSize: 14, marginTop: 4, marginBottom: 16 },

    hoursRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    dayToggle: { flexDirection: "row", alignItems: "center", width: 120 },
    dayLabel: { color: "#FFF", fontSize: 14, marginLeft: 8 },
    hoursInputs: { flexDirection: "row", alignItems: "center" },
    hoursInput: {
        width: 70,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        padding: 10,
        color: "#FFF",
        fontSize: 14,
        textAlign: "center",
    },
    toText: { color: "#888", marginHorizontal: 8 },
    closedText: { color: "#666", fontSize: 14 },

    addBlockedRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    addBtn: {
        backgroundColor: "#7ED957",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    noBlockedText: { color: "#666", fontSize: 14, textAlign: "center", paddingVertical: 16 },
    blockedDateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    blockedDate: { color: "#FFF", fontSize: 16 },

    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    settingLabel: { color: "#FFF", fontSize: 16 },
    settingDesc: { color: "#888", fontSize: 12, marginTop: 2 },

    policyRow: { marginBottom: 16 },
    policyLabel: { color: "#FFF", fontSize: 14, marginBottom: 8 },
    policyInputRow: { flexDirection: "row", alignItems: "center" },
    policyInput: {
        width: 80,
        backgroundColor: "#0A0A0A",
        borderRadius: 8,
        padding: 12,
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    policyUnit: { color: "#888", fontSize: 14, marginLeft: 12 },

    saveBtn: {
        backgroundColor: "#7ED957",
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 16,
        alignItems: "center",
    },
    saveBtnText: { color: "#000", fontSize: 16, fontWeight: "bold" },

    integrationBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 16,
    },
    integrationInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    // Autopilot Mode Card Styles
    autopilotCard: {
        backgroundColor: "rgba(255, 215, 0, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.3)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    autopilotHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    autopilotBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 215, 0, 0.15)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    autopilotBadgeText: {
        color: "#FFD700",
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 6,
    },
    autopilotTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    autopilotDescription: {
        color: "#AAA",
        fontSize: 14,
        lineHeight: 20,
    },
    autopilotActive: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 215, 0, 0.2)",
    },
    autopilotActiveText: {
        color: "#7ED957",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
})
