/**
 * Facility Premium Subscription Screen
 * Upgrade to Premium for reduced fees + AI features
 * Uses RevenueCat for In-App Purchase (App Store compliant)
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
import { revenueCatService } from "@/lib/revenue-cat"
import { PurchasesPackage } from "react-native-purchases"

import { useAuth } from "@/lib/auth-context"

export default function FacilityPremiumScreen() {
    const { facilityId } = useLocalSearchParams()
    const { user } = useAuth()

    const [offering, setOffering] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [currentTier, setCurrentTier] = useState<"free" | "premium">("free")
    const [monthlyRevenue, setMonthlyRevenue] = useState(2000)
    const savings = Math.round(monthlyRevenue * 0.03) // 3% savings on premium

    useEffect(() => {
        loadOfferings()
    }, [])

    const loadOfferings = async () => {
        try {
            await revenueCatService.initialize()
            const currentOffering = await revenueCatService.getOfferings()
            setOffering(currentOffering)

            // Check if already premium
            const customerInfo = await revenueCatService.getCustomerInfo()
            if (customerInfo && revenueCatService.isPro(customerInfo)) {
                setCurrentTier("premium")
            }
        } catch (e) {
            console.error("Error loading offerings:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleRestore = async () => {
        setProcessing(true)
        const success = await revenueCatService.restorePurchases()
        setProcessing(false)
        if (success) {
            setCurrentTier("premium")
            Alert.alert("Success!", "Your subscription has been restored. Welcome back! 🏆", [
                { text: "OK", onPress: () => router.back() }
            ])
        } else {
            Alert.alert("No Subscription Found", "We couldn't find an active Premium subscription for this Apple ID.")
        }
    }

    const handlePurchase = async (pack: PurchasesPackage) => {
        setProcessing(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            const success = await revenueCatService.purchasePackage(pack)
            if (success) {
                setCurrentTier("premium")
                Alert.alert("You're Premium! 🏆", "You now have full access to AI features, reduced fees, and priority placement.", [
                    { text: "Let's Go!", onPress: () => router.back() }
                ])
            }
        } catch (e) {
            console.log("Purchase failed or cancelled")
        } finally {
            setProcessing(false)
        }
    }

    // Get the monthly package from RevenueCat
    const monthlyPackage = offering?.availablePackages?.find((p: any) => p.packageType === "MONTHLY")

    const features = [
        {
            icon: "star",
            title: "Featured Placement",
            description: "Show up first when players search",
            free: false,
            premium: true,
        },
        {
            icon: "search",
            title: "Priority in Search",
            description: "Boost visibility in your area",
            free: false,
            premium: true,
        },
        {
            icon: "flash",
            title: "AI Slot Filling",
            description: "Auto-notify waitlist on cancellations",
            free: false,
            premium: true,
        },
        {
            icon: "analytics",
            title: "Demand Insights",
            description: "See when players are looking to book",
            free: false,
            premium: true,
        },
        {
            icon: "trending-down",
            title: "Reduced Fees",
            description: "5% instead of 8% on bookings",
            free: false,
            premium: true,
        },
        {
            icon: "calendar",
            title: "Accept Bookings",
            description: "Receive and manage court bookings",
            free: true,
            premium: true,
        },
        {
            icon: "stats-chart",
            title: "Basic Analytics",
            description: "Track bookings and revenue",
            free: true,
            premium: true,
        },
    ]

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#1A1510", "#0A0A0A"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: "#7ED957" }]}>Founding Member</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Current Plan Badge */}
                    {currentTier === "premium" && (
                        <View style={styles.currentPlanBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                            <Text style={styles.currentPlanText}>You're on Premium!</Text>
                        </View>
                    )}

                    {/* Pricing Card */}
                    <View style={styles.pricingCard}>
                        <LinearGradient
                            colors={["#7ED957", "#4CAF50"]}
                            style={styles.pricingGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="ribbon" size={32} color="#000" />
                            <Text style={styles.pricingLabel}>FOUNDING MEMBER</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.price}>$50</Text>
                                <Text style={styles.priceUnit}>/month</Text>
                            </View>
                            <Text style={styles.pricingSavings}>
                                Save 3% on every booking
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Savings Calculator */}
                    <View style={styles.savingsCard}>
                        <Text style={styles.savingsTitle}>See Your Savings</Text>
                        <Text style={styles.savingsSubtitle}>
                            Based on ${monthlyRevenue.toLocaleString()}/mo in bookings
                        </Text>

                        <View style={styles.savingsSlider}>
                            {[1000, 2000, 3000, 5000, 10000].map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={[
                                        styles.savingsChip,
                                        monthlyRevenue === amount && styles.savingsChipSelected,
                                    ]}
                                    onPress={() => setMonthlyRevenue(amount)}
                                >
                                    <Text style={[
                                        styles.savingsChipText,
                                        monthlyRevenue === amount && styles.savingsChipTextSelected,
                                    ]}>
                                        ${(amount / 1000).toFixed(0)}k
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.savingsResult}>
                            <Text style={styles.savingsResultLabel}>
                                {savings >= 0 ? "Monthly Savings" : "Monthly Cost"}
                            </Text>
                            <Text style={[
                                styles.savingsResultAmount,
                                savings >= 0 ? { color: "#7ED957" } : { color: "#FF6B6B" }
                            ]}>
                                {savings >= 0 ? "+" : ""}${Math.abs(savings).toLocaleString()}
                            </Text>
                        </View>

                        <Text style={styles.breakEvenText}>
                            {savings >= 0
                                ? "✅ Premium pays for itself at your volume!"
                                : `Upgrade pays off at ~$${Math.ceil(5000 / 3 * 100 / 100).toLocaleString()}/mo in bookings`}
                        </Text>
                    </View>

                    {/* Feature Comparison */}
                    <Text style={styles.sectionTitle}>What You Get</Text>

                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={[styles.featureIcon, { backgroundColor: "rgba(126, 217, 87, 0.1)" }]}>
                                <Ionicons name={feature.icon as any} size={20} color="#7ED957" />
                            </View>
                            <View style={styles.featureInfo}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.description}</Text>
                            </View>
                            <View style={styles.featureCheck}>
                                {feature.premium ? (
                                    <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
                                ) : (
                                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Upgrade Button - In-App Purchase via RevenueCat */}
                {currentTier !== "premium" && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.upgradeBtn}
                            disabled={processing || !monthlyPackage}
                            onPress={() => monthlyPackage && handlePurchase(monthlyPackage)}
                        >
                            <LinearGradient
                                colors={["#7ED957", "#4CAF50"]}
                                style={styles.upgradeBtnGradient}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Ionicons name="rocket" size={20} color="#000" />
                                        <Text style={styles.upgradeBtnText}>
                                            Upgrade to Premium - {monthlyPackage?.product?.priceString || "$50/mo"}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRestore} disabled={processing}>
                            <Text style={styles.footerNote}>Restore Purchases</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Already Premium Badge */}
                {currentTier === "premium" && (
                    <View style={styles.footer}>
                        <View style={[styles.upgradeBtn, { opacity: 0.7 }]}>
                            <LinearGradient
                                colors={["#7ED957", "#4CAF50"]}
                                style={styles.upgradeBtnGradient}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#000" />
                                <Text style={styles.upgradeBtnText}>You're Premium!</Text>
                            </LinearGradient>
                        </View>
                    </View>
                )}
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
    headerTitle: { color: "#FFD700", fontSize: 18, fontWeight: "bold" },

    content: { paddingHorizontal: 20, paddingBottom: 140 },

    currentPlanBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    currentPlanText: { color: "#7ED957", fontSize: 16, fontWeight: "600", marginLeft: 8 },

    pricingCard: { borderRadius: 20, overflow: "hidden", marginBottom: 20 },
    pricingGradient: { padding: 24, alignItems: "center" },
    pricingLabel: { color: "#000", fontSize: 14, fontWeight: "800", marginTop: 8, letterSpacing: 2 },
    priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 8 },
    price: { color: "#000", fontSize: 48, fontWeight: "900" },
    priceUnit: { color: "rgba(0,0,0,0.6)", fontSize: 18, marginLeft: 4 },
    pricingSavings: { color: "rgba(0,0,0,0.7)", fontSize: 14, marginTop: 8 },

    savingsCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    savingsTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    savingsSubtitle: { color: "#888", fontSize: 14, marginTop: 4, marginBottom: 16 },
    savingsSlider: { flexDirection: "row", justifyContent: "space-between" },
    savingsChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: "#0A0A0A",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#333",
    },
    savingsChipSelected: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
    savingsChipText: { color: "#888", fontSize: 14 },
    savingsChipTextSelected: { color: "#000", fontWeight: "600" },
    savingsResult: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    savingsResultLabel: { color: "#888", fontSize: 14 },
    savingsResultAmount: { fontSize: 28, fontWeight: "bold" },
    breakEvenText: { color: "#888", fontSize: 12, textAlign: "center", marginTop: 12 },

    sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 16 },

    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 215, 0, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    featureInfo: { flex: 1, marginLeft: 12 },
    featureTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    featureDesc: { color: "#888", fontSize: 12, marginTop: 2 },
    featureCheck: { marginLeft: 12 },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#0A0A0A",
    },
    upgradeBtn: { borderRadius: 16, overflow: "hidden" },
    upgradeBtnGradient: {
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    upgradeBtnText: { color: "#000", fontSize: 18, fontWeight: "800", marginLeft: 8 },
    footerNote: { color: "#888", fontSize: 12, textAlign: "center", marginTop: 8 },
})
