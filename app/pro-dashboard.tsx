import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

type PlanPeriod = "monthly" | "3months" | "6months"

interface Plan {
    id: PlanPeriod
    name: string
    price: number
    perMonth: number
    savings?: string
    popular?: boolean
}

const PLANS: Plan[] = [
    { id: "6months", name: "6 Months", price: 75, perMonth: 12.50, savings: "Save 17%" },
    { id: "3months", name: "3 Months", price: 40, perMonth: 13.33, savings: "Save 11%", popular: true },
    { id: "monthly", name: "Monthly", price: 15, perMonth: 15, savings: "Flexible" },
]

const FEATURES = [
    { icon: "sparkles", color: "#7ED957", title: "GIA AI Assistant", description: "Your 24/7 business copilot" },
    { icon: "document-text", color: "#8B5CF6", title: "Auto CRM Parser", description: "Extract client data from docs" },
    { icon: "people", color: "#06B6D4", title: "Smart Lead Matching", description: "AI finds your ideal clients" },
    { icon: "infinite", color: "#FBBF24", title: "Unlimited Clients & Programs", description: "No limits on your business" },
    { icon: "card", color: "#EC4899", title: "Stripe Payment Integration", description: "Get paid instantly" },
    { icon: "headset", color: "#10B981", title: "Priority Support", description: "Fast help when you need it" },
]

export default function ProDashboardScreen() {
    const [selectedPlan, setSelectedPlan] = useState<PlanPeriod>("3months")

    const handleSubscribe = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // In production, this would open the web dashboard
        Alert.alert(
            "Open Pro Dashboard",
            "This will take you to our web dashboard where you can complete your subscription.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Go to Dashboard",
                    onPress: () => {
                        // Linking.openURL("https://dashboard.goodrunss.com/pricing")
                        Alert.alert("Coming Soon", "Web dashboard integration coming soon!")
                    }
                },
            ]
        )
    }

    const selectedPlanData = PLANS.find(p => p.id === selectedPlan)

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Pro Dashboard</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={styles.heroBadge}>
                            <Ionicons name="rocket" size={14} color="#7ED957" />
                            <Text style={styles.heroBadgeText}>GROW YOUR BUSINESS</Text>
                        </View>
                        <Text style={styles.heroTitle}>Unlock the Full Power of GoodRunss</Text>
                        <Text style={styles.heroSubtitle}>
                            AI-powered tools to find more clients, save time, and increase your earnings
                        </Text>
                    </View>

                    {/* Dashboard Preview */}
                    <View style={styles.previewCard}>
                        <LinearGradient
                            colors={["#0F172A", "#1E293B"]}
                            style={styles.previewGradient}
                        >
                            <View style={styles.previewHeader}>
                                <Text style={styles.previewLabel}>Actual Dashboard Preview</Text>
                            </View>
                            <View style={styles.previewContent}>
                                <View style={styles.previewStat}>
                                    <Text style={styles.previewStatValue}>$12,450</Text>
                                    <Text style={styles.previewStatLabel}>Monthly Earnings</Text>
                                </View>
                                <View style={styles.previewStat}>
                                    <Text style={styles.previewStatValue}>42</Text>
                                    <Text style={styles.previewStatLabel}>Active Clients</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Pricing Plans */}
                    <View style={styles.plansSection}>
                        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                        <View style={styles.plansRow}>
                            {PLANS.map((plan) => (
                                <TouchableOpacity
                                    key={plan.id}
                                    style={[
                                        styles.planCard,
                                        selectedPlan === plan.id && styles.planCardSelected,
                                        plan.popular && styles.planCardPopular,
                                    ]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSelectedPlan(plan.id)
                                    }}
                                >
                                    {plan.popular && (
                                        <View style={styles.popularBadge}>
                                            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                                        </View>
                                    )}
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <Text style={styles.planPrice}>${plan.price}</Text>
                                    <Text style={styles.planPerMonth}>${plan.perMonth.toFixed(2)}/mo</Text>
                                    <Text style={styles.planSavings}>{plan.savings}</Text>
                                    {selectedPlan === plan.id && (
                                        <View style={styles.selectedCheckmark}>
                                            <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Everything Included</Text>
                        {FEATURES.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                                    <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* FAQ */}
                    <View style={styles.faqSection}>
                        <Text style={styles.faqTitle}>Questions?</Text>
                        <Text style={styles.faqText}>
                            The Pro Dashboard is a web-based platform with advanced AI features.
                            Your mobile app will continue to work for free - this is an optional upgrade
                            for serious coaches who want to scale their business.
                        </Text>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Fixed CTA */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
                        <Text style={styles.ctaButtonText}>
                            Start Pro - ${selectedPlanData?.price}/{selectedPlanData?.id === "monthly" ? "mo" : selectedPlanData?.id === "3months" ? "3mo" : "6mo"}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.ctaSubtext}>Cancel anytime • 7-day free trial</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    hero: {
        alignItems: "center",
        paddingVertical: 24,
    },
    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
        marginBottom: 16,
    },
    heroBadgeText: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#7ED957",
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 22,
    },
    previewCard: {
        borderRadius: 16,
        overflow: "hidden",
        marginVertical: 16,
    },
    previewGradient: {
        padding: 16,
    },
    previewHeader: {
        marginBottom: 16,
    },
    previewLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        backgroundColor: "rgba(0,0,0,0.3)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    previewContent: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    previewStat: {
        alignItems: "center",
    },
    previewStatValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#7ED957",
    },
    previewStatLabel: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 4,
    },
    plansSection: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    plansRow: {
        flexDirection: "row",
        gap: 10,
    },
    planCard: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
        position: "relative",
    },
    planCardSelected: {
        borderColor: "#7ED957",
    },
    planCardPopular: {
        backgroundColor: "#1E293B",
    },
    popularBadge: {
        position: "absolute",
        top: -10,
        backgroundColor: "#7ED957",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    popularBadgeText: {
        fontSize: 8,
        fontWeight: "bold",
        color: "#000",
    },
    planName: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        marginVertical: 4,
    },
    planPerMonth: {
        fontSize: 11,
        color: "#666",
    },
    planSavings: {
        fontSize: 11,
        color: "#7ED957",
        marginTop: 4,
    },
    selectedCheckmark: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    featuresSection: {
        marginVertical: 16,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        gap: 14,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    faqSection: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    faqTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 8,
    },
    faqText: {
        fontSize: 13,
        color: "#9CA3AF",
        lineHeight: 20,
    },
    ctaContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0A0A0A",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: "#222",
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#7ED957",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    ctaButtonText: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#000",
    },
    ctaSubtext: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        marginTop: 10,
    },
})
