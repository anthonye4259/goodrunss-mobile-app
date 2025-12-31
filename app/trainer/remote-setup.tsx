/**
 * Coach Remote Setup Screen
 * 
 * Allows trainers to configure their remote training services
 * - Enable/disable remote training
 * - Add/edit services with custom pricing
 * - Set languages spoken
 * - Configure destination profile
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Switch,
    TextInput,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

import { remoteTrainingService } from "@/lib/services/remote-training-service"
import { RemoteServiceCard } from "@/components/RemoteTraining/RemoteServiceCard"
import type { RemoteService, RemoteServiceType, Language } from "@/lib/types/remote-training"
import {
    SERVICE_TYPE_LABELS,
    SERVICE_TYPE_ICONS,
    SERVICE_TYPE_COLORS,
    SUPPORTED_CURRENCIES,
} from "@/lib/types/remote-training"

const AVAILABLE_LANGUAGES: Language[] = [
    "English", "Spanish", "French", "Portuguese", "Arabic",
    "German", "Italian", "Mandarin", "Japanese", "Korean", "Russian", "Dutch"
]

const SERVICE_TEMPLATES: Partial<RemoteService>[] = [
    {
        type: "video_analysis",
        name: "Swing Analysis",
        description: "Upload a video and I'll send detailed feedback within 48 hours.",
        price: 35,
        deliveryTime: "48 hours",
    },
    {
        type: "live_session",
        name: "1:1 Video Coaching",
        description: "Live video session where we work on technique in real-time.",
        price: 75,
        duration: 60,
    },
    {
        type: "training_plan",
        name: "Monthly Training Plan",
        description: "Custom drill program tailored to your goals, updated weekly.",
        price: 99,
    },
    {
        type: "form_check_subscription",
        name: "Form Check (5/month)",
        description: "Submit up to 5 videos per month for quick form feedback.",
        price: 79,
        sessionsIncluded: 5,
    },
    {
        type: "match_prep",
        name: "Match Prep Strategy",
        description: "I'll analyze your opponent and create a game plan.",
        price: 125,
        deliveryTime: "24 hours",
    },
    {
        type: "mental_game",
        name: "Mental Game Session",
        description: "Pre-match visualization and mindset coaching.",
        price: 85,
        duration: 45,
    },
]

export default function RemoteSetupScreen() {
    const [remoteEnabled, setRemoteEnabled] = useState(false)
    const [services, setServices] = useState<RemoteService[]>([])
    const [languages, setLanguages] = useState<Language[]>(["English"])
    const [destinationTagline, setDestinationTagline] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const myServices = await remoteTrainingService.getMyServices()
            setServices(myServices)
            setRemoteEnabled(myServices.length > 0)
        } catch (error) {
            console.error("Error loading remote services:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddService = async (template: Partial<RemoteService>) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        const newService = await remoteTrainingService.createService({
            type: template.type!,
            name: template.name!,
            description: template.description!,
            price: template.price!,
            currency,
            duration: template.duration,
            deliveryTime: template.deliveryTime,
            sessionsIncluded: template.sessionsIncluded,
            isActive: true,
        })

        setServices([...services, newService])
        Alert.alert("Service Added", `${template.name} is now available to clients.`)
    }

    const handleToggleService = async (serviceId: string, isActive: boolean) => {
        Haptics.selectionAsync()
        await remoteTrainingService.updateService(serviceId, { isActive })
        setServices(services.map(s => s.id === serviceId ? { ...s, isActive } : s))
    }

    const handleDeleteService = async (serviceId: string) => {
        Alert.alert(
            "Delete Service",
            "Are you sure you want to remove this service?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await remoteTrainingService.deleteService(serviceId)
                        setServices(services.filter(s => s.id !== serviceId))
                    },
                },
            ]
        )
    }

    const toggleLanguage = (lang: Language) => {
        Haptics.selectionAsync()
        if (languages.includes(lang)) {
            if (languages.length > 1) {
                setLanguages(languages.filter(l => l !== lang))
            }
        } else {
            setLanguages([...languages, lang])
        }
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
                    <Text style={styles.headerTitle}>Remote Training</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Enable Remote Training */}
                    <View style={styles.section}>
                        <View style={styles.toggleRow}>
                            <View>
                                <Text style={styles.toggleLabel}>Enable Remote Training</Text>
                                <Text style={styles.toggleSubtext}>Accept clients worldwide</Text>
                            </View>
                            <Switch
                                value={remoteEnabled}
                                onValueChange={setRemoteEnabled}
                                trackColor={{ false: "#333", true: "#6B9B5A" }}
                                thumbColor="#FFF"
                            />
                        </View>
                    </View>

                    {remoteEnabled && (
                        <>
                            {/* Languages */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Languages Spoken</Text>
                                <View style={styles.chipContainer}>
                                    {AVAILABLE_LANGUAGES.map(lang => (
                                        <TouchableOpacity
                                            key={lang}
                                            style={[
                                                styles.chip,
                                                languages.includes(lang) && styles.chipSelected
                                            ]}
                                            onPress={() => toggleLanguage(lang)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                languages.includes(lang) && styles.chipTextSelected
                                            ]}>
                                                {lang}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Destination Profile */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Destination Tagline</Text>
                                <Text style={styles.sectionSubtext}>
                                    Attract travelers with a catchy tagline
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Train with me in Dubai!"
                                    placeholderTextColor="#666"
                                    value={destinationTagline}
                                    onChangeText={setDestinationTagline}
                                />
                            </View>

                            {/* Currency */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Default Currency</Text>
                                <View style={styles.chipContainer}>
                                    {SUPPORTED_CURRENCIES.map(c => (
                                        <TouchableOpacity
                                            key={c.code}
                                            style={[
                                                styles.chip,
                                                currency === c.code && styles.chipSelected
                                            ]}
                                            onPress={() => {
                                                Haptics.selectionAsync()
                                                setCurrency(c.code)
                                            }}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                currency === c.code && styles.chipTextSelected
                                            ]}>
                                                {c.symbol} {c.code}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* My Services */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>My Services</Text>
                                {services.length === 0 ? (
                                    <Text style={styles.emptyText}>No services added yet</Text>
                                ) : (
                                    services.map(service => (
                                        <View key={service.id} style={styles.serviceRow}>
                                            <RemoteServiceCard
                                                service={service}
                                                variant="compact"
                                                onPress={() => {
                                                    // Edit service
                                                }}
                                            />
                                            <View style={styles.serviceActions}>
                                                <Switch
                                                    value={service.isActive}
                                                    onValueChange={(v) => handleToggleService(service.id, v)}
                                                    trackColor={{ false: "#333", true: "#6B9B5A" }}
                                                    thumbColor="#FFF"
                                                />
                                                <TouchableOpacity onPress={() => handleDeleteService(service.id)}>
                                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>

                            {/* Add Services */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Add Services</Text>
                                <Text style={styles.sectionSubtext}>
                                    Tap to add. You can customize pricing later.
                                </Text>
                                {SERVICE_TEMPLATES.filter(t =>
                                    !services.some(s => s.type === t.type)
                                ).map(template => (
                                    <TouchableOpacity
                                        key={template.type}
                                        style={styles.addServiceCard}
                                        onPress={() => handleAddService(template)}
                                    >
                                        <View style={[
                                            styles.addServiceIcon,
                                            { backgroundColor: `${SERVICE_TYPE_COLORS[template.type!]}20` }
                                        ]}>
                                            <Ionicons
                                                name={SERVICE_TYPE_ICONS[template.type!] as any}
                                                size={20}
                                                color={SERVICE_TYPE_COLORS[template.type!]}
                                            />
                                        </View>
                                        <View style={styles.addServiceContent}>
                                            <Text style={styles.addServiceName}>{template.name}</Text>
                                            <Text style={styles.addServiceDesc} numberOfLines={1}>
                                                {template.description}
                                            </Text>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color="#6B9B5A" />
                                    </TouchableOpacity>
                                ))}
                            </View>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 8,
    },
    sectionSubtext: {
        fontSize: 13,
        color: "#888",
        marginBottom: 12,
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
    toggleSubtext: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#1A1A1A",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    chipSelected: {
        backgroundColor: "#6B9B5A30",
        borderColor: "#6B9B5A",
    },
    chipText: {
        fontSize: 14,
        color: "#888",
    },
    chipTextSelected: {
        color: "#6B9B5A",
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    emptyText: {
        color: "#666",
        fontSize: 14,
        textAlign: "center",
        paddingVertical: 20,
    },
    serviceRow: {
        marginBottom: 8,
    },
    serviceActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    addServiceCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    addServiceIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    addServiceContent: {
        flex: 1,
        marginLeft: 12,
    },
    addServiceName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
    },
    addServiceDesc: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
})
