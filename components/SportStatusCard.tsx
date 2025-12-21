/**
 * SportStatusCard - Rich Sport-Specific Display
 * 
 * Each sport gets its own look, language, and information.
 * This is THE EDGE - feels native to each community.
 */

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import type { SportContext, Sport } from "@/lib/services/sport-intelligence-service"

interface SportStatusCardProps {
    context: SportContext
    venueName?: string
    onReportPress?: () => void
    variant?: "full" | "compact" | "hero"
}

// Sport-specific gradients
const SPORT_GRADIENTS: Record<Sport, [string, string]> = {
    basketball: ["#F97316", "#EA580C"],
    tennis: ["#22C55E", "#16A34A"],
    pickleball: ["#8B5CF6", "#7C3AED"],
    volleyball: ["#EAB308", "#CA8A04"],
    golf: ["#166534", "#14532D"],
    swimming: ["#0EA5E9", "#0284C7"],
    soccer: ["#16A34A", "#15803D"],
    padel: ["#06B6D4", "#0891B2"],
    racquetball: ["#DC2626", "#B91C1C"],
}

export function SportStatusCard({
    context,
    venueName,
    onReportPress,
    variant = "full",
}: SportStatusCardProps) {
    const {
        sport,
        activityLevel,
        activityColor,
        activityEmoji,
        headline,
        subheadline,
        waitTime,
        bestTime,
        bestTimeReason,
        recommendation,
        shouldCome,
        atmosphere,
        atmosphereLabel,
        conditions,
        magicNumber,
        sportTip,
        confidence,
        confidenceLabel,
        dataSource,
        weatherImpact,
        weatherScore,
    } = context

    const gradient = SPORT_GRADIENTS[sport]

    if (variant === "compact") {
        return (
            <View style={styles.compactContainer}>
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.compactGradient}
                >
                    <Text style={styles.compactEmoji}>{activityEmoji}</Text>
                </LinearGradient>
                <View style={styles.compactContent}>
                    <Text style={styles.compactHeadline} numberOfLines={1}>
                        {headline}
                    </Text>
                    <Text style={styles.compactSubheadline} numberOfLines={1}>
                        {subheadline}
                    </Text>
                </View>
                {dataSource === "live" && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveInner} />
                    </View>
                )}
            </View>
        )
    }

    if (variant === "hero") {
        return (
            <LinearGradient
                colors={[gradient[0] + "20", gradient[1] + "10"]}
                style={styles.heroContainer}
            >
                {/* Main Status */}
                <View style={styles.heroMain}>
                    <Text style={styles.heroEmoji}>{activityEmoji}</Text>
                    <Text style={[styles.heroHeadline, { color: activityColor }]}>
                        {headline}
                    </Text>
                    <Text style={styles.heroSubheadline}>{subheadline}</Text>
                </View>

                {/* Magic Number */}
                {magicNumber && (
                    <View style={[styles.magicNumber, { borderColor: activityColor }]}>
                        <Text style={styles.magicNumberLabel}>{magicNumber.label}</Text>
                    </View>
                )}

                {/* Recommendation */}
                <View style={[
                    styles.recommendationBadge,
                    { backgroundColor: shouldCome ? "#22C55E20" : "#F9731620" }
                ]}>
                    <Ionicons
                        name={shouldCome ? "checkmark-circle" : "time"}
                        size={18}
                        color={shouldCome ? "#22C55E" : "#F97316"}
                    />
                    <Text style={[
                        styles.recommendationText,
                        { color: shouldCome ? "#22C55E" : "#F97316" }
                    ]}>
                        {recommendation}
                    </Text>
                </View>

                {/* Best Time */}
                <View style={styles.bestTimeRow}>
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text style={styles.bestTimeLabel}>Best time:</Text>
                    <Text style={styles.bestTimeValue}>{bestTime}</Text>
                    <Text style={styles.bestTimeReason}>({bestTimeReason})</Text>
                </View>
            </LinearGradient>
        )
    }

    // Full variant
    return (
        <View style={styles.container}>
            {/* Header with gradient line */}
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            />

            {/* Venue name if provided */}
            {venueName && (
                <Text style={styles.venueName}>{venueName}</Text>
            )}

            {/* Main Status Section */}
            <View style={styles.mainSection}>
                <View style={styles.statusRow}>
                    {/* Emoji + Headline */}
                    <View style={styles.headlineContainer}>
                        <Text style={styles.statusEmoji}>{activityEmoji}</Text>
                        <View>
                            <Text style={[styles.headline, { color: activityColor }]}>
                                {headline}
                            </Text>
                            <Text style={styles.subheadline}>{subheadline}</Text>
                        </View>
                    </View>

                    {/* Wait Time Badge */}
                    {waitTime && (
                        <View style={styles.waitBadge}>
                            <Text style={styles.waitTime}>{waitTime}</Text>
                            <Text style={styles.waitLabel}>wait</Text>
                        </View>
                    )}
                </View>

                {/* Magic Number (if applicable) */}
                {magicNumber && (
                    <View style={[styles.magicNumberRow, { borderColor: activityColor + "40" }]}>
                        <View style={styles.magicNumberLeft}>
                            <Text style={[styles.magicCurrent, { color: activityColor }]}>
                                {magicNumber.current}
                            </Text>
                            <Text style={styles.magicSeparator}>/</Text>
                            <Text style={styles.magicNeeded}>{magicNumber.needed}</Text>
                            <Text style={styles.magicUnit}>{magicNumber.unit}</Text>
                        </View>
                        <Text style={styles.magicLabel}>{magicNumber.label}</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            {/* Quick Stats Row */}
            <View style={styles.statsRow}>
                {/* Atmosphere */}
                <View style={styles.stat}>
                    <Ionicons
                        name={atmosphere === "competitive" ? "trophy" : atmosphere === "family" ? "people" : "happy"}
                        size={18}
                        color="#9CA3AF"
                    />
                    <Text style={styles.statLabel}>{atmosphereLabel}</Text>
                </View>

                {/* Best Time */}
                <View style={styles.stat}>
                    <Ionicons name="time" size={18} color="#9CA3AF" />
                    <Text style={styles.statLabel}>Best: {bestTime}</Text>
                </View>

                {/* Weather */}
                {weatherImpact && (
                    <View style={styles.stat}>
                        <Text style={styles.weatherEmoji}>
                            {weatherScore >= 80 ? "☀️" : weatherScore >= 50 ? "⛅" : "🌧️"}
                        </Text>
                        <Text style={styles.statLabel}>{weatherScore}%</Text>
                    </View>
                )}
            </View>

            {/* Conditions */}
            {conditions.length > 0 && (
                <View style={styles.conditionsRow}>
                    {conditions.map((condition, index) => (
                        <View
                            key={index}
                            style={[
                                styles.conditionChip,
                                {
                                    backgroundColor: condition.positive
                                        ? activityColor + "15"
                                        : "#EF444415"
                                }
                            ]}
                        >
                            <Text style={styles.conditionIcon}>{condition.icon}</Text>
                            <Text style={[
                                styles.conditionLabel,
                                { color: condition.positive ? activityColor : "#EF4444" }
                            ]}>
                                {condition.label}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Sport Tip */}
            {sportTip && (
                <View style={[styles.tipRow, { backgroundColor: gradient[0] + "10" }]}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>{sportTip}</Text>
                </View>
            )}

            {/* Recommendation */}
            <View style={[
                styles.recommendationRow,
                { backgroundColor: shouldCome ? "#22C55E10" : "#F9731610" }
            ]}>
                <Ionicons
                    name={shouldCome ? "checkmark-circle" : "information-circle"}
                    size={20}
                    color={shouldCome ? "#22C55E" : "#F97316"}
                />
                <Text style={[
                    styles.recommendationText,
                    { color: shouldCome ? "#22C55E" : "#F97316" }
                ]}>
                    {recommendation}
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.confidenceRow}>
                    <View style={[
                        styles.confidenceDot,
                        { backgroundColor: confidence >= 70 ? "#22C55E" : confidence >= 40 ? "#EAB308" : "#6B7280" }
                    ]} />
                    <Text style={styles.confidenceText}>{confidenceLabel}</Text>
                </View>

                {onReportPress && (
                    <TouchableOpacity style={styles.reportButton} onPress={onReportPress}>
                        <Ionicons name="add-circle" size={16} color="#8B5CF6" />
                        <Text style={styles.reportButtonText}>Update</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

/**
 * Mini badge for map pins
 */
export function SportStatusPill({
    context
}: {
    context: SportContext
}) {
    const gradient = SPORT_GRADIENTS[context.sport]

    return (
        <LinearGradient
            colors={[gradient[0] + "CC", gradient[1] + "CC"]}
            style={styles.pillContainer}
        >
            <Text style={styles.pillEmoji}>{context.activityEmoji}</Text>
            <Text style={styles.pillLabel}>
                {context.activityLevel === "packed" || context.activityLevel === "busy"
                    ? "BUSY"
                    : context.activityLevel === "active"
                        ? "SOME"
                        : "OPEN"
                }
            </Text>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A2E",
        borderRadius: 16,
        overflow: "hidden",
    },
    headerGradient: {
        height: 4,
    },
    venueName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    mainSection: {
        padding: 16,
    },
    statusRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headlineContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    statusEmoji: {
        fontSize: 36,
    },
    headline: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    subheadline: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 2,
    },
    waitBadge: {
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    waitTime: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    waitLabel: {
        fontSize: 10,
        color: "#6B7280",
    },
    magicNumberRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    magicNumberLeft: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    magicCurrent: {
        fontSize: 24,
        fontWeight: "800",
    },
    magicSeparator: {
        fontSize: 18,
        color: "#6B7280",
        marginHorizontal: 2,
    },
    magicNeeded: {
        fontSize: 18,
        color: "#6B7280",
        fontWeight: "600",
    },
    magicUnit: {
        fontSize: 12,
        color: "#6B7280",
        marginLeft: 6,
    },
    magicLabel: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    weatherEmoji: {
        fontSize: 16,
    },
    conditionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    conditionChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    conditionIcon: {
        fontSize: 12,
    },
    conditionLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 10,
        borderRadius: 10,
    },
    tipIcon: {
        fontSize: 14,
    },
    tipText: {
        fontSize: 13,
        color: "#D1D5DB",
        flex: 1,
    },
    recommendationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        borderRadius: 10,
    },
    recommendationText: {
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.05)",
    },
    confidenceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    confidenceDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    confidenceText: {
        fontSize: 11,
        color: "#6B7280",
    },
    reportButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
    },
    reportButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    // Compact
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#1A1A2E",
        borderRadius: 12,
    },
    compactGradient: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    compactEmoji: {
        fontSize: 20,
    },
    compactContent: {
        flex: 1,
        marginLeft: 12,
    },
    compactHeadline: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
    compactSubheadline: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    liveBadge: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    liveInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    // Hero
    heroContainer: {
        padding: 24,
        borderRadius: 20,
        alignItems: "center",
    },
    heroMain: {
        alignItems: "center",
        marginBottom: 16,
    },
    heroEmoji: {
        fontSize: 56,
        marginBottom: 8,
    },
    heroHeadline: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 1,
    },
    heroSubheadline: {
        fontSize: 16,
        color: "#9CA3AF",
        marginTop: 4,
    },
    magicNumber: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    magicNumberLabel: {
        fontSize: 14,
        color: "#D1D5DB",
    },
    recommendationBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 12,
    },
    bestTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    bestTimeLabel: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    bestTimeValue: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
    },
    bestTimeReason: {
        fontSize: 12,
        color: "#6B7280",
    },
    // Pill
    pillContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pillEmoji: {
        fontSize: 12,
    },
    pillLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.5,
    },
})
