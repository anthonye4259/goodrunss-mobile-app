
import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"

import { useAuth } from "@/lib/auth-context"
import { facilityService, ClaimedFacility } from "@/lib/services/facility-service"
import { ImageService } from "@/lib/image-service"

const AMENITIES_LIST = [
    { id: "parking", label: "Free Parking", icon: "car" },
    { id: "wifi", label: "Free WiFi", icon: "wifi" },
    { id: "lockers", label: "Lockers", icon: "lock-closed" },
    { id: "showers", label: "Showers", icon: "water" },
    { id: "lighting", label: "Pro Lighting", icon: "flash" },
    { id: "equipment", label: "Rental Equip", icon: "basketball" },
    { id: "water", label: "Water Fountains", icon: "water-outline" },
    { id: "ac", label: "Air Conditioning", icon: "thermometer" },
]

export default function FacilityEditProfileScreen() {
    const { facilityId } = useLocalSearchParams<{ facilityId: string }>()
    const { user } = useAuth()
    const imageService = ImageService.getInstance()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [facility, setFacility] = useState<ClaimedFacility | null>(null)

    // Form State
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [coverPhoto, setCoverPhoto] = useState<string | null>(null)
    const [amenities, setAmenities] = useState<string[]>([])

    // Additional Photos (Future feature)
    // const [gallery, setGallery] = useState<string[]>([])

    useEffect(() => {
        loadFacility()
    }, [facilityId])

    const loadFacility = async () => {
        if (!facilityId) return
        setLoading(true)
        try {
            const fac = await facilityService.getClaimedFacility(facilityId)
            if (fac) {
                setFacility(fac)
                setName(fac.businessName)
                setDescription(fac.description || "")
                setCoverPhoto(fac.coverPhoto || null)
                setAmenities(fac.amenities || [])
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Error", "Failed to load facility details")
        } finally {
            setLoading(false)
        }
    }

    const handleImagePick = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        Alert.alert("Cover Photo", "Choose an option", [
            {
                text: "Take Photo",
                onPress: async () => {
                    const uri = await imageService.takePhoto()
                    if (uri) await uploadPhoto(uri)
                },
            },
            {
                text: "Choose from Library",
                onPress: async () => {
                    const uri = await imageService.pickImage()
                    if (uri) await uploadPhoto(uri)
                },
            },
            { text: "Cancel", style: "cancel" },
        ])
    }

    const uploadPhoto = async (uri: string) => {
        if (!facilityId) return
        try {
            const url = await imageService.uploadImage(uri, `facilities/${facilityId}/cover`)
            setCoverPhoto(url)
        } catch (e) {
            Alert.alert("Error", "Failed to upload photo")
        }
    }

    const toggleAmenity = (id: string) => {
        Haptics.selectionAsync()
        setAmenities(prev =>
            prev.includes(id)
                ? prev.filter(a => a !== id)
                : [...prev, id]
        )
    }

    const handleSave = async () => {
        if (!facilityId || !name.trim()) return

        setSaving(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            await facilityService.updateFacilityProfile(facilityId, {
                businessName: name.trim(),
                description: description.trim(),
                coverPhoto: coverPhoto || undefined,
                amenities,
            })

            Alert.alert("Success", "Facility profile updated!")
            router.back()
        } catch (error) {
            Alert.alert("Error", "Failed to save profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: '#7ED957' }}>Loading...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        <Text style={styles.saveHeaderBtn}>{saving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Cover Photo */}
                    <TouchableOpacity style={styles.photoSection} onPress={handleImagePick}>
                        {coverPhoto ? (
                            <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Ionicons name="image-outline" size={48} color="#666" />
                                <Text style={styles.photoText}>Add Cover Photo</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color="#000" />
                        </View>
                    </TouchableOpacity>

                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Facility Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="My Facility"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>About</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your facility, courts, and atmosphere..."
                            placeholderTextColor="#666"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {AMENITIES_LIST.map((item) => {
                                const isSelected = amenities.includes(item.id)
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.amenityCard,
                                            isSelected && styles.amenityCardSelected
                                        ]}
                                        onPress={() => toggleAmenity(item.id)}
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={24}
                                            color={isSelected ? "#000" : "#FFF"}
                                        />
                                        <Text style={[
                                            styles.amenityLabel,
                                            isSelected && styles.amenityLabelSelected
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    loadingContainer: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#222",
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1A",
        alignItems: "center", justifyContent: "center"
    },
    headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
    saveHeaderBtn: { color: "#7ED957", fontSize: 16, fontWeight: "bold" },

    content: { paddingBottom: 40 },

    photoSection: {
        height: 200,
        backgroundColor: "#1A1A1A",
        marginBottom: 24,
        position: "relative",
    },
    coverPhoto: { width: "100%", height: "100%" },
    photoPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    photoText: { color: "#666", marginTop: 8 },
    editBadge: {
        position: "absolute",
        bottom: 16,
        right: 16,
        backgroundColor: "#7ED957",
        padding: 8,
        borderRadius: 20,
    },

    section: { paddingHorizontal: 20, marginBottom: 24 },
    label: { color: "#888", fontSize: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
    input: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    textArea: { minHeight: 120 },

    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    amenityCard: {
        width: "48%",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    amenityCardSelected: {
        backgroundColor: "#7ED957",
        borderColor: "#7ED957",
    },
    amenityLabel: { color: "#FFF", fontWeight: "600" },
    amenityLabelSelected: { color: "#000" },
})
