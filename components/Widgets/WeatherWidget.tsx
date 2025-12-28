/**
 * Weather Widget
 * 
 * Shows current weather with court recommendations.
 * Rainy weather promotes indoor courts.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"

import { router } from "expo-router"
import * as Haptics from "expo-haptics"

type WeatherCondition = "sunny" | "cloudy" | "rainy" | "stormy" | "snowy"

type WeatherData = {
    condition: WeatherCondition
    temp: number
    humidity: number
    suggestion: string
}

const WEATHER_CONFIG: Record<WeatherCondition, { icon: string; gradient: [string, string]; textColor: string }> = {
    sunny: { icon: "sunny", gradient: ["#FBBF24", "#F97316"], textColor: "#000" },
    cloudy: { icon: "cloudy", gradient: ["#6B7280", "#4B5563"], textColor: "#FFF" },
    rainy: { icon: "rainy", gradient: ["#3B82F6", "#1E40AF"], textColor: "#FFF" },
    stormy: { icon: "thunderstorm", gradient: ["#4B5563", "#1F2937"], textColor: "#FFF" },
    snowy: { icon: "snow", gradient: ["#E0E7FF", "#C7D2FE"], textColor: "#000" },
}

// Mock weather - in production would use weather API
function getMockWeather(): WeatherData {
    const conditions: WeatherCondition[] = ["sunny", "cloudy", "rainy"]
    const condition = conditions[Math.floor(Math.random() * conditions.length)]

    const suggestions: Record<WeatherCondition, string> = {
        sunny: "Perfect day for outdoor courts! ☀️",
        cloudy: "Good conditions for a game today",
        rainy: "Try indoor courts at LA Fitness 🏢",
        stormy: "Stay safe! Check indoor options",
        snowy: "Indoor courts recommended today",
    }

    return {
        condition,
        temp: 55 + Math.floor(Math.random() * 30), // 55-85°F
        humidity: 40 + Math.floor(Math.random() * 40), // 40-80%
        suggestion: suggestions[condition],
    }
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null)

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setWeather(getMockWeather())
        }, 500)
    }, [])

    if (!weather) return null

    const config = WEATHER_CONFIG[weather.condition]

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (weather.condition === "rainy" || weather.condition === "stormy") {
            router.push("/(tabs)/discover")
        }
    }

    // Gradient colors are now used for accent only, not full background
    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    {/* Icon container with subtle tinted background */}
                    <View style={[styles.iconContainer, { backgroundColor: `${config.gradient[0]}20` }]}>
                        <Ionicons name={config.icon as any} size={24} color={config.gradient[0]} />
                    </View>
                    <View style={styles.tempInfo}>
                        <Text style={styles.temp}>{weather.temp}°</Text>
                        <Text style={styles.conditionName}>{weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)}</Text>
                    </View>
                </View>
                <View style={styles.rightSection}>
                    <Text style={styles.suggestion}>{weather.suggestion}</Text>
                    {(weather.condition === "rainy" || weather.condition === "stormy") && (
                        <View style={styles.indoorBadge}>
                            <Text style={styles.indoorText}>Indoor Suggested</Text>
                            <Ionicons name="arrow-forward" size={12} color="#FFF" />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: '#171717', // Flat Subtle Card
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    tempInfo: {
        justifyContent: 'center',
    },
    temp: {
        fontSize: 24,
        fontFamily: "Inter_700Bold",
        color: "#FFFFFF",
        letterSpacing: -1,
    },
    conditionName: {
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        color: "#A3A3A3",
    },
    humidity: {
        fontSize: 12,
        color: "#737373",
    },
    rightSection: {
        flex: 1,
        alignItems: "flex-end",
        gap: 4,
    },
    suggestion: {
        fontSize: 13,
        fontFamily: "Inter_500Medium",
        color: "#E5E5E5",
        textAlign: "right",
        maxWidth: 160,
    },
    indoorBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(59, 130, 246, 0.15)", // Blue tint for indoor
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 6,
    },
    indoorText: {
        color: "#3B82F6",
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
    },
})

export default WeatherWidget
