import { View, Text, ScrollView, StyleSheet, TextInput, RefreshControl, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { getVenuesForSport, Venue } from "@/lib/venue-data"
import { venueService } from "@/lib/services/venue-service"
import { useUserLocation } from "@/lib/location-context"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { EmptyState } from "@/components/ui/EmptyState"
import { TrainerFlywheel } from "@/components/Live/TrainerFlywheel"
import { VenueListCard } from "@/components/Live/VenueListCard"
import { FriendActivityRail } from "@/components/Live/FriendActivityRail"


// ... (imports are added at top)
import { LiveRequestRail } from "@/components/Live/LiveRequestRail"
import { DemandHeatmap } from "@/components/Live/DemandHeatmap"

// Sample venues for fallback (always available)
import { GiaSpaceFinder } from "@/components/Live/GiaSpaceFinder"
import { PlayersAlsoLiked } from "@/components/Widgets/PlayersAlsoLiked"
import { ShareCourtButton } from "@/components/ui/ShareCourtButton"
import { SkeletonCard } from "@/components/ui/SkeletonLoader"

const SAMPLE_VENUES: Venue[] = [
  {
    id: "1",
    name: "Central Park Basketball Courts",
    address: "Central Park, New York, NY",
    sport: "Basketball" as any,
    rating: 4.8,
    distance: 0.8,
    activePlayersNow: 6,
    lastActivityTimestamp: new Date(),
    lat: 40.7829,
    lng: -73.9654,
    images: []
  },
  {
    id: "3",
    name: "Downtown Recreation Center",
    address: "125 Worth St, New York, NY",
    sport: "Basketball" as any,
    rating: 4.6,
    distance: 1.8,
    activePlayersNow: 8,
    lastActivityTimestamp: new Date(),
    lat: 40.7128,
    lng: -74.0060,
    images: []
  },
  {
    id: "5",
    name: "Harlem Basketball Courts",
    address: "St. Nicholas Park, Harlem, NY",
    sport: "Basketball" as any,
    rating: 4.4,
    distance: 2.2,
    activePlayersNow: 4,
    lastActivityTimestamp: new Date(),
    lat: 40.8116,
    lng: -73.9465,
    images: []
  },
]

export default function LiveScreen() {
  const { t } = useTranslation()
  const { preferences } = useUserPreferences()
  const [searchQuery, setSearchQuery] = useState("")
  const [venues, setVenues] = useState<Venue[]>(SAMPLE_VENUES)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { location, loading: locationLoading } = useUserLocation()

  // Primary Activity
  const primaryActivity = preferences.primaryActivity || "Basketball" as Activity

  // Trainer Check
  const isTrainer = preferences.userType === "trainer" || preferences.userType === "instructor"

  // Filter venues... (existing logic)
  const filteredVenues = useMemo(() => {
    return venues.filter(v =>
      (v.sport === primaryActivity) ||
      (v.sport === "Basketball" && primaryActivity === "Basketball")
    );
  }, [venues, primaryActivity])

  // ... (existing helper functions: useEffect, loadVenues, handlePress, onRefresh)
  useEffect(() => {
    if (!locationLoading) {
      loadVenues()
    }
  }, [primaryActivity, location, locationLoading])

  const loadVenues = async () => {
    setLoading(true)
    try {
      const remoteVenues = await venueService.getVenuesNearby(location, 50, primaryActivity)
      if (remoteVenues.length > 0) {
        setVenues(remoteVenues)
      } else {
        const localVenues = getVenuesForSport(primaryActivity)
        setVenues(localVenues.length > 0 ? localVenues : SAMPLE_VENUES)
      }
    } catch (error) {
      console.error("Failed to load venues:", error)
      setVenues(SAMPLE_VENUES)
    } finally {
      setLoading(false)
    }
  }

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    action()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadVenues()
    setRefreshing(false)
  }

  // TRAINER VIEW
  if (isTrainer) {
    return (
      <LinearGradient colors={["#000000", "#121212"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7ED957" />}
          >
            {/* Trainer Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Marketplace</Text>
              <View style={[styles.searchContainer, { borderColor: '#333' }]}>
                <Ionicons name="search" size={20} color="#7ED957" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for clients or locations..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* 1. Live Requests */}
            <LiveRequestRail />

            {/* Saas "Web Dash" Tools Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Tools</Text>
              <View style={styles.toolsGrid}>
                <TouchableOpacity style={styles.toolCard} onPress={() => router.push("/business/leads")}>
                  <View style={[styles.toolIcon, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    <Ionicons name="flash" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.toolLabel}>Leads</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolCard} onPress={() => router.push("/business/crm")}>
                  <View style={[styles.toolIcon, { backgroundColor: 'rgba(126, 217, 87, 0.1)' }]}>
                    <Ionicons name="people" size={24} color="#7ED957" />
                  </View>
                  <Text style={styles.toolLabel}>CRM</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolCard} onPress={() => router.push("/business/campaigns")}>
                  <View style={[styles.toolIcon, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                    <Ionicons name="mail" size={24} color="#38BDF8" />
                  </View>
                  <Text style={styles.toolLabel}>Campaigns</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolCard} onPress={() => router.push("/business/invoices")}>
                  <View style={[styles.toolIcon, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                    <Ionicons name="receipt" size={24} color="#EAB308" />
                  </View>
                  <Text style={styles.toolLabel}>Invoices</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolCard} onPress={() => router.push("/pro-dashboard")}>
                  <View style={[styles.toolIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="stats-chart" size={24} color="#EF4444" />
                  </View>
                  <Text style={styles.toolLabel}>Analytics</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Gia Space Predictions */}
            <GiaSpaceFinder />

            {/* 4. Demand Heatmap */}
            <DemandHeatmap sport={primaryActivity} />

            {/* 5. Opportunities List */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>High Traffic Locations</Text>
                <TouchableOpacity onPress={() => handlePress(() => router.push("/global-live"))}>
                  <Text style={{ color: '#7ED957', fontWeight: 'bold' }}>Full Map</Text>
                </TouchableOpacity>
              </View>

              {filteredVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.trainerVenueCard}
                  onPress={() => handlePress(() => router.push(`/venues/${venue.id}`))}
                >
                  <View style={styles.tvCardLeft}>
                    <Text style={styles.tvCardName}>{venue.name}</Text>
                    <Text style={styles.tvCardInfo}>{venue.activePlayersNow} players active • {venue.distance}mi</Text>
                  </View>
                  <View style={styles.tvCardRight}>
                    <View style={styles.opportunityBadge}>
                      <Text style={styles.oppText}>High Demand</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  // PLAYER VIEW (Existing)
  return (
    <LinearGradient colors={["#000000", "#121212"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7ED957" />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Live Traffic</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search trainers, venues..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* New Trainer Flywheel - Passing sport prop */}
          <TrainerFlywheel sport={primaryActivity} />

          {/* Social Layer: Friends Active */}
          <FriendActivityRail />

          {/* Community & Competition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community & Competition</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <TouchableOpacity
                style={styles.communityCard}
                onPress={() => router.push("/groups")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['rgba(126, 217, 87, 0.15)', 'rgba(26,26,26,0)']} style={styles.commGradient}>
                  <View style={styles.commIconBg}>
                    <Ionicons name="people" size={24} color="#7ED957" />
                  </View>
                  <View>
                    <Text style={styles.commTitle}>Groups</Text>
                    <Text style={styles.commDesc}>Find your squad</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.communityCard}
                onPress={() => router.push("/leagues")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['rgba(245, 158, 11, 0.15)', 'rgba(26,26,26,0)']} style={styles.commGradient}>
                  <View style={[styles.commIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.commTitle}>Leagues</Text>
                    <Text style={styles.commDesc}>Compete & Win</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.communityCard}
                onPress={() => router.push("/need-players")}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['rgba(239, 68, 68, 0.15)', 'rgba(26,26,26,0)']} style={styles.commGradient}>
                  <View style={[styles.commIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Ionicons name="megaphone" size={24} color="#EF4444" />
                  </View>
                  <View>
                    <Text style={styles.commTitle}>Need Players</Text>
                    <Text style={styles.commDesc}>Broadcast Request</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Live Map Card (Full Width) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live {primaryActivity} Activity</Text>
            <TouchableOpacity
              style={styles.mapCard}
              onPress={() => router.push("/global-live")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#0F2010', '#050A05']}
                style={styles.mapGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Simulated Map Dots */}
                <View style={styles.mapContent}>
                  <View style={[styles.pulseContainer, { top: '30%', left: '25%' }]}>
                    <View style={styles.pulseRing} />
                    <View style={styles.pulseDot} />
                  </View>
                  <View style={[styles.pulseContainer, { top: '50%', left: '60%' }]}>
                    <View style={styles.pulseRing} />
                    <View style={styles.pulseDot} />
                  </View>

                  {/* Live Badge */}
                  <View style={styles.liveMapBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.liveMapText}>
                      {filteredVenues.reduce((acc, v) => acc + (v.activePlayersNow || 0), 0)} active now
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.mapFooter}>
                  <View>
                    <View style={styles.flexRow}>
                      <Ionicons name="pulse" size={16} color="#7ED957" />
                      <Text style={styles.mapCardTitle}>Live Activity</Text>
                    </View>
                    <Text style={styles.mapCardSubtitle}>
                      {filteredVenues.length} {primaryActivity} spots nearby
                    </Text>
                  </View>

                  <View style={styles.mapButton}>
                    <Ionicons name="expand" size={14} color="#000" />
                    <Text style={styles.mapButtonText}>Full Map</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* New Premium Venue List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby {primaryActivity} Courts</Text>
              <View style={styles.legend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} /><Text style={styles.legendText}>Quiet</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} /><Text style={styles.legendText}>Active</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>Busy</Text></View>
              </View>
            </View>

            {loading ? (
              <View style={{ gap: 12 }}>
                <SkeletonCard height={80} />
                <SkeletonCard height={80} />
                <SkeletonCard height={80} />
              </View>
            ) : filteredVenues.length === 0 ? (
              <EmptyState icon="search" title="No venues found" message="Try searching for a different area." />
            ) : (
              (venues || []).map((venue) => (
                <VenueListCard
                  key={venue.id}
                  venue={venue}
                  onPress={() => handlePress(() => router.push(`/venues/${venue.id}`))}
                />
              ))
            )}
          </View>

          {/* Players Also Liked Recommendations */}
          <PlayersAlsoLiked sport={primaryActivity} />

          <View style={{ height: 40 }} />
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
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18, // Updated size
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },

  // Map Card Styles
  mapCard: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e4c2e',
  },
  mapGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mapContent: {
    flex: 1,
    position: 'relative',
  },
  liveMapBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  liveMapText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pulseContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  pulseDot: {
    width: 12,
    height: 12,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  pulseRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  mapFooter: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  mapCardTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapCardSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  mapButton: {
    backgroundColor: '#7ED957',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
  },


  // Business Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    gap: 8,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolLabel: {
    color: '#CCC',
    fontSize: 12,
    fontWeight: '600',
  },

  // TRAINER SPECIFIC STYLES
  trainerVenueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  tvCardLeft: {
    gap: 4,
  },
  tvCardName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tvCardInfo: {
    color: '#888',
    fontSize: 12,
  },
  tvCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  opportunityBadge: {
    backgroundColor: 'rgba(126, 217, 87, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  oppText: {
    color: '#7ED957',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Community Styles
  communityCard: {
    width: 160,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden'
  },
  commGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  commIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(126, 217, 87, 0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2
  },
  commDesc: {
    color: '#999',
    fontSize: 12
  }
})
