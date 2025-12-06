import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { GlobalSearch } from "@/components/global-search"
import { TrainerCardSkeleton } from "@/components/skeleton-loader"
import { ErrorBoundary } from "@/components/error-boundary"
import { LocationService } from "@/lib/location-service"
import { getVenuesForSport } from "@/lib/venue-data"
import { predictVenueTraffic } from "@/lib/traffic-prediction"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { ActivityHeatMap } from "@/components/ActivityHeatMap"


export default function HomeScreen() {
  const { t } = useTranslation()
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
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="justify-center items-center" style={{ flex: 1 }}>
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
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
        <ScrollView className="flex-1" contentContainerClassName="pb-6">
          {/* Header */}
          <View className="px-6 pt-16 pb-6">
            <Text className="text-4xl font-bold text-foreground mb-2">Welcome to {content.displayName}</Text>
            {location && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="location" size={16} color="#7ED957" />
                <Text className="text-muted-foreground ml-2">
                  {location.city}, {location.state}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="glass-card rounded-xl flex-row items-center px-4 py-3 mt-4"
              onPress={() => setShowGlobalSearch(true)}
            >
              <Ionicons name="search" size={20} color="#7ED957" />
              <Text className="flex-1 ml-3 text-muted-foreground">{t('explore.searchPlaceholder')}</Text>
            </TouchableOpacity>
          </View>

          {/* Activity Heat Map */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">
                🔥 {t('home.liveActivity')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/activity-map')}>
                <Text className="text-primary font-semibold">View All</Text>
              </TouchableOpacity>
            </View>

            <ActivityHeatMap height={250} />
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
                      <Ionicons name="person" size={32} color="#7ED957" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-foreground font-bold text-lg">{trainer.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={16} color="#7ED957" />
                        <Text className="text-foreground ml-1">
                          {trainer.rating} ({trainer.reviews} reviews)
                        </Text>
                      </View>
                      {distance && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="location-outline" size={14} color="#7ED957" />
                          <Text className="text-muted-foreground text-sm ml-1">{distance.toFixed(1)} miles away</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text className="text-muted-foreground mb-3">{trainer.bio}</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-primary font-bold text-xl">${trainer.price}/session</Text>
                    <TouchableOpacity
                      className="bg-primary rounded-lg px-6 py-2"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        router.push("/trainers/0")
                      }}
                    >
                      <Text className="text-background font-bold">Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Nearby Venues with Traffic Prediction */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">Nearby {content.locationPrefix}s</Text>
              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.push("/(tabs)/explore")
              }}>
                <Text className="text-primary">View All</Text>
              </TouchableOpacity>
            </View>
            {getVenuesForSport(primaryActivity).slice(0, 2).map((venue) => {
              const trafficPrediction = predictVenueTraffic(venue.id, new Date(), venue.activePlayersNow)
              const minutesAgo = venue.lastActivityTimestamp
                ? Math.floor((Date.now() - venue.lastActivityTimestamp.getTime()) / 60000)
                : null

              return (
                <TouchableOpacity
                  key={venue.id}
                  className="bg-card rounded-xl p-4 mb-3 border border-border"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    router.push(`/venues/${venue.id}`)
                  }}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base mb-1">{venue.name}</Text>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="location-outline" size={14} color="#7ED957" />
                        <Text className="text-muted-foreground text-sm ml-1">{venue.address}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={14} color="#7ED957" />
                        <Text className="text-foreground text-sm ml-1">{venue.rating}</Text>
                        <Text className="text-muted-foreground text-sm ml-1">• {venue.distance || "0.8"} mi</Text>
                      </View>
                    </View>
                  </View>

                  {/* Traffic Prediction Badge */}
                  <View className="flex-row items-center gap-2 mb-2">
                    <View
                      className="flex-row items-center px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: `${trafficPrediction.color}20` }}
                    >
                      <Text className="text-sm mr-1">{trafficPrediction.emoji}</Text>
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: trafficPrediction.color }}
                      >
                        {trafficPrediction.label}
                      </Text>
                    </View>
                    {trafficPrediction.estimatedWaitTime && (
                      <Text className="text-muted-foreground text-xs">{trafficPrediction.estimatedWaitTime}</Text>
                    )}
                  </View>

                  {/* Real-time Player Activity */}
                  {venue.activePlayersNow && venue.activePlayersNow > 0 && (
                    <View className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-lg">
                      <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      <Ionicons name="people" size={12} color="#7ED957" />
                      <Text className="text-primary text-xs font-medium ml-1">
                        {venue.activePlayersNow} {venue.activePlayersNow === 1 ? "player" : "players"} active now
                      </Text>
                      {minutesAgo !== null && (
                        <Text className="text-muted-foreground text-xs ml-1">• {minutesAgo}m ago</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
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
                  <Ionicons name="location-outline" size={14} color="#7ED957" />
                  <Text className="text-muted-foreground text-sm ml-1">{session.location}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#7ED957" />
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
