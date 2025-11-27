import { View, Text, TouchableOpacity, Share, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import QRCode from "react-native-qrcode-svg"
import * as Clipboard from "expo-clipboard"
import { useUserPreferences } from "@/lib/user-preferences"

type ShareProfileCardProps = {
  trainerName: string
  trainerId: string
  activity: string
}

export function ShareProfileCard({ trainerName, trainerId, activity }: ShareProfileCardProps) {
  const { addCredits } = useUserPreferences()
  const profileUrl = `https://goodrunss.app/trainer/${trainerId}`

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${trainerName} on GoodRunss! Book your ${activity} session: ${profileUrl}`,
        url: profileUrl,
      })
      addCredits(10)
      Alert.alert("Credits Earned!", "You earned 10 credits for sharing!")
    } catch (error) {
      console.error("[v0] Share error:", error)
    }
  }

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(profileUrl)
    Alert.alert("Link Copied!", "Profile link copied to clipboard")
  }

  return (
    <View className="bg-card border border-border rounded-2xl p-6 mx-6 mb-6">
      <View className="items-center mb-4">
        <Text className="text-foreground font-bold text-lg mb-1">Your Mini Ad</Text>
        <Text className="text-muted-foreground text-center text-sm mb-4">
          Share your profile to get new clients. Earn 10 credits per share!
        </Text>
        <View className="bg-white p-4 rounded-xl">
          <QRCode value={profileUrl} size={120} />
        </View>
        <Text className="text-muted-foreground text-xs mt-2">Scan to book</Text>
      </View>

      <View className="bg-background border border-border rounded-xl p-3 mb-4">
        <Text className="text-muted-foreground text-xs mb-1">Your Profile Link</Text>
        <Text className="text-primary text-sm font-mono">{profileUrl}</Text>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center"
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={18} color="#000" />
          <Text className="text-black font-bold ml-2">Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-card border border-border rounded-xl py-3 flex-row items-center justify-center"
          onPress={handleCopyLink}
        >
          <Ionicons name="copy-outline" size={18} color="#7ED957" />
          <Text className="text-primary font-bold ml-2">Copy Link</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-4 bg-primary/10 border border-primary rounded-xl p-4">
        <View className="flex-row items-center justify-center mb-2">
          <Ionicons name="flash" size={16} color="#7ED957" />
          <Text className="text-primary font-bold ml-2">Powered by GoodRunss</Text>
        </View>
        <Text className="text-muted-foreground text-xs text-center">
          Every share helps grow your client base automatically
        </Text>
      </View>
    </View>
  )
}
