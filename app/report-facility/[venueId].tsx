
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import {
  type ReportCategory,
  type FacilityCondition,
  REPORT_REWARDS,
  getRewardEstimate,
} from "@/lib/facility-report-types"
import { ImageService } from "@/lib/image-service"
import { PARTNER_CITIES } from "@/lib/partner-city-types"

export default function ReportFacilityScreen() {
  const { venueId } = useLocalSearchParams()
  const [category, setCategory] = useState<ReportCategory>("maintenance")
  const [condition, setCondition] = useState<FacilityCondition>("good")
  const [details, setDetails] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [userCity, setUserCity] = useState<string | null>("myrtle-beach") // Would come from user profile
  const city = userCity ? PARTNER_CITIES.find((c) => c.id === userCity) : null

  const categories: { key: ReportCategory; label: string; icon: string; color: string }[] = [
    { key: "crowd", label: "Crowd Level", icon: "people", color: "#4FACFE" },
    { key: "skill", label: "Skill Level", icon: "stats-chart", color: "#667EEA" },
    { key: "maintenance", label: "Maintenance", icon: "construct", color: "#FA709A" },
    { key: "safety", label: "Safety Issue", icon: "alert-circle", color: "#FF6B6B" },
    { key: "amenities", label: "Amenities", icon: "cafe", color: "#7ED957" },
  ]

  const conditions: { key: FacilityCondition; label: string; icon: string; color: string }[] = [
    { key: "excellent", label: "Excellent", icon: "checkmark-circle", color: "#7ED957" },
    { key: "good", label: "Good", icon: "thumbs-up", color: "#4FACFE" },
    { key: "fair", label: "Fair", icon: "warning", color: "#FFA500" },
    { key: "poor", label: "Poor", icon: "close-circle", color: "#FF6B6B" },
  ]

  const estimatedReward = getRewardEstimate(category, photos.length > 0, details.length, userCity)

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setSubmitting(true)

    // Call API to submit report
    await new Promise((resolve) => setTimeout(resolve, 1500))

    router.back()
    router.push("/facility-reports/dashboard")
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
            <Text className="text-2xl font-bold text-foreground ml-4">Report Facility</Text>
          </View>

          {city && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-2">{city.badge}</Text>
                  <View>
                    <Text className="text-foreground font-bold">{city.name} Citizen</Text>
                    <Text className="text-muted-foreground text-sm">2x rewards active</Text>
                  </View>
                </View>
                <View className="bg-primary rounded-lg px-3 py-1">
                  <Text className="text-background font-bold">2x</Text>
                </View>
              </View>
            </View>
          )}

          <View className="bg-primary/10 border border-primary rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cash" size={24} color="#7ED957" />
                <View className="ml-3">
                  <Text className="text-foreground font-bold text-lg">Estimated Reward</Text>
                  <Text className="text-muted-foreground text-sm">Based on category and detail</Text>
                </View>
              </View>
              <Text className="text-primary font-bold text-2xl">${estimatedReward}</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Report Category</Text>
            <View className="flex-row flex-wrap gap-3">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  className={`flex-1 min-w-[45%] rounded-xl p-4 border ${category === cat.key ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setCategory(cat.key)
                  }}
                >
                  <Ionicons name={cat.icon as any} size={28} color={category === cat.key ? "#7ED957" : cat.color} />
                  <Text className={`font-bold mt-2 ${category === cat.key ? "text-primary" : "text-foreground"}`}>
                    {cat.label}
                  </Text>
                  <Text className="text-muted-foreground text-xs mt-1">
                    ${REPORT_REWARDS[cat.key].min}-${REPORT_REWARDS[cat.key].max}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Condition</Text>
            <View className="flex-row justify-between gap-2">
              {conditions.map((cond) => (
                <TouchableOpacity
                  key={cond.key}
                  className={`flex-1 rounded-xl p-4 border ${condition === cond.key ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setCondition(cond.key)
                  }}
                >
                  <Ionicons name={cond.icon as any} size={24} color={condition === cond.key ? "#7ED957" : cond.color} />
                  <Text
                    className={`font-semibold text-xs mt-2 ${condition === cond.key ? "text-primary" : "text-foreground"}`}
                  >
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Details</Text>
            <TextInput
              className="bg-card border border-border rounded-xl p-4 text-foreground min-h-[120px]"
              placeholder="Describe the condition in detail... (more detail = higher reward)"
              placeholderTextColor="#666"
              multiline
              value={details}
              onChangeText={setDetails}
              textAlignVertical="top"
            />
            <Text className="text-muted-foreground text-xs mt-2">
              {details.length} characters (100+ recommended for bonus)
            </Text>
          </View>

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
                <Text className="text-primary text-xs mt-1">+$5 bonus</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 ${submitting ? "bg-muted" : "bg-primary"}`}
            onPress={handleSubmit}
            disabled={submitting || !details.trim()}
          >
            <Text className="text-background font-bold text-center text-lg">
              {submitting ? "Submitting..." : "Submit Report"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
