/**
 * WidgetCard
 * 
 * Apple Watch-inspired widget cards with rich gradients and metrics
 * Used for profile stats, health data, and activity metrics
 */

import React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Path, Circle, G, Line } from "react-native-svg"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48 - 12) / 2 // 2 columns with padding

// Gradient presets inspired by the reference
export const WIDGET_GRADIENTS = {
    coral: ["#FF6B6B", "#EE5A4A", "#C73E3E"],
    teal: ["#20B2AA", "#088F8F", "#057070"],
    magenta: ["#E040FB", "#AB47BC", "#7B1FA2"],
    blue: ["#2196F3", "#1565C0", "#0D47A1"],
    amber: ["#FFB300", "#FF8F00", "#E65100"],
    green: ["#66BB6A", "#43A047", "#2E7D32"],
    purple: ["#7C4DFF", "#651FFF", "#5600E8"],
    pink: ["#FF4081", "#F50057", "#C51162"],
}

interface WidgetCardProps {
    title: string
    subtitle?: string
    value: string | number
    status?: string
    statusColor?: string
    gradient: keyof typeof WIDGET_GRADIENTS
    visualization?: "wave" | "bars" | "dots" | "pulse" | "none"
    size?: "normal" | "large"
}

// Wave visualization component
function WaveVisualization({ color = "#FFF" }: { color?: string }) {
    return (
        <Svg width={80} height={30} viewBox="0 0 80 30">
            <Path
                d="M0 15 Q10 5 20 15 Q30 25 40 15 Q50 5 60 15 Q70 25 80 15"
                stroke={color}
                strokeWidth={2}
                fill="none"
                opacity={0.6}
            />
        </Svg>
    )
}

// Bar visualization component
function BarsVisualization({ color = "#FFF" }: { color?: string }) {
    const heights = [12, 20, 16, 24, 18, 22, 14]
    return (
        <Svg width={70} height={30} viewBox="0 0 70 30">
            {heights.map((h, i) => (
                <Line
                    key={i}
                    x1={i * 10 + 5}
                    y1={30}
                    x2={i * 10 + 5}
                    y2={30 - h}
                    stroke={color}
                    strokeWidth={4}
                    strokeLinecap="round"
                    opacity={0.7}
                />
            ))}
        </Svg>
    )
}

// Dots/particles visualization
function DotsVisualization({ color = "#FFF" }: { color?: string }) {
    const dots = [
        { x: 10, y: 10, r: 3 },
        { x: 25, y: 20, r: 4 },
        { x: 40, y: 8, r: 3 },
        { x: 55, y: 22, r: 5 },
        { x: 70, y: 12, r: 3 },
        { x: 15, y: 25, r: 2 },
        { x: 45, y: 18, r: 4 },
        { x: 65, y: 5, r: 2 },
    ]
    return (
        <Svg width={80} height={30} viewBox="0 0 80 30">
            {dots.map((d, i) => (
                <Circle
                    key={i}
                    cx={d.x}
                    cy={d.y}
                    r={d.r}
                    fill={color}
                    opacity={0.6 + Math.random() * 0.4}
                />
            ))}
        </Svg>
    )
}

// Pulse circle visualization
function PulseVisualization({ color = "#FFF" }: { color?: string }) {
    return (
        <Svg width={50} height={50} viewBox="0 0 50 50">
            <Circle cx={25} cy={25} r={20} stroke={color} strokeWidth={1} fill="none" opacity={0.2} />
            <Circle cx={25} cy={25} r={15} stroke={color} strokeWidth={1.5} fill="none" opacity={0.4} />
            <Circle cx={25} cy={25} r={10} stroke={color} strokeWidth={2} fill="none" opacity={0.6} />
            <Circle cx={25} cy={25} r={5} fill={color} opacity={0.8} />
        </Svg>
    )
}

export function WidgetCard({
    title,
    subtitle,
    value,
    status,
    statusColor = "rgba(255,255,255,0.8)",
    gradient,
    visualization = "none",
    size = "normal",
}: WidgetCardProps) {
    const colors = WIDGET_GRADIENTS[gradient]
    const isLarge = size === "large"

    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, isLarge && styles.cardLarge]}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Main Value */}
            <View style={styles.valueContainer}>
                <Text style={[styles.value, isLarge && styles.valueLarge]}>{value}</Text>
            </View>

            {/* Visualization */}
            {visualization !== "none" && (
                <View style={styles.visualization}>
                    {visualization === "wave" && <WaveVisualization />}
                    {visualization === "bars" && <BarsVisualization />}
                    {visualization === "dots" && <DotsVisualization />}
                    {visualization === "pulse" && <PulseVisualization />}
                </View>
            )}

            {/* Status */}
            {status && (
                <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
            )}
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        minHeight: 140,
        borderRadius: 20,
        padding: 14,
        justifyContent: "space-between",
    },
    cardLarge: {
        width: "100%",
        minHeight: 160,
    },
    header: {
        marginBottom: 8,
    },
    title: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFF",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 11,
        color: "rgba(255,255,255,0.7)",
        marginTop: 2,
    },
    valueContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    value: {
        fontSize: 48,
        fontWeight: "800",
        color: "#FFF",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    valueLarge: {
        fontSize: 64,
    },
    visualization: {
        alignItems: "center",
        marginTop: 8,
    },
    status: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 8,
    },
})

export default WidgetCard
