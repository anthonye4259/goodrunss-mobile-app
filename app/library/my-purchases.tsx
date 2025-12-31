/**
 * My Purchases Screen
 * 
 * View purchased library content
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import {
    trainerLibraryService,
    LibraryItem,
    LibraryPurchase,
    CONTENT_TYPE_LABELS,
    CONTENT_TYPE_ICONS,
} from "@/lib/services/trainer-library-service"

export default function MyPurchasesScreen() {
    const [purchases, setPurchases] = useState<LibraryPurchase[]>([])
    const [items, setItems] = useState<LibraryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadPurchases()
    }, [])

    const loadPurchases = async () => {
        try {
            const [purchaseData, allItems] = await Promise.all([
                trainerLibraryService.getMyPurchases(),
                trainerLibraryService.browseLibrary(),
            ])
            setPurchases(purchaseData)
            setItems(allItems)
        } catch (error) {
            console.error("Error loading purchases:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        setRefreshing(true)
        loadPurchases()
    }

    const handleItemPress = (itemId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.push({
            pathname: "/library/[id]",
            params: { id: itemId },
        })
    }

    const getItemDetails = (itemId: string): LibraryItem | undefined => {
        return items.find(i => i.id === itemId)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
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
                    <Text style={styles.headerTitle}>My Library</Text>
                    <TouchableOpacity onPress={() => router.push("/library")}>
                        <Ionicons name="add" size={24} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#6B9B5A"
                        />
                    }
                >
                    {loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Loading...</Text>
                        </View>
                    ) : purchases.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="library-outline" size={64} color="#666" />
                            <Text style={styles.emptyTitle}>No Purchases Yet</Text>
                            <Text style={styles.emptyText}>
                                Browse the library to find courses, drills, and programs from top trainers.
                            </Text>
                            <TouchableOpacity
                                style={styles.browseButton}
                                onPress={() => router.push("/library")}
                            >
                                <Text style={styles.browseButtonText}>Browse Library</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.sectionTitle}>
                                {purchases.length} Item{purchases.length !== 1 ? "s" : ""}
                            </Text>

                            {purchases.map(purchase => {
                                const item = getItemDetails(purchase.itemId)
                                if (!item) return null

                                return (
                                    <TouchableOpacity
                                        key={purchase.id}
                                        style={styles.purchaseCard}
                                        onPress={() => handleItemPress(purchase.itemId)}
                                    >
                                        <LinearGradient
                                            colors={["#1A1A1A", "#0F0F0F"]}
                                            style={styles.cardGradient}
                                        >
                                            {/* Icon */}
                                            <View style={styles.itemIcon}>
                                                <Ionicons
                                                    name={CONTENT_TYPE_ICONS[item.type] as any}
                                                    size={24}
                                                    color="#6B9B5A"
                                                />
                                            </View>

                                            {/* Info */}
                                            <View style={styles.itemInfo}>
                                                <View style={styles.typeBadge}>
                                                    <Text style={styles.typeText}>
                                                        {CONTENT_TYPE_LABELS[item.type]}
                                                    </Text>
                                                </View>
                                                <Text style={styles.itemTitle} numberOfLines={2}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.trainerName}>
                                                    by {item.trainerName}
                                                </Text>
                                                <Text style={styles.purchaseDate}>
                                                    Purchased {formatDate(purchase.purchasedAt)}
                                                </Text>
                                            </View>

                                            {/* Continue Button */}
                                            <View style={styles.continueButton}>
                                                <Ionicons name="play-circle" size={32} color="#6B9B5A" />
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )
                            })}
                        </>
                    )}
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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 14,
        color: "#888",
        marginBottom: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 22,
    },
    browseButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#6B9B5A",
        borderRadius: 12,
    },
    browseButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#FFF",
    },
    purchaseCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    cardGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    itemIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    typeBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#2A2A2A",
        borderRadius: 4,
        marginBottom: 4,
    },
    typeText: {
        fontSize: 10,
        color: "#888",
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
        marginBottom: 2,
    },
    trainerName: {
        fontSize: 12,
        color: "#888",
    },
    purchaseDate: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    continueButton: {
        marginLeft: 12,
    },
})
