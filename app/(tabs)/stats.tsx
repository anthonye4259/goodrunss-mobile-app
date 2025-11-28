
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { useEffect, useRef } from "react"
import * as Haptics from "expo-haptics"
import { useRouter } from "next/router"

export default function StatsScreen() {
  const router = useRouter()
  const { preferences } = useUserPreferences()
  const primaryActivity = preferences.primaryActivity || "Basketball"
  const isStudio = ["Pilates", "Yoga", "Lagree", "Barre", "Meditation"].includes(primaryActivity)

  // Activity-specific metrics
  const metrics = isStudio
    ? [
        {
          title: "Balance",
          subtitle: "Core Strength",
          value: "85",
          status: "Good",
          gradient: ["#FF9A8B", "#FF6A88", "#FF99AC"],
          icon: "fitness",
        },
        {
          title: "Flexibility",
          subtitle: "Range of Motion",
          value: "92%",
          status: "Excellent",
          gradient: ["#4FACFE", "#00F2FE"],
          icon: "body",
        },
        {
          title: "Mindfulness",
          subtitle: "Focus Score",
          value: "+12",
          status: "Nice",
          gradient: ["#FA709A", "#FEE140"],
          icon: "heart",
        },
        {
          title: "Recovery",
          subtitle: "Monitoring",
          value: "AM/PM",
          status: "Tracking",
          gradient: ["#667EEA", "#764BA2"],
          icon: "moon",
        },
        {
          title: "Heart Rate",
          subtitle: "Monitoring",
          value: "72 bpm",
          status: "Normal",
          gradient: ["#F093FB", "#F5576C"],
          icon: "pulse",
        },
        {
          title: "Calories",
          subtitle: "Burned Today",
          value: "420",
          status: "Active",
          gradient: ["#FA8BFF", "#2BD2FF", "#2BFF88"],
          icon: "flame",
        },
      ]
    : [
        {
          title: "Performance",
          subtitle: "Overall Score",
          value: "88",
          status: "Great",
          gradient: ["#FF9A8B", "#FF6A88", "#FF99AC"],
          icon: "trophy",
        },
        {
          title: "Endurance",
          subtitle: "Stamina Level",
          value: "76%",
          status: "Good",
          gradient: ["#4FACFE", "#00F2FE"],
          icon: "speedometer",
        },
        {
          title: "Strength",
          subtitle: "Power Output",
          value: "+18",
          status: "Improving",
          gradient: ["#FA709A", "#FEE140"],
          icon: "barbell",
        },
        {
          title: "Recovery",
          subtitle: "Rest Quality",
          value: "85%",
          status: "Optimal",
          gradient: ["#667EEA", "#764BA2"],
          icon: "bed",
        },
        {
          title: "Heart Rate",
          subtitle: "Avg BPM",
          value: "145",
          status: "Training",
          gradient: ["#F093FB", "#F5576C"],
          icon: "pulse",
        },
        {
          title: "Sessions",
          subtitle: "This Week",
          value: "8",
          status: "Active",
          gradient: ["#FA8BFF", "#2BD2FF", "#2BFF88"],
          icon: "calendar",
        },
      ]

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnims = useRef(
    Array(6)
      .fill(0)
      .map(() => new Animated.Value(0.8)),
  ).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(
        80,
        scaleAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start()
  }, [])

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim }} className="px-6 pt-16 pb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Stats</Text>
          <Text className="text-muted-foreground">Your {primaryActivity.toLowerCase()} metrics</Text>
        </Animated.View>

        {/* Metrics Grid */}
        <View className="px-6">
          <View className="flex-row flex-wrap gap-4">
            {metrics.map((metric, index) => (
              <Animated.View
                key={index}
                className="w-[48%]"
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnims[index] }],
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    router.push("/stats/detailed")
                  }}
                >
                  <LinearGradient
                    colors={metric.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-5 h-48 justify-between"
                    style={{
                      shadowColor: metric.gradient[0],
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    {/* Top Section */}
                    <View>
                      <Text className="text-white/80 text-sm font-medium">{metric.title}</Text>
                      <Text className="text-white/60 text-xs">{metric.subtitle}</Text>
                    </View>

                    {/* Middle Section - Large Value */}
                    <View className="items-center justify-center flex-1">
                      <Text className="text-white text-5xl font-bold">{metric.value}</Text>
                    </View>

                    {/* Bottom Section */}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white/70 text-xs">{metric.status}</Text>
                      <Ionicons name={metric.icon as any} size={20} color="rgba(255,255,255,0.5)" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Weekly Summary */}
        <Animated.View style={{ opacity: fadeAnim }} className="px-6 mt-8">
          <Text className="text-xl font-bold text-foreground mb-4">Weekly Summary</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between mb-6">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Total Sessions</Text>
                <Text className="text-foreground text-2xl font-bold">12</Text>
              </View>
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Hours Trained</Text>
                <Text className="text-foreground text-2xl font-bold">18.5</Text>
              </View>
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Calories</Text>
                <Text className="text-foreground text-2xl font-bold">2.4k</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm">Weekly Goal</Text>
                <Text className="text-primary text-sm font-semibold">80%</Text>
              </View>
              <View className="bg-muted rounded-full h-2">
                <View className="bg-primary rounded-full h-2 w-[80%]" />
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push("/stats/detailed")
              }}
            >
              <Text className="text-background font-semibold">View Detailed Stats</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Connect Wearables */}
        <Animated.View style={{ opacity: fadeAnim }} className="px-6 mt-6">
          <TouchableOpacity
            className="bg-card border border-border rounded-2xl p-6 flex-row items-center"
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push("/settings/wearables")
            }}
          >
            <View className="bg-primary/20 rounded-full p-3 mr-4">
              <Ionicons name="watch" size={24} color="#7ED957" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-lg">Connect Wearables</Text>
              <Text className="text-muted-foreground text-sm">
                Sync Apple Watch, Whoop, or Garmin for real-time data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center gap-4 px-6"
      >
        <TouchableOpacity
          className="bg-card border border-border rounded-full w-14 h-14 items-center justify-center"
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.back()
          }}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-card border border-border rounded-full px-6 py-3"
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.push("/stats/detailed")
          }}
        >
          <Text className="text-foreground font-semibold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary rounded-full w-14 h-14 items-center justify-center"
          activeOpacity={0.8}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            router.back()
          }}
        >
          <Ionicons name="checkmark" size={28} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
