
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { AnimatedButton } from "@/components/animated-button"

export default function FavoritesScreen() {
  const [activeTab, setActiveTab] = useState<"trainers" | "venues">("trainers")

  const favoriteTrainers = [
    {
      id: 1,
      name: "Alex Johnson",
      specialty: "Basketball Training",
      rating: 4.9,
      price: 75,
      location: "Downtown",
    },
    { id: 2, name: "Sarah Lee", specialty: "Yoga Instructor", rating: 4.8, price: 60, location: "Westside" },
  ]

  const favoriteVenues = [
    {
      id: 1,
      name: "Downtown Basketball Courts",
      sport: "Basketball",
      rating: 4.7,
      verified: 92,
      distance: "0.8 mi",
    },
    { id: 2, name: "Sunset Tennis Club", sport: "Tennis", rating: 4.9, verified: 95, distance: "1.2 mi" },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Favorites</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "trainers" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("trainers")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "trainers" ? "text-background" : "text-muted-foreground"}`}
              >
                Trainers ({favoriteTrainers.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "venues" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("venues")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "venues" ? "text-background" : "text-muted-foreground"}`}
              >
                Venues ({favoriteVenues.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {activeTab === "trainers" && favoriteTrainers.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="No favorite trainers"
              description="Save your favorite trainers for quick access"
              actionText="Find Trainers"
              onAction={() => router.push("/(tabs)/index")}
            />
          ) : activeTab === "venues" && favoriteVenues.length === 0 ? (
            <EmptyState
              icon="location-outline"
              title="No favorite venues"
              description="Save your favorite courts and venues for quick access"
              actionText="Explore Venues"
              onAction={() => router.push("/(tabs)/explore")}
            />
          ) : (
            <>
              {activeTab === "trainers" &&
                favoriteTrainers.map((trainer) => (
                  <TouchableOpacity
                    key={trainer.id}
                    className="bg-card border border-border rounded-2xl p-4 mb-4"
                    onPress={() => router.push(`/trainers/${trainer.id}`)}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg mb-1">{trainer.name}</Text>
                        <Text className="text-muted-foreground text-sm mb-2">{trainer.specialty}</Text>
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={16} color="#7ED957" />
                          <Text className="text-foreground ml-1 mr-3">{trainer.rating}</Text>
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text className="text-muted-foreground ml-1">{trainer.location}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-primary font-bold text-xl">${trainer.price}</Text>
                        <Text className="text-muted-foreground text-xs">per session</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <AnimatedButton onPress={() => router.push(`/trainers/${trainer.id}`)} title="Book Now" />
                      </View>
                      <TouchableOpacity className="bg-card border border-destructive rounded-xl px-4 py-3">
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}

              {activeTab === "venues" &&
                favoriteVenues.map((venue) => (
                  <TouchableOpacity
                    key={venue.id}
                    className="bg-card border border-border rounded-2xl p-4 mb-4"
                    onPress={() => router.push(`/venues/${venue.id}`)}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg mb-1">{venue.name}</Text>
                        <Text className="text-muted-foreground text-sm mb-2">{venue.sport}</Text>
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={16} color="#7ED957" />
                          <Text className="text-foreground ml-1 mr-3">{venue.rating}</Text>
                          <View className="bg-primary/20 rounded-lg px-2 py-1 mr-3">
                            <Text className="text-primary text-xs font-bold">✓ {venue.verified}</Text>
                          </View>
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text className="text-muted-foreground ml-1">{venue.distance}</Text>
                        </View>
                      </View>
                      <TouchableOpacity className="bg-card border border-destructive rounded-xl p-3">
                        <Ionicons name="heart" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <AnimatedButton
                      onPress={() => router.push(`/venues/${venue.id}`)}
                      title="View Details"
                      className="mt-3"
                    />
                  </TouchableOpacity>
                ))}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
