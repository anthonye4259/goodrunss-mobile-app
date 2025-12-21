/**
 * CheckBeforeYouGo - Premium Pre-Game Intelligence
 * 
 * THE CORE VALUE PROP:
 * "No one leaves the house to play a sport without checking GoodRunss first"
 * 
 * This is what users see when they open the app - 
 * instant, premium, actionable intelligence.
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { getSportContext, getSportConfig, type SportContext, type Sport } from "@/lib/services/sport-intelligence-service"
import { getActivityConditions, type ActivityConditions } from "@/lib/services/activity-conditions-service"

const { width } = Dimensions.get("window")

// ============================================
// TYPES
// ============================================

interface QuickCheckResult {
    sport: Sport
    sportConfig: { name: string; emoji: string; color: string }
    context: SportContext
    conditions?: ActivityConditions
    verdict: "perfect" | "good" | "okay" | "wait"
    verdictLabel: string
    verdictEmoji: string
    verdictColor: string
    keyInsight: string
    bestTime: string
}

// ============================================
// MAIN COMPONENT
// ============================================

interface CheckBeforeYouGoProps {
    userLat: number
    userLng: number
    favoriteSport: Sport
    onVenuePress?: (venueId: string) => void
}

export function CheckBeforeYouGo({
    userLat,
    userLng,
    favoriteSport,
    onVenuePress,
}: CheckBeforeYouGoProps) {
    const [result, setResult] = useState<QuickCheckResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const fadeAnim = useState(new Animated.Value(0))[0]

    useEffect(() => {
        loadCheck()
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const loadCheck = async () => {
        try {
            setLoading(true)

            const sportConfig = getSportConfig(favoriteSport)
            const context = await getSportContext("default", favoriteSport)

            // Determine verdict
            const { verdict, verdictLabel, verdictEmoji, verdictColor } = getVerdict(context)

            // Key insight
            const keyInsight = getKeyInsight(context, favoriteSport)

            setResult({
                sport: favoriteSport,
                sportConfig,
                context,
                verdict,
                verdictLabel,
                verdictEmoji,
                verdictColor,
                keyInsight,
                bestTime: context.bestTime,
            })

            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start()
        } catch (error) {
            console.error("[CheckBeforeYouGo] Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = () => {
        return currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const formatDate = () => {
        return currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingPulse}>
                    <Text style={styles.loadingEmoji}>🏀</Text>
                </View>
                <Text style={styles.loadingText}>Checking conditions...</Text>
            </View>
        )
    }

    if (!result) return null

    const { sportConfig, context, verdict, verdictLabel, verdictEmoji, verdictColor, keyInsight, bestTime } = result

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={[verdictColor + "15", "#0A0A0A"]}
                style={styles.gradientBg}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.timeText}>{formatTime()}</Text>
                        <Text style={styles.dateText}>{formatDate()}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => router.push("/settings")}
                    >
                        <Ionicons name="settings-outline" size={22} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                {/* Main Verdict Card */}
                <View style={styles.verdictCard}>
                    <LinearGradient
                        colors={[verdictColor + "25", verdictColor + "08"]}
                        style={styles.verdictGradient}
                    >
                        {/* Sport Badge */}
                        <View style={[styles.sportBadge, { backgroundColor: sportConfig.color + "20" }]}>
                            <Text style={styles.sportEmoji}>{sportConfig.emoji}</Text>
                            <Text style={[styles.sportName, { color: sportConfig.color }]}>
                                {sportConfig.name}
                            </Text>
                        </View>

                        {/* Verdict */}
                        <View style={styles.verdictMain}>
                            <Text style={styles.verdictEmoji}>{verdictEmoji}</Text>
                            <Text style={[styles.verdictLabel, { color: verdictColor }]}>
                                {verdictLabel.toUpperCase()}
                            </Text>
                        </View>

                        {/* Key Insight */}
                        <Text style={styles.keyInsight}>{keyInsight}</Text>

                        {/* Context Line */}
                        <View style={styles.contextRow}>
                            <View style={styles.contextItem}>
                                <Ionicons name="time" size={16} color="#9CA3AF" />
                                <Text style={styles.contextText}>
                                    Best: <Text style={styles.contextValue}>{bestTime}</Text>
                                </Text>
                            </View>
                            <View style={styles.contextDivider} />
                            <View style={styles.contextItem}>
                                <Ionicons name="sunny" size={16} color="#9CA3AF" />
                                <Text style={styles.contextText}>
                                    <Text style={styles.contextValue}>{context.weatherScore}%</Text> conditions
                                </Text>
                            </View>
                        </View>

                        {/* CTA */}
                        <TouchableOpacity
                            style={[styles.ctaButton, { backgroundColor: verdictColor }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                router.push("/venues/map")
                            }}
                        >
                            <Text style={styles.ctaText}>Find Courts Near Me</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <QuickActionButton
                        icon="map"
                        label="Map"
                        onPress={() => router.push("/venues/map")}
                    />
                    <QuickActionButton
                        icon="analytics"
                        label="Forecast"
                        onPress={() => router.push("/global-live")}
                    />
                    <QuickActionButton
                        icon="megaphone"
                        label="Report"
                        onPress={() => router.push("/report-facility")}
                    />
                    <QuickActionButton
                        icon="people"
                        label="Find Players"
                        onPress={() => router.push("/find-partners")}
                    />
                </View>

                {/* Status Footer */}
                <View style={styles.footer}>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>Live data</Text>
                    </View>
                    <Text style={styles.updateText}>Updated just now</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    )
}

