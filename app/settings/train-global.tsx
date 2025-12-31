/**
 * Train Global Settings Screen
 * 
 * Manage Train Global settings after initial onboarding
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Switch,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import {
    trainerProService,
    TrainerGlobalSettings,
    TRAINER_PRO_PRICING,
} from "@/lib/services/trainer-pro-service"

const TARGET_MARKETS = [
    { id: "usa", label: "🇺🇸 USA" },
    { id: "uk", label: "🇬🇧 UK" },
    { id: "europe", label: "🇪🇺 Europe" },
    { id: "middle_east", label: "🇦🇪 Middle East" },
    { id: "asia", label: "🌏 Asia" },
]

const LANGUAGES = ["English", "Spanish", "French", "Arabic", "Portuguese", "German", "Italian", "Chinese"]
const TIMEZONES = ["EST", "CST", "MST", "PST", "GMT", "CET", "GST", "JST"]

export default function TrainGlobalSettingsScreen() {
    const [isEnabled, setIsEnabled] = useState(false)
    const [isPro, setIsPro] = useState(false)
    const [settings, setSettings] = useState<TrainerGlobalSettings | null>(null)
    const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"])
    const [selectedTimezones, setSelectedTimezones] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const [proStatus, globalSettings] = await Promise.all([
                trainerProService.isProTrainer(),
                trainerProService.getGlobalSettings(),
            ])

            setIsPro(proStatus)
            setSettings(globalSettings)

            if (globalSettings) {
                setIsEnabled(globalSettings.enabled)
                setSelectedMarkets(globalSettings.targetMarkets)
                setSelectedLanguages(globalSettings.languagesSpoken)
                setSelectedTimezones(globalSettings.timezoneAvailability)
            }
        } catch (error) {
            console.error("Error loading settings:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleEnabled = async (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        if (value && !isPro) {
            // Prompt to subscribe
            Alert.alert(
                "Train Global",
                "Enable Train Global to reach international clients for $29/month.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Subscribe",
                        onPress: () => {
                            // In production, trigger Stripe subscription
                            Alert.alert("Coming Soon", "Subscription flow will be implemented soon!")
                        },
                    },
                ]
            )
            return
        }

        if (value) {
            await trainerProService.enableTrainGlobal({
                targetMarkets: selectedMarkets as any[],
                acceptedCurrencies: ["USD", "EUR", "GBP"],
                languagesSpoken: selectedLanguages,
                timezoneAvailability: selectedTimezones,
            })
        } else {
            await trainerProService.disableTrainGlobal()
        }

        setIsEnabled(value)
    }

    const handleMarketToggle = (marketId: string) => {
        Haptics.selectionAsync()
        setSelectedMarkets(prev =>
            prev.includes(marketId)
                ? prev.filter(m => m !== marketId)
                : [...prev, marketId]
        )
    }

    const handleLanguageToggle = (language: string) => {
        Haptics.selectionAsync()
        setSelectedLanguages(prev =>
            prev.includes(language)
                ? prev.filter(l => l !== language)
                : [...prev, language]
        )
    }

    const handleTimezoneToggle = (tz: string) => {
        Haptics.selectionAsync()
        setSelectedTimezones(prev =>
            prev.includes(tz)
                ? prev.filter(t => t !== tz)
                : [...prev, tz]
        )
    }

    const handleSave = async () => {
        if (selectedMarkets.length === 0) {
            Alert.alert("Error", "Please select at least one target market.")
            return
        }

        setSaving(true)
        try {
            await trainerProService.updateGlobalSettings({
                targetMarkets: selectedMarkets as any[],
                languagesSpoken: selectedLanguages,
                timezoneAvailability: selectedTimezones,
            })
            Alert.alert("Saved", "Your Train Global settings have been updated.")
        } catch (error) {
            Alert.alert("Error", "Failed to save settings.")
        } finally {
            setSaving(false)
        }
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
                    <Text style={styles.headerTitle}>Train Global</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Enable Toggle */}
                    <View style={styles.toggleCard}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleEmoji}>🌍</Text>
                            <View style={styles.toggleText}>
                                <Text style={styles.toggleTitle}>Train Global</Text>
                                <Text style={styles.toggleDesc}>
                                    Reach international clients
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isEnabled}
                            onValueChange={handleToggleEnabled}
                            trackColor={{ false: "#333", true: "#6B9B5A" }}
                            thumbColor="#FFF"
                        />
                    </View>

                    {/* Subscription Status */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Status</Text>
                            <View style={[styles.statusBadge, isPro && styles.statusBadgeActive]}>
                                <Text style={[styles.statusText, isPro && styles.statusTextActive]}>
                                    {isPro ? "Active" : "Not Subscribed"}
                                </Text>
                            </View>
                        </View>
                        {!isPro && (
                            <Text style={styles.pricingNote}>
                                ${TRAINER_PRO_PRICING.monthly.price}/month to access global features
                            </Text>
                        )}
                    </View>

                    {/* Target Markets */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Target Markets</Text>
                        <Text style={styles.sectionSubtitle}>
                            Select regions where you want to attract clients
                        </Text>
                        <View style={styles.chipGrid}>
                            {TARGET_MARKETS.map(market => {
                                const isSelected = selectedMarkets.includes(market.id)
                                return (
                                    <TouchableOpacity
                                        key={market.id}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                        onPress={() => handleMarketToggle(market.id)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {market.label}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Languages */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages Spoken</Text>
                        <View style={styles.chipGrid}>
                            {LANGUAGES.map(lang => {
                                const isSelected = selectedLanguages.includes(lang)
                                return (
                                    <TouchableOpacity
                                        key={lang}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                        onPress={() => handleLanguageToggle(lang)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {lang}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Timezones */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Timezone Availability</Text>
                        <Text style={styles.sectionSubtitle}>
                            When can you take sessions?
                        </Text>
                        <View style={styles.chipGrid}>
                            {TIMEZONES.map(tz => {
                                const isSelected = selectedTimezones.includes(tz)
                                return (
                                    <TouchableOpacity
                                        key={tz}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                        onPress={() => handleTimezoneToggle(tz)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {tz}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Save Button */}
                    {isEnabled && (
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <LinearGradient
                                colors={["#6B9B5A", "#4A7A3A"]}
                                style={styles.saveGradient}
                            >
                                <Text style={styles.saveText}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    toggleCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        marginBottom: 16,
    },
    toggleInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    toggleEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    toggleText: {},
    toggleTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    toggleDesc: {
        fontSize: 13,
        color: "#888",
    },
    statusCard: {
        padding: 16,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        marginBottom: 24,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statusLabel: {
        fontSize: 14,
        color: "#888",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#333",
        borderRadius: 8,
    },
    statusBadgeActive: {
        backgroundColor: "#6B9B5A20",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#888",
    },
    statusTextActive: {
        color: "#6B9B5A",
    },
    pricingNote: {
        fontSize: 13,
        color: "#666",
        marginTop: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#888",
        marginBottom: 12,
    },
    chipGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    chipSelected: {
        backgroundColor: "#6B9B5A20",
        borderColor: "#6B9B5A",
    },
    chipText: {
        fontSize: 13,
        color: "#888",
    },
    chipTextSelected: {
        color: "#6B9B5A",
        fontWeight: "600",
    },
    saveButton: {
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 16,
    },
    saveGradient: {
        paddingVertical: 16,
        alignItems: "center",
    },
    saveText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
})
