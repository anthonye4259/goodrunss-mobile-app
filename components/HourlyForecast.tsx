/**
 * HourlyForecast - Waze-Style Prediction Timeline
 * 
 * Shows predictions for the next 12 hours:
 * - Visual timeline with color bars
 * - Best time recommendation
 * - Tomorrow preview
 */

import React, { useMemo } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import type { ActivityLevel, Sport } from "@/lib/services/sport-intelligence-service"

interface HourlyForecastProps {
    venueId: string
    sport: Sport
    predictions: HourPrediction[]
    bestTime: { hour: string; reason: string }
    accuracy?: number
    compact?: boolean
}

interface HourPrediction {
    hour: number
    label: string           // "3 PM"
    level: ActivityLevel
    color: string
    emoji: string
    isNow?: boolean
    isBest?: boolean
}

// Color mapping
const LEVEL_COLORS: Record<ActivityLevel, string> = {
    dead: "#374151",
    quiet: "#22C55E",
    active: "#EAB308",
    busy: "#F97316",
    packed: "#EF4444",
}

export function HourlyForecast({
    venueId,
    sport,
    predictions,
    bestTime,
    accuracy,
    compact = false,
}: HourlyForecastProps) {
    // Find the current hour and best hour
    const nowIndex = predictions.findIndex(p => p.isNow)
    const bestIndex = predictions.findIndex(p => p.isBest)

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactHeader}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.compactTitle}>Next 6 hours</Text>
                </View>
                <View style={styles.compactBars}>
                    {predictions.slice(0, 6).map((pred, index) => (
                        <View
                            key={index}
                            style={[
                                styles.compactBar,
                                { backgroundColor: pred.color },
                                pred.isNow && styles.compactBarNow,
                                pred.isBest && styles.compactBarBest,
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.compactLabels}>
                    <Text style={styles.compactLabel}>Now</Text>
                    <Text style={styles.compactLabel}>+6h</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="sparkles" size={18} color="#EC4899" />
                    <Text style={styles.headerTitle}>GIA Prediction</Text>
                </View>
                {accuracy !== undefined && accuracy > 0 && (
                    <View style={styles.accuracyBadge}>
                        <Text style={styles.accuracyText}>{accuracy}% accurate</Text>
                    </View>
                )}
            </View>

            {/* Best Time Recommendation */}
            <View style={styles.bestTimeCard}>
                <View style={styles.bestTimeIcon}>
                    <Ionicons name="time" size={24} color="#EC4899" />
                </View>
                <View style={styles.bestTimeContent}>
                    <Text style={styles.bestTimeLabel}>Best time to come</Text>
                    <Text style={styles.bestTimeValue}>{bestTime.hour}</Text>
                    <Text style={styles.bestTimeReason}>{bestTime.reason}</Text>
                </View>
            </View>

            {/* Timeline */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeline}
                contentContainerStyle={styles.timelineContent}
            >
                {predictions.map((pred, index) => (
                    <View
                        key={index}
                        style={[
                            styles.hourSlot,
                            pred.isNow && styles.hourSlotNow,
                            pred.isBest && styles.hourSlotBest,
                        ]}
                    >
                        {/* Activity bar */}
                        <View style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        backgroundColor: pred.color,
                                        height: this.getBarHeight(pred.level),
                                    }
                                ]}
                            />
                        </View>

                        {/* Activity indicator dot */}
                        <View style={[styles.hourDot, { backgroundColor: pred.color }]} />

                        {/* Time label */}
                        <Text style={[
                            styles.hourLabel,
                            pred.isNow && styles.hourLabelNow,
                        ]}>
                            {pred.isNow ? "NOW" : pred.label}
                        </Text>

                        {/* Best indicator */}
                        {pred.isBest && (
                            <View style={styles.bestDot} />
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <LegendItem color={LEVEL_COLORS.quiet} label="Quiet" />
                <LegendItem color={LEVEL_COLORS.active} label="Active" />
                <LegendItem color={LEVEL_COLORS.busy} label="Busy" />
                <LegendItem color={LEVEL_COLORS.packed} label="Packed" />
            </View>
        </View>
    )
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{label}</Text>
        </View>
    )
}

function getBarHeight(level: ActivityLevel): number {
    const heights: Record<ActivityLevel, number> = {
        dead: 10,
        quiet: 20,
        active: 35,
        busy: 50,
        packed: 65,
    }
    return heights[level]
}

/**
 * Tomorrow Preview Card
 */
export function TomorrowPreview({
    bestMorning,
    bestAfternoon,
    bestEvening,
}: {
    bestMorning: { hour: string; level: ActivityLevel }
    bestAfternoon: { hour: string; level: ActivityLevel }
    bestEvening: { hour: string; level: ActivityLevel }
}) {
    return (
        <View style={styles.tomorrowCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Ionicons name="calendar" size={16} color="#9CA3AF" />
                <Text style={styles.tomorrowTitle}>Tomorrow</Text>
            </View>
            <View style={styles.tomorrowSlots}>
                <TimeSlot
                    label="Morning"
                    time={bestMorning.hour}
                    level={bestMorning.level}
                />
                <TimeSlot
                    label="Afternoon"
                    time={bestAfternoon.hour}
                    level={bestAfternoon.level}
                />
                <TimeSlot
                    label="Evening"
                    time={bestEvening.hour}
                    level={bestEvening.level}
                />
            </View>
        </View>
    )
}

function TimeSlot({
    label,
    time,
    level
}: {
    label: string
    time: string
    level: ActivityLevel
}) {
    return (
        <View style={styles.timeSlot}>
            <Text style={styles.timeSlotLabel}>{label}</Text>
            <View style={[
                styles.timeSlotIndicator,
                { backgroundColor: LEVEL_COLORS[level] + "30" }
            ]}>
                <View style={[
                    styles.timeSlotDot,
                    { backgroundColor: LEVEL_COLORS[level] }
                ]} />
                <Text style={styles.timeSlotTime}>{time}</Text>
            </View>
        </View>
    )
}

/**
 * Generate predictions for display
 */
export function generateHourlyPredictions(
    sport: Sport,
    venueId: string,
    basePattern: number[],
    startHour: number = new Date().getHours()
): HourPrediction[] {
    const predictions: HourPrediction[] = []
    const now = new Date().getHours()

    let lowestScore = 100
    let bestHourIndex = 0

    for (let i = 0; i < 12; i++) {
        const hour = (startHour + i) % 24
        const score = basePattern[hour] || 30

        const level = scoreToLevel(score)

        predictions.push({
            hour,
            label: formatHour(hour),
            level,
            color: LEVEL_COLORS[level],
            emoji: getLevelEmoji(level),
            isNow: hour === now,
        })

        if (score < lowestScore && hour >= 6) { // Don't recommend before 6 AM
            lowestScore = score
            bestHourIndex = i
        }
    }

    // Mark best hour
    if (predictions[bestHourIndex]) {
        predictions[bestHourIndex].isBest = true
    }

    return predictions
}

function scoreToLevel(score: number): ActivityLevel {
    if (score < 15) return "dead"
    if (score < 35) return "quiet"
    if (score < 60) return "active"
    if (score < 80) return "busy"
    return "packed"
}

function formatHour(hour: number): string {
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}${ampm}`
}

function getLevelEmoji(level: ActivityLevel): string {
    // Return empty string - we use color dots now
    return ""
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A2E",
        borderRadius: 16,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    accuracyBadge: {
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    accuracyText: {
        fontSize: 11,
        color: "#22C55E",
        fontWeight: "600",
    },
    bestTimeCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 12,
    },
    bestTimeIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    bestTimeEmoji: {
        fontSize: 24,
    },
    bestTimeContent: {
        flex: 1,
    },
    bestTimeLabel: {
        fontSize: 11,
        color: "#8B5CF6",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    bestTimeValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#fff",
    },
    bestTimeReason: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    timeline: {
        marginBottom: 12,
    },
    timelineContent: {
        paddingRight: 16,
    },
    hourSlot: {
        alignItems: "center",
        width: 44,
        marginRight: 8,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.03)",
    },
    hourSlotNow: {
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },
    hourSlotBest: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
    },
    barContainer: {
        height: 70,
        justifyContent: "flex-end",
        marginBottom: 6,
    },
    bar: {
        width: 28,
        borderRadius: 4,
    },
    hourEmoji: {
        fontSize: 14,
        marginBottom: 4,
    },
    hourLabel: {
        fontSize: 10,
        color: "#6B7280",
        fontWeight: "500",
    },
    hourLabelNow: {
        color: "#8B5CF6",
        fontWeight: "700",
    },
    hourDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginBottom: 8,
    },
    bestDot: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22C55E",
    },
    legend: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendLabel: {
        fontSize: 11,
        color: "#6B7280",
    },
    // Compact
    compactContainer: {
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        padding: 10,
    },
    compactHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
    },
    compactTitle: {
        fontSize: 11,
        color: "#6B7280",
    },
    compactBars: {
        flexDirection: "row",
        height: 24,
        gap: 3,
    },
    compactBar: {
        flex: 1,
        borderRadius: 4,
    },
    compactBarNow: {
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },
    compactBarBest: {
        borderWidth: 1,
        borderColor: "#22C55E",
    },
    compactLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    compactLabel: {
        fontSize: 10,
        color: "#6B7280",
    },
    // Tomorrow
    tomorrowCard: {
        backgroundColor: "#1A1A2E",
        borderRadius: 12,
        padding: 12,
    },
    tomorrowTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 10,
    },
    tomorrowSlots: {
        flexDirection: "row",
        gap: 8,
    },
    timeSlot: {
        flex: 1,
    },
    timeSlotLabel: {
        fontSize: 10,
        color: "#6B7280",
        marginBottom: 4,
    },
    timeSlotIndicator: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderRadius: 8,
        gap: 6,
    },
    timeSlotDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    timeSlotTime: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
})
