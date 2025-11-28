
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent } from "@/lib/activity-content"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/lib/auth-context"
import { LoginPromptModal } from "@/components/login-prompt-modal"

export default function HomeScreen() {
  const { preferences } = useUserPreferences()
  const { isGuest } = useAuth()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptFeature, setLoginPromptFeature] = useState("")
  const [loginPromptDescription, setLoginPromptDescription] = useState("")
  const primaryActivity = preferences.primaryActivity || "Basketball"
  const content = getActivityContent(primaryActivity as any)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action()
  }

  const handleFeatureAccess = (feature: string, description: string, action: () => void) => {
    if (isGuest) {
      setLoginPromptFeature(feature)
      setLoginPromptDescription(description)
      setShowLoginPrompt(true)
    } else {
      action()
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      {isGuest && (
        <View className="bg-primary/10 border-b border-primary/20 px-6 pt-12 pb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-primary font-bold text-sm">GUEST MODE</Text>
              <Text className="text-muted-foreground text-xs">Sign up to unlock all features</Text>
            </View>
            <TouchableOpacity className="bg-primary rounded-lg px-4 py-2" onPress={() => router.push("/auth")}>
              <Text className="text-background font-semibold text-sm">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Animated.ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {isGuest ? "Welcome to GoodRunss!" : "Welcome back!"}
          </Text>
          <Text className="text-muted-foreground">
            {isGuest ? "Discover trainers and courts near you" : `Ready to play ${primaryActivity.toLowerCase()}?`}
          </Text>
        </View>

        <TouchableOpacity
          className="mx-6 mb-6 glass-card rounded-2xl overflow-hidden"
          onPress={() => handlePress(() => router.push("/for-you"))}
          activeOpacity={0.8}
        >
          <LinearGradient colors={["#7ED957", "#6BB642"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="sparkles" size={20} color="#000" />
                  <Text className="text-background font-bold text-sm ml-2">AI POWERED</Text>
                </View>
                <Text className="text-background font-bold text-2xl mb-1">For You Feed</Text>
                <Text className="text-background/80 text-sm">Personalized trainers based on your preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#000" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {!isGuest && (
          <View className="px-6 mb-6">
            <View className="glass-card rounded-2xl p-6">
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-3xl font-bold text-primary">12</Text>
                  <Text className="text-muted-foreground text-sm">Sessions</Text>
                </View>
                <View className="items-center flex-1 border-l border-r border-border">
                  <Text className="text-3xl font-bold text-accent">5</Text>
                  <Text className="text-muted-foreground text-sm">Streak</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-3xl font-bold text-foreground">8</Text>
                  <Text className="text-muted-foreground text-sm">Friends</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Upcoming Session */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Upcoming</Text>
          <TouchableOpacity
            className="glass-card rounded-2xl p-6 glow-primary"
            activeOpacity={0.7}
            onPress={() => handlePress(() => router.push("/(tabs)/bookings"))}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-primary/20 rounded-full p-3 mr-4">
                <Ionicons name="calendar" size={24} color="#7ED957" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">{content.sampleSessions[0].title}</Text>
                <Text className="text-muted-foreground">{content.sampleSessions[0].location}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">{content.sampleSessions[0].time}</Text>
              <TouchableOpacity
                className="bg-primary rounded-lg px-4 py-2"
                onPress={() => router.push("/(tabs)/bookings")}
              >
                <Text className="text-background font-semibold">Start</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">Recent Activity</Text>
            <TouchableOpacity onPress={() => handlePress(() => router.push("/(tabs)/stats"))}>
              <Text className="text-primary font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <View className="space-y-3">
            {content.activityFeed.slice(0, 3).map((item, index) => (
              <TouchableOpacity
                key={index}
                className="glass-card rounded-xl p-4 flex-row items-center"
                activeOpacity={0.8}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View className="bg-primary/20 rounded-full p-3 mr-4">
                  <Ionicons
                    name={
                      item.type === "achievement"
                        ? "trophy"
                        : item.type === "session"
                          ? "checkmark-circle"
                          : item.type === "friend"
                            ? "people"
                            : "trending-up"
                    }
                    size={20}
                    color="#7ED957"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{item.title}</Text>
                  <Text className="text-muted-foreground text-sm">{item.description}</Text>
                  <Text className="text-muted-foreground text-xs mt-1">{item.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Find Trainers */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Find {content.trainerTitle}s</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-4"
            decelerationRate="fast"
            snapToInterval={272}
          >
            {content.sampleTrainers.map((trainer, index) => (
              <TouchableOpacity
                key={index}
                className="glass-card rounded-2xl p-4 w-64 mr-4"
                activeOpacity={0.8}
                onPress={() => handlePress(() => router.push(`/trainers/${index}`))}
              >
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                    <Text className="text-primary font-bold text-lg">{trainer.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold">{trainer.name}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#7ED957" />
                      <Text className="text-muted-foreground text-sm ml-1">
                        {trainer.rating} ({trainer.reviews})
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-muted-foreground text-sm mb-3">{trainer.location}</Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-primary font-bold text-lg">${trainer.price}/hr</Text>
                  <TouchableOpacity
                    className="bg-primary rounded-lg px-4 py-2"
                    onPress={() => router.push(`/trainers/${index}`)}
                  >
                    <Text className="text-background font-semibold">Book</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>

      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature={loginPromptFeature}
        description={loginPromptDescription}
      />
    </LinearGradient>
  )
}
