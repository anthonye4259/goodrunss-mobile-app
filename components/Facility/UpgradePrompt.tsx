/**
 * Facility Upgrade Prompt Component
 * 
 * Compelling modal to upgrade free facilities to premium:
 * - Revenue increase calculator
 * - Feature comparison
 * - One-tap upgrade flow
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Animated,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"

import {
    FACILITY_SUBSCRIPTION,
    AI_FEATURE_DESCRIPTIONS,
    facilitySubscriptionService,
} from "@/lib/services/facility-subscription-service"

interface UpgradePromptProps {
    visible: boolean
    onClose: () => void
    facilityId: string
    monthlyRevenue?: number // Current monthly booking revenue
    onUpgrade: () => void
}

export function UpgradePrompt({
    visible,
    onClose,
    facilityId,
    monthlyRevenue = 3000,
    onUpgrade,
}: UpgradePromptProps) {
    const [scaleAnim] = useState(new Animated.Value(0.8))
    const [loading, setLoading] = useState(false)

    // Calculate savings
    const monthlySavings = facilitySubscriptionService.calculateMonthlySavings(monthlyRevenue)
    const feeReduction = monthlyRevenue * 0.03 // 8% - 5% = 3% saved
    const subscriptionCost = FACILITY_SUBSCRIPTION.PREMIUM.priceMonthly

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start()
        } else {
            scaleAnim.setValue(0.8)
        }
    }, [visible])

    const handleUpgrade = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setLoading(true)

        try {
            // Create Stripe checkout session
            const result = await facilitySubscriptionService.createSubscription(facilityId)
            if (result?.sessionUrl) {
                onUpgrade()
                // Open Stripe checkout
                // router.push(result.sessionUrl) - handled by parent
            }
        } catch (error) {
            console.error("Upgrade error:", error)
        } finally {
            setLoading(false)
        }
    }

    const AI_FEATURES = [
        "aiSlotFilling",
        "demandInsights",
        "aiPricingOptimizer",
        "bookingPredictions",
        "automatedPromotions",
        "competitorAnalysis",
        "aiChatSupport",
    ] as const

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} style={styles.blurContainer}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={["#1A1A1A", "#0A0A0A"]}
                        style={styles.gradientContainer}
                    >
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#888" />
                        </TouchableOpacity>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View style={styles.header}>
                                <LinearGradient
                                    colors={["#FFD700", "#FFA500"]}
                                    style={styles.premiumBadge}
                                >
                                    <Ionicons name="star" size={24} color="#000" />
                                </LinearGradient>
                                <Text style={styles.title}>Unlock AI Features</Text>
                                <Text style={styles.subtitle}>
                                    Fill more slots, earn more revenue
                                </Text>
                            </View>

                            {/* Revenue Calculator */}
                            <View style={styles.calculatorCard}>
                                <Text style={styles.calculatorTitle}>
                                    💰 Your Potential Savings
                                </Text>

                                <View style={styles.calculatorRow}>
                                    <Text style={styles.calculatorLabel}>Monthly booking revenue</Text>
                                    <Text style={styles.calculatorValue}>${monthlyRevenue.toLocaleString()}</Text>
                                </View>

                                <View style={styles.calculatorRow}>
                                    <Text style={styles.calculatorLabel}>Fee reduction (8% → 5%)</Text>
                                    <Text style={styles.calculatorValueGreen}>-${feeReduction.toLocaleString()}/mo</Text>
                                </View>

                                <View style={styles.calculatorRow}>
                                    <Text style={styles.calculatorLabel}>Premium subscription</Text>
                                    <Text style={styles.calculatorValueRed}>+${subscriptionCost}/mo</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.calculatorRow}>
                                    <Text style={styles.calculatorLabelBold}>Net monthly savings</Text>
                                    <Text style={[
                                        styles.calculatorValueBold,
                                        monthlySavings > 0 ? styles.calculatorValueGreen : styles.calculatorValueRed
                                    ]}>
                                        {monthlySavings > 0 ? "+" : ""}${monthlySavings.toLocaleString()}
                                    </Text>
                                </View>

                                {monthlySavings <= 0 && (
                                    <Text style={styles.breakEvenNote}>
                                        💡 Break-even at ~$1,700/month in bookings
                                    </Text>
                                )}
                            </View>

                            {/* AI Features */}
                            <View style={styles.featuresSection}>
                                <Text style={styles.sectionTitle}>
                                    ⚡ 7 AI-Powered Features
                                </Text>

                                {AI_FEATURES.map((key) => {
                                    const feature = AI_FEATURE_DESCRIPTIONS[key]
                                    return (
                                        <View key={key} style={styles.featureRow}>
                                            <View style={styles.featureIcon}>
                                                <Ionicons
                                                    name={feature.icon as any}
                                                    size={20}
                                                    color="#7ED957"
                                                />
                                            </View>
                                            <View style={styles.featureText}>
                                                <Text style={styles.featureName}>{feature.name}</Text>
                                                <Text style={styles.featureDescription}>
                                                    {feature.description}
                                                </Text>
                                            </View>
                                            <Ionicons name="lock-open" size={16} color="#7ED957" />
                                        </View>
                                    )
                                })}
                            </View>

                            {/* CTA */}
                            <TouchableOpacity
                                style={styles.upgradeButton}
                                onPress={handleUpgrade}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={["#7ED957", "#4CAF50"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.upgradeButtonGradient}
                                >
                                    {loading ? (
                                        <Text style={styles.upgradeButtonText}>Loading...</Text>
                                    ) : (
                                        <>
                                            <Ionicons name="rocket" size={20} color="#000" />
                                            <Text style={styles.upgradeButtonText}>
                                                Upgrade for ${subscriptionCost}/month
                                            </Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <Text style={styles.disclaimer}>
                                Cancel anytime • Billed monthly
                            </Text>
                        </ScrollView>
                    </LinearGradient>
                </Animated.View>
            </BlurView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    blurContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: "90%",
        maxHeight: "85%",
        borderRadius: 24,
        overflow: "hidden",
    },
    gradientContainer: {
        padding: 24,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 8,
    },

    // Header
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    premiumBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "#888",
        marginTop: 8,
        textAlign: "center",
    },

    // Calculator
    calculatorCard: {
        backgroundColor: "#0F0F0F",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#222",
    },
    calculatorTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
        textAlign: "center",
    },
    calculatorRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    calculatorLabel: {
        fontSize: 14,
        color: "#888",
    },
    calculatorLabelBold: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#FFF",
    },
    calculatorValue: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "600",
    },
    calculatorValueBold: {
        fontSize: 18,
        fontWeight: "bold",
    },
    calculatorValueGreen: {
        color: "#7ED957",
    },
    calculatorValueRed: {
        color: "#EF4444",
    },
    divider: {
        height: 1,
        backgroundColor: "#333",
        marginVertical: 12,
    },
    breakEvenNote: {
        fontSize: 12,
        color: "#888",
        textAlign: "center",
        marginTop: 12,
    },

    // Features
    featuresSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1A1A1A",
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    featureText: {
        flex: 1,
    },
    featureName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
    featureDescription: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },

    // CTA
    upgradeButton: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
    },
    upgradeButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        gap: 10,
    },
    upgradeButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    disclaimer: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
})

export default UpgradePrompt
