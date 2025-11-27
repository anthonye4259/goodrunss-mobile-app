import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams } from "expo-router"
import { getActivityContent, type Activity } from "@/lib/activity-content"

export default function PublicTrainerLandingPage() {
  const { id } = useLocalSearchParams()

  // For demo purposes, using Basketball content
  const content = getActivityContent("Basketball" as Activity)
  const trainer = content.sampleTrainers[0]

  const handleDownloadApp = () => {
    // Deep link to app store or open app if installed
    Linking.openURL("https://goodrunss.app/download")
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header with branding */}
        <View className="px-6 pt-16 pb-6 border-b border-border">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Ionicons name="flash" size={24} color="#7ED957" />
              <Text className="text-primary font-bold text-xl ml-2">GoodRunss</Text>
            </View>
            <TouchableOpacity onPress={handleDownloadApp}>
              <Text className="text-primary font-semibold">Download App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trainer Profile */}
        <View className="px-6 pt-6">
          <View className="items-center mb-6">
            <View className="bg-primary/20 rounded-full w-32 h-32 items-center justify-center mb-4">
              <Text className="text-primary font-bold text-5xl">{trainer.name.charAt(0)}</Text>
            </View>
            <Text className="text-foreground font-bold text-2xl mb-2">{trainer.name}</Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="star" size={20} color="#7ED957" />
              <Text className="text-foreground ml-2 text-lg">
                {trainer.rating} ({trainer.reviews} reviews)
              </Text>
            </View>
            <Text className="text-muted-foreground">{trainer.location}</Text>
          </View>

          {/* About */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-3">About</Text>
            <View className="bg-card border border-border rounded-2xl p-4">
              <Text className="text-muted-foreground leading-6">{trainer.bio}</Text>
            </View>
          </View>

          {/* Specialties */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-foreground mb-3">Specialties</Text>
            <View className="flex-row flex-wrap gap-2">
              {trainer.specialties.map((specialty, index) => (
                <View key={index} className="bg-primary/20 border border-primary rounded-xl px-4 py-2">
                  <Text className="text-primary font-semibold">{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View className="bg-gradient-to-b from-primary/20 to-primary/5 border border-primary rounded-2xl p-6 mb-6">
            <Text className="text-foreground font-bold text-xl text-center mb-2">Book {trainer.name} on GoodRunss</Text>
            <Text className="text-muted-foreground text-center mb-4">
              Download the app to book sessions, message trainers, and discover local sports & wellness
            </Text>
            <TouchableOpacity className="bg-primary rounded-xl py-4 mb-3" onPress={handleDownloadApp}>
              <Text className="text-background font-bold text-center text-lg">Download GoodRunss</Text>
            </TouchableOpacity>
            <Text className="text-muted-foreground text-xs text-center">Available on iOS and Android</Text>
          </View>

          {/* Powered by footer */}
          <View className="items-center py-8 border-t border-border">
            <View className="flex-row items-center mb-2">
              <Ionicons name="flash" size={20} color="#7ED957" />
              <Text className="text-primary font-bold text-lg ml-2">Powered by GoodRunss</Text>
            </View>
            <Text className="text-muted-foreground text-center text-sm">
              Find local trainers, studios, courts & wellness activities
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
