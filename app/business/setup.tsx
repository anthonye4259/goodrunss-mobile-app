import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import Slider from "@react-native-community/slider"

import { useUserPreferences } from "@/lib/user-preferences"
import { useUserLocation } from "@/lib/location-context"
import { trainerProfileService, TrainerListing } from "@/lib/services/trainer-profile-service"
import { ImageService } from "@/lib/image-service"

export default function TrainerSetupScreen() {
    const { preferences } = useUserPreferences()
    const { location } = useUserLocation()
    const cityName = location?.city || ""
    const imageService = ImageService.getInstance()

    // Form State (pre-populated from onboarding)
    const [name, setName] = useState(preferences.name || "")
    const [bio, setBio] = useState("")
    const [tagline, setTagline] = useState("")
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
    const [hourlyRate, setHourlyRate] = useState(7500) // $75 default in cents
    const [travelRadius, setTravelRadius] = useState(10) // 10 miles default

    // Auto-populated from onboarding
    const activities = preferences.activities || ["Basketball"]

    const [loading, setLoading] = useState(false)
    const [existingListing, setExistingListing] = useState<TrainerListing | null>(null)

    useEffect(() => {
        loadExistingListing()
    }, [])

    const loadExistingListing = async () => {
        const listing = await trainerProfileService.getListing()
        if (listing) {
            setExistingListing(listing)
            setName(listing.name || preferences.name || "")
            setBio(listing.bio || "")
            setTagline(listing.tagline || "")
            setPhotoUrl(listing.photoUrl || null)
            setHourlyRate(listing.hourlyRate || 7500)
            setTravelRadius(listing.travelRadius || 10)
        }
    }

    const handleImagePick = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        Alert.alert("Profile Photo", "Choose an option", [
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
        try {
            const url = await imageService.uploadImage(uri, "profile")
            setPhotoUrl(url)
        } catch (e) {
            Alert.alert("Error", "Failed to upload photo")
        }
    }

    const handleGoLive = async () => {
        if (!name.trim()) {
            Alert.alert("Missing Info", "Please enter your name.")
            return
        }

        setLoading(true)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        try {
            const listingData = {
                name: name.trim(),
                bio: bio.trim(),
                tagline: tagline.trim() || `${activities[0]} Training Expert`,
                photoUrl: photoUrl || undefined,
                hourlyRate,
                activities,
                city: cityName || "Unknown",
                state: "", // Could extract from reverse geocoding
                latitude: location?.lat,
                longitude: location?.lng,
                travelRadius,
                isListed: true,
                rating: existingListing?.rating || 5.0,
                reviewCount: existingListing?.reviewCount || 0,
                totalSessions: existingListing?.totalSessions || 0,
            }

            if (existingListing) {
                await trainerProfileService.updateListing(listingData)
            } else {
                await trainerProfileService.createListing(listingData)
            }

            Alert.alert(
                "You're Live! 🎉",
                "Players in your area can now find and book you.",
                [{ text: "Let's Go", onPress: () => router.back() }]
            )
        } catch (e) {
            console.error(e)
            Alert.alert("Error", "Failed to save listing. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Go Live</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Hero */}
                    <View style={styles.heroSection}>
                        <TouchableOpacity onPress={handleImagePick} style={styles.photoContainer}>
                            {photoUrl ? (
                                <Image source={{ uri: photoUrl }} style={styles.photo} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons name="camera" size={32} color="#666" />
                                </View>
                            )}
                            <View style={styles.editBadge}>
                                <Ionicons name="pencil" size={14} color="#000" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.photoHint}>Tap to add photo</Text>
                    </View>

                    {/* Name */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Coach Mike"
                            placeholderTextColor="#666"
                        />
                    </View>

                    {/* Tagline */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Tagline</Text>
                        <TextInput
                            style={styles.input}
                            value={tagline}
                            onChangeText={setTagline}
                            placeholder={`${activities[0]} Training Expert`}
                            placeholderTextColor="#666"
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell players about your experience and coaching style..."
                            placeholderTextColor="#666"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Activities (Auto from Onboarding) */}
                    <View style={styles.field}>
                        <Text style={styles.label}>What You Teach</Text>
                        <View style={styles.chipContainer}>
                            {activities.map(activity => (
                                <View key={activity} style={styles.chip}>
                                    <Text style={styles.chipText}>{activity}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.hint}>Based on your onboarding. Edit in Settings.</Text>
                    </View>

                    {/* Hourly Rate */}
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Hourly Rate</Text>
                            <Text style={styles.rateValue}>${(hourlyRate / 100).toFixed(0)}/hr</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={3000}
                            maximumValue={25000}
                            step={500}
                            value={hourlyRate}
                            onValueChange={setHourlyRate}
                            minimumTrackTintColor="#7ED957"
                            maximumTrackTintColor="#333"
                            thumbTintColor="#7ED957"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>$30</Text>
                            <Text style={styles.sliderLabel}>$250+</Text>
                        </View>
                    </View>

                    {/* Travel Radius */}
                    <View style={styles.field}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Travel Radius</Text>
                            <Text style={styles.rateValue}>{travelRadius} mi</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={50}
                            step={1}
                            value={travelRadius}
                            onValueChange={setTravelRadius}
                            minimumTrackTintColor="#7ED957"
                            maximumTrackTintColor="#333"
                            thumbTintColor="#7ED957"
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>1 mi</Text>
                            <Text style={styles.sliderLabel}>50 mi</Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Your Location</Text>
                        <View style={styles.locationBox}>
                            <Ionicons name="location" size={20} color="#7ED957" />
                            <Text style={styles.locationText}>
                                {cityName || "Detecting location..."}
                            </Text>
                        </View>
                    </View>

                </ScrollView>

                {/* Footer CTA */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.goLiveBtn, loading && styles.disabledBtn]}
                        onPress={handleGoLive}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#7ED957', '#4C9E29']}
                            style={styles.goLiveGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="flash" size={20} color="#000" />
                            <Text style={styles.goLiveText}>
                                {loading ? "Saving..." : existingListing?.isListed ? "Update Listing" : "Go Live on Marketplace"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.footerHint}>
                        You can take your listing offline anytime from Settings.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
        alignItems: 'center', justifyContent: 'center'
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },

    content: { paddingHorizontal: 20, paddingBottom: 140 },

    heroSection: { alignItems: 'center', marginBottom: 32 },
    photoContainer: { position: 'relative' },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: '#1A1A1A',
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#333', borderStyle: 'dashed'
    },
    editBadge: {
        position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#7ED957', alignItems: 'center', justifyContent: 'center'
    },
    photoHint: { color: '#666', fontSize: 12, marginTop: 8 },

    field: { marginBottom: 24 },
    label: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    rateValue: { color: '#7ED957', fontSize: 18, fontWeight: 'bold' },

    input: {
        backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16,
        borderWidth: 1, borderColor: '#333'
    },
    bioInput: { minHeight: 100 },

    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        backgroundColor: 'rgba(126, 217, 87, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#7ED957'
    },
    chipText: { color: '#7ED957', fontWeight: '600' },
    hint: { color: '#666', fontSize: 12, marginTop: 8 },

    slider: { width: '100%', height: 40 },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    sliderLabel: { color: '#666', fontSize: 12 },

    locationBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333'
    },
    locationText: { color: '#FFF', fontSize: 16 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: 20, paddingBottom: 40, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#222'
    },
    goLiveBtn: { borderRadius: 16, overflow: 'hidden' },
    disabledBtn: { opacity: 0.5 },
    goLiveGradient: {
        paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    goLiveText: { color: '#000', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
    footerHint: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 12 }
})
