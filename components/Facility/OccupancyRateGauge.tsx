/**
 * Occupancy Rate Gauge
 * 
 * Visual gauge showing % of courts/spaces booked today.
 * Animated ring chart with utilization breakdown.
 */

import { View, Text, StyleSheet, Animated } from "react-native"
import { useRef, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Circle, G } from "react-native-svg"

type Props = {
    occupancyPercent: number // 0-100
    totalSlots: number
    bookedSlots: number
    pendingSlots?: number
    variant?: "large" | "compact"
}

export function OccupancyRateGauge({
    occupancyPercent,
    totalSlots,
    bookedSlots,
    pendingSlots = 0,
    variant = "large"
}: Props) {
    const animatedValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: occupancyPercent,
            duration: 1000,
            useNativeDriver: false,
        }).start()
    }, [occupancyPercent])

    const getColor = () => {
        if (occupancyPercent >= 90) return "#22C55E" // Green - nearly full!
        if (occupancyPercent >= 70) return "#FBBF24" // Yellow - good
        if (occupancyPercent >= 40) return "#3B82F6" // Blue - moderate
        return "#EF4444" // Red - low occupancy
    }

    const getLabel = () => {
        if (occupancyPercent >= 90) return "🔥 Almost Full!"
        if (occupancyPercent >= 70) return "Good Utilization"
        if (occupancyPercent >= 40) return "Room to Grow"
        return "Low Occupancy"
    }

    const color = getColor()
    const size = variant === "large" ? 160 : 80
    const strokeWidth = variant === "large" ? 12 : 6
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (occupancyPercent / 100) * circumference

    if (variant === "compact") {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactGauge}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="#333"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={color}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={`${circumference} ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                            />
                        </G>
                    </Svg>
                    <View style={styles.compactCenter}>
                        <Text style={[styles.compactPercent, { color }]}>{occupancyPercent}%</Text>
                    </View>
                </View>
                <Text style={styles.compactLabel}>Occupancy</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="pie-chart" size={20} color={color} />
                <Text style={styles.title}>Today's Occupancy</Text>
            </View>

            <View style={styles.gaugeContainer}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#252525"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
                <View style={styles.centerContent}>
                    <Text style={[styles.percentText, { color }]}>{occupancyPercent}%</Text>
                    <Text style={styles.statusLabel}>{getLabel()}</Text>
                </View>
            </View>

            <View style={styles.stats}>
                <View style={styles.stat}>
                    <View style={[styles.statDot, { backgroundColor: color }]} />
                    <Text style={styles.statLabel}>Booked</Text>
                    <Text style={styles.statValue}>{bookedSlots}</Text>
                </View>
                {pendingSlots > 0 && (
                    <View style={styles.stat}>
                        <View style={[styles.statDot, { backgroundColor: "#FBBF24" }]} />
                        <Text style={styles.statLabel}>Pending</Text>
                        <Text style={styles.statValue}>{pendingSlots}</Text>
                    </View>
                )}
                <View style={styles.stat}>
                    <View style={[styles.statDot, { backgroundColor: "#333" }]} />
                    <Text style={styles.statLabel}>Available</Text>
                    <Text style={styles.statValue}>{totalSlots - bookedSlots - pendingSlots}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#252525",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
        alignSelf: "flex-start",
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    gaugeContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    centerContent: {
        position: "absolute",
        alignItems: "center",
    },
    percentText: {
        fontSize: 36,
        fontWeight: "800",
    },
    statusLabel: {
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    stats: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    stat: {
        alignItems: "center",
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    statLabel: {
        color: "#888",
        fontSize: 11,
    },
    statValue: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "700",
        marginTop: 2,
    },
    compactContainer: {
        alignItems: "center",
    },
    compactGauge: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    compactCenter: {
        position: "absolute",
    },
    compactPercent: {
        fontSize: 16,
        fontWeight: "800",
    },
    compactLabel: {
        color: "#888",
        fontSize: 10,
        marginTop: 4,
    },
})

export default OccupancyRateGauge
