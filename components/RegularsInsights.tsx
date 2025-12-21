/**
 * RegularsInsights - Community Wisdom Component
 * 
 * Shows tips and insights from frequent users:
 * - "Lights off at 10 PM"
 * - "Nets are often down on weekends"
 * - "Morning regulars are friendly"
 * 
 * Users can contribute and upvote insights.
 */

import React, { useState, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { db } from "@/lib/firebase-config"
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    increment,
    serverTimestamp
} from "firebase/firestore"

// ============================================
// TYPES
// ============================================

export interface VenueInsight {
    id: string
    venueId: string
    text: string
    category: InsightCategory
    upvotes: number
    downvotes: number
    verified: boolean
    userId: string
    userName?: string
    createdAt: string
}

export type InsightCategory =
    | "timing"       // "Busy on Wednesdays"
    | "conditions"   // "Lights off at 10"
    | "community"    // "Regulars are friendly"
    | "equipment"    // "Bring your own ball"
    | "access"       // "Gate code is 1234"
    | "other"

const CATEGORY_CONFIG: Record<InsightCategory, { icon: string; label: string }> = {
    timing: { icon: "⏰", label: "Timing" },
    conditions: { icon: "💡", label: "Conditions" },
    community: { icon: "👥", label: "Community" },
    equipment: { icon: "🏀", label: "Equipment" },
    access: { icon: "🔑", label: "Access" },
    other: { icon: "💬", label: "Other" },
}

// ============================================
// REGULARS INSIGHTS COMPONENT
// ============================================

interface RegularsInsightsProps {
    venueId: string
    insights: VenueInsight[]
    userId: string
    onInsightAdded?: () => void
}

export function RegularsInsights({
    venueId,
    insights,
    userId,
    onInsightAdded,
}: RegularsInsightsProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [newInsight, setNewInsight] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<InsightCategory>("other")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpvote = useCallback(async (insightId: string) => {
        if (!db) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        try {
            await updateDoc(doc(db, "venueInsights", insightId), {
                upvotes: increment(1)
            })
        } catch (error) {
            console.error("Error upvoting:", error)
        }
    }, [])

    const handleSubmit = useCallback(async () => {
        if (!db || !newInsight.trim()) return

        setIsSubmitting(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            await addDoc(collection(db, "venueInsights"), {
                venueId,
                text: newInsight.trim(),
                category: selectedCategory,
                upvotes: 1,
                downvotes: 0,
                verified: false,
                userId,
                createdAt: serverTimestamp(),
            })

            setNewInsight("")
            setShowAddForm(false)
            onInsightAdded?.()
        } catch (error) {
            console.error("Error adding insight:", error)
        } finally {
            setIsSubmitting(false)
        }
    }, [venueId, newInsight, selectedCategory, userId, onInsightAdded])

    // Sort by upvotes
    const sortedInsights = [...insights].sort((a, b) => b.upvotes - a.upvotes)

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerEmoji}>💬</Text>
                    <Text style={styles.headerTitle}>Regulars Know</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddForm(!showAddForm)}
                >
                    <Ionicons
                        name={showAddForm ? "close" : "add"}
                        size={18}
                        color="#8B5CF6"
                    />
                </TouchableOpacity>
            </View>

            {/* Add Form */}
            {showAddForm && (
                <View style={styles.addForm}>
                    {/* Category Selection */}
                    <View style={styles.categoryRow}>
                        {(Object.keys(CATEGORY_CONFIG) as InsightCategory[]).map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === cat && styles.categoryChipSelected
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={styles.categoryEmoji}>
                                    {CATEGORY_CONFIG[cat].icon}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Share a tip... (e.g., 'Lights off at 10 PM')"
                        placeholderTextColor="#6B7280"
                        value={newInsight}
                        onChangeText={setNewInsight}
                        multiline
                        maxLength={150}
                    />

                    {/* Submit */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            !newInsight.trim() && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!newInsight.trim() || isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? "Sharing..." : "Share Tip"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Insights List */}
            {sortedInsights.length > 0 ? (
                <View style={styles.insightsList}>
                    {sortedInsights.slice(0, 4).map(insight => (
                        <InsightCard
                            key={insight.id}
                            insight={insight}
                            onUpvote={() => handleUpvote(insight.id)}
                        />
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🤔</Text>
                    <Text style={styles.emptyText}>
                        No tips yet. Be the first to share!
                    </Text>
                </View>
            )}
        </View>
    )
}

/**
 * Individual Insight Card
 */
function InsightCard({
    insight,
    onUpvote
}: {
    insight: VenueInsight
    onUpvote: () => void
}) {
    const config = CATEGORY_CONFIG[insight.category]

    return (
        <View style={styles.insightCard}>
            <View style={styles.insightLeft}>
                <Text style={styles.insightIcon}>{config.icon}</Text>
                <Text style={styles.insightText}>{insight.text}</Text>
            </View>
            <TouchableOpacity
                style={styles.upvoteButton}
                onPress={onUpvote}
            >
                <Ionicons name="arrow-up" size={14} color="#9CA3AF" />
                <Text style={styles.upvoteCount}>{insight.upvotes}</Text>
            </TouchableOpacity>
        </View>
    )
}

/**
 * Compact version for venue cards
 */
export function InsightBadge({
    text,
    category = "other"
}: {
    text: string
    category?: InsightCategory
}) {
    const config = CATEGORY_CONFIG[category]

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeIcon}>{config.icon}</Text>
            <Text style={styles.badgeText}>{text}</Text>
        </View>
    )
}

/**
 * Quick insight suggestions for common patterns
 */
export const COMMON_INSIGHTS = [
    { text: "Lights turn off at 10 PM", category: "conditions" as InsightCategory },
    { text: "Bring your own ball", category: "equipment" as InsightCategory },
    { text: "Regulars are very friendly", category: "community" as InsightCategory },
    { text: "Busy on league nights (Wed)", category: "timing" as InsightCategory },
    { text: "Courts drain fast after rain", category: "conditions" as InsightCategory },
    { text: "Morning crew starts at 6 AM", category: "timing" as InsightCategory },
]

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1A1A2E",
        borderRadius: 16,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerEmoji: {
        fontSize: 18,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    addForm: {
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    categoryRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    categoryChip: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.05)",
        alignItems: "center",
        justifyContent: "center",
    },
    categoryChipSelected: {
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },
    categoryEmoji: {
        fontSize: 16,
    },
    input: {
        backgroundColor: "#0F0F1A",
        borderRadius: 10,
        padding: 12,
        color: "#fff",
        fontSize: 14,
        minHeight: 60,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#8B5CF6",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    insightsList: {
        gap: 8,
    },
    insightCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        padding: 12,
    },
    insightLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    insightIcon: {
        fontSize: 16,
    },
    insightText: {
        fontSize: 14,
        color: "#D1D5DB",
        flex: 1,
    },
    upvoteButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    upvoteCount: {
        fontSize: 12,
        color: "#9CA3AF",
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        padding: 20,
    },
    emptyEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeIcon: {
        fontSize: 12,
    },
    badgeText: {
        fontSize: 11,
        color: "#A78BFA",
    },
})