// ============================================
// QUICK ACTION BUTTON
// ============================================

function QuickActionButton({
    icon,
    label,
    onPress,
}: {
    icon: string
    label: string
    onPress: () => void
}) {
    return (
        <TouchableOpacity style={styles.quickAction} onPress={onPress}>
            <View style={styles.quickActionIcon}>
                <Ionicons name={icon as any} size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    )
}

// ============================================
// VERDICT LOGIC
// ============================================

function getVerdict(context: SportContext): {
    verdict: "perfect" | "good" | "okay" | "wait"
    verdictLabel: string
    verdictEmoji: string
    verdictColor: string
} {
    const { activityLevel, weatherScore, shouldCome } = context

    // Perfect: Good activity + great weather
    if (shouldCome && weatherScore >= 80 &&
        (activityLevel === "quiet" || activityLevel === "active")) {
        return {
            verdict: "perfect",
            verdictLabel: "Perfect Time to Go",
            verdictEmoji: "✨",
            verdictColor: "#22C55E",
        }
    }

    // Good: Should come, decent conditions
    if (shouldCome && weatherScore >= 60) {
        return {
            verdict: "good",
            verdictLabel: "Good Time to Go",
            verdictEmoji: "👍",
            verdictColor: "#22C55E",
        }
    }

    // Okay: Possible but not ideal
    if (weatherScore >= 40 && activityLevel !== "packed") {
        return {
            verdict: "okay",
            verdictLabel: "Okay to Go",
            verdictEmoji: "🤔",
            verdictColor: "#EAB308",
        }
    }

    // Wait: Busy or bad conditions
    return {
        verdict: "wait",
        verdictLabel: "Maybe Wait",
        verdictEmoji: "⏳",
        verdictColor: "#F97316",
    }
}

function getKeyInsight(context: SportContext, sport: Sport): string {
    const { activityLevel, weatherScore, atmosphereLabel, sportTip } = context

    // Return sport tip if available
    if (sportTip) return sportTip

    // Activity-based insights
    if (activityLevel === "packed") {
        return "Courts are packed right now. Consider waiting or trying a different location."
    }

    if (activityLevel === "dead" || activityLevel === "quiet") {
        return "Courts are quiet. Perfect for practice or finding a game."
    }

    if (activityLevel === "active" || activityLevel === "busy") {
        return `${atmosphereLabel}. Good energy for pickup games.`
    }

    // Weather-based insights
    if (weatherScore >= 85) {
        return "Conditions are perfect for playing right now."
    }

    if (weatherScore < 40) {
        return "Weather might affect play. Check conditions before heading out."
    }

    return "Moderate activity expected. Good time to check out the courts."
}

// ============================================
// COMPACT VERSION (for home screen)
// ============================================

export function CheckBeforeYouGoCompact({
    sport,
    onPress,
}: {
    sport: Sport
    onPress: () => void
}) {
    const [context, setContext] = useState<SportContext | null>(null)

    useEffect(() => {
        getSportContext("default", sport).then(setContext)
    }, [sport])

    if (!context) return null

    const sportConfig = getSportConfig(sport)
    const { verdict, verdictLabel, verdictEmoji, verdictColor } = getVerdict(context)

    return (
        <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
            <LinearGradient
                colors={[verdictColor + "15", "#1A1A2E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.compactGradient}
            >
                <View style={styles.compactLeft}>
                    <Text style={styles.compactEmoji}>{sportConfig.emoji}</Text>
                    <View>
                        <Text style={styles.compactTitle}>Check before you go</Text>
                        <Text style={[styles.compactVerdict, { color: verdictColor }]}>
                            {verdictEmoji} {verdictLabel}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </LinearGradient>
        </TouchableOpacity>
    )
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBg: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A0A",
    },
    loadingPulse: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    loadingEmoji: {
        fontSize: 36,
    },
    loadingText: {
        fontSize: 16,
        color: "#9CA3AF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    timeText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: -1,
    },
    dateText: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 2,
    },
    settingsButton: {
        padding: 8,
    },
    verdictCard: {
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 24,
    },
    verdictGradient: {
        padding: 24,
    },
    sportBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    sportEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    sportName: {
        fontSize: 14,
        fontWeight: "700",
    },
    verdictMain: {
        alignItems: "center",
        marginBottom: 16,
    },
    verdictEmoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    verdictLabel: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 1,
    },
    keyInsight: {
        fontSize: 16,
        color: "#D1D5DB",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 20,
    },
    contextRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    contextItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    contextText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
    contextValue: {
        color: "#fff",
        fontWeight: "600",
    },
    contextDivider: {
        width: 1,
        height: 16,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginHorizontal: 16,
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    quickAction: {
        alignItems: "center",
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    liveIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#22C55E",
    },
    liveText: {
        fontSize: 12,
        color: "#22C55E",
        fontWeight: "500",
    },
    updateText: {
        fontSize: 12,
        color: "#6B7280",
    },
    // Compact
    compactContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: "hidden",
    },
    compactGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    compactLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    compactEmoji: {
        fontSize: 28,
    },
    compactTitle: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2,
    },
    compactVerdict: {
        fontSize: 15,
        fontWeight: "700",
    },
})
