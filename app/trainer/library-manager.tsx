/**
 * Trainer Library Content Manager
 * 
 * Create and manage library content (drills, courses, programs)
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
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

const CONTENT_TYPES: { type: ContentType; label: string; icon: string }[] = [
    { type: "drill", label: "Drill", icon: "flash" },
    { type: "tutorial", label: "Tutorial", icon: "play-circle" },
    { type: "program", label: "Program", icon: "list" },
    { type: "course", label: "Course", icon: "school" },
    { type: "playbook", label: "Playbook", icon: "book" },
]

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "all"]
const SPORTS = ["Tennis", "Pickleball", "Padel", "Basketball", "Golf", "Soccer", "Volleyball"]

export default function TrainerLibraryManagerScreen() {
    const [myContent, setMyContent] = useState<LibraryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)

    // Create form state
    const [contentType, setContentType] = useState<ContentType>("drill")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [sport, setSport] = useState("Tennis")
    const [skillLevel, setSkillLevel] = useState("all")
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadContent()
    }, [])

    const loadContent = async () => {
        try {
            const content = await trainerLibraryService.getMyContent()
            setMyContent(content)
        } catch (error) {
            console.error("Error loading content:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a title")
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setCreating(true)

        try {
            const newItem = await trainerLibraryService.createContent({
                type: contentType,
                title: title.trim(),
                description: description.trim(),
                price: price ? parseFloat(price) : 0,
                isFree: !price || parseFloat(price) === 0,
                sport,
                skillLevel: skillLevel as any,
                tags: [sport.toLowerCase(), skillLevel],
            })

            setMyContent([...myContent, newItem])
            setShowCreateForm(false)
            resetForm()
            Alert.alert("Success! 🎉", `"${title}" has been created.`)
        } catch (error) {
            Alert.alert("Error", "Failed to create content. Please try again.")
        } finally {
            setCreating(false)
        }
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPrice("")
        setContentType("drill")
        setSport("Tennis")
        setSkillLevel("all")
    }

    const handleDelete = (item: LibraryItem) => {
        Alert.alert(
            "Delete Content",
            `Are you sure you want to delete "${item.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await trainerLibraryService.deleteContent(item.id)
                        setMyContent(myContent.filter(c => c.id !== item.id))
                    },
                },
            ]
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
                    <Text style={styles.headerTitle}>My Content</Text>
                    <TouchableOpacity onPress={() => setShowCreateForm(!showCreateForm)}>
                        <Ionicons name={showCreateForm ? "close" : "add"} size={28} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Create Form */}
                    {showCreateForm && (
                        <View style={styles.createForm}>
                            <Text style={styles.formTitle}>Create New Content</Text>

                            {/* Content Type */}
                            <Text style={styles.label}>Type</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                                {CONTENT_TYPES.map(ct => (
                                    <TouchableOpacity
                                        key={ct.type}
                                        style={[styles.typeChip, contentType === ct.type && styles.typeChipActive]}
                                        onPress={() => setContentType(ct.type)}
                                    >
                                        <Ionicons
                                            name={ct.icon as any}
                                            size={16}
                                            color={contentType === ct.type ? "#FFF" : "#888"}
                                        />
                                        <Text style={[styles.typeText, contentType === ct.type && styles.typeTextActive]}>
                                            {ct.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Title */}
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="e.g., Power Forehand Drill"
                                placeholderTextColor="#666"
                            />

                            {/* Description */}
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe what players will learn..."
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                            />

                            {/* Sport */}
                            <Text style={styles.label}>Sport</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                                {SPORTS.map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.sportChip, sport === s && styles.sportChipActive]}
                                        onPress={() => setSport(s)}
                                    >
                                        <Text style={[styles.sportText, sport === s && styles.sportTextActive]}>
                                            {s}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Skill Level */}
                            <Text style={styles.label}>Skill Level</Text>
                            <View style={styles.skillRow}>
                                {SKILL_LEVELS.map(sl => (
                                    <TouchableOpacity
                                        key={sl}
                                        style={[styles.skillChip, skillLevel === sl && styles.skillChipActive]}
                                        onPress={() => setSkillLevel(sl)}
                                    >
                                        <Text style={[styles.skillText, skillLevel === sl && styles.skillTextActive]}>
                                            {sl.charAt(0).toUpperCase() + sl.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Price */}
                            <Text style={styles.label}>Price (USD)</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0 for free"
                                placeholderTextColor="#666"
                                keyboardType="decimal-pad"
                            />

                            {/* Create Button */}
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreate}
                                disabled={creating}
                            >
                                <LinearGradient
                                    colors={["#6B9B5A", "#4A7A3A"]}
                                    style={styles.createGradient}
                                >
                                    <Text style={styles.createButtonText}>
                                        {creating ? "Creating..." : "Create Content"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* My Content List */}
                    <View style={styles.contentList}>
                        <Text style={styles.sectionTitle}>
                            Your Content ({myContent.length})
                        </Text>

                        {loading ? (
                            <Text style={styles.loadingText}>Loading...</Text>
                        ) : myContent.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="library-outline" size={48} color="#666" />
                                <Text style={styles.emptyTitle}>No Content Yet</Text>
                                <Text style={styles.emptyText}>
                                    Create drills, courses, and programs to sell to players worldwide.
                                </Text>
                            </View>
                        ) : (
                            myContent.map(item => (
                                <View key={item.id} style={styles.contentCard}>
                                    <View style={styles.contentIcon}>
                                        <Ionicons
                                            name={CONTENT_TYPE_ICONS[item.type] as any}
                                            size={24}
                                            color="#6B9B5A"
                                        />
                                    </View>
                                    <View style={styles.contentInfo}>
                                        <View style={styles.contentTypeLabel}>
                                            <Text style={styles.contentTypeText}>
                                                {CONTENT_TYPE_LABELS[item.type]}
                                            </Text>
                                        </View>
                                        <Text style={styles.contentTitle}>{item.title}</Text>
                                        <View style={styles.contentMeta}>
                                            <Text style={styles.contentPrice}>
                                                {item.isFree ? "Free" : `$${item.price}`}
                                            </Text>
                                            <Text style={styles.contentStats}>
                                                {item.purchaseCount} purchases
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(item)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    createForm: {
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#888",
        marginBottom: 8,
        marginTop: 12,
    },
    typeRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    typeChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#2A2A2A",
        borderRadius: 20,
        marginRight: 8,
        gap: 6,
    },
    typeChipActive: {
        backgroundColor: "#6B9B5A",
    },
    typeText: {
        fontSize: 13,
        color: "#888",
    },
    typeTextActive: {
        color: "#FFF",
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#0A0A0A",
        borderRadius: 12,
        padding: 14,
        color: "#FFF",
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    sportChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#2A2A2A",
        borderRadius: 20,
        marginRight: 8,
    },
    sportChipActive: {
        backgroundColor: "#8B5CF620",
        borderWidth: 1,
        borderColor: "#8B5CF6",
    },
    sportText: {
        fontSize: 13,
        color: "#888",
    },
    sportTextActive: {
        color: "#8B5CF6",
        fontWeight: "600",
    },
    skillRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    skillChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#2A2A2A",
        borderRadius: 20,
    },
    skillChipActive: {
        backgroundColor: "#3B82F620",
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    skillText: {
        fontSize: 13,
        color: "#888",
    },
    skillTextActive: {
        color: "#3B82F6",
        fontWeight: "600",
    },
    createButton: {
        marginTop: 24,
        borderRadius: 12,
        overflow: "hidden",
    },
    createGradient: {
        paddingVertical: 14,
        alignItems: "center",
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    contentList: {},
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 16,
    },
    loadingText: {
        color: "#888",
        textAlign: "center",
        paddingVertical: 20,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
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
        lineHeight: 22,
    },
    contentCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    contentIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
    contentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    contentTypeLabel: {
        alignSelf: "flex-start",
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#2A2A2A",
        borderRadius: 4,
        marginBottom: 4,
    },
    contentTypeText: {
        fontSize: 10,
        color: "#888",
    },
    contentTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
    },
    contentMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 4,
    },
    contentPrice: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    contentStats: {
        fontSize: 12,
        color: "#666",
    },
})
