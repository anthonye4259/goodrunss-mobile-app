/**
 * Library Browse Screen
 * 
 * Browse and purchase trainer content libraries
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import {
    trainerLibraryService,
    LibraryItem,
    ContentType,
    CONTENT_TYPE_LABELS,
    CONTENT_TYPE_ICONS,
} from "@/lib/services/trainer-library-service"

const CONTENT_TYPES: ContentType[] = ["course", "program", "drill", "tutorial", "playbook"]

export default function LibraryBrowseScreen() {
    const [items, setItems] = useState<LibraryItem[]>([])
    const [featured, setFeatured] = useState<LibraryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState<ContentType | null>(null)

    useEffect(() => {
        loadContent()
    }, [selectedType])

    const loadContent = async () => {
        setLoading(true)
        try {
            const [allItems, featuredItems] = await Promise.all([
                trainerLibraryService.browseLibrary({ type: selectedType || undefined }),
                trainerLibraryService.getFeaturedContent(),
            ])
            setItems(allItems)
            setFeatured(featuredItems)
        } catch (error) {
            console.error("Error loading library:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleItemPress = (item: LibraryItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push({
            pathname: "/library/[id]",
            params: { id: item.id },
        })
    }

    const renderItem = (item: LibraryItem) => (
        <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => handleItemPress(item)}
        >
            <LinearGradient
                colors={["#1A1A1A", "#0F0F0F"]}
                style={styles.itemGradient}
            >
                {/* Thumbnail */}
                <View style={styles.thumbnail}>
                    <Ionicons
                        name={CONTENT_TYPE_ICONS[item.type] as any}
                        size={32}
                        color="#6B9B5A"
                    />
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                    <View style={styles.itemHeader}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>
                                {CONTENT_TYPE_LABELS[item.type]}
                            </Text>
                        </View>
                        {item.isFree && (
                            <View style={styles.freeBadge}>
                                <Text style={styles.freeBadgeText}>FREE</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>

                    <Text style={styles.trainerName}>by {item.trainerName}</Text>

                    <View style={styles.itemMeta}>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={12} color="#FBBF24" />
                            <Text style={styles.ratingText}>
                                {item.rating.toFixed(1)} ({item.reviewCount})
                            </Text>
                        </View>
                        {item.lessons && (
                            <Text style={styles.lessonCount}>
                                {item.lessons.length} lessons
                            </Text>
                        )}
                    </View>

                    <View style={styles.itemFooter}>
                        <Text style={styles.price}>
                            {item.isFree ? "Free" : `$${item.price}`}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Trainer Library</Text>
                    <TouchableOpacity onPress={() => router.push("/library/my-purchases")}>
                        <Ionicons name="book" size={24} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses, drills..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Type Filters */}
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
                        <Text style={[styles.filterText, !selectedType && styles.filterTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {CONTENT_TYPES.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                            onPress={() => {
                                Haptics.selectionAsync()
                                setSelectedType(selectedType === type ? null : type)
                            }}
                        >
                            <Ionicons
                                name={CONTENT_TYPE_ICONS[type] as any}
                                size={14}
                                color={selectedType === type ? "#6B9B5A" : "#888"}
                            />
                            <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>
                                {CONTENT_TYPE_LABELS[type]}s
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Featured Section */}
                    {!selectedType && featured.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>⭐ Featured</Text>
                            {featured.slice(0, 2).map(renderItem)}
                        </View>
                    )}

                    {/* All Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {selectedType ? CONTENT_TYPE_LABELS[selectedType] + "s" : "Browse All"}
                        </Text>
                        {loading ? (
                            <Text style={styles.loadingText}>Loading...</Text>
                        ) : items.length === 0 ? (
                            <Text style={styles.emptyText}>No content found</Text>
                        ) : (
                            items.map(renderItem)
                        )}
                    </View>
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
        backgroundColor: "#6B9B5A20",
        borderColor: "#6B9B5A",
    },
    filterText: {
        fontSize: 13,
        color: "#888",
    },
    filterTextActive: {
        color: "#6B9B5A",
        fontWeight: "600",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    loadingText: {
        color: "#666",
        textAlign: "center",
        paddingVertical: 20,
    },
    emptyText: {
        color: "#666",
        textAlign: "center",
        paddingVertical: 20,
    },
    itemCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    itemGradient: {
        flexDirection: "row",
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: "#2A2A2A",
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        color: "#888",
        fontWeight: "600",
    },
    freeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: "#6B9B5A20",
        borderRadius: 6,
    },
    freeBadgeText: {
        fontSize: 10,
        color: "#6B9B5A",
        fontWeight: "bold",
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 4,
    },
    trainerName: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
    },
    itemMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: "#AAA",
    },
    lessonCount: {
        fontSize: 12,
        color: "#666",
    },
    itemFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
})
