/**
 * Facility Integrations Settings
 * Connect existing court management systems (CourtReserve, PodPlay, etc.)
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
import { externalIntegrationService, IntegrationType, IntegrationConfig } from "@/lib/services/external-integration-service"
import { colors, spacing, borderRadius } from "@/lib/theme"

export default function IntegrationsScreen() {
    const { user } = useAuth()
    const params = useLocalSearchParams()
    const facilityId = params.facilityId as string || user?.id || ""

    const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null)
    const [config, setConfig] = useState<IntegrationConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [apiKey, setApiKey] = useState("")
    const [organizationId, setOrganizationId] = useState("")
    const [venueSlug, setVenueSlug] = useState("")

    const integrations = externalIntegrationService.getSupportedIntegrations()

    useEffect(() => {
        loadConfig()
    }, [facilityId])

    const loadConfig = async () => {
        setLoading(true)
        const existing = await externalIntegrationService.getIntegrationConfig(facilityId)
        if (existing) {
            setConfig(existing)
            setSelectedIntegration(existing.type)
            setApiKey(existing.apiKey || "")
            setOrganizationId(existing.organizationId || "")
            setVenueSlug(existing.venueSlug || "")
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!selectedIntegration) {
            Alert.alert("Error", "Please select an integration")
            return
        }

        setSaving(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const newConfig: IntegrationConfig = {
                type: selectedIntegration,
                apiKey,
                organizationId: selectedIntegration === "courtreserve" ? organizationId : undefined,
                venueSlug: selectedIntegration === "podplay" ? venueSlug : undefined,
                isActive: true,
            }

            await externalIntegrationService.saveIntegrationConfig(facilityId, newConfig)

            // Test the connection
            const courts = await externalIntegrationService.syncCourts(facilityId)

            if (courts.length > 0) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                Alert.alert(
                    "✅ Connected!",
                    `Successfully synced ${courts.length} courts from ${selectedIntegration}`,
                    [{ text: "OK", onPress: () => router.back() }]
                )
            } else {
                Alert.alert("Warning", "Connected but no courts found. Please check your API credentials.")
            }
        } catch (error: any) {
            Alert.alert("Connection Failed", error.message || "Please check your API credentials")
        } finally {
            setSaving(false)
        }
    }

    const handleDisconnect = async () => {
        Alert.alert(
            "Disconnect Integration",
            "Are you sure you want to disconnect this integration?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: async () => {
                        await externalIntegrationService.saveIntegrationConfig(facilityId, {
                            type: "manual",
                            isActive: false,
                        })
                        setConfig(null)
                        setSelectedIntegration(null)
                        setApiKey("")
                        setOrganizationId("")
                        setVenueSlug("")
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
                    <Text style={styles.headerTitle}>Integrations</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                    {/* Intro */}
                    <View style={styles.introCard}>
                        <Ionicons name="link" size={32} color={colors.primary} />
                        <Text style={styles.introTitle}>Connect Your Booking System</Text>
                        <Text style={styles.introText}>
                            Sync your existing court management software. Players book through GoodRunss,
                            we sync with your system. You handle everything else as usual.
                        </Text>
                    </View>

                    {/* Current Connection */}
                    {config && config.isActive && (
                        <View style={styles.connectedCard}>
                            <View style={styles.connectedHeader}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                                <Text style={styles.connectedText}>
                                    Connected to {integrations.find(i => i.id === config.type)?.name}
                                </Text>
                            </View>
                            {config.lastSyncAt && (
                                <Text style={styles.lastSync}>
                                    Last synced: {new Date(config.lastSyncAt).toLocaleString()}
                                </Text>
                            )}
                            <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                                <Text style={styles.disconnectText}>Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Integration Options */}
                    <Text style={styles.sectionTitle}>Supported Platforms</Text>
                    <View style={styles.integrationsList}>
                        {integrations.map((integration) => (
                            <TouchableOpacity
                                key={integration.id}
                                style={[
                                    styles.integrationCard,
                                    selectedIntegration === integration.id && styles.integrationCardSelected,
                                ]}
                                onPress={() => {
                                    Haptics.selectionAsync()
                                    setSelectedIntegration(integration.id)
                                }}
                            >
                                <View style={styles.integrationInfo}>
                                    <Text style={styles.integrationName}>{integration.name}</Text>
                                    <TouchableOpacity onPress={() => Linking.openURL(integration.apiDocsUrl)}>
                                        <Text style={styles.docsLink}>View API Docs →</Text>
                                    </TouchableOpacity>
                                </View>
                                {selectedIntegration === integration.id && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
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
                                <Text style={styles.docsLink}>No integration, manage manually</Text>
                            </View>
                            {selectedIntegration === "manual" && (
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* API Credentials Form */}
                    {selectedIntegration && selectedIntegration !== "manual" && (
                        <View style={styles.credentialsSection}>
                            <Text style={styles.sectionTitle}>API Credentials</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>API Key</Text>
                                <TextInput
                                    style={styles.input}
                                    value={apiKey}
                                    onChangeText={setApiKey}
                                    placeholder="Enter your API key"
                                    placeholderTextColor={colors.text.muted}
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>

                            {selectedIntegration === "courtreserve" && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Organization ID</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={organizationId}
                                        onChangeText={setOrganizationId}
                                        placeholder="Your CourtReserve Org ID"
                                        placeholderTextColor={colors.text.muted}
                                        autoCapitalize="none"
                                    />
                                </View>
                            )}

                            {selectedIntegration === "podplay" && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Venue Slug</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={venueSlug}
                                        onChangeText={setVenueSlug}
                                        placeholder="e.g. my-tennis-club"
                                        placeholderTextColor={colors.text.muted}
                                        autoCapitalize="none"
                                    />
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

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color={colors.accent} />
                        <Text style={styles.infoText}>
                            Need help getting API credentials? Contact your platform's support or{" "}
                            <Text style={styles.infoLink}>reach out to us</Text>.
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
        backgroundColor: colors.bg.card,
        borderRadius: borderRadius.xl,
        padding: spacing["2xl"],
        alignItems: "center",
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    introTitle: { fontSize: 18, fontWeight: "bold", color: colors.text.primary, marginTop: spacing.md, textAlign: "center" },
    introText: { fontSize: 14, color: colors.text.secondary, marginTop: spacing.sm, textAlign: "center", lineHeight: 20 },

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
    integrationCardSelected: { borderColor: colors.primary, backgroundColor: colors.overlay.primary },
    integrationInfo: {},
    integrationName: { fontSize: 16, fontWeight: "600", color: colors.text.primary },
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

    // Save
    saveBtn: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { fontSize: 16, fontWeight: "bold", color: "#000" },

    // Info
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderRadius: borderRadius.md,
        padding: spacing.lg,
    },
    infoText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
    infoLink: { color: colors.accent },
})
