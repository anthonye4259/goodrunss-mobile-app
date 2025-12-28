/**
 * Proactive GIA Suggestions
 * 
 * Shows contextual AI suggestions based on:
 * - Current location (near courts, gyms, etc.)
 * - Time of day
 * - User history and preferences
 * - Weather conditions
 */

import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useUserLocation } from "@/lib/location-context"
import { useUserPreferences } from "@/lib/user-preferences"

interface ProactiveSuggestion {
    id: string
    message: string
    icon: keyof typeof Ionicons.glyphMap
    action: () => void
    priority: number
    color: string
}

interface ProactiveGIAProps {
    onSuggestionTap?: (suggestion: ProactiveSuggestion) => void
    compact?: boolean
}

export function ProactiveGIA({ onSuggestionTap, compact = false }: ProactiveGIAProps) {
    const { location } = useUserLocation()
    const { preferences } = useUserPreferences()
    const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([])

    useEffect(() => {
        generateSuggestions()
    }, [location, preferences])

    const generateSuggestions = () => {
        const now = new Date()
        const hour = now.getHours()
        const dayOfWeek = now.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const isTeacher = preferences.userType === "trainer" || preferences.userType === "instructor"

        const newSuggestions: ProactiveSuggestion[] = []

        // Time-based suggestions
        if (hour >= 6 && hour < 10) {
            // Morning
            newSuggestions.push({
                id: "morning-workout",
                message: "🌅 Good morning! Courts are usually quiet now. Perfect for practice.",
                icon: "sunny-outline",
                action: () => router.push("/(tabs)/explore"),
                priority: 1,
                color: "#F59E0B",
            })
        } else if (hour >= 11 && hour < 14) {
            // Lunch time
            newSuggestions.push({
                id: "lunch-game",
                message: "🏀 Lunch run? Check who's playing near you.",
                icon: "restaurant-outline",
                action: () => router.push("/(tabs)/explore"),
                priority: 1,
                color: "#7ED957",
            })
        } else if (hour >= 17 && hour < 20) {
            // Evening peak
            newSuggestions.push({
                id: "evening-peak",
                message: "🔥 Peak hours! Courts are filling up. Check live conditions.",
                icon: "flame-outline",
                action: () => router.push("/(tabs)/explore"),
                priority: 1,
                color: "#EF4444",
            })
        } else if (hour >= 20 || hour < 6) {
            // Night
            newSuggestions.push({
                id: "night-courts",
                message: "🌙 Looking for lit courts? I can find ones with lights on.",
                icon: "moon-outline",
                action: () => router.push("/(tabs)/explore"),
                priority: 1,
                color: "#8B5CF6",
            })
        }

        // Weekend specific
        if (isWeekend) {
            newSuggestions.push({
                id: "weekend-games",
                message: "🏆 It's the weekend! Find pickup games happening now.",
                icon: "trophy-outline",
                action: () => router.push("/need-players"),
                priority: 2,
                color: "#3B82F6",
            })
        }

        // Teacher-specific suggestions
        if (isTeacher && hour >= 9 && hour < 18) {
            newSuggestions.push({
                id: "client-check",
                message: "📊 Check your dashboard - any pending bookings?",
                icon: "stats-chart-outline",
                action: () => router.push("/trainer-dashboard"),
                priority: 1,
                color: "#7ED957",
            })
        }

        // Report reminder
        if (hour >= 16 && hour < 20) {
            newSuggestions.push({
                id: "report-reminder",
                message: "💰 Heading to a court? Report conditions and earn $5!",
                icon: "camera-outline",
                action: () => router.push("/(tabs)/report"),
                priority: 3,
                color: "#22C55E",
            })
        }

        // Sort by priority and take top suggestions
        newSuggestions.sort((a, b) => a.priority - b.priority)
        setSuggestions(newSuggestions.slice(0, compact ? 1 : 3))
    }

    const handleTap = (suggestion: ProactiveSuggestion) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onSuggestionTap?.(suggestion)
        suggestion.action()
    }

    if (suggestions.length === 0) return null

    if (compact) {
        const suggestion = suggestions[0]
        return (
            <TouchableOpacity
                style={[styles.compactContainer, { backgroundColor: `${suggestion.color}15` }]}
                onPress={() => handleTap(suggestion)}
            >
                <Ionicons name="sparkles" size={16} color={suggestion.color} />
                <Text style={[styles.compactText, { color: suggestion.color }]} numberOfLines={1}>
                    {suggestion.message}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={suggestion.color} />
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                <Text style={styles.headerText}>GIA Suggests</Text>
            </View>
            {suggestions.map((suggestion) => (
                <TouchableOpacity
                    key={suggestion.id}
                    style={styles.suggestionCard}
                    onPress={() => handleTap(suggestion)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: `${suggestion.color}20` }]}>
                        <Ionicons name={suggestion.icon} size={20} color={suggestion.color} />
                    </View>
                    <Text style={styles.suggestionText} numberOfLines={2}>
                        {suggestion.message}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    headerText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8B5CF6",
    },
    suggestionCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#252525",
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        color: "#FFFFFF",
        lineHeight: 20,
    },
    // Compact styles
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 4,
        gap: 8,
    },
    compactText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
    },
})
