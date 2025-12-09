import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Platform, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import {
  getVenueQualityAttributes,
  calculateGoodRunssRating,
  type GoodRunssVerifiedRating,
} from "@/lib/venue-quality-types"
import { GoodRunssVerifiedBadge } from "@/components/goodrunss-verified-badge"
import * as Haptics from "expo-haptics"
import { ImageService } from "@/lib/image-service"
import { ErrorBoundary } from "@/components/error-boundary"
import { NotificationService } from "@/lib/notification-service"
import { WaitlistJoinModal } from "@/components/waitlist-join-modal"
import { ReviewModal } from "@/components/review-modal"
import { venueService } from "@/lib/services/venue-service"
import { Venue } from "@/lib/venue-data"
import { MapsService } from "@/lib/services/maps-service"
import { PoolConditionsBadge } from "@/components/PoolConditionsBadge"

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams()
  const { preferences } = useUserPreferences()
  const { user } = useAuth()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [isFullyBooked, setIsFullyBooked] = useState(false)
  const [venue, setVenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePlayers, setActivePlayers] = useState<any[]>([])
  const [needPlayersAlerts, setNeedPlayersAlerts] = useState<any[]>([])

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = getActivityContent(primaryActivity)

  useEffect(() => {
    loadVenue()
  }, [id])

  const loadVenue = async () => {
    if (typeof id !== "string") return
    setLoading(true)
    const fetchedVenue = await venueService.getVenueById(id)

    if (fetchedVenue) {
      // Enrich with mock quality data for UI
      const enrichedVenue = {
        ...fetchedVenue,
        quality: generateMockQuality(primaryActivity, fetchedVenue.rating),
        distance: fetchedVenue.distance ? `${fetchedVenue.distance.toFixed(1)} mi` : "0.8 mi",
        price: fetchedVenue.price || "Free",
        hours: fetchedVenue.hours || "6:00 AM - 10:00 PM",
        amenities: fetchedVenue.amenities || ["Parking", "Restrooms"],
        images: fetchedVenue.photos && fetchedVenue.photos.length > 0 ? fetchedVenue.photos : ["/outdoor-basketball-court.png"]
      }
      setVenue(enrichedVenue)

      // Load real-time data
      loadCheckIns(id)
      loadAlerts(id)
    }
    setLoading(false)
  }

  const loadCheckIns = async (venueId: string) => {
    const checkIns = await venueService.getVenueCheckIns(venueId)
    // Group check-ins by time periods
    const grouped = checkIns.reduce((acc: any[], checkIn: any) => {
      const timestamp = checkIn.timestamp?.toDate?.() || new Date()
      const minutesAgo = Math.floor((Date.now() - timestamp.getTime()) / 60000)

      // Group into 15-minute buckets
      const bucket = Math.floor(minutesAgo / 15)
      if (!acc[bucket]) {
        acc[bucket] = {
          id: `group-${bucket}`,
          count: 0,
          sport: primaryActivity,
          timestamp: new Date(Date.now() - bucket * 15 * 60000)
        }
      }
      acc[bucket].count++
      return acc
    }, [])

    setActivePlayers(grouped.filter(Boolean).slice(0, 5))
  }

  const loadAlerts = async (venueId: string) => {
    const alerts = await venueService.getVenueAlerts(venueId)
    const formatted = alerts.map((alert: any) => ({
      id: alert.id,
      userName: alert.userName || "Anonymous",
      playersNeeded: alert.playersNeeded || 1,
      skillLevel: alert.skillLevel || "Any",
      timestamp: alert.timestamp?.toDate?.() || new Date()
    }))
    setNeedPlayersAlerts(formatted)
  }

  const generateMockQuality = (sport: string, rating: number) => {
    const base = rating || 4.5
    if (sport === "Basketball") {
      return {
        rimQuality: base,
        netPresence: true,
        doubleRim: false,
        courtGrip: base + 0.2,
        lighting: base - 0.3,
        backboard: base + 0.1,
        surface: "Outdoor Asphalt",
        lines: base - 0.2,
      }
    }
    return {
      cleanliness: base + 0.2,
      equipment: base,
      ambiance: base + 0.1,
      temperature: base,
      spacing: base - 0.1,
      flooring: base + 0.1,
      mirrors: base,
      sound: base - 0.1,
    }
  }

  const qualityAttributes = getVenueQualityAttributes(primaryActivity)

  const getQualityIcon = (attribute: string) => {
    const iconMap: Record<string, string> = {
      "Rim Quality": "basketball",
      "Net Presence": "checkmark-circle",
      "Double Rim": "close-circle",
      "Court Grip": "hand-left",
      Lighting: "sunny",
      Backboard: "square",
      Surface: "layers",
      Lines: "git-branch",
      "Grass Quality": "leaf",
      Patchiness: "grid",
      "Green Speed": "speedometer",
      Bunkers: "ellipse",
      Fairways: "trail-sign",
      "Tee Boxes": "flag",
      Drainage: "water",
      Cleanliness: "sparkles",
      Equipment: "barbell",
      Ambiance: "bulb",
      Temperature: "thermometer",
      Spacing: "resize",
      Flooring: "square-outline",
      Mirrors: "copy",
      Sound: "volume-high",
    }
    return iconMap[attribute] || "star"
  }

  const getQualityValue = (attribute: string): number => {
    if (!venue?.quality) return 4.5
    const key = attribute.toLowerCase().replace(/\s+/g, "").replace("/", "")
    return (venue.quality as any)[key] || 4.5
  }

  const getQualityColor = (value: number) => {
    if (value >= 4.5) return "#7ED957"
    if (value >= 3.5) return "#FFA500"
    return "#FF6B6B"
  }

  const getVerifiedRatingColor = (tier: string) => {
    const colorMap: Record<string, string> = {
      Bronze: "#CD7F32",
      Silver: "#C0C0C0",
      Gold: "#FFD700",
      Platinum: "#E5E4E2",
    }
    return colorMap[tier] || "#FFFFFF"
  }

  if (loading || !venue) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#7ED957" />
      </View>
    )
  }

  const verifiedRating: GoodRunssVerifiedRating = calculateGoodRunssRating(
    primaryActivity,
    venue.quality,
    venue.reviews || 0,
  )


  const handleCheckIn = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setIsCheckedIn(!isCheckedIn)

    if (!isCheckedIn && typeof id === "string") {
      // Check in
      const userId = user?.id || "guest-" + Math.random().toString(36).substr(2, 9)
      await venueService.checkIn(id, userId)

      // Update local state to reflect +1 player
      setVenue(prev => ({
        ...prev,
        activePlayersNow: (prev.activePlayersNow || 0) + 1
      }))
    }
  }

  const handleReviewSubmit = async (rating: number, text: string) => {
    if (typeof id !== "string") return

    const userId = user?.id || "guest-" + Math.random().toString(36).substr(2, 9)
    const success = await venueService.addReview(id, userId, rating, text)

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      // Refresh venue data
      loadVenue()
    }
  }

  const handleNeedPlayers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/ need - players / ${id} `)
  }

  const handleUploadPhoto = async () => {
    try {
      setUploadingPhoto(true)
      const imageService = ImageService.getInstance()
      const result = await imageService.pickImage()

      if (result) {
        const compressed = await imageService.compressImage(result.uri)
        // Upload to your backend
        console.log("[v0] Uploading venue photo:", compressed)

        // Show success notification
        const notificationService = NotificationService.getInstance()
        await notificationService.sendLocalNotification({
          type: "general",
          title: "Photo Uploaded!",
          body: "Thanks for contributing to the community!",
        })
      }
    } catch (error) {
      console.error("[v0] Photo upload error:", error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const canRequestPlayers = primaryActivity === "Basketball" || primaryActivity === "Pickleball"

  const handleJoinWaitlist = (preferences: any) => {
    console.log("[v0] Joining facility waitlist with preferences:", preferences)
    // Call backend API to join waitlist
    const notificationService = NotificationService.getInstance()
    notificationService.sendLocalNotification({
      type: "general",
      title: "Waitlist Joined!",
      body: `You'll be notified when ${venue.name} has availability.`,
    })
    setShowWaitlist(false)
  }

  const handleReportFacility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/report-facility/${id}`)
  }

  const handleGetDirections = async () => {
    if (!venue) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const mapsService = MapsService.getInstance()
    await mapsService.openDirections({
      latitude: venue.lat || venue.coordinates?.lat || 0,
      longitude: venue.lng || venue.coordinates?.lon || 0,
      name: venue.name,
      address: venue.address,
    })
  }

  return (
    <ErrorBoundary>
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="relative">
            <Image source={{ uri: venue.images[0] }} className="w-full h-64" resizeMode="cover" />
            <TouchableOpacity
              className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.back()
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View className="px-6 py-6">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground mb-2">{venue.name}</Text>

                <View className="mb-3">
                  <GoodRunssVerifiedBadge rating={verifiedRating} size="medium" />
                </View>

                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={18} color="#7ED957" />
                  <Text className="text-foreground font-semibold ml-1">
                    {venue.rating} ({venue.reviews} reviews)
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text className="text-muted-foreground ml-1">{venue.distance} away</Text>
                </View>
              </View>
              <View className="bg-primary/20 rounded-xl px-4 py-2">
                <Text className="text-primary font-bold">{venue.price}</Text>
              </View>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark" size={24} color={getVerifiedRatingColor(verifiedRating.tier)} />
                  <Text className="text-xl font-bold text-foreground ml-2">GoodRunss Rating</Text>
                </View>
                <View className="items-end">
                  <Text className="text-3xl font-bold" style={{ color: getVerifiedRatingColor(verifiedRating.tier) }}>
                    {verifiedRating.overallScore}
                  </Text>
                  <Text className="text-muted-foreground text-xs">out of 100</Text>
                </View>
              </View>

              <View className="bg-muted/30 rounded-xl p-3 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-foreground font-semibold">Tier: {verifiedRating.tier}</Text>
                  <Text className="text-2xl">{verifiedRating.badge}</Text>
                </View>
                <Text className="text-muted-foreground text-xs">
                  Based on {verifiedRating.reviewCount} verified player reviews
                </Text>
              </View>

              <Text className="text-muted-foreground text-xs">
                Our algorithm weighs factors like equipment quality, maintenance, and player feedback to give you an
                accurate rating.
              </Text>
            </View>

            {/* Pool Conditions - Only for pool/swimming venues */}
            {(venue.type === "Pool" || venue.type === "Swimming" || primaryActivity === "Swimming") && (
              <View className="bg-card border border-border rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="water" size={24} color="#3B82F6" />
                  <Text className="text-xl font-bold text-foreground ml-2">Pool Conditions</Text>
                </View>
                <PoolConditionsBadge
                  lat={venue.lat || venue.coordinates?.lat || 40.7}
                  lon={venue.lng || venue.coordinates?.lon || -74.0}
                  isHeated={venue.isHeated || false}
                  isOutdoor={venue.isOutdoor !== false}
                />
              </View>
            )}

            {activePlayers.length > 0 && (
              <View className="bg-card border border-primary/50 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 rounded-full p-2 mr-3">
                    <Ionicons name="people" size={20} color="#7ED957" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg">Players Active Now</Text>
                    <Text className="text-muted-foreground text-sm">
                      {activePlayers.reduce((sum, p) => sum + p.count, 0)} players checked in
                    </Text>
                  </View>
                  <View className="bg-primary rounded-full w-3 h-3 animate-pulse" />
                </View>

                {activePlayers.map((player) => (
                  <View key={player.id} className="flex-row items-center justify-between py-2 border-t border-border">
                    <View className="flex-row items-center">
                      <Ionicons name="basketball" size={16} color="#7ED957" />
                      <Text className="text-foreground ml-2">
                        {player.count} {player.count === 1 ? "player" : "players"}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      {Math.floor((Date.now() - player.timestamp.getTime()) / 60000)}m ago
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {needPlayersAlerts.length > 0 && (
              <View className="bg-card border border-accent/50 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="bg-accent/20 rounded-full p-2 mr-3">
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg">Players Needed</Text>
                    <Text className="text-muted-foreground text-sm">Active requests at this court</Text>
                  </View>
                </View>

                {needPlayersAlerts.map((alert) => (
                  <TouchableOpacity
                    key={alert.id}
                    className="bg-accent/10 rounded-xl p-3 mb-2"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      console.log("[v0] Respond to player alert:", alert.id)
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-foreground font-semibold">{alert.userName}</Text>
                      <Text className="text-muted-foreground text-xs">
                        {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}m ago
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-accent/20 rounded-lg px-2 py-1 mr-2">
                        <Text className="text-accent text-xs font-semibold">
                          Need {alert.playersNeeded} {alert.playersNeeded === 1 ? "player" : "players"}
                        </Text>
                      </View>
                      <View className="bg-primary/20 rounded-lg px-2 py-1">
                        <Text className="text-primary text-xs font-semibold">{alert.skillLevel}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View className="bg-card border border-border rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-foreground">{venue.type} Quality</Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    setShowReviewModal(true)
                  }}
                >
                  <Text className="text-primary font-semibold">Rate This {venue.type}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {qualityAttributes.map((attribute, index) => {
                  const value = getQualityValue(attribute) || 4.5
                  const color = getQualityColor(value)
                  return (
                    <View key={index} className="w-[48%] bg-muted/30 rounded-xl p-3">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name={getQualityIcon(attribute) as any} size={20} color={color} />
                        <Text className="text-foreground font-semibold ml-2 flex-1" numberOfLines={1}>
                          {attribute}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="flex-1 bg-muted rounded-full h-2 mr-2">
                          <View
                            className="h-2 rounded-full"
                            style={{ width: `${(value / 5) * 100}%`, backgroundColor: color }}
                          />
                        </View>
                        <Text className="text-foreground font-bold">{value.toFixed(1)}</Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">Details</Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">{venue.hours}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={20} color="#7ED957" />
                  <Text className="text-foreground ml-3">{venue.address}</Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-3 mt-4 flex-row items-center justify-center"
                onPress={handleGetDirections}
              >
                <Ionicons name="navigate" size={20} color="#000" />
                <Text className="text-black font-bold ml-2">Get Directions</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mb-6">
              <Text className="text-lg font-bold text-foreground mb-4">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {venue.amenities.map((amenity, index) => (
                  <View key={index} className="bg-primary/10 rounded-lg px-3 py-2">
                    <Text className="text-primary font-medium">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="space-y-3 mb-6">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 rounded-xl py-4 ${isCheckedIn ? "bg-primary" : "bg-card border border-primary"}`}
                  onPress={handleCheckIn}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name={isCheckedIn ? "checkmark-circle" : "log-in-outline"}
                      size={20}
                      color={isCheckedIn ? "#000" : "#7ED957"}
                    />
                    <Text className={`font-bold ml-2 ${isCheckedIn ? "text-background" : "text-primary"}`}>
                      {isCheckedIn ? "Checked In" : "Check In"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-card border border-primary rounded-xl px-6 py-4"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    const address = encodeURIComponent(venue.address)
                    const url = Platform.select({
                      ios: `maps:?daddr=${address}`,
                      android: `google.navigation:q=${address}`,
                    })
                    if (url) Linking.openURL(url)
                  }}
                >
                  <Ionicons name="navigate" size={24} color="#7ED957" />
                </TouchableOpacity>
              </View>

              {canRequestPlayers && (
                <TouchableOpacity
                  className="bg-accent rounded-xl py-4 flex-row items-center justify-center"
                  onPress={handleNeedPlayers}
                >
                  <Ionicons name="people" size={20} color="#FFF" />
                  <Text className="text-white font-bold ml-2 text-lg">Need Players?</Text>
                </TouchableOpacity>
              )}

              {isFullyBooked ? (
                <View className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                    <Text className="text-foreground font-bold text-lg ml-2">Fully Booked</Text>
                  </View>
                  <Text className="text-muted-foreground mb-4">
                    This {venue.type.toLowerCase()} is currently fully booked. Join the waitlist to be notified when a
                    spot opens up.
                  </Text>
                  <TouchableOpacity
                    className="bg-primary rounded-xl py-3"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                      setShowWaitlist(true)
                    }}
                  >
                    <Text className="text-black text-center font-bold">Join Waitlist</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="bg-primary rounded-xl py-4"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                    router.push(`/booking/${id}`)
                  }}
                >
                  <Text className="text-background font-bold text-center text-lg">Book {venue.type}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="bg-card border border-primary/50 rounded-xl py-3 flex-row items-center justify-center"
                onPress={handleReportFacility}
              >
                <Ionicons name="clipboard" size={20} color="#7ED957" />
                <Text className="text-primary font-bold ml-2">Report Facility Condition</Text>
                <View className="bg-primary/20 rounded-full px-2 py-1 ml-2">
                  <Text className="text-primary text-xs font-bold">Earn $1-31</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="px-6 mb-6">
              <TouchableOpacity
                className="bg-card border border-border rounded-xl p-4 flex-row items-center justify-between"
                onPress={handleUploadPhoto}
                disabled={uploadingPhoto}
              >
                <View className="flex-row items-center">
                  <Ionicons name="camera" size={24} color="#7ED957" />
                  <Text className="text-foreground font-semibold ml-3">
                    {uploadingPhoto ? "Uploading..." : "Add Photos"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <WaitlistJoinModal
          visible={showWaitlist}
          onClose={() => setShowWaitlist(false)}
          onJoin={handleJoinWaitlist}
          type="facility"
          name={venue.name}
        />

        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          venueName={venue.name}
        />
      </LinearGradient>
    </ErrorBoundary>
  )
}
