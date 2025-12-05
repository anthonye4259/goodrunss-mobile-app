import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { getVenuesForSport, Venue } from "@/lib/venue-data"
import { venueService } from "@/lib/services/venue-service"
import { useUserLocation } from "@/lib/services/location-service"
import { predictVenueTraffic } from "@/lib/traffic-prediction"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { QuickSettingsBar } from "@/components/quick-settings-bar"

export default function ExploreScreen() {
  const { preferences } = useUserPreferences()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"trainers" | "venues">("venues")
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const { location, loading: locationLoading } = useUserLocation()

  const primaryActivity = getPrimaryActivity(preferences.activities) as Activity
  const content = getActivityContent(primaryActivity)

  useEffect(() => {
    if (!locationLoading) {
      loadVenues()
    }
  }, [primaryActivity, location, locationLoading])

  const loadVenues = async () => {
    if (activeTab === "venues" || true) { // Always load for now to be ready
      setLoading(true)
      try {
        // Try fetching from Firestore first
        const remoteVenues = await venueService.getVenuesNearby(
          location,
          50, // 50km radius
          primaryActivity
        )

        if (remoteVenues.length > 0) {
          setVenues(remoteVenues)
        } else {
          // Fallback to local data
          console.log("Using local venue data fallback")
          setVenues(getVenuesForSport(primaryActivity))
        }
      } catch (error) {
        console.error("Failed to load venues:", error)
        setVenues(getVenuesForSport(primaryActivity))
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <QuickSettingsBar />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Live Traffic</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search trainers, venues..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "trainers" && styles.tabActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab("trainers") }}
            >
              <Text style={[styles.tabText, activeTab === "trainers" && styles.tabTextActive]}>
                {content.trainerTitle}s
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "venues" && styles.tabActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab("venues") }}
            >
              <Text style={[styles.tabText, activeTab === "venues" && styles.tabTextActive]}>
                Venues
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === "trainers" ? (
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>Top {content.trainerTitle}s Near You</Text>
              {content.sampleTrainers.map((trainer, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trainerCard}
                  onPress={() => handlePress(() => router.push(`/trainers/${index}`))}
                >
                  <View style={styles.trainerHeader}>
                    <View style={styles.trainerAvatar}>
                      <Text style={styles.trainerInitial}>{trainer.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.trainerInfo}>
                      <Text style={styles.trainerName}>{trainer.name}</Text>
                      <View style={styles.trainerRating}>
                        <Ionicons name="star" size={14} color="#84CC16" />
                        <Text style={styles.trainerRatingText}>{trainer.rating} ({trainer.reviews} reviews)</Text>
                      </View>
                      <Text style={styles.trainerSpecialty}>{trainer.specialties?.[0] || primaryActivity}</Text>
                    </View>
                  </View>
                  <View style={styles.trainerFooter}>
                    <View>
                      <Text style={styles.trainerLocation}>
                        <Ionicons name="location" size={14} color="#9CA3AF" /> {trainer.location}
                      </Text>
                    </View>
                    <View style={styles.trainerPriceContainer}>
                      <Text style={styles.trainerPrice}>${trainer.price}/hr</Text>
                      <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.contentSection}>
              {/* Environmental Impact Banner */}
              <View style={styles.impactBanner}>
                <View style={styles.impactIconContainer}>
                  <Ionicons name="leaf" size={24} color="#84CC16" />
                </View>
                <View style={styles.impactTextContainer}>
                  <Text style={styles.impactTitle}>Check Before You Go</Text>
                  <Text style={styles.impactDesc}>Save gas money, time & reduce CO₂ emissions</Text>
                </View>
                <View style={styles.impactStats}>
                  <Text style={styles.impactNumber}>🌍</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Nearby {content.locationPrefix}s</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#84CC16" style={{ marginTop: 20 }} />
              ) : (
                venues.map((venue, index) => {
                  const trafficPrediction = predictVenueTraffic(venue.id, new Date(), venue.activePlayersNow)
                  const minutesAgo = venue.lastActivityTimestamp
                    ? Math.floor((Date.now() - venue.lastActivityTimestamp.getTime()) / 60000)
                    : null

                  return (
                    <TouchableOpacity
                      key={venue.id}
                      style={styles.venueCard}
                      onPress={() => handlePress(() => router.push(`/venues/${venue.id}`))}
                    >
                      <View style={styles.venueHeader}>
                        <View style={styles.venueIcon}>
                          <Ionicons name="location" size={24} color="#84CC16" />
                        </View>
                        <View style={styles.venueInfo}>
                          <Text style={styles.venueName}>{venue.name}</Text>
                          <Text style={styles.venueAddress}>{venue.address}</Text>
                          <View style={styles.venueRating}>
                            <Ionicons name="star" size={14} color="#84CC16" />
                            <Text style={styles.venueRatingText}>{venue.rating}</Text>
                            <Text style={styles.venueDistance}> • {venue.distance || "0.8"} mi</Text>
                          </View>
                        </View>
                      </View>

                      {/* Traffic Prediction */}
                      <View style={styles.trafficContainer}>
                        <View style={[styles.trafficBadge, { backgroundColor: `${trafficPrediction.color}20` }]}>
                          <Text style={styles.trafficEmoji}>{trafficPrediction.emoji}</Text>
                          <Text style={[styles.trafficLabel, { color: trafficPrediction.color }]}>
                            {trafficPrediction.label}
                          </Text>
                        </View>
                        {trafficPrediction.estimatedWaitTime && (
                          <Text style={styles.waitTime}>{trafficPrediction.estimatedWaitTime}</Text>
                        )}
                      </View>

                      {/* Real-time Player Activity */}
                      {venue.activePlayersNow && venue.activePlayersNow > 0 && (
                        <View style={styles.activePlayersContainer}>
                          <View style={styles.activeDot} />
                          <Ionicons name="people" size={14} color="#7ED957" />
                          <Text style={styles.activePlayersText}>
                            {venue.activePlayersNow} {venue.activePlayersNow === 1 ? "player" : "players"} active now
                          </Text>
                          {minutesAgo !== null && (
                            <Text style={styles.activePlayersTime}> • {minutesAgo}m ago</Text>
                          )}
                        </View>
                      )}

                      <View style={styles.venueFooter}>
                        <View style={styles.venueAmenities}>
                          {venue.amenities?.slice(0, 2).map((amenity, i) => (
                            <View key={i} style={styles.amenityBadge}>
                              <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={styles.venueActions}>
                          <TouchableOpacity
                            style={styles.reportButton}
                            onPress={(e) => {
                              e.stopPropagation()
                              handlePress(() => router.push(`/report-facility/${venue.id}`))
                            }}
                          >
                            <Ionicons name="clipboard-outline" size={16} color="#84CC16" />
                            <Text style={styles.reportButtonText}>Report</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>View</Text>
                            <Ionicons name="chevron-forward" size={16} color="#84CC16" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
            </View>
          )}

          {/* Categories */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {["Basketball", "Tennis", "Pickleball", "Golf", "Soccer", "Yoga", "Pilates", "Swimming"].map((sport, index) => (
                <TouchableOpacity key={index} style={styles.categoryCard} onPress={() => handlePress(() => { })}>
                  <Ionicons
                    name={
                      sport === "Basketball" ? "basketball" :
                        sport === "Tennis" ? "tennisball" :
                          sport === "Golf" ? "golf" :
                            sport === "Soccer" ? "football" :
                              sport === "Yoga" || sport === "Pilates" ? "body" :
                                sport === "Swimming" ? "water" :
                                  "fitness"
                    }
                    size={28}
                    color="#84CC16"
                  />
                  <Text style={styles.categoryText}>{sport}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    backgroundColor: "#1A1A1A",
  },
  tabActive: {
    backgroundColor: "#84CC16",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#000000",
  },
  contentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  trainerCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  trainerHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  trainerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  trainerInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#84CC16",
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  trainerRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trainerRatingText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  trainerSpecialty: {
    fontSize: 14,
    color: "#84CC16",
    marginTop: 4,
  },
  trainerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trainerLocation: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  trainerPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trainerPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#84CC16",
  },
  bookButton: {
    backgroundColor: "#84CC16",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookButtonText: {
    color: "#000000",
    fontWeight: "600",
  },
  venueCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  venueHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  venueIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  venueAddress: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  venueRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  venueRatingText: {
    fontSize: 14,
    color: "#84CC16",
    marginLeft: 4,
  },
  venueDistance: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  venueFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  venueAmenities: {
    flexDirection: "row",
    gap: 8,
  },
  amenityBadge: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amenityText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  trafficContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  trafficBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  trafficEmoji: {
    fontSize: 14,
  },
  trafficLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  waitTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  activePlayersContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7ED957",
  },
  activePlayersText: {
    fontSize: 13,
    color: "#7ED957",
    fontWeight: "500",
  },
  activePlayersTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    color: "#84CC16",
    fontWeight: "600",
    marginRight: 4,
  },
  venueActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(132, 204, 22, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  reportButtonText: {
    color: "#84CC16",
    fontWeight: "600",
    fontSize: 13,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    width: "30%",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
  impactBanner: {
    backgroundColor: "rgba(132, 204, 22, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(132, 204, 22, 0.3)",
  },
  impactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  impactDesc: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  impactStats: {
    alignItems: "center",
    justifyContent: "center",
  },
  impactNumber: {
    fontSize: 24,
  },
})
