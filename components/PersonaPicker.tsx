/**
 * Persona Picker
 * 
 * UI for selecting AI coaching persona
 * Shows all available personas with their styles and features
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import {
    aiPersonasService,
    AIPersona,
    PersonaId,
    PersonaStyle,
} from "@/lib/services/ai-personas-service"

type Props = {
    visible: boolean
    onClose: () => void
    onSelect: (persona: AIPersona) => void
}

const STYLE_COLORS: Record<PersonaStyle, string> = {
    motivational: "#EF4444",
    technical: "#3B82F6",
    zen: "#8B5CF6",
    drill_sergeant: "#F97316",
    supportive: "#6B9B5A",
    playful: "#FBBF24",
}

export function PersonaPicker({ visible, onClose, onSelect }: Props) {
    const [personas, setPersonas] = useState<AIPersona[]>([])
    const [selectedId, setSelectedId] = useState<PersonaId>("gia_default")
    const [unlockedIds, setUnlockedIds] = useState<PersonaId[]>([])

    useEffect(() => {
        loadPersonas()
    }, [visible])

    const loadPersonas = async () => {
        const all = aiPersonasService.getAllPersonas()
        const current = await aiPersonasService.getSelectedPersona()
        const unlocked = await aiPersonasService.getUnlockedPersonas()

        setPersonas(all)
        setSelectedId(current.id as PersonaId)
        setUnlockedIds(unlocked)
    }

    const handleSelect = async (persona: AIPersona) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        // Check if premium and locked
        if (persona.isPremium && !unlockedIds.includes(persona.id as PersonaId)) {
            Alert.alert(
                "Premium Persona",
                `${persona.name} is a premium persona. Upgrade to GoodRunss Pro to unlock all coaching personalities!`,
                [
                    { text: "Maybe Later", style: "cancel" },
                    { text: "Learn More", onPress: () => { } },
                ]
            )
            return
        }

        await aiPersonasService.setSelectedPersona(persona.id as PersonaId)
        setSelectedId(persona.id as PersonaId)
        onSelect(persona)
        onClose()
    }

    const isUnlocked = (persona: AIPersona) => {
        return !persona.isPremium || unlockedIds.includes(persona.id as PersonaId)
    }

    const renderPersona = (persona: AIPersona) => {
        const isSelected = selectedId === persona.id
        const unlocked = isUnlocked(persona)
        const color = STYLE_COLORS[persona.style]

        return (
            <TouchableOpacity
                key={persona.id}
                style={[
                    styles.personaCard,
                    isSelected && styles.personaCardSelected,
                    !unlocked && styles.personaCardLocked,
                ]}
                onPress={() => handleSelect(persona)}
            >
                <LinearGradient
                    colors={isSelected ? [`${color}20`, "#0A0A0A"] : ["#1A1A1A", "#0F0F0F"]}
                    style={styles.personaGradient}
                >
                    {/* Avatar */}
                    <View style={[styles.avatar, { backgroundColor: `${color}30` }]}>
                        <Text style={styles.avatarEmoji}>{persona.emoji}</Text>
                        {!unlocked && (
                            <View style={styles.lockBadge}>
                                <Ionicons name="lock-closed" size={10} color="#FFF" />
                            </View>
                        )}
                    </View>

                    {/* Info */}
                    <View style={styles.personaInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.personaName}>{persona.name}</Text>
                            {persona.isPremium && (
                                <View style={styles.proBadge}>
                                    <Text style={styles.proBadgeText}>PRO</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.personaTitle}>{persona.title}</Text>
                        <Text style={styles.personaDesc} numberOfLines={2}>
                            {persona.description}
                        </Text>

                        {/* Style badge */}
                        <View style={[styles.styleBadge, { backgroundColor: `${color}20` }]}>
                            <Text style={[styles.styleBadgeText, { color }]}>
                                {persona.style.replace("_", " ")}
                            </Text>
                        </View>
                    </View>

                    {/* Selected indicator */}
                    {isSelected && (
                        <View style={[styles.selectedIndicator, { backgroundColor: color }]}>
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    // Group personas
    const freePersonas = personas.filter(p => !p.isPremium)
    const premiumPersonas = personas.filter(p => p.isPremium)
    const sportPersonas = personas.filter(p => p.sport)
    const generalPersonas = personas.filter(p => !p.sport && !p.isPremium)

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Choose Your Coach</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Current Selection */}
                        <View style={styles.currentSection}>
                            <Text style={styles.currentLabel}>Currently Active</Text>
                            {personas.find(p => p.id === selectedId) &&
                                renderPersona(personas.find(p => p.id === selectedId)!)
                            }
                        </View>

                        {/* General Personas */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Coaching Styles</Text>
                            {generalPersonas.map(renderPersona)}
                        </View>

                        {/* Sport-Specific */}
                        {sportPersonas.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Sport Specialists</Text>
                                {sportPersonas.map(renderPersona)}
                            </View>
                        )}

                        {/* Premium */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🌟 Premium Coaches</Text>
                            <Text style={styles.sectionSubtitle}>
                                Upgrade to Pro to unlock
                            </Text>
                            {premiumPersonas.map(renderPersona)}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#0A0A0A",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    currentSection: {
        marginBottom: 24,
    },
    currentLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: "#888",
        marginBottom: 12,
    },
    personaCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    personaCardSelected: {
        borderWidth: 2,
        borderColor: "#6B9B5A",
    },
    personaCardLocked: {
        opacity: 0.7,
    },
    personaGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    avatarEmoji: {
        fontSize: 28,
    },
    lockBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
    },
    personaInfo: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    personaName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    proBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#FBBF2420",
        borderRadius: 4,
    },
    proBadgeText: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#FBBF24",
    },
    personaTitle: {
        fontSize: 12,
        color: "#6B9B5A",
        marginTop: 2,
    },
    personaDesc: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    styleBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 8,
    },
    styleBadgeText: {
        fontSize: 10,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    selectedIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
})

export default PersonaPicker
