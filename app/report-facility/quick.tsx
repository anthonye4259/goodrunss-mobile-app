import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/lib/auth-context"
import { venueService } from "@/lib/services/venue-service"
import * as Haptics from "expo-haptics"
import { ImageService } from "@/lib/image-service"
import { useUserLocation } from "@/lib/location-context"

// Quick nearby courts for selection
const NEARBY_COURTS = [
    { id: "1", name: "Piedmont Park Tennis Courts", distance: "0.3 mi" },
    { id: "2", name: "Grant Park Recreation", distance: "0.8 mi" },
    { id: "3", name: "Chastain Park Courts", distance: "1.2 mi" },
    { id: "4", name: "Other / Not Listed", distance: "" },
]

export default function QuickReportScreen() {
    const { user } = useAuth()
    const { location } = useUserLocation()
    const params = useLocalSearchParams()
    const [selectedCourt, setSelectedCourt] = useState(params.courtName ? String(params.courtName) : "")
    const [showCourtPicker, setShowCourtPicker] = useState(!params.courtName)
    const [crowdLevel, setCrowdLevel] = useState<"empty" | "light" | "moderate" | "busy" | "packed">("moderate")
    const [ageGroup, setAgeGroup] = useState<"kids" | "teens" | "adults" | "mixed">("adults")
    const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | "mixed">("intermediate")
    const [notes, setNotes] = useState("")
    const [photos, setPhotos] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)

    const crowdLevels = [
        { key: "empty", label: "Empty", icon: "bed-outline", color: "#22C55E", players: "0-2" },
        { key: "light", label: "Light", icon: "walk-outline", color: "#84CC16", players: "3-5" },
        { key: "moderate", label: "Moderate", icon: "people-outline", color: "#EAB308", players: "6-10" },
        { key: "busy", label: "Busy", icon: "flame-outline", color: "#F97316", players: "11-15" },
        { key: "packed", label: "Packed", icon: "rocket-outline", color: "#EF4444", players: "16+" },
    ]

    const ageGroups = [
        { key: "kids", label: "Kids", icon: "happy-outline", range: "Under 13" },
        { key: "teens", label: "Teens", icon: "school-outline", range: "13-17" },
        { key: "adults", label: "Adults", icon: "person-outline", range: "18+" },
        { key: "mixed", label: "Mixed", icon: "people-outline", range: "All ages" },
    ]

    const skillLevels = [
        { key: "beginner", label: "Beginner", icon: "leaf-outline", color: "#22C55E" },
        { key: "intermediate", label: "Intermediate", icon: "flash-outline", color: "#EAB308" },
        { key: "advanced", label: "Advanced", icon: "trophy-outline", color: "#F59E0B" },
        { key: "mixed", label: "Mixed", icon: "apps-outline", color: "#8B5CF6" },
    ]

    const handleAddPhoto = async () => {
        try {
            const imageService = ImageService.getInstance()
            const result = await imageService.pickImage()
            if (result) {
                setPhotos([...photos, result])
            }
        } catch (error) {
            console.error("Photo error:", error)
        }
    }

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert("Login Required", "Please log in to submit reports.")
            return
        }

        if (!selectedCourt) {
            Alert.alert("Select Court", "Please select which court you're reporting.")
            return
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setSubmitting(true)

        const success = await venueService.submitReport(
            null, // No specific venue for quick report
            user.id,
            "crowd",
            "good",
            notes,
            crowdLevel,
            ageGroup,
            skillLevel,
            photos
        )

        setSubmitting(false)

        if (success) {
            Alert.alert(
                "Report Submitted!",
                `Thank you for reporting ${selectedCourt}! You earned $5.`,
                [{ text: "OK", onPress: () => router.back() }]
            )
        } else {
            Alert.alert("Error", "Failed to submit report. Please try again.")
        }
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-16 pb-6">
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.back()
                            }}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-foreground ml-4">Court Report</Text>
                    </View>

                    {/* COURT SELECTION - Show which court they're reporting */}
                    <View className="mb-6">
                        <Text className="text-foreground font-bold text-lg mb-3">📍 Which Court?</Text>

                        {selectedCourt ? (
                            <TouchableOpacity
                                className="bg-primary/10 border border-primary rounded-xl p-4 flex-row items-center justify-between"
                                onPress={() => setShowCourtPicker(true)}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                                        <Ionicons name="location" size={20} color="#7ED957" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-base" numberOfLines={1}>{selectedCourt}</Text>
                                        <Text className="text-muted-foreground text-xs">Tap to change court</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="#7ED957" />
                            </TouchableOpacity>
                        ) : (
                            <View className="gap-2">
                                {NEARBY_COURTS.map((court) => (
                                    <TouchableOpacity
                                        key={court.id}
                                        className="bg-card border border-border rounded-xl p-4 flex-row items-center"
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                            if (court.name === "Other / Not Listed") {
                                                setSelectedCourt("")
                                                // Could prompt for custom input
                                            } else {
                                                setSelectedCourt(court.name)
                                                setShowCourtPicker(false)
                                            }
                                        }}
                                    >
                                        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                                            <Ionicons name="location-outline" size={20} color="#7ED957" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-foreground font-semibold">{court.name}</Text>
                                            {court.distance && <Text className="text-muted-foreground text-xs">{court.distance}</Text>}
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#666" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Crowd Level */}
                    <View className="mb-6">
                        <Text className="text-foreground font-bold text-lg mb-3">Current Traffic</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {crowdLevels.map((level) => (
                                <TouchableOpacity
                                    key={level.key}
                                    className={`flex-1 min-w-[30%] rounded-xl p-3 border ${crowdLevel === level.key ? "border-primary bg-primary/10" : "border-border bg-card"
                                        }`}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setCrowdLevel(level.key as any)
                                    }}
                                >
                                    <View style={{ alignItems: "center", marginBottom: 4 }}>
                                        <Ionicons name={level.icon as any} size={28} color={level.color} />
                                    </View>
                                    <Text className={`font-bold text-xs text-center ${crowdLevel === level.key ? "text-primary" : "text-foreground"}`}>
                                        {level.label}
                                    </Text>
                                    <Text className="text-muted-foreground text-xs text-center">{level.players}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Age Group */}
                    <View className="mb-6">
                        <Text className="text-foreground font-bold text-lg mb-3">Age Group</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {ageGroups.map((group) => (
                                <TouchableOpacity
                                    key={group.key}
                                    className={`flex-1 min-w-[45%] rounded-xl p-3 border ${ageGroup === group.key ? "border-primary bg-primary/10" : "border-border bg-card"
                                        }`}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setAgeGroup(group.key as any)
                                    }}
                                >
                                    <View style={{ alignItems: "center", marginBottom: 4 }}>
                                        <Ionicons name={group.icon as any} size={28} color="#9CA3AF" />
                                    </View>
                                    <Text className={`font-bold text-xs text-center ${ageGroup === group.key ? "text-primary" : "text-foreground"}`}>
                                        {group.label}
                                    </Text>
                                    <Text className="text-muted-foreground text-xs text-center">{group.range}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Skill Level */}
                    <View className="mb-6">
                        <Text className="text-foreground font-bold text-lg mb-3">Skill Level</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {skillLevels.map((level) => (
                                <TouchableOpacity
                                    key={level.key}
                                    className={`flex-1 min-w-[45%] rounded-xl p-3 border ${skillLevel === level.key ? "border-primary bg-primary/10" : "border-border bg-card"
                                        }`}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        setSkillLevel(level.key as any)
                                    }}
                                >
                                    <View style={{ alignItems: "center", marginBottom: 4 }}>
                                        <Ionicons name={level.icon as any} size={28} color={level.color} />
                                    </View>
                                    <Text className={`font-bold text-xs text-center ${skillLevel === level.key ? "text-primary" : "text-foreground"}`}>
                                        {level.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    <View className="mb-6">
                        <Text className="text-foreground font-bold text-lg mb-3">Additional Notes (Optional)</Text>
                        <TextInput
                            className="bg-card border border-border rounded-xl p-4 text-foreground min-h-[100px]"
                            placeholder="Any other details about the court..."
                            placeholderTextColor="#666"
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Photos */}
                    <View className="mb-6">
                        <Text className="text-foreground font-bold text-lg mb-3">Photos (Optional)</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {photos.map((photo, index) => (
                                <View key={index} className="w-24 h-24 rounded-xl overflow-hidden">
                                    <Image source={{ uri: photo }} className="w-full h-full" />
                                </View>
                            ))}
                            <TouchableOpacity
                                className="w-24 h-24 bg-card border border-border border-dashed rounded-xl items-center justify-center"
                                onPress={handleAddPhoto}
                            >
                                <Ionicons name="camera" size={32} color="#7ED957" />
                                <Text className="text-primary text-xs mt-1">+$5</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 ${submitting ? "bg-muted" : "bg-primary"}`}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text className="text-background font-bold text-center text-lg">
                            {submitting ? "Submitting..." : "Submit Report & Earn $5"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    )
}
