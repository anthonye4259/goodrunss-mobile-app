/**
 * MiniWidget
 * 
 * Compact widget for embedding inside other cards (like SportStatusCard).
 * Features:
 * - Gradient background
 * - Icon + Label + Value layout
 * - "Glanceable" data
 */

import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { WIDGET_GRADIENTS } from "../Profile/WidgetCard"

interface MiniWidgetProps {
    icon: string
    label: string
    value: string
    gradient: keyof typeof WIDGET_GRADIENTS
    subValue?: string
}

export function MiniWidget({ icon, label, value, gradient, subValue }: MiniWidgetProps) {
    const colors = WIDGET_GRADIENTS[gradient]

    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <Ionicons name={icon as any} size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            {subValue && <Text style={styles.subValue}>{subValue}</Text>}
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 12,
        padding: 10,
        minHeight: 80,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: "700",
        color: "rgba(255,255,255,0.8)",
        textTransform: "uppercase",
    },
    value: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFF",
        marginTop: 4,
    },
    subValue: {
        fontSize: 10,
        color: "rgba(255,255,255,0.9)",
        marginTop: 2,
    },
})
