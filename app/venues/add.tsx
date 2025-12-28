import React, { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import * as ImagePicker from "expo-image-picker"
import { useUserLocation } from "@/lib/location-context"
import { venueService } from "@/lib/services/venue-service"
import { socialService } from "@/lib/services/social-service"

export default function AddVenueScreen() {
    const { location } = useUserLocation()
    const [name, setName] = useState("")
    const [sport, setSport] = useState("Basketball")
    const [desc, setDesc] = useState("")
    const [photos, setPhotos] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Default to user location, but allow picking (mock picker for now)
    const [coords, setCoords] = useState(location ? { latitude: location.lat, longitude: location.lng } : { latitude: 0, longitude: 0 })

    const handleAddPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        })

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri])
        }
    }

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert("Missing Info", "Please give this spot a name.")
            return
        }

        setSubmitting(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            // 1. Submit to Venue Service
            // In a real app with auth, get userId
            const userId = "current_user_id"

            await venueService.submitVenueProposal(
                userId,
                name,
                sport,
                coords.latitude,
                coords.longitude,
                desc,
                photos // In real app, upload these to Storage first and get URLs
            )

            // 2. Grant Reward (Optimistic)
            await socialService.addXP(50, "venue_proposal")

            Alert.alert(
                "Spot Submitted! 📍",
                "Thanks for contributing! You earned +50 XP pending approval.",
                [{
                    text: "Awesome",
                    onPress: () => router.back()
                }]
            )

            // 3. Notify Friends (Simulated)
            // socialService.broadcastActivity(...)

        } catch (e) {
            console.error(e)
            Alert.alert("Error", "Could not submit venue.")
        } finally {
            setSubmitting(false)
        }
    }

    const SPORTS = ["Basketball", "Tennis", "Pickleball", "Soccer", "Volleyball", "Gym"]

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#000", "#111"]} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add a Hidden Gem</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.label}>Name of the Spot</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. The Cage, Sunset Park Courts"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Sport</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
                        {SPORTS.map(s => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.pill, sport === s && styles.pillActive]}
                                onPress={() => setSport(s)}
                            >
                                <Text style={[styles.pillText, sport === s && styles.pillTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Location</Text>
                    <View style={styles.locationCard}>
                        <View style={styles.mapPreview}>
                            {/* Placeholder for mini map */}
                            <Ionicons name="map" size={32} color="#444" />
                            <Text style={styles.mapText}>Using Current Location</Text>
                        </View>
                        <Text style={styles.coordText}>
                            {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                        </Text>
                    </View>

                    <Text style={styles.label}>Description & Tips</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Is it lighted? Is there water? Best time to go?"
                        placeholderTextColor="#666"
                        multiline
                        textAlignVertical="top"
                        value={desc}
                        onChangeText={setDesc}
                    />

                    <Text style={styles.label}>Photos</Text>
                    <ScrollView horizontal style={styles.photoRow}>
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
                            <Ionicons name="camera" size={24} color="#3B82F6" />
                            <Text style={styles.addPhotoText}>Add Photo</Text>
                        </TouchableOpacity>
                        {photos.map((p, i) => (
                            <Image key={i} source={{ uri: p }} style={styles.photoThumb} />
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && styles.btnDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <LinearGradient
                            colors={['#7ED957', '#4C9E29']} // Brand Green
                            style={styles.btnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.btnText}>
                                {submitting ? "Publicizing..." : "Publicize Spot (+50 XP)"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222'
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
        alignItems: 'center', justifyContent: 'center'
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    content: { padding: 20 },

    label: { color: '#999', fontSize: 12, marginBottom: 8, marginTop: 20, fontWeight: 'bold', textTransform: 'uppercase' },
    input: {
        backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16,
        borderWidth: 1, borderColor: '#333'
    },
    textArea: { height: 100 },

    hScroll: { flexDirection: 'row', marginBottom: 10 },
    pill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#1A1A1A', marginRight: 8, borderWidth: 1, borderColor: '#333'
    },
    pillActive: {
        backgroundColor: '#3B82F6', borderColor: '#3B82F6'
    },
    pillText: { color: '#999', fontWeight: 'bold' },
    pillTextActive: { color: '#FFF' },

    locationCard: {
        backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333'
    },
    mapPreview: {
        height: 100, backgroundColor: '#111', borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12
    },
    mapText: { color: '#666', marginTop: 8 },
    coordText: { color: '#666', fontSize: 12, textAlign: 'center' },

    photoRow: { flexDirection: 'row' },
    addPhotoBtn: {
        width: 100, height: 100, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
        borderWidth: 1, borderColor: '#3B82F6', borderStyle: 'dashed'
    },
    addPhotoText: { color: '#3B82F6', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
    photoThumb: {
        width: 100, height: 100, borderRadius: 12, marginRight: 12
    },

    submitBtn: {
        marginTop: 40, borderRadius: 16, overflow: 'hidden', marginBottom: 40
    },
    btnDisabled: { opacity: 0.7 },
    btnGradient: {
        paddingVertical: 16, alignItems: 'center', justifyContent: 'center'
    },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
})
