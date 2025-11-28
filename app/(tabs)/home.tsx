
import { View, Text, ScrollView, TouchableOpacity, useState, useEffect } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { GlobalSearch } from "@/components/global-search"
import { TrainerCardSkeleton } from "@/components/skeleton-loader"
import { ErrorBoundary } from "@/components/error-boundary"
import { LocationService } from "@/lib/location-service"

export default function HomeScreen() {
  const { preferences } = useUserPreferences()
  const { location, calculateDistance } = useLocation()
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nearbyTrainers, setNearbyTrainers] = useState<any[]>([])

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity

  useEffect(() => {
    const initLocation = async () => {
      setLoading(true)
      const locationService = LocationService.getInstance()
      await locationService.requestPermissions()
      const currentLocation = await locationService.getCurrentLocation()

      if (currentLocation) {
        // Fetch nearby trainers based on location
        // This would call your backend API
        console.log("[v0] Current location:", currentLocation)
      }
      setLoading(false)
    }

    initLocation()
  }, [])

  if (!primaryActivity) {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1 justify-center items-center">
        <Text className="text-foreground">Loading...</Text>
      </LinearGradient>
    )
  }

  const content = getActivityContent(primaryActivity)
  const trainer = content.sampleTrainers[0]

  const trainerCoords = { lat: 40.7589, lon: -73.9851 }
  const distance = calculateDistance(trainerCoords.lat, trainerCoords.lon)

  return (
    <ErrorBoundary>
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="pb-6">
          {/* Header */}
          <View className="px-6 pt-16 pb-6">
            <Text className="text-4xl font-bold text-foreground mb-2">Welcome to {content.displayName}</Text>
            {location && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="location" size={16} color="#84CC16" />
                <Text className="text-muted-foreground ml-2">
                  {location.city}, {location.state}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="glass-card rounded-xl flex-row items-center px-4 py-3 mt-4"
              onPress={() => setShowGlobalSearch(true)}
            >
              <Ionicons name="search" size={20} color="#84CC16" />
              <Text className="flex-1 ml-3 text-muted-foreground">Search trainers, venues, activities...</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Trainer */}
          <View className="px-6 mb-6">
            <Text className="text-xl font-bold text-foreground mb-4">Featured {content.trainerTitle}</Text>

            {loading ? (
              <TrainerCardSkeleton />
            ) : (
              <TouchableOpacity className="bg-card rounded-2xl overflow-hidden border border-border">
                <View className="p-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
                      <Ionicons name="person" size={32} color="#84CC16" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-foreground font-bold text-lg">{trainer.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={16} color="#84CC16" />
                        <Text className="text-foreground ml-1">
                          {trainer.rating} ({trainer.reviews} reviews)
                        </Text>
                      </View>
                      {distance && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="location-outline" size={14} color="#84CC16" />
                          <Text className="text-muted-foreground text-sm ml-1">{distance.toFixed(1)} miles away</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text className="text-muted-foreground mb-3">{trainer.bio}</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-primary font-bold text-xl">${trainer.price}/session</Text>
                    <TouchableOpacity className="bg-primary rounded-lg px-6 py-2">
                      <Text className="text-background font-bold">Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Upcoming Sessions */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">Nearby {content.sessionType}s</Text>
              <TouchableOpacity>
                <Text className="text-primary">View All</Text>
              </TouchableOpacity>
            </View>
            {content.sampleSessions.map((session, index) => (
              <TouchableOpacity key={index} className="bg-card rounded-xl p-4 mb-3 border border-border">
                <Text className="text-foreground font-bold mb-1">{session.title}</Text>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="location-outline" size={14} color="#84CC16" />
                  <Text className="text-muted-foreground text-sm ml-1">{session.location}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#84CC16" />
                  <Text className="text-muted-foreground text-sm ml-1">{session.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <View className="px-6">
            <Text className="text-xl font-bold text-foreground mb-4">Recent Activity</Text>
            {content.activityFeed.slice(0, 3).map((item, index) => (
              <View key={index} className="bg-card rounded-xl p-4 mb-3 border border-border">
                <Text className="text-foreground font-bold mb-1">{item.title}</Text>
                <Text className="text-muted-foreground text-sm mb-1">{item.description}</Text>
                <Text className="text-muted-foreground text-xs">{item.time}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <GlobalSearch visible={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
      </LinearGradient>
    </ErrorBoundary>
  )
}
