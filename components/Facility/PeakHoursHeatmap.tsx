/**
 * Peak Hours Heatmap
 * 
 * Visualizes busiest booking times across the week.
 * Helps identify optimal pricing and staffing.
 */

import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type HourData = {
    hour: number // 0-23
    bookings: number
}

type DayData = {
    day: string // "Mon", "Tue", etc.
    hours: HourData[]
}

type Props = {
    data: DayData[]
    peakHour?: { day: string; hour: number }
}

export function PeakHoursHeatmap({ data, peakHour }: Props) {
    const hours = Array.from({ length: 14 }, (_, i) => i + 6) // 6 AM to 8 PM

    const getIntensity = (bookings: number, maxBookings: number) => {
        if (bookings === 0) return 0
        return Math.min(bookings / maxBookings, 1)
    }

    const getColor = (intensity: number) => {
        if (intensity === 0) return "#1A1A1A"
        if (intensity < 0.25) return "#22C55E30"
        if (intensity < 0.5) return "#22C55E50"
        if (intensity < 0.75) return "#7ED957"
        return "#4ADE80"
    }

    const maxBookings = Math.max(
        ...data.flatMap(d => d.hours.map(h => h.bookings))
    )

    const formatHour = (hour: number) => {
        if (hour === 0) return "12a"
        if (hour === 12) return "12p"
        if (hour < 12) return `${hour}a`
        return `${hour - 12}p`
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="flame" size={20} color="#F97316" />
                    <Text style={styles.title}>Peak Hours</Text>
                </View>
                {peakHour && (
                    <View style={styles.peakBadge}>
                        <Text style={styles.peakText}>
                            🔥 {peakHour.day} {formatHour(peakHour.hour)}
                        </Text>
                    </View>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Hour labels */}
                    <View style={styles.hourLabelsRow}>
                        <View style={styles.dayLabelCell} />
                        {hours.map((hour) => (
                            <View key={hour} style={styles.hourLabelCell}>
                                <Text style={styles.hourLabel}>{formatHour(hour)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Heatmap grid */}
                    {data.map((dayData) => (
                        <View key={dayData.day} style={styles.row}>
                            <View style={styles.dayLabelCell}>
                                <Text style={styles.dayLabel}>{dayData.day}</Text>
                            </View>
                            {hours.map((hour) => {
                                const hourData = dayData.hours.find(h => h.hour === hour)
                                const bookings = hourData?.bookings || 0
                                const intensity = getIntensity(bookings, maxBookings)
                                const isPeak = peakHour?.day === dayData.day && peakHour?.hour === hour

                                return (
                                    <View
                                        key={hour}
                                        style={[
                                            styles.cell,
                                            { backgroundColor: getColor(intensity) },
                                            isPeak && styles.peakCell,
                                        ]}
                                    >
                                        {bookings > 0 && (
                                            <Text style={[
                                                styles.cellText,
                                                intensity > 0.5 && styles.cellTextDark
                                            ]}>
                                                {bookings}
                                            </Text>
                                        )}
                                    </View>
                                )
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={styles.legendLabel}>Less</Text>
                <View style={styles.legendGradient}>
                    {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                        <View
                            key={i}
                            style={[styles.legendCell, { backgroundColor: getColor(intensity) }]}
                        />
                    ))}
                </View>
                <Text style={styles.legendLabel}>More</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#141414",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F9731630",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    peakBadge: {
        backgroundColor: "#F9731620",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    peakText: {
        color: "#F97316",
        fontSize: 11,
        fontWeight: "600",
    },
    hourLabelsRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    dayLabelCell: {
        width: 36,
        justifyContent: "center",
    },
    hourLabelCell: {
        width: 24,
        alignItems: "center",
    },
    hourLabel: {
        color: "#666",
        fontSize: 8,
    },
    row: {
        flexDirection: "row",
        marginBottom: 2,
    },
    dayLabel: {
        color: "#888",
        fontSize: 10,
        fontWeight: "500",
    },
    cell: {
        width: 22,
        height: 22,
        marginHorizontal: 1,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    peakCell: {
        borderWidth: 2,
        borderColor: "#F97316",
    },
    cellText: {
        color: "#888",
        fontSize: 8,
        fontWeight: "600",
    },
    cellTextDark: {
        color: "#000",
    },
    legend: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        gap: 8,
    },
    legendLabel: {
        color: "#666",
        fontSize: 10,
    },
    legendGradient: {
        flexDirection: "row",
        gap: 2,
    },
    legendCell: {
        width: 16,
        height: 16,
        borderRadius: 3,
    },
})

export default PeakHoursHeatmap
