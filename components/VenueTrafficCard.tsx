/**
 * Venue Traffic Card Component
 * 
 * Premium design showing real-time activity and GIA predictions
 * with timeline visualization of expected crowd levels
 */

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import {
    predictVenueTraffic,
    getBestVisitTime,
    TrafficLevel,
} from "@/lib/traffic-prediction"
import { getVenueActivity } from "@/lib/services/venue-checkin-service"

interface VenueTrafficCardProps {
    venueId: string
    venueName: string
    distance?: number // miles
    openUntil?: string
    sport?: string
}

interface HourPrediction {
    hour: number
    label: string
    level: TrafficLevel
    isCurrent: boolean
}

export function VenueTrafficCard({
    venueId,
    venueName,
    distance,
    openUntil,
    sport = "basketball",
}: VenueTrafficCardProps) {
    const [currentLevel, setCurrentLevel] = useState<TrafficLevel>("moderate")
    const [currentLabel, setCurrentLabel] = useState("Moderate")
    const [playerCount, setPlayerCount] = useState<number | null>(null)
    const [bestTime, setBestTime] = useState<string>("9PM")
    const [hourlyPredictions, setHourlyPredictions] = useState<HourPrediction[]>([])

    useEffect(() => {
        loadTrafficData()
    }, [venueId])

    const loadTrafficData = async () => {
        const now = new Date()
        const currentHour = now.getHours()

        // Get current prediction
        const prediction = predictVenueTraffic(venueId, now)
        setCurrentLevel(prediction.level)
        setCurrentLabel(prediction.label)

        // Get real-time player count if available
        const activity = await getVenueActivity(venueId)
        if (activity?.activeCheckIns) {
            setPlayerCount(activity.activeCheckIns)
        }

        // Get best time to visit
        const best = getBestVisitTime(venueId)
        setBestTime(best.time)

        // Generate hourly predictions for next 5 hours
        const predictions: HourPrediction[] = []
        for (let i = 0; i < 5; i++) {
            const hourTime = new Date(now.getTime() + i * 60 * 60 * 1000)
            const hourNum = hourTime.getHours()
            const pred = predictVenueTraffic(venueId, hourTime)

            predictions.push({
                hour: hourNum,
                label: formatHour(hourNum),
                level: pred.level,
                isCurrent: i === 0,
            })
        }
        setHourlyPredictions(predictions)
    }

    const formatHour = (h: number): string => {
        if (h === new Date().getHours()) return "Now"
        const ampm = h >= 12 ? "PM" : "AM"
        const hour12 = h % 12 || 12
        return `${hour12}${ampm}`
    }

    const getLevelColor = (level: TrafficLevel): string => {
        switch (level) {
            case "low":
                return "#6B9B5A"
            case "moderate":
                return "#D99B3D"
            case "busy":
                return "#DC4444"
            default:
                return "#6B9B5A"
        }
    }

    const getLevelBadge = () => {
        const color = getLevelColor(currentLevel)
        return (
            <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
                <View style={[styles.badgeDot, { backgroundColor: color }]} />
                <Text style={[styles.badgeText, { color }]}>{currentLabel}</Text>
            </View>
        )
    }

    const getBarHeight = (level: TrafficLevel): number => {
        switch (level) {
            case "low":
                return 20
            case "moderate":
                return 35
            case "busy":
                return 50
            default:
                return 20
        }
    }

    const handleShare = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const message = `🏀 ${venueName} is at ${currentLabel} traffic right now! (~${playerCount ?? "unknown"} players). Best time to go is ${bestTime}. Join me? https://goodrunss.app/venue/${venueId}`

        try {
            await Share.share({
                message,
                title: `${venueName} Status`
            })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push(`/venue/${venueId}`)}
            activeOpacity={0.8}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.venueName} numberOfLines={1}>{venueName}</Text>
                    {getLevelBadge()}
                </View>
                <TouchableOpacity
                    onPress={handleShare}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ paddingLeft: 8 }}
                >
                    <Ionicons name="share-outline" size={20} color="#7ED957" />
                </TouchableOpacity>
            </View>

            {/* Meta Info */}
            <View style={styles.metaRow}>
                <Ionicons name="walk-outline" size={14} color="#8A8A8A" />
                <Text style={styles.metaText}>
                    {distance ? `${distance.toFixed(1)} mi` : "—"}
                </Text>
                {openUntil && (
                    <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.openText}>Open until {openUntil}</Text>
                    </>
                )}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                {/* Right Now */}
                <View style={styles.statSection}>
                    <Text style={styles.statLabel}>Right Now</Text>
                    <View style={styles.statValue}>
                        <Ionicons name="people" size={18} color="#6B9B5A" />
                        <Text style={styles.playerCount}>
                            {playerCount !== null ? `${playerCount} players` : "—"}
                        </Text>
                    </View>
                </View>

                {/* GIA Predict */}
                <View style={[styles.statSection, styles.statRight]}>
                    <View style={styles.giaLabel}>
                        <Text style={styles.giaIcon}>🔮</Text>
                        <Text style={styles.statLabel}>GIA Predict</Text>
                    </View>
                    <Text style={styles.bestTime}>Best time: {bestTime}</Text>
                </View>
            </View>

            {/* Timeline Bars */}
            <View style={styles.timeline}>
                {hourlyPredictions.map((pred, index) => (
                    <View key={index} style={styles.barColumn}>
                        <View style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: getBarHeight(pred.level),
                                        backgroundColor: pred.isCurrent ? getLevelColor(pred.level) : "#2A2A2A",
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.barFill,
                                        { backgroundColor: getLevelColor(pred.level) },
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={[styles.barLabel, pred.isCurrent && styles.currentBarLabel]}>
                            {pred.label}
                        </Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1F1F1F",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    venueName: {
        fontFamily: "Outfit_700Bold",
        fontSize: 20,
        color: "#F0F0F0",
        flex: 1,
        marginRight: 12,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    badgeText: {
        fontFamily: "Outfit_600SemiBold",
        fontSize: 13,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 4,
    },
    metaText: {
        fontFamily: "Outfit_400Regular",
        fontSize: 14,
        color: "#8A8A8A",
        marginLeft: 4,
    },
    metaDot: {
        color: "#555",
        marginHorizontal: 4,
    },
    openText: {
        fontFamily: "Outfit_400Regular",
        fontSize: 14,
        color: "#6B9B5A",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statSection: {
        flex: 1,
    },
    statRight: {
        alignItems: "flex-end",
    },
    statLabel: {
        fontFamily: "Outfit_500Medium",
        fontSize: 13,
        color: "#666",
        marginBottom: 4,
    },
    statValue: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    playerCount: {
        fontFamily: "Outfit_700Bold",
        fontSize: 16,
        color: "#6B9B5A",
    },
    giaLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    giaIcon: {
        fontSize: 14,
    },
    bestTime: {
        fontFamily: "Outfit_600SemiBold",
        fontSize: 14,
        color: "#6B9B5A",
    },
    timeline: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingTop: 8,
    },
    barColumn: {
        flex: 1,
        alignItems: "center",
    },
    barContainer: {
        height: 55,
        justifyContent: "flex-end",
        marginBottom: 8,
    },
    bar: {
        width: 32,
        borderRadius: 6,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    barFill: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40%",
        borderRadius: 4,
    },
    barLabel: {
        fontFamily: "Outfit_500Medium",
        fontSize: 11,
        color: "#666",
    },
    currentBarLabel: {
        color: "#6B9B5A",
        fontFamily: "Outfit_600SemiBold",
    },
})

export default VenueTrafficCard
