/**
 * Quick Response Templates
 * 
 * Pre-written responses for common lead inquiries.
 * One-tap to copy and send.
 */

import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import * as Haptics from "expo-haptics"

type Template = {
    id: string
    title: string
    content: string
    category: "greeting" | "pricing" | "availability" | "follow_up"
}

const DEFAULT_TEMPLATES: Template[] = [
    {
        id: "1",
        title: "Welcome Intro",
        content: "Hi! Thanks for reaching out. I'd love to help you reach your fitness goals. When would you like to schedule a free intro session?",
        category: "greeting",
    },
    {
        id: "2",
        title: "Pricing Info",
        content: "Great question! My sessions are $XX/hour for individuals and $XX/hour for groups. I also offer package discounts. Want to discuss what works best for you?",
        category: "pricing",
    },
    {
        id: "3",
        title: "Availability This Week",
        content: "I have openings this week on [DAYS]. What time works best for you? Morning or afternoon?",
        category: "availability",
    },
    {
        id: "4",
        title: "Follow Up",
        content: "Hey! Just checking in - still interested in getting started? I have some availability opening up this week if you'd like to book.",
        category: "follow_up",
    },
    {
        id: "5",
        title: "Post-Trial Thank You",
        content: "Great session today! You did awesome. Ready to commit to a regular schedule? I can set you up with a package that fits your goals.",
        category: "follow_up",
    },
]

type Props = {
    templates?: Template[]
    onSelect?: (template: Template) => void
    variant?: "inline" | "modal"
}

export function QuickResponseTemplates({ templates = DEFAULT_TEMPLATES, onSelect, variant = "inline" }: Props) {
    const [modalVisible, setModalVisible] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = async (template: Template) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        await Clipboard.setStringAsync(template.content)
        setCopiedId(template.id)
        onSelect?.(template)

        setTimeout(() => setCopiedId(null), 2000)
    }

    const getCategoryIcon = (category: Template["category"]) => {
        switch (category) {
            case "greeting": return "hand-left"
            case "pricing": return "pricetag"
            case "availability": return "calendar"
            case "follow_up": return "refresh"
        }
    }

    const getCategoryColor = (category: Template["category"]) => {
        switch (category) {
            case "greeting": return "#22C55E"
            case "pricing": return "#3B82F6"
            case "availability": return "#8B5CF6"
            case "follow_up": return "#F97316"
        }
    }

    const renderTemplate = (template: Template) => {
        const color = getCategoryColor(template.category)
        const isCopied = copiedId === template.id

        return (
            <TouchableOpacity
                key={template.id}
                style={[styles.templateCard, isCopied && styles.templateCopied]}
                onPress={() => handleCopy(template)}
                activeOpacity={0.8}
            >
                <View style={styles.templateHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: color + "20" }]}>
                        <Ionicons name={getCategoryIcon(template.category) as any} size={14} color={color} />
                    </View>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    {isCopied ? (
                        <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                    ) : (
                        <Ionicons name="copy-outline" size={16} color="#666" />
                    )}
                </View>
                <Text style={styles.templateContent} numberOfLines={2}>{template.content}</Text>
            </TouchableOpacity>
        )
    }

    if (variant === "modal") {
        return (
            <>
                <TouchableOpacity
                    style={styles.triggerButton}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setModalVisible(true)
                    }}
                >
                    <Ionicons name="flash" size={18} color="#7ED957" />
                    <Text style={styles.triggerText}>Quick Responses</Text>
                </TouchableOpacity>

                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Quick Responses</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>Tap to copy</Text>

                            <FlatList
                                data={templates}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => renderTemplate(item)}
                                style={styles.modalList}
                            />
                        </View>
                    </View>
                </Modal>
            </>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="flash" size={18} color="#FBBF24" />
                <Text style={styles.title}>Quick Responses</Text>
            </View>
            <View style={styles.templatesList}>
                {templates.slice(0, 3).map(renderTemplate)}
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
        borderColor: "#FBBF2420",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
    templatesList: {
        gap: 8,
    },
    templateCard: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "transparent",
    },
    templateCopied: {
        borderColor: "#22C55E40",
        backgroundColor: "#22C55E10",
    },
    templateHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    categoryIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    templateTitle: {
        flex: 1,
        color: "#FFF",
        fontSize: 13,
        fontWeight: "600",
    },
    templateContent: {
        color: "#888",
        fontSize: 12,
        lineHeight: 16,
    },
    triggerButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#7ED95720",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    triggerText: {
        color: "#7ED957",
        fontSize: 14,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: "70%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "700",
    },
    modalSubtitle: {
        color: "#666",
        fontSize: 13,
        marginBottom: 16,
    },
    modalList: {
        flexGrow: 0,
    },
})

export default QuickResponseTemplates
