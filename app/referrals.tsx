
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Clipboard from "expo-clipboard"
import * as Haptics from "expo-haptics"
import QRCode from "react-native-qrcode-svg"
import { REFERRAL_REWARDS, getCurrentMultiplier, type ReferralHistoryItem } from "@/lib/referral-types"

export default function ReferralsScreen() {
  const [showQR, setShowQR] = useState(false)

  // Mock data - replace with actual user data from backend
  const userId = "user123"
  const referralCode = "GOODRUNSS-USER123"
  const referralLink = `https://goodrunss.com/join?ref=${referralCode}`

  const stats = {
    totalInvites: 12,
    successfulSignups: 8,
    creditsEarned: 650,
  }

  const multiplierInfo = getCurrentMultiplier(stats.successfulSignups)

  const referralHistory: ReferralHistoryItem[] = [
    {
      id: "1",
      name: "Sarah M.",
      type: "premium",
      status: "completed",
      creditsEarned: 200,
      date: "2 days ago",
    },
    {
      id: "2",
      name: "Mike T.",
      type: "trainer",
      status: "completed",
      creditsEarned: 100,
      date: "5 days ago",
    },
    {
      id: "3",
      name: "Alex K.",
      type: "player",
      status: "pending",
      creditsEarned: 0,
      date: "1 week ago",
    },
  ]

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(referralLink)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Alert.alert("Copied!", "Referral link copied to clipboard")
  }

  const shareReferral = async (platform?: string) => {
    const message = `Join me on GoodRunss! Use my code ${referralCode} to get 25 free credits. ${referralLink}`

    if (platform === "instagram" || platform === "twitter" || platform === "whatsapp") {
      // Platform-specific sharing would go here
      console.log(`[v0] Share to ${platform}:`, message)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else {
      // Generic share
      try {
        await Share.share({
          message,
          url: referralLink,
        })
      } catch (error) {
        console.error("[v0] Error sharing:", error)
      }
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#7ED957" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Refer Friends</Text>
          <Text className="text-muted-foreground">Earn credits for every friend who joins GoodRunss</Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between mb-6">
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-primary">{stats.totalInvites}</Text>
                <Text className="text-muted-foreground text-sm">Invites Sent</Text>
              </View>
              <View className="items-center flex-1 border-l border-r border-border">
                <Text className="text-3xl font-bold text-accent">{stats.successfulSignups}</Text>
                <Text className="text-muted-foreground text-sm">Signups</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-3xl font-bold text-foreground">{stats.creditsEarned}</Text>
                <Text className="text-muted-foreground text-sm">Credits Earned</Text>
              </View>
            </View>

            {/* Multiplier Progress */}
            <View className="bg-background rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="trophy" size={20} color="#7ED957" />
                  <Text className="text-foreground font-bold ml-2">
                    {multiplierInfo.label} Tier - {multiplierInfo.multiplier}x Multiplier
                  </Text>
                </View>
              </View>
              {multiplierInfo.nextTier && (
                <>
                  <View className="bg-border rounded-full h-2 mb-2 overflow-hidden">
                    <View
                      className="bg-primary h-full"
                      style={{
                        width: `${(stats.successfulSignups / multiplierInfo.nextTier.referrals) * 100}%`,
                      }}
                    />
                  </View>
                  <Text className="text-muted-foreground text-xs">
                    {multiplierInfo.nextTier.referrals - stats.successfulSignups} more referrals to unlock{" "}
                    {multiplierInfo.nextTier.label} ({multiplierInfo.nextTier.multiplier}x)
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Referral Link Card */}
        <View className="px-6 mb-6">
          <View className="bg-card border border-border rounded-2xl p-6">
            <Text className="text-lg font-bold text-foreground mb-4">Your Referral Link</Text>

            <View className="bg-background rounded-xl p-4 mb-4">
              <Text className="text-primary font-mono text-sm mb-2">{referralCode}</Text>
              <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {referralLink}
              </Text>
            </View>

            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={copyToClipboard}
                className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="copy" size={18} color="#000" />
                <Text className="text-black font-bold ml-2">Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQR(!showQR)}
                className="bg-background border border-border rounded-xl py-3 px-4 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code" size={18} color="#7ED957" />
                <Text className="text-primary font-bold ml-2">QR Code</Text>
              </TouchableOpacity>
            </View>

            {showQR && (
              <View className="bg-white rounded-xl p-6 items-center mb-4">
                <QRCode value={referralLink} size={200} />
                <Text className="text-black text-xs mt-4">Scan to join with your referral code</Text>
              </View>
            )}

            {/* Social Share Buttons */}
            <Text className="text-sm font-semibold text-foreground mb-3">Share via</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => shareReferral("instagram")}
                className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="logo-instagram" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => shareReferral("twitter")}
                className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="logo-twitter" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => shareReferral("whatsapp")}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => shareReferral()}
                className="flex-1 bg-background border border-border rounded-xl py-3 items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="share-social" size={20} color="#7ED957" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reward Rules */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">How It Works</Text>
          {REFERRAL_REWARDS.map((reward, index) => (
            <View key={index} className="bg-card border border-border rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <View className="bg-primary/20 rounded-full w-10 h-10 items-center justify-center mr-3">
                  <Ionicons name={reward.icon as any} size={20} color="#7ED957" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">{reward.title}</Text>
                  <Text className="text-muted-foreground text-sm">{reward.description}</Text>
                </View>
              </View>
              <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
                <View>
                  <Text className="text-primary font-bold text-lg">+{reward.referrerReward}</Text>
                  <Text className="text-muted-foreground text-xs">You earn</Text>
                </View>
                <View className="items-end">
                  <Text className="text-accent font-bold text-lg">+{reward.refereeReward}</Text>
                  <Text className="text-muted-foreground text-xs">They earn</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Referral History */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Recent Referrals</Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            {referralHistory.map((item, index) => (
              <View
                key={item.id}
                className={`p-4 flex-row items-center justify-between ${
                  index < referralHistory.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-foreground font-semibold">{item.name}</Text>
                    <View
                      className={`ml-2 px-2 py-1 rounded-full ${
                        item.status === "completed"
                          ? "bg-primary/20"
                          : item.status === "pending"
                            ? "bg-yellow-500/20"
                            : "bg-destructive/20"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          item.status === "completed"
                            ? "text-primary"
                            : item.status === "pending"
                              ? "text-yellow-500"
                              : "text-destructive"
                        }`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-muted-foreground text-sm">{item.date}</Text>
                </View>
                {item.status === "completed" && (
                  <View className="items-end">
                    <Text className="text-primary font-bold text-lg">+{item.creditsEarned}</Text>
                    <Text className="text-muted-foreground text-xs">credits</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
