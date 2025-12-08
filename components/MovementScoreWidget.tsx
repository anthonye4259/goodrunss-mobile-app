/**
 * Movement Score Widget
 * 
 * A WHOOP-style daily health/activity score that encourages daily app opens.
 * Uses GIA AI to provide personalized insights based on the score.
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

interface MovementScoreProps {
    onPress?: () => void
}

// Score components that make up the overall Movement Score
interface ScoreComponents {
    activity: number      // Based on steps, workouts, active minutes
    recovery: number      // Based on sleep, HRV, rest
    consistency: number   // Based on streak, regular activity
    social: number       // Based on games played, friends activity
}

// Get color based on score
const getScoreColor = (score: number): string => {
    if (score >= 80) return "#22C55E"      // Green - Excellent
    if (score >= 60) return "#7ED957"      // Light green - Good
    if (score >= 40) return "#FBBF24"      // Yellow - Moderate
    if (score >= 20) return "#F97316"      // Orange - Low
    return "#EF4444"                        // Red - Very low
}

// Get score label
const getScoreLabel = (score: number): string => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Moderate"
    if (score >= 20) return "Low"
    return "Rest Day"
}

// Get GIA insight based on score
const getGiaInsight = (score: number, components: ScoreComponents): string => {
    if (score >= 80) {
        return "You're on fire! 🔥 Your body is primed for peak performance today."
    }
    if (score >= 60) {
        if (components.recovery < 50) {
            return "Good activity, but prioritize sleep tonight for better recovery."
        }
        return "Solid day ahead! Consider a moderate intensity workout."
    }
    if (score >= 40) {
        if (components.activity < 40) {
            return "Time to get moving! Even a 20-min walk will boost your score."
        }
        return "Balance is key today. Mix light activity with rest."
    }
    if (score >= 20) {
        return "Your body needs rest. Focus on recovery and light stretching."
    }
    return "Take it easy today. Hydrate, stretch, and recover."
}

export function MovementScoreWidget({ onPress }: MovementScoreProps) {
    // Mock data - in production, this would come from health data
    const [score] = useState(72)
    const [components] = useState<ScoreComponents>({
        activity: 78,
        recovery: 65,
        consistency: 80,
        social: 68,
    })
    const [streak] = useState(5)

    const scaleAnim = useRef(new Animated.Value(0.95)).current
    const progressAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // Animate score circle fill
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start()

        // Animate progress
        Animated.timing(progressAnim, {
            toValue: score / 100,
            duration: 1000,
            useNativeDriver: false,
        }).start()
    }, [score])

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (onPress) {
            onPress()
        } else {
            router.push("/(tabs)/stats")
        }
    }

    const scoreColor = getScoreColor(score)
    const scoreLabel = getScoreLabel(score)
    const giaInsight = getGiaInsight(score, components)

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                <LinearGradient
                    colors={["#1A1A1A", "#0F0F0F"]}
                    style={styles.card}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>Movement Score</Text>
                            <View style={styles.streakBadge}>
                                <Text style={styles.streakEmoji}>🔥</Text>
                                <Text style={styles.streakText}>{streak} day streak</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.giaButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/(tabs)/gia")
                            }}
                        >
                            <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                            <Text style={styles.giaButtonText}>Ask GIA</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Score Display */}
                    <View style={styles.scoreContainer}>
                        {/* Score Circle */}
                        <View style={styles.scoreCircleContainer}>
                            <View style={[styles.scoreCircleOuter, { borderColor: scoreColor }]}>
                                <View style={styles.scoreCircleInner}>
                                    <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}</Text>
                                    <Text style={styles.scoreMax}>/100</Text>
                                </View>
                            </View>
                            <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
                        </View>

                        {/* Component Breakdown */}
                        <View style={styles.componentsContainer}>
                            <ComponentBar
                                icon="flash"
                                label="Activity"
                                value={components.activity}
                                color="#7ED957"
                            />
                            <ComponentBar
                                icon="moon"
                                label="Recovery"
                                value={components.recovery}
                                color="#8B5CF6"
                            />
                            <ComponentBar
                                icon="trending-up"
                                label="Consistency"
                                value={components.consistency}
                                color="#0EA5E9"
                            />
                            <ComponentBar
                                icon="people"
                                label="Social"
                                value={components.social}
                                color="#F97316"
                            />
                        </View>
                    </View>

                    {/* GIA Insight */}
                    <View style={styles.insightContainer}>
                        <View style={styles.insightIcon}>
                            <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                        </View>
                        <Text style={styles.insightText}>{giaInsight}</Text>
                    </View>

                    {/* View Details */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Tap to view detailed breakdown</Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    )
}

// Component bar for breakdown
function ComponentBar({
    icon,
    label,
    value,
    color
}: {
    icon: string
    label: string
    value: number
    color: string
}) {
    return (
        <View style={styles.componentRow}>
            <View style={styles.componentLabel}>
                <Ionicons name={icon as any} size={14} color={color} />
                <Text style={styles.componentLabelText}>{label}</Text>
            </View>
            <View style={styles.componentBarContainer}>
                <View style={styles.componentBarBg}>
                    <View
                        style={[
                            styles.componentBarFill,
                            { width: `${value}%`, backgroundColor: color }
                        ]}
                    />
                </View>
                <Text style={styles.componentValue}>{value}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginBottom: 24,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: "#252525",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    streakBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(251, 191, 36, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    streakEmoji: {
        fontSize: 12,
        marginRight: 4,
    },
    streakText: {
        fontSize: 12,
        color: "#FBBF24",
        fontWeight: "600",
    },
    giaButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    giaButtonText: {
        fontSize: 12,
        color: "#8B5CF6",
        fontWeight: "600",
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    scoreCircleContainer: {
        alignItems: "center",
        marginRight: 24,
    },
    scoreCircleOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    scoreCircleInner: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: "bold",
    },
    scoreMax: {
        fontSize: 14,
        color: "#666",
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 8,
    },
    componentsContainer: {
        flex: 1,
        gap: 10,
    },
    componentRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    componentLabel: {
        width: 90,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    componentLabelText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    componentBarContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    componentBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: "#252525",
        borderRadius: 3,
        overflow: "hidden",
    },
    componentBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    componentValue: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "600",
        width: 24,
        textAlign: "right",
    },
    insightContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },
    insightIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        color: "#D1D5DB",
        lineHeight: 20,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: "#666",
    },
})

export default MovementScoreWidget
