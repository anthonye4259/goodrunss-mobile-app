
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { PARTNER_CITIES, type CityFacility, type CityChallenge } from "@/lib/partner-city-types"

const { width } = Dimensions.get("window")

export default function PartnerCityScreen() {
  const { cityId } = useLocalSearchParams()
  const city = PARTNER_CITIES.find((c) => c.id === cityId)
  const [isCitizen, setIsCitizen] = useState(false)

  if (!city) return null

  const facilities: CityFacility[] = [
    {
      id: "1",
      name: "Myrtle Beach Sports Center",
      type: "recreational",
      sport: ["basketball", "volleyball"],
      condition: "excellent",
      crowdLevel: "moderate",
      lastReportTime: new Date(Date.now() - 30 * 60 * 1000),
      recentReports: 5,
      coordinates: { lat: 33.6891, lng: -78.8867 },
    },
    {
      id: "2",
      name: "Broadway Tennis Courts",
      type: "recreational",
      sport: ["tennis"],
      condition: "good",
      crowdLevel: "light",
      lastReportTime: new Date(Date.now() - 120 * 60 * 1000),
      recentReports: 3,
      coordinates: { lat: 33.7102, lng: -78.8795 },
    },
  ]

  const challenges: CityChallenge[] = [
    {
      id: "1",
      cityId: city.id,
      title: "March Reporting Challenge",
      description: "Submit 10 facility reports this month",
      goal: 10,
      progress: 7,
      reward: 50,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-31"),
      participants: 234,
      status: "active",
    },
  ]

  const handleVerifyCitizen = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setIsCitizen(true)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.back()
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground ml-4">Partner City</Text>
          </View>

          <LinearGradient
            colors={["#4FACFE", "#00F2FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6 mb-6"
          >
            <View className="flex-row items-center mb-4">
              <Text className="text-6xl mr-4">{city.badge}</Text>
              <View>
                <Text className="text-background font-bold text-3xl">{city.name}</Text>
                <Text className="text-background/80 text-lg">
                  {city.state}, {city.country}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between bg-background/20 rounded-2xl p-4">
              <View className="items-center">
                <Text className="text-background font-bold text-2xl">{city.stats.totalFacilities}</Text>
                <Text className="text-background/80 text-sm">Facilities</Text>
              </View>
              <View className="items-center">
                <Text className="text-background font-bold text-2xl">{city.stats.activeCitizens}</Text>
                <Text className="text-background/80 text-sm">Citizens</Text>
              </View>
              <View className="items-center">
                <Text className="text-background font-bold text-2xl">{city.stats.reportsThisMonth}</Text>
                <Text className="text-background/80 text-sm">Reports</Text>
              </View>
            </View>
          </LinearGradient>

          {!isCitizen && (
            <TouchableOpacity className="bg-primary rounded-xl py-4 mb-6" onPress={handleVerifyCitizen}>
              <View className="flex-row items-center justify-center">
                <Ionicons name="location" size={20} color="#0A0A0A" />
                <Text className="text-background font-bold text-lg ml-2">Verify I'm a {city.name} Citizen</Text>
              </View>
            </TouchableOpacity>
          )}

          {isCitizen && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-primary rounded-full w-16 h-16 items-center justify-center mr-4">
                  <Text className="text-4xl">{city.badge}</Text>
                </View>
                <View>
                  <Text className="text-primary font-bold text-xl">{city.name} Citizen</Text>
                  <Text className="text-muted-foreground">Verified Member</Text>
                </View>
              </View>
              <View className="bg-background/50 rounded-xl p-3">
                <Text className="text-foreground font-semibold mb-2">Citizen Benefits Active</Text>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                  <Text className="text-muted-foreground text-sm ml-2">2x Rewards on all reports</Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                  <Text className="text-muted-foreground text-sm ml-2">Priority city dashboard access</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7ED957" />
                  <Text className="text-muted-foreground text-sm ml-2">Special recognition badge</Text>
                </View>
              </View>
            </View>
          )}

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-foreground font-bold text-xl">Citizen Benefits</Text>
              <View className="bg-primary/20 rounded-full px-3 py-1">
                <Text className="text-primary font-bold text-sm">2x REWARDS</Text>
              </View>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-3">
                <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                  <Ionicons name="cash" size={24} color="#7ED957" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">Double Rewards</Text>
                  <Text className="text-muted-foreground text-sm">10-30 credits vs 5-15 regular</Text>
                </View>
              </View>
              <View className="bg-background rounded-xl p-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground">Regular reports</Text>
                  <Text className="text-primary font-bold">10-30 credits</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground">Maintenance reports</Text>
                  <Text className="text-primary font-bold">up to 62 credits</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">GPS verification bonus</Text>
                  <Text className="text-primary font-bold">6 credits</Text>
                </View>
              </View>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mb-3">
              <View className="flex-row items-center">
                <View className="bg-accent/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                  <Ionicons name="star" size={24} color="#FA709A" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">City Badge & Recognition</Text>
                  <Text className="text-muted-foreground text-sm">Special profile badge + priority features</Text>
                </View>
              </View>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4 mb-3">
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                  <Ionicons name="timer" size={24} color="#7ED957" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">Real-Time Facility Info</Text>
                  <Text className="text-muted-foreground text-sm">
                    Live crowd levels & recent reports (last 2 hours)
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-card border border-border rounded-2xl p-4">
              <View className="flex-row items-center">
                <View className="bg-accent/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                  <Ionicons name="trophy" size={24} color="#FA709A" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">City Challenges</Text>
                  <Text className="text-muted-foreground text-sm">Monthly challenges with exclusive rewards</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-xl mb-3">Live Facility Status</Text>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                className="bg-card border border-border rounded-2xl p-4 mb-3"
                onPress={() => router.push(`/venues/${facility.id}`)}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg">{facility.name}</Text>
                    <Text className="text-muted-foreground text-sm capitalize">{facility.sport.join(", ")}</Text>
                  </View>
                  <View
                    className={`rounded-lg px-3 py-1 ${
                      facility.condition === "excellent"
                        ? "bg-primary/20"
                        : facility.condition === "good"
                          ? "bg-accent/20"
                          : "bg-destructive/20"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        facility.condition === "excellent"
                          ? "text-primary"
                          : facility.condition === "good"
                            ? "text-accent"
                            : "text-destructive"
                      }`}
                    >
                      {facility.condition}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={16} color="#7ED957" />
                    <Text className="text-muted-foreground text-sm ml-1 capitalize">{facility.crowdLevel}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#FA709A" />
                    <Text className="text-muted-foreground text-sm ml-1">
                      {Math.round((Date.now() - facility.lastReportTime.getTime()) / (1000 * 60))}m ago
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="document-text" size={16} color="#4FACFE" />
                    <Text className="text-muted-foreground text-sm ml-1">{facility.recentReports} reports</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-xl mb-3">City Challenges</Text>
            {challenges.map((challenge) => (
              <View key={challenge.id} className="bg-card border border-border rounded-2xl p-4 mb-3">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-lg">{challenge.title}</Text>
                    <Text className="text-muted-foreground text-sm">{challenge.description}</Text>
                  </View>
                  <View className="bg-primary/20 rounded-lg px-3 py-1">
                    <Text className="text-primary font-bold text-sm">${challenge.reward}</Text>
                  </View>
                </View>

                <View className="mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-muted-foreground text-sm">Progress</Text>
                    <Text className="text-foreground font-bold text-sm">
                      {challenge.progress}/{challenge.goal}
                    </Text>
                  </View>
                  <View className="bg-muted rounded-full h-2">
                    <View
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                    />
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={16} color="#7ED957" />
                    <Text className="text-muted-foreground text-sm ml-1">{challenge.participants} participating</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Ends {challenge.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 mb-6"
            onPress={() => router.push(`/partner-cities/${cityId}/dashboard`)}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="stats-chart" size={20} color="#0A0A0A" />
              <Text className="text-background font-bold text-lg ml-2">View City Dashboard</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
