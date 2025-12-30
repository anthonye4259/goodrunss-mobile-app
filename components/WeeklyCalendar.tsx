/**
 * Weekly Calendar Component
 * 
 * Shows a week view with check-in completion status
 * Inspired by fitness app design with clean, minimalist aesthetic
 * Includes current weather conditions
 */

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getCheckInHistory } from "@/lib/services/venue-checkin-service"

interface WeekDay {
    date: Date
    dayName: string
    dayNumber: number
    hasCheckIn: boolean
    isToday: boolean
    isFuture: boolean
}

interface WeeklyCalendarProps {
    onDayPress?: (date: Date) => void
    weather?: {
        temp?: number
        condition?: "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy"
        description?: string
    }
}

export function WeeklyCalendar({ onDayPress, weather }: WeeklyCalendarProps) {
    const [weekDays, setWeekDays] = useState<WeekDay[]>([])
    const [completedDays, setCompletedDays] = useState(0)

    useEffect(() => {
        loadCalendar()
    }, [])

    const loadCalendar = async () => {
        const today = new Date()
        const currentDayOfWeek = today.getDay() // 0 = Sunday
        const monday = new Date(today)
        monday.setDate(today.getDate() - ((currentDayOfWeek + 6) % 7)) // Get Monday

        // Get check-in history
        const history = await getCheckInHistory()
        const checkInDates = new Set(
            history.map((c) => new Date(c.timestamp).toDateString())
        )

        const days: WeekDay[] = []
        let completed = 0

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)

            const hasCheckIn = checkInDates.has(date.toDateString())
            const isToday = date.toDateString() === today.toDateString()
            const isFuture = date > today

            if (hasCheckIn) completed++

            days.push({
                date,
                dayName: ["M", "T", "W", "T", "F", "S", "S"][i],
                dayNumber: date.getDate(),
                hasCheckIn,
                isToday,
                isFuture,
            })
        }

        setWeekDays(days)
        setCompletedDays(completed)
    }

    const getWeatherIcon = (condition?: string) => {
        switch (condition) {
            case "sunny":
                return "sunny-outline"
            case "cloudy":
                return "cloudy-outline"
            case "rainy":
                return "rainy-outline"
            case "snowy":
                return "snow-outline"
            case "partly-cloudy":
                return "partly-sunny-outline"
            default:
                return "sunny-outline"
        }
    }

    return (
        <View style={styles.container}>
            {/* Header with Weather */}
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>THIS WEEK</Text>
                    <Text style={styles.progress}>{completedDays} of 7</Text>
                </View>

                {weather && (
                    <View style={styles.weatherSection}>
                        <Ionicons
                            name={getWeatherIcon(weather.condition) as any}
                            size={20}
                            color="#D99B3D"
                        />
                        {weather.temp !== undefined && (
                            <Text style={styles.weatherTemp}>{Math.round(weather.temp)}°</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Week Days */}
            <View style={styles.weekRow}>
                {weekDays.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.dayColumn}
                        onPress={() => onDayPress?.(day.date)}
                        disabled={day.isFuture}
                    >
                        <Text style={[styles.dayName, day.isToday && styles.todayText]}>
                            {day.dayName}
                        </Text>
                        <View
                            style={[
                                styles.dayCircle,
                                day.hasCheckIn && styles.completedCircle,
                                day.isToday && !day.hasCheckIn && styles.todayCircle,
                                day.isFuture && styles.futureCircle,
                            ]}
                        >
                            {day.hasCheckIn ? (
                                <Ionicons name="checkmark" size={16} color="#0A0A0A" />
                            ) : (
                                <Text
                                    style={[
                                        styles.dayNumber,
                                        day.isToday && styles.todayNumber,
                                        day.isFuture && styles.futureNumber,
                                    ]}
                                >
                                    {day.dayNumber}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 16,
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
        marginBottom: 16,
    },
    titleSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    title: {
        fontFamily: "Outfit_600SemiBold",
        fontSize: 12,
        color: "#8A8A8A",
        letterSpacing: 1,
    },
    progress: {
        fontFamily: "Outfit_500Medium",
        fontSize: 12,
        color: "#666",
    },
    weatherSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(217, 155, 61, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    weatherTemp: {
        fontFamily: "Outfit_600SemiBold",
        fontSize: 14,
        color: "#D99B3D",
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dayColumn: {
        alignItems: "center",
        flex: 1,
    },
    dayName: {
        fontFamily: "Outfit_500Medium",
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    todayText: {
        color: "#F0F0F0",
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#252525",
    },
    completedCircle: {
        backgroundColor: "#6B9B5A",
        borderColor: "#6B9B5A",
    },
    todayCircle: {
        borderColor: "#6B9B5A",
        borderWidth: 2,
    },
    futureCircle: {
        opacity: 0.5,
    },
    dayNumber: {
        fontFamily: "Outfit_500Medium",
        fontSize: 14,
        color: "#8A8A8A",
    },
    todayNumber: {
        color: "#F0F0F0",
    },
    futureNumber: {
        color: "#555",
    },
})

export default WeeklyCalendar
