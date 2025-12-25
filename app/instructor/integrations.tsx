/**
 * Wellness Studio Integrations Settings
 * Connect existing studio management systems (Mindbody, Glofox, Momence)
 * 
 * ClassPass Model: Studios connect their booking system → we pull schedule → players book → we push booking back
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { externalIntegrationService, WellnessIntegrationConfig } from "@/lib/services/external-integration-service"
import { colors, spacing, borderRadius } from "@/lib/theme"
import { db } from "@/lib/firebase-config"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

type WellnessIntegrationType = "mindbody" | "glofox" | "momence" | "calendarsync" | "manual"

export default function WellnessIntegrationsScreen() {
    const { user } = useAuth()
    const params = useLocalSearchParams()
    const studioId = params.studioId as string || user?.id || ""

    const [selectedIntegration, setSelectedIntegration] = useState<WellnessIntegrationType | null>(null)
    const [config, setConfig] = useState<WellnessIntegrationConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [apiKey, setApiKey] = useState("")
    const [siteId, setSiteId] = useState("")       // Mindbody
    const [branchId, setBranchId] = useState("")   // Glofox
    const [companyUuid, setCompanyUuid] = useState("") // Momence
    const [calendarUrl, setCalendarUrl] = useState("") // CalendarSync

    const integrations = externalIntegrationService.getSupportedWellnessIntegrations()

    useEffect(() => {
        loadConfig()
    }, [studioId])

    const loadConfig = async () => {
        if (!db || !studioId) {
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const snap = await getDoc(doc(db, "studioIntegrations", studioId))
            if (snap.exists()) {
                const existing = snap.data() as WellnessIntegrationConfig
                setConfig(existing)
                setSelectedIntegration(existing.type)
                setApiKey(existing.apiKey || "")
                setSiteId(existing.siteId || "")
                setBranchId(existing.branchId || "")
                setCompanyUuid(existing.companyUuid || "")
                setCalendarUrl(existing.calendarUrl || "")
            }
        } catch (error) {
            console.error("Error loading config:", error)
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!selectedIntegration) {
            Alert.alert("Error", "Please select an integration")
            return
        }

        if (!db) {
            Alert.alert("Error", "Database not available")
            return
        }

        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const newConfig: WellnessIntegrationConfig = {
                type: selectedIntegration,
                apiKey: selectedIntegration !== "calendarsync" && selectedIntegration !== "manual" ? apiKey : undefined,
                siteId: selectedIntegration === "mindbody" ? siteId : undefined,
                branchId: selectedIntegration === "glofox" ? branchId : undefined,
                companyUuid: selectedIntegration === "momence" ? companyUuid : undefined,
                calendarUrl: selectedIntegration === "calendarsync" ? calendarUrl : undefined,
                isActive: true,
            }

            await setDoc(doc(db, "studioIntegrations", studioId), {
                ...newConfig,
                updatedAt: serverTimestamp(),
            })

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert(
                "✅ Connected!",
                `Your ${integrations.find(i => i.id === selectedIntegration)?.name} integration is now active. Classes will sync automatically.`,
                [{ text: "OK", onPress: () => router.back() }]
            )
        } catch (error: any) {
            Alert.alert("Connection Failed", error.message || "Please check your credentials")
        } finally {
            setSaving(false)
        }
    }

    const handleDisconnect = async () => {
        if (!db) return

        Alert.alert(
            "Disconnect Integration",
            "Are you sure? This will stop syncing your classes.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: async () => {
                        await setDoc(doc(db, "studioIntegrations", studioId), {
                            type: "manual",
                            isActive: false,
                            updatedAt: serverTimestamp(),
                        })
                        setConfig(null)
                        setSelectedIntegration(null)
                        setApiKey("")
                        setSiteId("")
                        setBranchId("")
                        setCompanyUuid("")
                        setCalendarUrl("")
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    },
                },
            ]
        )
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
            <LinearGradient colors={[colors.bg.primary, colors.bg.secondary]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Studio Integrations</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {/* Intro */}
                    <View style={styles.introCard}>
                        <Ionicons name="fitness" size={32} color="#8B5CF6" />
                        <Text style={styles.introTitle}>Connect Your Booking System</Text>
                        <Text style={styles.introText}>
                            Just like ClassPass! Connect your existing studio software.
                            We'll sync your schedule and push bookings back to your system.
                        </Text>
                    </View>

                    {/* How It Works */}
                    <View style={styles.howItWorks}>
                        <Text style={styles.sectionTitle}>How It Works</Text>
                        <View style={styles.stepRow}>
                            <View style={styles.stepBadge}><Text style={styles.stepNum}>1</Text></View>
                            <Text style={styles.stepText}>Connect your Mindbody/Glofox/Momence</Text>
                        </View>
                        <View style={styles.stepRow}>
                            <View style={styles.stepBadge}><Text style={styles.stepNum}>2</Text></View>
                            <Text style={styles.stepText}>We pull your class schedule automatically</Text>
                        </View>
                        <View style={styles.stepRow}>
                            <View style={styles.stepBadge}><Text style={styles.stepNum}>3</Text></View>
                            <Text style={styles.stepText}>Players discover and book your classes</Text>
                        </View>
                        <View style={styles.stepRow}>
                            <View style={styles.stepBadge}><Text style={styles.stepNum}>4</Text></View>
                            <Text style={styles.stepText}>Booking appears in YOUR system instantly</Text>
                        </View>
                    </View>

                    {/* Current Connection - Enhanced */}
                    {config && config.isActive && (
                        <View style={styles.connectedCard}>
                            <View style={styles.connectedHeader}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                                <Text style={styles.connectedText}>
                                    Connected to {integrations.find(i => i.id === config.type)?.name}
                                </Text>
                            </View>

                            {/* Sync Stats */}
                            <View style={styles.syncStats}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>Auto</Text>
                                    <Text style={styles.statLabel}>Every 30 min</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>14</Text>
                                    <Text style={styles.statLabel}>Days synced</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>✓</Text>
                                    <Text style={styles.statLabel}>Push enabled</Text>
                                </View>
                            </View>

                            {config.lastSyncAt && (
                                <Text style={styles.lastSync}>
                                    Last synced: {new Date(config.lastSyncAt).toLocaleString()}
                                </Text>
                            )}

                            {/* Show sync errors if any */}
                            {config.syncErrors && config.syncErrors.length > 0 && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="warning" size={16} color={colors.status.error} />
                                    <Text style={styles.errorText}>
                                        {config.syncErrors[config.syncErrors.length - 1]}
                                    </Text>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.connectedActions}>
                                <TouchableOpacity
                                    style={styles.syncNowBtn}
                                    onPress={async () => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                        // Trigger sync by updating the config (triggers Cloud Function)
                                        if (db) {
                                            await setDoc(doc(db, "studioIntegrations", studioId), {
                                                ...config,
                                                syncTrigger: Date.now(), // Force trigger
                                                updatedAt: serverTimestamp(),
                                            })
                                            Alert.alert("Sync Started", "Classes will refresh in a moment...")
                                            loadConfig() // Reload to show updated status
                                        }
                                    }}
                                >
                                    <Ionicons name="refresh" size={16} color={colors.primary} />
                                    <Text style={styles.syncNowText}>Sync Now</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                                    <Text style={styles.disconnectText}>Disconnect</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Integration Options */}
                    <Text style={styles.sectionTitle}>Select Your Platform</Text>
                    <View style={styles.integrationsList}>
                        {integrations.map((integration) => (
                            <TouchableOpacity
                                key={integration.id}
                                style={[
                                    styles.integrationCard,
                                    selectedIntegration === integration.id && styles.integrationCardSelected,
                                    integration.comingSoon && styles.integrationCardDisabled,
                                ]}
                                onPress={() => {
                                    if (integration.comingSoon) {
                                        Alert.alert(
                                            "Coming Soon",
                                            `${integration.name} integration will be available soon. ${integration.description}`
                                        )
                                        return
                                    }
                                    Haptics.selectionAsync()
                                    setSelectedIntegration(integration.id as WellnessIntegrationType)
                                }}
                            >
                                <View style={styles.integrationInfo}>
                                    <View style={styles.integrationNameRow}>
                                        <Text style={styles.integrationName}>{integration.name}</Text>
                                        {integration.comingSoon && (
                                            <View style={styles.comingSoonBadge}>
                                                <Text style={styles.comingSoonText}>Coming Soon</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.integrationMethod}>{integration.method}</Text>
                                    <Text style={styles.integrationDesc}>{integration.description}</Text>
                                    {integration.apiDocsUrl && !integration.comingSoon && (
                                        <TouchableOpacity onPress={() => Linking.openURL(integration.apiDocsUrl)}>
                                            <Text style={styles.docsLink}>View Setup Guide →</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {selectedIntegration === integration.id && !integration.comingSoon && (
                                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                                )}
                            </TouchableOpacity>
                        ))}

                        {/* Manual Option */}
                        <TouchableOpacity
                            style={[
                                styles.integrationCard,
                                selectedIntegration === "manual" && styles.integrationCardSelected,
                            ]}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setSelectedIntegration("manual")
                            }}
                        >
                            <View style={styles.integrationInfo}>
                                <Text style={styles.integrationName}>Manual Entry</Text>
                                <Text style={styles.integrationMethod}>Add classes manually in GoodRunss</Text>
                                <Text style={styles.integrationDesc}>No external system needed</Text>
                            </View>
                            {selectedIntegration === "manual" && (
                                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Credentials Form */}
                    {selectedIntegration && selectedIntegration !== "manual" && (
                        <View style={styles.credentialsSection}>
                            <Text style={styles.sectionTitle}>Enter Credentials</Text>

                            {selectedIntegration === "mindbody" && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>API Key</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={apiKey}
                                            onChangeText={setApiKey}
                                            placeholder="Your Mindbody API Key"
                                            placeholderTextColor={colors.text.muted}
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Site ID</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={siteId}
                                            onChangeText={setSiteId}
                                            placeholder="-99999 (found in Settings)"
                                            placeholderTextColor={colors.text.muted}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </>
                            )}

                            {selectedIntegration === "glofox" && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>API Key</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={apiKey}
                                            onChangeText={setApiKey}
                                            placeholder="Your Glofox API Key"
                                            placeholderTextColor={colors.text.muted}
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Branch ID</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={branchId}
                                            onChangeText={setBranchId}
                                            placeholder="Your branch/location ID"
                                            placeholderTextColor={colors.text.muted}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </>
                            )}

                            {selectedIntegration === "momence" && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>API Key</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={apiKey}
                                            onChangeText={setApiKey}
                                            placeholder="Your Momence API Key"
                                            placeholderTextColor={colors.text.muted}
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Company UUID</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={companyUuid}
                                            onChangeText={setCompanyUuid}
                                            placeholder="Found in Momence settings"
                                            placeholderTextColor={colors.text.muted}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </>
                            )}

                            {selectedIntegration === "calendarsync" && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Calendar URL (iCal or Google)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={calendarUrl}
                                        onChangeText={setCalendarUrl}
                                        placeholder="https://calendar.google.com/calendar/ical/..."
                                        placeholderTextColor={colors.text.muted}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <Text style={styles.inputHint}>
                                        Paste your public calendar URL. We'll sync your events.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Save Button */}
                    {selectedIntegration && (
                        <TouchableOpacity
                            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Ionicons name="link" size={20} color="#000" />
                                    <Text style={styles.saveBtnText}>
                                        {selectedIntegration === "manual" ? "Save" : "Connect & Sync"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Value Prop */}
                    <View style={styles.valueCard}>
                        <Ionicons name="trending-up" size={24} color={colors.primary} />
                        <Text style={styles.valueTitle}>Get More Students</Text>
                        <Text style={styles.valueText}>
                            Thousands of players use GoodRunss to discover classes.
                            Connect once, get new students automatically.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg.primary },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: colors.text.primary },
    scrollView: { flex: 1 },
    content: { padding: spacing.xl, paddingBottom: 100 },

    // Intro
    introCard: {
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderRadius: borderRadius.xl,
        padding: spacing["2xl"],
        alignItems: "center",
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: "rgba(139, 92, 246, 0.3)",
    },
    introTitle: { fontSize: 18, fontWeight: "bold", color: colors.text.primary, marginTop: spacing.md, textAlign: "center" },
    introText: { fontSize: 14, color: colors.text.secondary, marginTop: spacing.sm, textAlign: "center", lineHeight: 20 },

    // How It Works
    howItWorks: {
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    stepRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
    stepBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginRight: spacing.md },
    stepNum: { fontSize: 12, fontWeight: "bold", color: "#000" },
    stepText: { flex: 1, fontSize: 14, color: colors.text.secondary },

    // Connected
    connectedCard: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: "rgba(34, 197, 94, 0.3)",
    },
    connectedHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    connectedText: { fontSize: 16, fontWeight: "600", color: colors.status.success },
    lastSync: { fontSize: 12, color: colors.text.muted, marginTop: spacing.sm },
    disconnectBtn: { marginTop: spacing.md },
    disconnectText: { fontSize: 14, color: colors.status.error },

    // Section
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.text.primary, marginBottom: spacing.md },

    // Integrations List
    integrationsList: { gap: spacing.md, marginBottom: spacing.xl },
    integrationCard: {
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    integrationCardSelected: { borderColor: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.1)" },
    integrationInfo: {},
    integrationName: { fontSize: 16, fontWeight: "600", color: colors.text.primary },
    integrationMethod: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
    docsLink: { fontSize: 12, color: colors.accent, marginTop: 4 },

    // Credentials
    credentialsSection: { marginBottom: spacing.xl },
    inputGroup: { marginBottom: spacing.lg },
    inputLabel: { fontSize: 14, color: colors.text.secondary, marginBottom: spacing.sm },
    input: {
        backgroundColor: colors.bg.elevated,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        color: colors.text.primary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    inputHint: { fontSize: 12, color: colors.text.muted, marginTop: spacing.xs },

    // Save
    saveBtn: {
        backgroundColor: "#8B5CF6",
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { fontSize: 16, fontWeight: "bold", color: "#FFF" },

    // Value Card
    valueCard: {
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    valueTitle: { fontSize: 16, fontWeight: "bold", color: colors.text.primary, marginTop: spacing.sm },
    valueText: { fontSize: 13, color: colors.text.secondary, textAlign: "center", marginTop: spacing.sm, lineHeight: 18 },

    // Sync Stats
    syncStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text.primary,
    },
    statLabel: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border.default,
    },

    // Error Box
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        color: colors.status.error,
    },

    // Connected Actions
    connectedActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: spacing.lg,
    },
    syncNowBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
    },
    syncNowText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.primary,
    },

    // Coming Soon
    integrationCardDisabled: {
        opacity: 0.6,
    },
    integrationNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    comingSoonBadge: {
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    comingSoonText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#F97316",
    },
    integrationDesc: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 2,
    },
})
