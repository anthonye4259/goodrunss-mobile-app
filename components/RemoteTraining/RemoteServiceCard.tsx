/**
 * Remote Service Card
 * 
 * Displays a single remote training service offering
 * Used in trainer profiles and service listings
 */

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type { RemoteService } from "@/lib/types/remote-training"
import {
    SERVICE_TYPE_LABELS,
    SERVICE_TYPE_ICONS,
    SERVICE_TYPE_COLORS,
    formatPrice,
} from "@/lib/types/remote-training"

type Props = {
    service: RemoteService
    onPress?: () => void
    variant?: "default" | "compact"
}

export function RemoteServiceCard({ service, onPress, variant = "default" }: Props) {
    const color = SERVICE_TYPE_COLORS[service.type]
    const icon = SERVICE_TYPE_ICONS[service.type]
    const label = SERVICE_TYPE_LABELS[service.type]

    if (variant === "compact") {
        return (
            <TouchableOpacity style={styles.compactCard} onPress={onPress}>
                <View style={[styles.compactIcon, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <View style={styles.compactContent}>
                    <Text style={styles.compactName} numberOfLines={1}>{service.name}</Text>
                    <Text style={styles.compactPrice}>{formatPrice(service.price, service.currency)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <LinearGradient
                colors={[`${color}15`, "#0A0A0A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
                        <Ionicons name={icon as any} size={24} color={color} />
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: `${color}20` }]}>
                        <Text style={[styles.typeText, { color }]}>{label}</Text>
                    </View>
                </View>

                {/* Content */}
                <Text style={styles.name}>{service.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {service.description}
                </Text>

                {/* Meta */}
                <View style={styles.meta}>
                    {service.duration && (
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color="#888" />
                            <Text style={styles.metaText}>{service.duration} min</Text>
                        </View>
                    )}
                    {service.deliveryTime && (
                        <View style={styles.metaItem}>
                            <Ionicons name="hourglass-outline" size={14} color="#888" />
                            <Text style={styles.metaText}>{service.deliveryTime}</Text>
                        </View>
                    )}
                    {service.sessionsIncluded && (
                        <View style={styles.metaItem}>
                            <Ionicons name="repeat-outline" size={14} color="#888" />
                            <Text style={styles.metaText}>{service.sessionsIncluded} sessions/mo</Text>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.price}>
                        {formatPrice(service.price, service.currency)}
                        {service.type === "training_plan" || service.type === "form_check_subscription"
                            ? "/month"
                            : service.type === "live_session"
                                ? "/session"
                                : ""
                        }
                    </Text>
                    <View style={[styles.bookButton, { backgroundColor: color }]}>
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    // Full Card
    card: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    cardGradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: "#AAA",
        lineHeight: 20,
        marginBottom: 12,
    },
    meta: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: "#888",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    bookButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    bookButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },

    // Compact Card
    compactCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    compactIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    compactContent: {
        flex: 1,
        marginLeft: 12,
    },
    compactName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFF",
    },
    compactPrice: {
        fontSize: 12,
        color: "#6B9B5A",
        marginTop: 2,
    },
})

export default RemoteServiceCard
