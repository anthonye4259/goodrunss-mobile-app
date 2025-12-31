/**
 * Train Global Onboarding Screen
 * 
 * Shows trainers how going global can generate more income
 * Displayed after questionnaire for trainer/instructor roles
 */

import { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import { trainerProService } from "@/lib/services/trainer-pro-service"

const { width } = Dimensions.get("window")

const TARGET_MARKETS = [
    { id: "usa", label: "🇺🇸 USA", popular: true },
    { id: "uk", label: "🇬🇧 UK", popular: true },
    { id: "europe", label: "🇪🇺 Europe", popular: true },
    { id: "middle_east", label: "🇦🇪 Middle East", popular: false },
    { id: "asia", label: "🌏 Asia", popular: false },
]

const INCOME_STATS = {
    avgRemoteSession: 75,
    avgVideoAnalysis: 35,
    monthlyPotential: 2500,
    topEarners: 8000,
}

export default function TrainGlobalOnboardingScreen() {
    const router = useRouter()
    const params = useLocalSearchParams<{ userType: string }>()

    const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["usa"])
    const [languages, setLanguages] = useState<string[]>(["English"])
    const [loading, setLoading] = useState(false)

    const handleMarketToggle = (marketId: string) => {
        Haptics.selectionAsync()
        setSelectedMarkets(prev =>
            prev.includes(marketId)
                ? prev.filter(m => m !== marketId)
                : [...prev, marketId]
        )
    }

    const handleEnableGlobal = async () => {
        if (selectedMarkets.length === 0) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setLoading(true)

        try {
            await trainerProService.enableTrainGlobal({
                targetMarkets: selectedMarkets as any[],
                acceptedCurrencies: ["USD", "EUR", "GBP"],
                languagesSpoken: languages,
                timezoneAvailability: ["EST", "PST", "GMT", "CET"],
            })

            router.push("/(tabs)")
        } catch (error) {
            console.error("Failed to enable global:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push("/(tabs)")
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Skip Button */}
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Maybe Later</Text>
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🌍</Text>
                        <Text style={styles.title}>Go Global,{"\n"}Earn More</Text>
                        <Text style={styles.subtitle}>
                            Train clients worldwide without leaving home.
                            Remote coaching is the future—be part of it.
                        </Text>
                    </View>

                    {/* Income Stats */}
                    <View style={styles.statsContainer}>
                        <LinearGradient
                            colors={["#6B9B5A20", "#0A0A0A"]}
                            style={styles.statsGradient}
                        >
                            <Text style={styles.statsTitle}>💰 Income Potential</Text>

                            <View style={styles.statRow}>
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>
                                        ${INCOME_STATS.avgRemoteSession}
                                    </Text>
                                    <Text style={styles.statLabel}>per live session</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>
                                        ${INCOME_STATS.avgVideoAnalysis}
                                    </Text>
                                    <Text style={styles.statLabel}>per video analysis</Text>
                                </View>
                            </View>

                            <View style={styles.potentialRow}>
                                <Ionicons name="trending-up" size={20} color="#6B9B5A" />
                                <Text style={styles.potentialText}>
                                    Top trainers earn <Text style={styles.potentialHighlight}>
                                        ${INCOME_STATS.topEarners}+/mo
                                    </Text> from remote clients
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* What You Get */}
                    <View style={styles.benefitsSection}>
                        <Text style={styles.sectionTitle}>What You Get</Text>

                        <View style={styles.benefitItem}>
                            <View style={styles.benefitIcon}>
                                <Ionicons name="notifications" size={20} color="#6B9B5A" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={styles.benefitTitle}>Player Lead Alerts</Text>
                                <Text style={styles.benefitDesc}>
                                    Get notified when players search for trainers in your area
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <View style={styles.benefitIcon}>
                                <Ionicons name="star" size={20} color="#6B9B5A" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={styles.benefitTitle}>Featured Placement</Text>
                                <Text style={styles.benefitDesc}>
                                    Appear in "Train with International Pros" section
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <View style={styles.benefitIcon}>
                                <Ionicons name="library" size={20} color="#6B9B5A" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={styles.benefitTitle}>Content Library</Text>
                                <Text style={styles.benefitDesc}>
                                    Sell drills, programs & courses to global audience
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <View style={styles.benefitIcon}>
                                <Ionicons name="videocam" size={20} color="#6B9B5A" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={styles.benefitTitle}>Remote Training Tools</Text>
                                <Text style={styles.benefitDesc}>
                                    Video analysis, live sessions, and training plans
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Target Markets */}
                    <View style={styles.marketsSection}>
                        <Text style={styles.sectionTitle}>Target Markets</Text>
                        <Text style={styles.sectionSubtitle}>
                            Select regions where you want to attract clients
                        </Text>

                        <View style={styles.marketsGrid}>
                            {TARGET_MARKETS.map(market => {
                                const isSelected = selectedMarkets.includes(market.id)
                                return (
                                    <TouchableOpacity
                                        key={market.id}
                                        style={[
                                            styles.marketChip,
                                            isSelected && styles.marketChipSelected,
                                        ]}
                                        onPress={() => handleMarketToggle(market.id)}
                                    >
                                        <Text style={[
                                            styles.marketLabel,
                                            isSelected && styles.marketLabelSelected,
                                        ]}>
                                            {market.label}
                                        </Text>
                                        {market.popular && (
                                            <View style={styles.popularBadge}>
                                                <Text style={styles.popularText}>HOT</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Pricing */}
                    <View style={styles.pricingSection}>
                        <LinearGradient
                            colors={["#1A1A1A", "#0F0F0F"]}
                            style={styles.pricingCard}
                        >
                            <View style={styles.pricingHeader}>
                                <Text style={styles.pricingTitle}>Train Global</Text>
                                <View style={styles.pricingBadge}>
                                    <Text style={styles.pricingBadgeText}>PRO</Text>
                                </View>
                            </View>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceAmount}>$29</Text>
                                <Text style={styles.priceUnit}>/month</Text>
                            </View>
                            <Text style={styles.pricingNote}>
                                Cancel anytime • Pays for itself with 1 client
                            </Text>
                        </LinearGradient>
                    </View>
                </ScrollView>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleEnableGlobal}
                        disabled={selectedMarkets.length === 0 || loading}
                        style={[
                            styles.enableButton,
                            selectedMarkets.length > 0 && styles.enableButtonActive,
                        ]}
                    >
                        <LinearGradient
                            colors={selectedMarkets.length > 0
                                ? ["#6B9B5A", "#4A7A3A"]
                                : ["#333", "#222"]
                            }
                            style={styles.enableGradient}
                        >
                            <Ionicons name="globe" size={20} color="#FFF" />
                            <Text style={styles.enableText}>
                                {loading ? "Setting up..." : "Enable Global Training"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.footerNote}>
                        You can configure this later in Settings
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0A0A0A",
    },
    safeArea: {
        flex: 1,
    },
    skipButton: {
        alignSelf: "flex-end",
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    skipText: {
        fontSize: 15,
        color: "#666",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    emoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        lineHeight: 40,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: "#888",
        textAlign: "center",
        lineHeight: 22,
    },
    statsContainer: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 24,
    },
    statsGradient: {
        padding: 20,
        borderWidth: 1,
        borderColor: "#6B9B5A40",
        borderRadius: 16,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    stat: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    potentialRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#2A2A2A",
    },
    potentialText: {
        fontSize: 14,
        color: "#AAA",
    },
    potentialHighlight: {
        color: "#6B9B5A",
        fontWeight: "bold",
    },
    benefitsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#888",
        marginTop: -12,
        marginBottom: 12,
    },
    benefitItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#6B9B5A20",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    benefitText: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 2,
    },
    benefitDesc: {
        fontSize: 13,
        color: "#888",
        lineHeight: 18,
    },
    marketsSection: {
        marginBottom: 24,
    },
    marketsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    marketChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    marketChipSelected: {
        backgroundColor: "#6B9B5A20",
        borderColor: "#6B9B5A",
    },
    marketLabel: {
        fontSize: 14,
        color: "#888",
    },
    marketLabelSelected: {
        color: "#FFF",
    },
    popularBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#EF4444",
        borderRadius: 4,
    },
    popularText: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#FFF",
    },
    pricingSection: {
        marginBottom: 24,
    },
    pricingCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    pricingHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    pricingTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    pricingBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: "#6B9B5A",
        borderRadius: 6,
    },
    pricingBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFF",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 8,
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    priceUnit: {
        fontSize: 16,
        color: "#888",
        marginLeft: 4,
    },
    pricingNote: {
        fontSize: 13,
        color: "#666",
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: "#1A1A1A",
    },
    enableButton: {
        borderRadius: 14,
        overflow: "hidden",
    },
    enableButtonActive: {},
    enableGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 18,
    },
    enableText: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#FFF",
    },
    footerNote: {
        fontSize: 13,
        color: "#555",
        textAlign: "center",
        marginTop: 12,
    },
})
