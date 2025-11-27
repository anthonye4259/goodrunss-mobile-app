"use client"

import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useRef } from "react"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { calculateGoodRunssRating } from "@/lib/venue-quality-types"
import { GoodRunssVerifiedBadge } from "@/components/goodrunss-verified-badge"
import { GlobalSearch } from "@/components/global-search"
import { TrainerCardSkeleton, VenueCardSkeleton } from "@/components/skeleton-loader"
import { ErrorBoundary } from "@/components/error-boundary"
import { formatCurrency, formatDistance } from "@/lib/global-format"
import type { VenueType } from "@/lib/check-in-types"

export default function ExploreScreen() {
  const { preferences } = useUserPreferences()
  const { location, calculateDistance } = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"trainers" | "venues" | "marketplace" | "personas">("trainers")
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const [loading, setLoading] = useState(false)

  const [priceFilter, setPriceFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [distanceFilter, setDistanceFilter] = useState<number>(10)
  const [ratingFilter, setRatingFilter] = useState<number>(0)

  const [venueTypeFilter, setVenueTypeFilter] = useState<VenueType | "all">(
    preferences.isStudioUser && !preferences.isRecUser
      ? "studio"
      : preferences.isRecUser && !preferences.isStudioUser
        ? "recreational"
        : "all",
  )

  const tabIndicatorAnim = useRef(new Animated.Value(0)).current
  const contentFadeAnim = useRef(new Animated.Value(1)).current

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = getActivityContent(primaryActivity)

  const getVenueLabel = (type: VenueType) => {
    if (type === "studio") return preferences.isStudioUser ? "Studio" : "Studio"
    return content.locationPrefix || "Court"
  }

  const getTrainerLabel = () => {
    return preferences.isStudioUser ? "Instructor" : content.trainerTitle || "Trainer"
  }

  const switchTab = (tab: "trainers" | "venues" | "marketplace" | "personas", position: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    Animated.sequence([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tabIndicatorAnim, {
        toValue: position,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tab)
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    })
  }

  const venueQualityData = [
    { rimQuality: 4.5, netPresence: true, courtGrip: 4.8, lighting: 4.2 },
    { rimQuality: 3.8, netPresence: false, courtGrip: 3.5, lighting: 4.5 },
    { rimQuality: 4.9, netPresence: true, courtGrip: 4.7, lighting: 4.8 },
  ]

  const filterTrainers = (trainers: typeof content.sampleTrainers) => {
    return trainers.filter((trainer) => {
      if (ratingFilter > 0 && trainer.rating < ratingFilter) return false
      if (priceFilter === "low" && trainer.price > 50) return false
      if (priceFilter === "medium" && (trainer.price < 50 || trainer.price > 100)) return false
      if (priceFilter === "high" && trainer.price < 100) return false
      return true
    })
  }

  return (
    <ErrorBoundary>
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-16 pb-6">
            <Text className="text-3xl font-bold text-foreground mb-4">Explore</Text>

            <TouchableOpacity
              className="bg-primary rounded-xl p-4 mb-4 flex-row items-center justify-between"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push("/for-you")
              }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="sparkles" size={24} color="#000" />
                <View className="ml-3 flex-1">
                  <Text className="text-background font-bold text-lg">For You Feed</Text>
                  <Text className="text-background/70 text-sm">AI-personalized recommendations</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              className="glass-card rounded-xl flex-row items-center px-4 py-3"
              onPress={() => setShowGlobalSearch(true)}
            >
              <Ionicons name="search" size={20} color="#7ED957" />
              <Text className="flex-1 ml-3 text-muted-foreground">
                Search {getTrainerLabel().toLowerCase()}s, {getVenueLabel("recreational").toLowerCase()}s...
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs with smooth indicator */}
          <View className="px-6 mb-6">
            <View className="glass-card rounded-xl p-1">
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ${activeTab === "trainers" ? "bg-primary" : ""}`}
                  onPress={() => switchTab("trainers", 0)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center font-semibold ${activeTab === "trainers" ? "text-background" : "text-muted-foreground"}`}
                  >
                    {getTrainerLabel()}s
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ${activeTab === "venues" ? "bg-primary" : ""}`}
                  onPress={() => switchTab("venues", 1)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center font-semibold ${activeTab === "venues" ? "text-background" : "text-muted-foreground"}`}
                  >
                    Venues
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ${activeTab === "marketplace" ? "bg-primary" : ""}`}
                  onPress={() => switchTab("marketplace", 2)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center font-semibold ${activeTab === "marketplace" ? "text-background" : "text-muted-foreground"}`}
                  >
                    Gear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg ${activeTab === "personas" ? "bg-primary" : ""}`}
                  onPress={() => switchTab("personas", 3)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center font-semibold ${activeTab === "personas" ? "text-background" : "text-muted-foreground"}`}
                  >
                    AI Personas
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {activeTab === "venues" && (preferences.isStudioUser || preferences.isRecUser) && (
            <View className="px-6 mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                {preferences.isStudioUser && preferences.isRecUser && (
                  <TouchableOpacity
                    className={`rounded-full px-4 py-2 border ${venueTypeFilter === "all" ? "bg-primary border-primary" : "bg-card border-border"}`}
                    onPress={() => setVenueTypeFilter("all")}
                  >
                    <Text className={venueTypeFilter === "all" ? "text-background font-semibold" : "text-foreground"}>
                      All Venues
                    </Text>
                  </TouchableOpacity>
                )}
                {preferences.isRecUser && (
                  <TouchableOpacity
                    className={`rounded-full px-4 py-2 border ${venueTypeFilter === "recreational" ? "bg-primary border-primary" : "bg-card border-border"}`}
                    onPress={() => setVenueTypeFilter("recreational")}
                  >
                    <Text
                      className={
                        venueTypeFilter === "recreational" ? "text-background font-semibold" : "text-foreground"
                      }
                    >
                      Courts & Fields
                    </Text>
                  </TouchableOpacity>
                )}
                {preferences.isStudioUser && (
                  <TouchableOpacity
                    className={`rounded-full px-4 py-2 border ${venueTypeFilter === "studio" ? "bg-primary border-primary" : "bg-card border-border"}`}
                    onPress={() => setVenueTypeFilter("studio")}
                  >
                    <Text
                      className={venueTypeFilter === "studio" ? "text-background font-semibold" : "text-foreground"}
                    >
                      Studios & Classes
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {activeTab === "trainers" && (
            <View className="px-6 mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                <TouchableOpacity
                  className={`rounded-full px-4 py-2 border ${priceFilter === "all" ? "bg-primary border-primary" : "bg-card border-border"}`}
                  onPress={() => setPriceFilter("all")}
                >
                  <Text className={priceFilter === "all" ? "text-background font-semibold" : "text-foreground"}>
                    All Prices
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-full px-4 py-2 border ${priceFilter === "low" ? "bg-primary border-primary" : "bg-card border-border"}`}
                  onPress={() => setPriceFilter("low")}
                >
                  <Text className={priceFilter === "low" ? "text-background font-semibold" : "text-foreground"}>
                    Under {formatCurrency(50)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-full px-4 py-2 border ${priceFilter === "medium" ? "bg-primary border-primary" : "bg-card border-border"}`}
                  onPress={() => setPriceFilter("medium")}
                >
                  <Text className={priceFilter === "medium" ? "text-background font-semibold" : "text-foreground"}>
                    {formatCurrency(50)}-{formatCurrency(100)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-full px-4 py-2 border ${priceFilter === "high" ? "bg-primary border-primary" : "bg-card border-border"}`}
                  onPress={() => setPriceFilter("high")}
                >
                  <Text className={priceFilter === "high" ? "text-background font-semibold" : "text-foreground"}>
                    {formatCurrency(100)}+
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-full px-4 py-2 border ${ratingFilter > 0 ? "bg-primary border-primary" : "bg-card border-border"}`}
                  onPress={() => setRatingFilter(ratingFilter > 0 ? 0 : 4.5)}
                >
                  <Text className={ratingFilter > 0 ? "text-background font-semibold" : "text-foreground"}>
                    4.5+ Rating
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Animated content */}
          <Animated.View style={{ opacity: contentFadeAnim }}>
            {/* Trainers Tab */}
            {activeTab === "trainers" && (
              <View className="px-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-foreground">Top {getTrainerLabel()}s Near You</Text>
                  <TouchableOpacity>
                    <Ionicons name="options-outline" size={24} color="#7ED957" />
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <>
                    <TrainerCardSkeleton />
                    <TrainerCardSkeleton />
                    <TrainerCardSkeleton />
                  </>
                ) : (
                  filterTrainers(content.sampleTrainers).map((trainer, index) => {
                    const distance = calculateDistance(40.7589 + index * 0.01, -73.9851 + index * 0.01)
                    return (
                      <TouchableOpacity
                        key={index}
                        className="bg-card border border-border rounded-2xl p-4 mb-4"
                        onPress={() => router.push(`/trainers/${index}`)}
                      >
                        <View className="flex-row items-start mb-3">
                          <View className="bg-primary/20 rounded-full w-16 h-16 items-center justify-center mr-4">
                            <Text className="text-primary font-bold text-2xl">{trainer.name.charAt(0)}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-foreground font-bold text-lg mb-1">{trainer.name}</Text>
                            <View className="flex-row items-center mb-1">
                              <Ionicons name="star" size={16} color="#7ED957" />
                              <Text className="text-foreground ml-1">
                                {trainer.rating} ({trainer.reviews} reviews)
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Ionicons name="location-outline" size={14} color="#666" />
                              <Text className="text-muted-foreground text-sm ml-1">
                                {distance ? formatDistance(distance) : trainer.location}
                              </Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text className="text-primary font-bold text-xl">{formatCurrency(trainer.price)}</Text>
                            <Text className="text-muted-foreground text-xs">/session</Text>
                          </View>
                        </View>

                        <Text className="text-muted-foreground text-sm mb-3" numberOfLines={2}>
                          {trainer.bio}
                        </Text>

                        <View className="flex-row flex-wrap gap-2 mb-3">
                          {trainer.specialties.map((specialty, idx) => (
                            <View key={idx} className="bg-primary/10 rounded-lg px-3 py-1">
                              <Text className="text-primary text-xs font-medium">{specialty}</Text>
                            </View>
                          ))}
                        </View>

                        <TouchableOpacity className="bg-primary rounded-xl py-3">
                          <Text className="text-background font-bold text-center">Book Session</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )
                  })
                )}
              </View>
            )}

            {/* Venues Tab */}
            {activeTab === "venues" && (
              <View className="px-6">
                <Text className="text-xl font-bold text-foreground mb-4">
                  {venueTypeFilter === "studio"
                    ? "Studios"
                    : venueTypeFilter === "recreational"
                      ? "Courts & Fields"
                      : "All Venues"}{" "}
                  Near You
                </Text>

                {loading ? (
                  <>
                    <VenueCardSkeleton />
                    <VenueCardSkeleton />
                    <VenueCardSkeleton />
                  </>
                ) : (
                  content.sampleSessions.map((session, index) => {
                    const quality = venueQualityData[index] || venueQualityData[0]

                    const verifiedRating = calculateGoodRunssRating(
                      primaryActivity,
                      {
                        rimQuality: quality.rimQuality,
                        netPresence: quality.netPresence,
                        courtSlipperiness: 5 - quality.courtGrip,
                        lighting: quality.lighting,
                        backboardCondition: 4.5,
                        lineVisibility: 4.3,
                        doubleRim: false,
                      },
                      45 + index * 20,
                    )

                    return (
                      <TouchableOpacity
                        key={index}
                        className="bg-card border border-border rounded-2xl p-4 mb-4"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          router.push(`/venues/${index}`)
                        }}
                      >
                        <View className="flex-row items-start mb-3">
                          <View className="bg-primary/20 rounded-xl w-16 h-16 items-center justify-center mr-4">
                            <Ionicons name="location" size={28} color="#7ED957" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-foreground font-bold text-lg mb-1">{session.location}</Text>

                            <View className="mb-2">
                              <GoodRunssVerifiedBadge rating={verifiedRating} size="small" showScore={false} />
                            </View>

                            <View className="flex-row items-center mb-1">
                              <Ionicons name="time-outline" size={14} color="#666" />
                              <Text className="text-muted-foreground text-sm ml-1">Open 6 AM - 10 PM</Text>
                            </View>
                            <View className="flex-row items-center">
                              <Ionicons name="location-outline" size={14} color="#666" />
                              <Text className="text-muted-foreground text-sm ml-1">
                                {formatDistance(calculateDistance(40.7589 + index * 0.02, -73.9851) || 0)} away
                              </Text>
                            </View>
                          </View>
                        </View>

                        {primaryActivity === "Basketball" && (
                          <View className="bg-muted/30 rounded-xl p-3 mb-3">
                            <Text className="text-foreground font-semibold mb-2">Court Quality</Text>
                            <View className="flex-row flex-wrap gap-2">
                              <View className="flex-row items-center bg-card rounded-lg px-2 py-1">
                                <Ionicons name="basketball" size={14} color="#7ED957" />
                                <Text className="text-foreground text-xs ml-1">Rim: {quality.rimQuality}/5</Text>
                              </View>
                              <View className="flex-row items-center bg-card rounded-lg px-2 py-1">
                                <Ionicons
                                  name={quality.netPresence ? "checkmark-circle" : "close-circle"}
                                  size={14}
                                  color={quality.netPresence ? "#7ED957" : "#FF6B6B"}
                                />
                                <Text className="text-foreground text-xs ml-1">
                                  {quality.netPresence ? "Has Net" : "No Net"}
                                </Text>
                              </View>
                              <View className="flex-row items-center bg-card rounded-lg px-2 py-1">
                                <Ionicons name="hand-left" size={14} color="#7ED957" />
                                <Text className="text-foreground text-xs ml-1">Grip: {quality.courtGrip}/5</Text>
                              </View>
                              <View className="flex-row items-center bg-card rounded-lg px-2 py-1">
                                <Ionicons name="sunny" size={14} color="#7ED957" />
                                <Text className="text-foreground text-xs ml-1">Light: {quality.lighting}/5</Text>
                              </View>
                            </View>
                          </View>
                        )}

                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            className="flex-1 bg-primary rounded-xl py-3"
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                              router.push(`/venues/${index}`)
                            }}
                          >
                            <Text className="text-background font-bold text-center">
                              Book {getVenueLabel(venueTypeFilter === "studio" ? "studio" : "recreational")}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="bg-card border border-primary rounded-xl px-4 py-3"
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                              router.push("/venues/map")
                            }}
                          >
                            <Ionicons name="map-outline" size={20} color="#7ED957" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    )
                  })
                )}
              </View>
            )}

            {/* Marketplace Tab */}
            {activeTab === "marketplace" && (
              <View className="px-6">
                <Text className="text-xl font-bold text-foreground mb-4">Gear & Equipment</Text>

                <View className="flex-row flex-wrap justify-between">
                  {content.marketplaceItems.map((item, index) => (
                    <TouchableOpacity key={index} className="w-[48%] bg-card border border-border rounded-2xl mb-4">
                      <View className="bg-muted rounded-t-2xl h-40 items-center justify-center">
                        <Ionicons name="image-outline" size={48} color="#666" />
                      </View>
                      <View className="p-3">
                        <Text className="text-foreground font-bold mb-1" numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text className="text-muted-foreground text-xs mb-2">{item.condition}</Text>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-primary font-bold text-lg">{formatCurrency(item.price)}</Text>
                          <TouchableOpacity
                            className="bg-primary rounded-lg px-3 py-1"
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                              router.push(`/marketplace/${item.name}`)
                            }}
                          >
                            <Text className="text-background text-xs font-bold">Buy</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Personas Tab */}
            {activeTab === "personas" && (
              <View className="px-6">
                <Text className="text-xl font-bold text-foreground mb-4">Featured AI Personas</Text>

                <TouchableOpacity
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-4"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    router.push("/personas")
                  }}
                >
                  <View className="flex-row items-center mb-4">
                    <View className="bg-purple-500/30 rounded-full w-12 h-12 items-center justify-center mr-3">
                      <Ionicons name="sparkles" size={24} color="#a855f7" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg mb-1">Train with AI Coaches</Text>
                      <Text className="text-zinc-400 text-sm">Get personalized coaching from AI personas</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mb-4">
                    <View className="bg-purple-500/20 rounded-lg px-3 py-1">
                      <Text className="text-purple-400 text-xs font-medium">24/7 Available</Text>
                    </View>
                    <View className="bg-purple-500/20 rounded-lg px-3 py-1">
                      <Text className="text-purple-400 text-xs font-medium">Voice Enabled</Text>
                    </View>
                    <View className="bg-purple-500/20 rounded-lg px-3 py-1">
                      <Text className="text-purple-400 text-xs font-medium">Custom Workouts</Text>
                    </View>
                  </View>

                  <TouchableOpacity className="bg-purple-500 rounded-xl py-3">
                    <Text className="text-white font-bold text-center">Explore AI Personas</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <GlobalSearch visible={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
      </LinearGradient>
    </ErrorBoundary>
  )
}
