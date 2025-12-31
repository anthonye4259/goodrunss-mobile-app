/**
 * Remote Training Index
 * 
 * Main hub for browsing remote training services
 * - Browse remote trainers
 * - Filter by service type, sport, language
 * - View trainer profiles with remote offerings
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import { remoteTrainingService } from "@/lib/services/remote-training-service"
import { RemoteServiceCard } from "@/components/RemoteTraining/RemoteServiceCard"
import type { RemoteServiceType } from "@/lib/types/remote-training"
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_COLORS, SERVICE_TYPE_ICONS } from "@/lib/types/remote-training"

const SERVICE_TYPES: RemoteServiceType[] = [
    "video_analysis",
    "live_session",
    "training_plan",
    "form_check_subscription",
    "match_prep",
    "mental_game",
]

export default function RemoteTrainingScreen() {
    const params = useLocalSearchParams<{ city?: string; filter?: string }>()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState<RemoteServiceType | null>(null)
    const [trainers, setTrainers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTrainers()
    }, [selectedType, params.city])

    const loadTrainers = async () => {
        setLoading(true)
        try {
            const results = await remoteTrainingService.searchRemoteTrainers({
                city: params.city,
                serviceType: selectedType || undefined,
            })
            setTrainers(results)
        } catch (error) {
            console.error("Error loading trainers:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTrainerPress = (trainerId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push(`/trainer/${trainerId}`)
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {params.city ? `Trainers in ${params.city}` : "Remote Training"}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/remote-training/train-abroad")}>
                        <Ionicons name="globe-outline" size={24} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search trainers, sports..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Service Type Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    <TouchableOpacity
                        style={[styles.filterChip, !selectedType && styles.filterChipActive]}
                        onPress={() => {
                            Haptics.selectionAsync()
                            setSelectedType(null)
                        }}
                    >
                        <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {SERVICE_TYPES.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.filterChip,
                                selectedType === type && {
                                    ...styles.filterChipActive,
                                    backgroundColor: `${SERVICE_TYPE_COLORS[type]}30`,
                                    borderColor: SERVICE_TYPE_COLORS[type],
                                }
                            ]}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setSelectedType(selectedType === type ? null : type)
                            }}
                        >
                            <Ionicons
                                name={SERVICE_TYPE_ICONS[type] as any}
                                size={14}
                                color={selectedType === type ? SERVICE_TYPE_COLORS[type] : "#888"}
                            />
                            <Text style={[
                                styles.filterChipText,
                                selectedType === type && { color: SERVICE_TYPE_COLORS[type] }
                            ]}>
                                {SERVICE_TYPE_LABELS[type]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Trainers List */}
                <ScrollView contentContainerStyle={styles.content}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Finding trainers...</Text>
                        </View>
                    ) : trainers.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color="#666" />
                            <Text style={styles.emptyTitle}>No trainers found</Text>
                            <Text style={styles.emptyText}>
                                Try adjusting your filters or search in a different location.
                            </Text>
                        </View>
                    ) : (
                        trainers.map(trainer => (
                            <TouchableOpacity
                                key={trainer.id}
                                style={styles.trainerCard}
                                onPress={() => handleTrainerPress(trainer.id)}
                            >
                                <LinearGradient
                                    colors={["#1A1A1A", "#0F0F0F"]}
                                    style={styles.trainerGradient}
                                >
                                    {/* Avatar */}
                                    <View style={styles.trainerAvatar}>
                                        <Ionicons name="person" size={28} color="#6B9B5A" />
                                    </View>

                                    {/* Info */}
                                    <View style={styles.trainerInfo}>
                                        <View style={styles.trainerHeader}>
                                            <Text style={styles.trainerName}>{trainer.name}</Text>
                                            {trainer.isInternationalTrainer && (
                                                <View style={styles.intlBadge}>
                                                    <Ionicons name="globe" size={12} color="#3B82F6" />
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.trainerMeta}>
                                            {trainer.sport} • {trainer.city}, {trainer.country}
                                        </Text>
                                        <View style={styles.trainerStats}>
                                            <Ionicons name="star" size={14} color="#FBBF24" />
                                            <Text style={styles.trainerRating}>
                                                {trainer.rating} ({trainer.reviewCount})
                                            </Text>
                                            <Text style={styles.trainerLanguages}>
                                                {trainer.languages?.join(", ")}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Arrow */}
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </LinearGradient>
                            </TouchableOpacity>
                        ))
                    )}

                    {/* Train Abroad CTA */}
                    <TouchableOpacity
                        style={styles.trainAbroadCta}
                        onPress={() => router.push("/remote-training/train-abroad")}
                    >
                        <LinearGradient
                            colors={["#6B9B5A20", "#0A0A0A"]}
                            style={styles.trainAbroadGradient}
                        >
                            <Ionicons name="airplane" size={24} color="#6B9B5A" />
                            <View style={styles.trainAbroadContent}>
                                <Text style={styles.trainAbroadTitle}>Train Abroad</Text>
                                <Text style={styles.trainAbroadText}>
                                    Browse trainers in Spain, Dubai, UK & more
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6B9B5A" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: "#FFF",
    },
    filterContainer: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 8,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#2A2A2A",
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: "#6B9B5A30",
        borderColor: "#6B9B5A",
    },
    filterChipText: {
        fontSize: 13,
        color: "#888",
    },
    filterChipTextActive: {
        color: "#6B9B5A",
        fontWeight: "600",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        color: "#666",
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
    },
    trainerCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    trainerGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    trainerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#6B9B5A20",
        alignItems: "center",
        justifyContent: "center",
    },
    trainerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    trainerHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    trainerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    intlBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#3B82F620",
        alignItems: "center",
        justifyContent: "center",
    },
    trainerMeta: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    trainerStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
    },
    trainerRating: {
        fontSize: 13,
        color: "#AAA",
    },
    trainerLanguages: {
        fontSize: 12,
        color: "#666",
        marginLeft: 8,
    },
    trainAbroadCta: {
        marginTop: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    trainAbroadGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#6B9B5A40",
        borderRadius: 16,
    },
    trainAbroadContent: {
        flex: 1,
        marginLeft: 12,
    },
    trainAbroadTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    trainAbroadText: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
})
