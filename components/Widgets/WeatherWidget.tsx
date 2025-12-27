/**
 * Weather Widget
 * 
 * Shows current weather with court recommendations.
 * Rainy weather promotes indoor courts.
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
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
        // If rainy, navigate to gym courts section
        if (weather.condition === "rainy" || weather.condition === "stormy") {
            router.push("/(tabs)/discover")
        }
    }

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
            <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.leftSection}>
                    <Ionicons name={config.icon as any} size={32} color={config.textColor} />
                    <View style={styles.tempInfo}>
                        <Text style={[styles.temp, { color: config.textColor }]}>{weather.temp}°</Text>
                        <Text style={[styles.humidity, { color: config.textColor + "99" }]}>{weather.humidity}% humidity</Text>
                    </View>
                </View>
                <View style={styles.rightSection}>
                    <Text style={[styles.suggestion, { color: config.textColor }]}>{weather.suggestion}</Text>
                    {(weather.condition === "rainy" || weather.condition === "stormy") && (
                        <View style={styles.indoorBadge}>
                            <Ionicons name="business" size={12} color="#FFF" />
                            <Text style={styles.indoorText}>Indoor</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    tempInfo: {},
    temp: {
        fontSize: 24,
        fontWeight: "800",
    },
    humidity: {
        fontSize: 12,
    },
    rightSection: {
        flex: 1,
        alignItems: "flex-end",
    },
    suggestion: {
        fontSize: 13,
        fontWeight: "600",
        textAlign: "right",
    },
    indoorBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(0,0,0,0.3)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 6,
    },
    indoorText: {
        color: "#FFF",
        fontSize: 11,
        fontWeight: "600",
    },
})

export default WeatherWidget
