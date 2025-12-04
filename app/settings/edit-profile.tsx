
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"
import { ImageService } from "@/lib/image-service"
import { SkeletonLoader } from "@/components/skeleton-loader"

export default function EditProfileScreen() {
  const { preferences, updatePreferences } = useUserPreferences()
  const [name, setName] = useState(preferences.name || "")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const imageService = ImageService.getInstance()

  const handleSave = async () => {
    await updatePreferences({ name })
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }

  const handleImagePick = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    Alert.alert("Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          const uri = await imageService.takePhoto()
          if (uri) {
            await uploadProfileImage(uri)
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const uri = await imageService.pickImage()
          if (uri) {
            await uploadProfileImage(uri)
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const uploadProfileImage = async (uri: string) => {
    setUploading(true)
    try {
      const url = await imageService.uploadImage(uri, "profile")
      setProfileImage(url)
      Alert.alert("Success", "Profile picture updated!")
    } catch (error) {
      console.error("[v0] Image upload error:", error)
      Alert.alert("Error", "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Edit Profile</Text>
        </View>

        <View className="px-6 mb-6 items-center">
          <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
            {uploading ? (
              <SkeletonLoader width={120} height={120} borderRadius={60} />
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} className="w-30 h-30 rounded-full" />
            ) : (
              <View className="bg-primary/20 rounded-full w-30 h-30 items-center justify-center">
                <Text className="text-primary font-bold text-4xl">{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary rounded-full w-10 h-10 items-center justify-center border-4 border-background">
              <Ionicons name="camera" size={20} color="#0A0A0A" />
            </View>
          </TouchableOpacity>
          <Text className="text-muted-foreground text-sm mt-2">
            {uploading ? "Uploading..." : "Tap to change photo"}
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 gap-4">
          <View>
            <Text className="text-foreground font-semibold mb-2">Name</Text>
            <View className="bg-card border border-border rounded-xl p-4">
              <TextInput
                className="text-foreground"
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View>
            <Text className="text-foreground font-semibold mb-2">Bio</Text>
            <View className="bg-card border border-border rounded-xl p-4">
              <TextInput
                className="text-foreground min-h-[100px]"
                placeholder="Tell us about yourself"
                placeholderTextColor="#666"
                multiline
                value={bio}
                onChangeText={setBio}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity className="bg-primary rounded-xl py-4 mt-4" onPress={handleSave}>
            <Text className="text-background font-bold text-center">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
