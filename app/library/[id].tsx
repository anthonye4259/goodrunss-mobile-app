/**
 * Library Item Detail Screen
 * 
 * View and purchase individual library items (courses, drills, programs)
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

import {
    trainerLibraryService,
    LibraryItem,
    CONTENT_TYPE_LABELS,
    CONTENT_TYPE_ICONS,
} from "@/lib/services/trainer-library-service"

export default function LibraryItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [item, setItem] = useState<LibraryItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState(false)
    const [hasAccess, setHasAccess] = useState(false)

    useEffect(() => {
        loadItem()
    }, [id])

    const loadItem = async () => {
        try {
            const items = await trainerLibraryService.browseLibrary()
            const found = items.find(i => i.id === id)
            setItem(found || null)

            if (found) {
                const access = await trainerLibraryService.hasAccess(found.id)
                setHasAccess(access || found.isFree)
            }
        } catch (error) {
            console.error("Error loading item:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        if (!item) return

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setPurchasing(true)

        try {
            await trainerLibraryService.purchaseItem(item)
            setHasAccess(true)
            Alert.alert(
                "Purchase Complete! 🎉",
                `You now have access to "${item.title}"`
            )
        } catch (error) {
            Alert.alert("Error", "Failed to complete purchase. Please try again.")
        } finally {
            setPurchasing(false)
        }
    }

    const handleStartLearning = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        // In production, navigate to the content player
        Alert.alert("Coming Soon", "Content player will be available soon!")
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        )
    }

    if (!item) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Item not found</Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.backLink}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        )
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
                    <TouchableOpacity>
                        <Ionicons name="share-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={styles.thumbnail}>
                            <Ionicons
                                name={CONTENT_TYPE_ICONS[item.type] as any}
                                size={48}
                                color="#6B9B5A"
                            />
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>{CONTENT_TYPE_LABELS[item.type]}</Text>
                        </View>
                    </View>

                    {/* Title & Trainer */}
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.trainerName}>by {item.trainerName}</Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Ionicons name="star" size={16} color="#FBBF24" />
                            <Text style={styles.statText}>
                                {item.rating.toFixed(1)} ({item.reviewCount})
                            </Text>
                        </View>
                        <View style={styles.stat}>
                            <Ionicons name="people" size={16} color="#888" />
                            <Text style={styles.statText}>{item.purchaseCount} students</Text>
                        </View>
                        {item.lessons && (
                            <View style={styles.stat}>
                                <Ionicons name="play-circle" size={16} color="#888" />
                                <Text style={styles.statText}>{item.lessons.length} lessons</Text>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        <View style={styles.skillBadge}>
                            <Text style={styles.skillText}>{item.skillLevel}</Text>
                        </View>
                        <View style={styles.sportBadge}>
                            <Text style={styles.sportText}>{item.sport}</Text>
                        </View>
                        {item.tags.slice(0, 3).map(tag => (
                            <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Lessons (if course) */}
                    {item.lessons && item.lessons.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Lessons</Text>
                            {item.lessons.map((lesson, index) => (
                                <View key={lesson.id} style={styles.lessonItem}>
                                    <View style={styles.lessonNumber}>
                                        <Text style={styles.lessonNumberText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.lessonInfo}>
                                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                        {lesson.duration && (
                                            <Text style={styles.lessonDuration}>
                                                {lesson.duration} min
                                            </Text>
                                        )}
                                    </View>
                                    {lesson.isPreview && (
                                        <View style={styles.previewBadge}>
                                            <Text style={styles.previewText}>FREE</Text>
                                        </View>
                                    )}
                                    <Ionicons
                                        name={hasAccess || lesson.isPreview ? "play-circle" : "lock-closed"}
                                        size={20}
                                        color={hasAccess || lesson.isPreview ? "#6B9B5A" : "#666"}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Footer CTA */}
                <View style={styles.footer}>
                    {hasAccess ? (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={handleStartLearning}
                        >
                            <LinearGradient
                                colors={["#6B9B5A", "#4A7A3A"]}
                                style={styles.buttonGradient}
                            >
                                <Ionicons name="play" size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Start Learning</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.purchaseRow}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>
                                    {item.isFree ? "Free" : `$${item.price}`}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.purchaseButton}
                                onPress={handlePurchase}
                                disabled={purchasing}
                            >
                                <LinearGradient
                                    colors={["#6B9B5A", "#4A7A3A"]}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>
                                        {purchasing ? "Processing..." : item.isFree ? "Enroll Free" : "Purchase"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: { color: "#888", fontSize: 16 },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: { color: "#FFF", fontSize: 18, marginBottom: 12 },
    backLink: { color: "#6B9B5A", fontSize: 16 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    hero: {
        alignItems: "center",
        marginBottom: 20,
    },
    thumbnail: {
        width: 120,
        height: 120,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    typeBadge: {
        backgroundColor: "#6B9B5A20",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B9B5A",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginBottom: 4,
    },
    trainerName: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginBottom: 24,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: "#AAA",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#AAA",
        lineHeight: 24,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 24,
    },
    skillBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#3B82F620",
        borderRadius: 8,
    },
    skillText: {
        fontSize: 12,
        color: "#3B82F6",
        textTransform: "capitalize",
    },
    sportBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#8B5CF620",
        borderRadius: 8,
    },
    sportText: {
        fontSize: 12,
        color: "#8B5CF6",
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#2A2A2A",
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: "#888",
    },
    lessonItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        marginBottom: 8,
    },
    lessonNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    lessonNumberText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#888",
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 14,
        color: "#FFF",
    },
    lessonDuration: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    previewBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#6B9B5A20",
        borderRadius: 4,
        marginRight: 8,
    },
    previewText: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 32,
        backgroundColor: "#0A0A0A",
        borderTopWidth: 1,
        borderTopColor: "#1A1A1A",
    },
    startButton: {
        borderRadius: 14,
        overflow: "hidden",
    },
    purchaseRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    priceContainer: {
        flex: 1,
    },
    price: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    purchaseButton: {
        flex: 2,
        borderRadius: 14,
        overflow: "hidden",
    },
    buttonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
})
