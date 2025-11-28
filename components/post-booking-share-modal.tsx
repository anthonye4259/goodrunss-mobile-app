
import { View, Text, TouchableOpacity, Modal, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useUserPreferences } from "@/lib/user-preferences"
import { useState, useRef } from "react"
import ViewShot from "react-native-view-shot"
import { SocialShare } from "@/lib/social-share"

type PostBookingShareModalProps = {
  visible: boolean
  onClose: () => void
  bookingDetails: {
    trainerName: string
    activity: string
    date: string
    location: string
  }
}

export function PostBookingShareModal({ visible, onClose, bookingDetails }: PostBookingShareModalProps) {
  const { addCredits } = useUserPreferences()
  const [shared, setShared] = useState(false)
  const viewShotRef = useRef<ViewShot>(null)

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Just booked a ${bookingDetails.activity} session with ${bookingDetails.trainerName} on @GoodRunssAI! 🔥\n\nJoin me: https://goodrunss.app`,
      })
      addCredits(25)
      setShared(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("[v0] Share error:", error)
    }
  }

  const handleSnapchatShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (uri) {
        await SocialShare.shareToSnapchat({
          imageUri: uri,
          caption: `Just booked ${bookingDetails.activity} with ${bookingDetails.trainerName}! 🔥`,
          deepLink: "https://goodrunss.app/download",
        })
        addCredits(25)
        setShared(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error("[v0] Snapchat share error:", error)
    }
  }

  const handleTwitterShare = async () => {
    try {
      await SocialShare.shareToTwitter({
        text: `Just booked a ${bookingDetails.activity} session with ${bookingDetails.trainerName}! 🔥`,
        url: "https://goodrunss.app",
        hashtags: ["GoodRunss", bookingDetails.activity.replace(/\s+/g, "")],
      })
      addCredits(25)
      setShared(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("[v0] Twitter share error:", error)
    }
  }

  const handleInstagramShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.()
      if (uri) {
        await SocialShare.shareToInstagram({
          imageUri: uri,
          caption: `Just booked ${bookingDetails.activity} with ${bookingDetails.trainerName}! 🔥 #GoodRunss`,
        })
        addCredits(25)
        setShared(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error("[v0] Instagram share error:", error)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/80 justify-end">
        <LinearGradient colors={["#0A0A0A", "#141414"]} className="rounded-t-3xl p-6">
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
            <View className="items-center mb-6">
              <View className="bg-primary/20 rounded-full w-16 h-16 items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={40} color="#7ED957" />
              </View>
              <Text className="text-foreground font-bold text-2xl mb-2">Booking Confirmed!</Text>
              <Text className="text-muted-foreground text-center">
                {bookingDetails.activity} with {bookingDetails.trainerName}
              </Text>
              <Text className="text-muted-foreground text-sm">{bookingDetails.date}</Text>
            </View>
          </ViewShot>

          {!shared ? (
            <>
              <View className="bg-accent/10 border border-accent rounded-2xl p-4 mb-4">
                <View className="flex-row items-center justify-center mb-2">
                  <Ionicons name="gift" size={24} color="#FF6B35" />
                  <Text className="text-accent font-bold text-lg ml-2">Earn 25 Credits!</Text>
                </View>
                <Text className="text-muted-foreground text-center text-sm">
                  Share your session and tag @GoodRunssAI to earn credits toward your next booking
                </Text>
              </View>

              <TouchableOpacity
                className="bg-[#FFFC00] rounded-2xl py-4 flex-row items-center justify-center mb-3"
                onPress={handleSnapchatShare}
              >
                <Ionicons name="logo-snapchat" size={20} color="#000" />
                <Text className="text-black font-bold ml-2">Share to Snapchat Stories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-2xl py-4 flex-row items-center justify-center mb-3"
                onPress={handleInstagramShare}
              >
                <LinearGradient
                  colors={["#833AB4", "#C13584", "#E1306C", "#FD1D1D", "#F77737"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="absolute inset-0 rounded-2xl"
                />
                <Ionicons name="logo-instagram" size={20} color="#FFF" />
                <Text className="text-white font-bold ml-2">Share to Instagram Stories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-[#1DA1F2] rounded-2xl py-4 flex-row items-center justify-center mb-3"
                onPress={handleTwitterShare}
              >
                <Ionicons name="logo-twitter" size={20} color="#FFF" />
                <Text className="text-white font-bold ml-2">Share to Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-card border border-border rounded-2xl py-4 flex-row items-center justify-center mb-3"
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={20} color="#7ED957" />
                <Text className="text-foreground font-bold ml-2">Share Other Ways</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="bg-primary/20 border border-primary rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-center">
                <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
                <Text className="text-primary font-bold text-lg ml-2">+25 Credits Earned!</Text>
              </View>
            </View>
          )}

          <TouchableOpacity className="bg-card border border-border rounded-2xl py-4 items-center" onPress={onClose}>
            <Text className="text-foreground font-semibold">Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  )
}
