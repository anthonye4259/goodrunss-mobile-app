/**
 * CheckBeforeYouGo - Premium Pre-Game Intelligence
 * 
 * Minimal. Clean. Sophisticated.
 * Think Apple, not Discord.
 */

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { getSportContext, getSportConfig, type SportContext, type Sport } from "@/lib/services/sport-intelligence-service"

const { width } = Dimensions.get("window")

// ============================================
// TYPES
// ============================================

interface QuickCheckResult {
    sport: Sport
    verdict: "go" | "good" | "wait"
    verdictLabel: string
    verdictColor: string
    insight: string
    bestTime: string
    conditions: number
}

// ============================================
// MAIN COMPONENT
// ============================================

interface CheckBeforeYouGoProps {
    userLat: number
    userLng: number
    favoriteSport: Sport
}

export function CheckBeforeYouGo({
    userLat,
    userLng,
    favoriteSport,
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
            const context = await getSportContext("default", favoriteSport)
            const { verdict, verdictLabel, verdictColor } = getVerdict(context)
            const insight = getInsight(context)

            setResult({
                sport: favoriteSport,
                verdict,
                verdictLabel,
                verdictColor,
                insight,
                bestTime: context.bestTime,
                conditions: context.weatherScore,
            })

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start()
        } catch (error) {
            console.error("[Check] Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = () => {
        return currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingRing} />
                <Text style={styles.loadingText}>Checking...</Text>
            </View>
        )
    }

    if (!result) return null

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={["#0F0F0F", "#0A0A0A"]}
                style={styles.gradientBg}
            >
                {/* Time */}
                <Text style={styles.timeText}>{formatTime()}</Text>

                {/* Verdict */}
                <View style={styles.verdictSection}>
                    <View style={[styles.verdictDot, { backgroundColor: result.verdictColor }]} />
                    <Text style={[styles.verdictLabel, { color: result.verdictColor }]}>
                        {result.verdictLabel}
                    </Text>
                </View>

                {/* Insight - one line */}
                <Text style={styles.insight}>{result.insight}</Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.statLabel}>Best</Text>
                        <Text style={styles.statValue}>{result.bestTime}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Ionicons name="partly-sunny-outline" size={16} color="#6B7280" />
                        <Text style={styles.statLabel}>Conditions</Text>
                        <Text style={styles.statValue}>{result.conditions}%</Text>
                    </View>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                        router.push("/venues/map")
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.ctaText}>Find Courts</Text>
                    <Ionicons name="chevron-forward" size={18} color="#000" />
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={styles.actions}>
                    <ActionButton icon="map-outline" label="Map" onPress={() => router.push("/venues/map")} />
                    <ActionButton icon="bar-chart-outline" label="Forecast" onPress={() => router.push("/global-live")} />
                    <ActionButton icon="flag-outline" label="Report" onPress={() => router.push("/report-facility")} />
                    <ActionButton icon="people-outline" label="Players" onPress={() => router.push("/find-partners")} />
                </View>

                {/* Live indicator */}
                <View style={styles.liveRow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    )
}

// ============================================
// ACTION BUTTON
// ============================================

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.actionIcon}>
                <Ionicons name={icon as any} size={20} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    )
}

// ============================================
// VERDICT LOGIC
// ============================================

function getVerdict(context: SportContext): { verdict: "go" | "good" | "wait"; verdictLabel: string; verdictColor: string } {
    const { activityLevel, weatherScore, shouldCome } = context

    if (shouldCome && weatherScore >= 70 && activityLevel !== "packed" && activityLevel !== "busy") {
        return { verdict: "go", verdictLabel: "Go now", verdictColor: "#22C55E" }
    }

    if (shouldCome && weatherScore >= 50) {
        return { verdict: "good", verdictLabel: "Good time", verdictColor: "#22C55E" }
    }

    return { verdict: "wait", verdictLabel: "Wait", verdictColor: "#F97316" }
}

function getInsight(context: SportContext): string {
    const { activityLevel } = context

    if (activityLevel === "packed") return "Courts are full"
    if (activityLevel === "busy") return "Expect a wait"
    if (activityLevel === "active") return "Games running"
    if (activityLevel === "quiet") return "Courts available"
    return "Courts empty"
}

// ============================================
// COMPACT VERSION
// ============================================

export function CheckCompact({ sport, onPress }: { sport: Sport; onPress: () => void }) {
    const [context, setContext] = useState<SportContext | null>(null)

    useEffect(() => {
        getSportContext("default", sport).then(setContext)
    }, [sport])

    if (!context) return null

    const { verdict, verdictLabel, verdictColor } = getVerdict(context)

    return (
        <TouchableOpacity style={styles.compactContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.compactLeft}>
                <View style={[styles.compactDot, { backgroundColor: verdictColor }]} />
                <Text style={styles.compactLabel}>{verdictLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
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
        paddingTop: 80,
        paddingHorizontal: 24,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0A0A",
    },
    loadingRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#333",
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 14,
        color: "#6B7280",
        letterSpacing: 0.5,
    },
    timeText: {
        fontSize: 56,
        fontWeight: "200",
        color: "#fff",
        letterSpacing: -2,
        marginBottom: 40,
    },
    verdictSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    verdictDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    verdictLabel: {
        fontSize: 28,
        fontWeight: "600",
        letterSpacing: -0.5,
    },
    insight: {
        fontSize: 17,
        color: "#9CA3AF",
        marginBottom: 32,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
    },
    stat: {
        alignItems: "center",
        gap: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
    },
    statValue: {
        fontSize: 17,
        fontWeight: "600",
        color: "#fff",
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#333",
        marginHorizontal: 40,
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#fff",
        paddingVertical: 16,
        borderRadius: 14,
        marginBottom: 40,
    },
    ctaText: {
        fontSize: 17,
        fontWeight: "600",
        color: "#000",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 40,
    },
    actionButton: {
        alignItems: "center",
        gap: 8,
    },
    actionIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    actionLabel: {
        fontSize: 12,
        color: "#6B7280",
    },
    liveRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    liveText: {
        fontSize: 12,
        color: "#6B7280",
        letterSpacing: 0.5,
    },
    // Compact
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 16,
    },
    compactLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    compactDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    compactLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
})
