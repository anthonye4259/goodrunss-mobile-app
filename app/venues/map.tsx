
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useState } from "react"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity } from "@/lib/activity-content"
import { formatDistance } from "@/lib/global-format"

const { width, height } = Dimensions.get("window")

type SportType = "basketball" | "tennis" | "volleyball" | "soccer" | "pickleball" | "golf"

interface Venue {
  id: number
  name: string
  lat: number
  lng: number
  sport: SportType
  distance: number
  rating: number
  type: "recreational" | "studio"
}

export default function VenuesMapScreen() {
  const { preferences } = useUserPreferences()
  const primaryActivity = getPrimaryActivity(preferences.activities)
  const content = getActivityContent(primaryActivity)

  const allVenues: Venue[] = [
    // Basketball courts
    {
      id: 1,
      name: "Central Park Basketball Courts",
      lat: 40.7829,
      lng: -73.9654,
      sport: "basketball",
      distance: 0.8,
      rating: 4.5,
      type: "recreational",
    },
    {
      id: 2,
      name: "Brooklyn Bridge Courts",
      lat: 40.7061,
      lng: -73.9969,
      sport: "basketball",
      distance: 1.2,
      rating: 4.8,
      type: "recreational",
    },
    {
      id: 3,
      name: "Williamsburg Rec Center",
      lat: 40.7092,
      lng: -73.9571,
      sport: "basketball",
      distance: 2.1,
      rating: 4.3,
      type: "recreational",
    },
    {
      id: 4,
      name: "The Cage - West 4th Street",
      lat: 40.7322,
      lng: -74.0024,
      sport: "basketball",
      distance: 1.5,
      rating: 4.9,
      type: "recreational",
    },
    {
      id: 5,
      name: "Gauchos Gym Basketball Court",
      lat: 40.7589,
      lng: -73.9851,
      sport: "basketball",
      distance: 0.5,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 6,
      name: "Rucker Park",
      lat: 40.8303,
      lng: -73.9381,
      sport: "basketball",
      distance: 3.2,
      rating: 5.0,
      type: "recreational",
    },
    {
      id: 7,
      name: "Chelsea Piers Basketball",
      lat: 40.7469,
      lng: -74.0081,
      sport: "basketball",
      distance: 1.8,
      rating: 4.7,
      type: "recreational",
    },
    {
      id: 8,
      name: "Queensbridge Park Courts",
      lat: 40.7556,
      lng: -73.9503,
      sport: "basketball",
      distance: 2.5,
      rating: 4.4,
      type: "recreational",
    },
    {
      id: 9,
      name: "Pier 2 Brooklyn Courts",
      lat: 40.6989,
      lng: -73.9996,
      sport: "basketball",
      distance: 3.1,
      rating: 4.5,
      type: "recreational",
    },
    {
      id: 10,
      name: "Tompkins Square Courts",
      lat: 40.7264,
      lng: -73.9815,
      sport: "basketball",
      distance: 1.3,
      rating: 4.2,
      type: "recreational",
    },
    {
      id: 11,
      name: "Lincoln Towers Courts",
      lat: 40.7756,
      lng: -73.9911,
      sport: "basketball",
      distance: 1.9,
      rating: 4.3,
      type: "recreational",
    },
    {
      id: 12,
      name: "Fort Greene Park Courts",
      lat: 40.6919,
      lng: -73.9744,
      sport: "basketball",
      distance: 2.8,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 13,
      name: "East River Park Courts",
      lat: 40.7156,
      lng: -73.9742,
      sport: "basketball",
      distance: 2.2,
      rating: 4.4,
      type: "recreational",
    },
    {
      id: 14,
      name: "Astoria Park Basketball",
      lat: 40.7782,
      lng: -73.9246,
      sport: "basketball",
      distance: 3.5,
      rating: 4.5,
      type: "recreational",
    },
    {
      id: 15,
      name: "Dyckman Park Courts",
      lat: 40.8608,
      lng: -73.9272,
      sport: "basketball",
      distance: 4.2,
      rating: 4.3,
      type: "recreational",
    },
    {
      id: 16,
      name: "Marcus Garvey Park Courts",
      lat: 40.7956,
      lng: -73.9425,
      sport: "basketball",
      distance: 2.9,
      rating: 4.4,
      type: "recreational",
    },
    {
      id: 17,
      name: "Red Hook Recreation Courts",
      lat: 40.6756,
      lng: -74.0098,
      sport: "basketball",
      distance: 3.7,
      rating: 4.2,
      type: "recreational",
    },
    {
      id: 18,
      name: "Riverside Park Courts - 96th",
      lat: 40.7939,
      lng: -73.9719,
      sport: "basketball",
      distance: 2.4,
      rating: 4.5,
      type: "recreational",
    },

    // Tennis courts
    {
      id: 19,
      name: "Central Park Tennis Center",
      lat: 40.7812,
      lng: -73.9665,
      sport: "tennis",
      distance: 1.1,
      rating: 4.8,
      type: "recreational",
    },
    {
      id: 20,
      name: "Riverside Clay Courts",
      lat: 40.7889,
      lng: -73.9724,
      sport: "tennis",
      distance: 1.4,
      rating: 4.7,
      type: "recreational",
    },
    {
      id: 21,
      name: "Hudson River Tennis",
      lat: 40.7256,
      lng: -74.0089,
      sport: "tennis",
      distance: 2.3,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 22,
      name: "Prospect Park Tennis",
      lat: 40.6602,
      lng: -73.969,
      sport: "tennis",
      distance: 3.8,
      rating: 4.9,
      type: "recreational",
    },
    {
      id: 23,
      name: "McCarren Park Tennis",
      lat: 40.7204,
      lng: -73.9502,
      sport: "tennis",
      distance: 2.7,
      rating: 4.4,
      type: "recreational",
    },
    {
      id: 24,
      name: "Fort Greene Tennis",
      lat: 40.6912,
      lng: -73.9751,
      sport: "tennis",
      distance: 2.9,
      rating: 4.5,
      type: "recreational",
    },
    {
      id: 25,
      name: "East River Tennis Club",
      lat: 40.7189,
      lng: -73.9734,
      sport: "tennis",
      distance: 2.1,
      rating: 4.7,
      type: "recreational",
    },
    {
      id: 26,
      name: "Astoria Tennis Courts",
      lat: 40.7791,
      lng: -73.9254,
      sport: "tennis",
      distance: 3.6,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 27,
      name: "Chelsea Piers Tennis",
      lat: 40.7465,
      lng: -74.0078,
      sport: "tennis",
      distance: 1.9,
      rating: 4.8,
      type: "recreational",
    },
    {
      id: 28,
      name: "West Side Tennis Club",
      lat: 40.7142,
      lng: -73.8456,
      sport: "tennis",
      distance: 5.2,
      rating: 5.0,
      type: "recreational",
    },
    {
      id: 29,
      name: "Brooklyn Heights Tennis",
      lat: 40.6956,
      lng: -73.9951,
      sport: "tennis",
      distance: 3.2,
      rating: 4.5,
      type: "recreational",
    },
    {
      id: 30,
      name: "Inwood Hill Tennis",
      lat: 40.8675,
      lng: -73.9219,
      sport: "tennis",
      distance: 4.5,
      rating: 4.3,
      type: "recreational",
    },
    {
      id: 31,
      name: "Flushing Meadows Tennis",
      lat: 40.7445,
      lng: -73.8456,
      sport: "tennis",
      distance: 5.8,
      rating: 4.9,
      type: "recreational",
    },
    {
      id: 32,
      name: "LIC Tennis Club",
      lat: 40.7456,
      lng: -73.9489,
      sport: "tennis",
      distance: 2.8,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 33,
      name: "Battery Park Tennis",
      lat: 40.7033,
      lng: -74.017,
      sport: "tennis",
      distance: 3.5,
      rating: 4.4,
      type: "recreational",
    },

    // Volleyball courts
    {
      id: 34,
      name: "Manhattan Beach Volleyball",
      lat: 40.5776,
      lng: -73.9412,
      sport: "volleyball",
      distance: 6.2,
      rating: 4.7,
      type: "recreational",
    },
    {
      id: 35,
      name: "Rockaway Beach Volleyball",
      lat: 40.5834,
      lng: -73.8168,
      sport: "volleyball",
      distance: 7.8,
      rating: 4.8,
      type: "recreational",
    },
    {
      id: 36,
      name: "Pier 6 Brooklyn Volleyball",
      lat: 40.6945,
      lng: -74.0012,
      sport: "volleyball",
      distance: 3.4,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 37,
      name: "Hudson River Volleyball",
      lat: 40.7289,
      lng: -74.0156,
      sport: "volleyball",
      distance: 2.6,
      rating: 4.5,
      type: "recreational",
    },

    // Soccer fields
    {
      id: 38,
      name: "Central Park Great Lawn",
      lat: 40.7789,
      lng: -73.9654,
      sport: "soccer",
      distance: 1.2,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 39,
      name: "Randall's Island Soccer",
      lat: 40.7945,
      lng: -73.9234,
      sport: "soccer",
      distance: 3.8,
      rating: 4.8,
      type: "recreational",
    },
    {
      id: 40,
      name: "Brooklyn Bridge Park Field",
      lat: 40.7012,
      lng: -73.9978,
      sport: "soccer",
      distance: 3.1,
      rating: 4.7,
      type: "recreational",
    },
    {
      id: 41,
      name: "Pier 40 Soccer Fields",
      lat: 40.7289,
      lng: -74.0112,
      sport: "soccer",
      distance: 2.4,
      rating: 4.5,
      type: "recreational",
    },
    {
      id: 42,
      name: "McCarren Park Soccer",
      lat: 40.7198,
      lng: -73.9512,
      sport: "soccer",
      distance: 2.8,
      rating: 4.4,
      type: "recreational",
    },
    {
      id: 43,
      name: "Red Hook Soccer Fields",
      lat: 40.6734,
      lng: -74.0089,
      sport: "soccer",
      distance: 3.9,
      rating: 4.3,
      type: "recreational",
    },

    // Pickleball courts
    {
      id: 44,
      name: "Wollman Rink Pickleball",
      lat: 40.7678,
      lng: -73.9756,
      sport: "pickleball",
      distance: 1.5,
      rating: 4.6,
      type: "recreational",
    },
    {
      id: 45,
      name: "Hudson River Pickleball",
      lat: 40.7412,
      lng: -74.0089,
      sport: "pickleball",
      distance: 2.1,
      rating: 4.7,
      type: "recreational",
    },
    {
      id: 46,
      name: "LIC Pickleball Courts",
      lat: 40.7489,
      lng: -73.9456,
      sport: "pickleball",
      distance: 2.9,
      rating: 4.5,
      type: "recreational",
    },

    // Golf
    {
      id: 47,
      name: "Chelsea Piers Golf Club",
      lat: 40.7456,
      lng: -74.0089,
      sport: "golf",
      distance: 1.8,
      rating: 4.8,
      type: "recreational",
    },
  ]

  const [selectedSport, setSelectedSport] = useState<SportType | "all">("all")

  const sportCounts = {
    all: allVenues.length,
    basketball: allVenues.filter((v) => v.sport === "basketball").length,
    tennis: allVenues.filter((v) => v.sport === "tennis").length,
    volleyball: allVenues.filter((v) => v.sport === "volleyball").length,
    soccer: allVenues.filter((v) => v.sport === "soccer").length,
    pickleball: allVenues.filter((v) => v.sport === "pickleball").length,
    golf: allVenues.filter((v) => v.sport === "golf").length,
  }

  const filteredVenues = selectedSport === "all" ? allVenues : allVenues.filter((v) => v.sport === selectedSport)

  const getSportIcon = (sport: SportType) => {
    const icons: Record<SportType, string> = {
      basketball: "basketball",
      tennis: "tennisball",
      volleyball: "football",
      soccer: "football",
      pickleball: "tennisball",
      golf: "golf",
    }
    return icons[sport]
  }

  const getSportColor = (sport: SportType) => {
    const colors: Record<SportType, string> = {
      basketball: "#FF6B35",
      tennis: "#FFD23F",
      volleyball: "#06FFA5",
      soccer: "#4ECDC4",
      pickleball: "#95E1D3",
      golf: "#90EE90",
    }
    return colors[sport]
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-muted relative">
        {/* Map visualization with colored pins */}
        <View className="absolute inset-0 items-center justify-center">
          <Ionicons name="map" size={64} color="#333" />
          <Text className="text-muted-foreground mt-4 font-semibold">Interactive Map View</Text>
          <Text className="text-muted-foreground text-sm">Showing {filteredVenues.length} facilities</Text>
        </View>

        {/* Simulated pins scattered across map */}
        <View className="absolute inset-0">
          {filteredVenues.slice(0, 20).map((venue, index) => (
            <View
              key={venue.id}
              style={{
                position: "absolute",
                left: `${15 + ((index * 17) % 70)}%`,
                top: `${20 + ((index * 23) % 60)}%`,
              }}
            >
              <View
                style={{
                  backgroundColor: getSportColor(venue.sport),
                  borderRadius: 20,
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Ionicons name={getSportIcon(venue.sport) as any} size={18} color="#000" />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="absolute top-0 left-0 right-0 pt-16 px-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.back()
            }}
            className="bg-background/95 backdrop-blur rounded-full p-3 shadow-lg"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="bg-background/95 backdrop-blur rounded-full px-4 py-3 shadow-lg">
            <Text className="text-foreground font-bold">{filteredVenues.length} Facilities</Text>
          </View>

          <TouchableOpacity className="bg-background/95 backdrop-blur rounded-full p-3 shadow-lg">
            <Ionicons name="options" size={24} color="#7ED957" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0">
        <LinearGradient colors={["transparent", "#0A0A0A"]} className="pt-24">
          <View className="bg-background rounded-t-3xl">
            {/* Drag handle */}
            <View className="w-12 h-1 bg-border rounded-full self-center mt-3 mb-4" />

            {/* Main count card */}
            <View className="px-6 pb-4">
              <View className="bg-card border border-border rounded-2xl p-6 mb-4">
                <View className="items-center mb-4">
                  <Text className="text-5xl font-bold text-primary">{filteredVenues.length}</Text>
                  <Text className="text-muted-foreground text-lg mt-1">FACILITIES FOUND</Text>
                </View>

                {/* Sport filter chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 -mx-2"
                  contentContainerClassName="px-2"
                >
                  <TouchableOpacity
                    className={`rounded-full px-4 py-2 mr-2 ${selectedSport === "all" ? "bg-primary" : "bg-muted"}`}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setSelectedSport("all")
                    }}
                  >
                    <Text className={selectedSport === "all" ? "text-background font-bold" : "text-foreground"}>
                      All ({sportCounts.all})
                    </Text>
                  </TouchableOpacity>

                  {(["basketball", "tennis", "volleyball", "soccer", "pickleball", "golf"] as SportType[]).map(
                    (sport) =>
                      sportCounts[sport] > 0 && (
                        <TouchableOpacity
                          key={sport}
                          className={`rounded-full px-4 py-2 mr-2 flex-row items-center ${selectedSport === sport ? "bg-primary" : "bg-muted"}`}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            setSelectedSport(sport)
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: getSportColor(sport),
                              marginRight: 6,
                            }}
                          />
                          <Text className={selectedSport === sport ? "text-background font-bold" : "text-foreground"}>
                            {sport.charAt(0).toUpperCase() + sport.slice(1)} ({sportCounts[sport]})
                          </Text>
                        </TouchableOpacity>
                      ),
                  )}
                </ScrollView>

                {/* Sport breakdown list */}
                <View className="bg-muted/30 rounded-xl p-4">
                  <Text className="text-foreground font-bold mb-3">Breakdown by Sport</Text>
                  {(["basketball", "tennis", "volleyball", "soccer", "pickleball", "golf"] as SportType[]).map(
                    (sport) =>
                      sportCounts[sport] > 0 && (
                        <View key={sport} className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center flex-1">
                            <View
                              style={{
                                backgroundColor: getSportColor(sport),
                                borderRadius: 8,
                                width: 32,
                                height: 32,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                              }}
                            >
                              <Ionicons name={getSportIcon(sport) as any} size={16} color="#000" />
                            </View>
                            <Text className="text-foreground font-medium">
                              {sport.charAt(0).toUpperCase() + sport.slice(1)}
                            </Text>
                          </View>
                          <Text className="text-primary font-bold text-lg">{sportCounts[sport]}</Text>
                        </View>
                      ),
                  )}
                </View>
              </View>
            </View>

            {/* Scrollable venue list */}
            <ScrollView className="px-6" style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <Text className="text-foreground font-bold text-lg mb-3">Nearby Venues</Text>
              {filteredVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  className="bg-card border border-border rounded-xl p-4 mb-3"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    router.push(`/venues/${venue.id}`)
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      style={{
                        backgroundColor: getSportColor(venue.sport),
                        borderRadius: 12,
                        width: 48,
                        height: 48,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name={getSportIcon(venue.sport) as any} size={24} color="#000" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold">{venue.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text className="text-muted-foreground text-sm ml-1">
                          {formatDistance(venue.distance)} away
                        </Text>
                        <Ionicons name="star" size={14} color="#7ED957" className="ml-3" />
                        <Text className="text-muted-foreground text-sm ml-1">{venue.rating}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}
              <View className="h-8" />
            </ScrollView>
          </View>
        </LinearGradient>
      </View>
    </View>
  )
}
