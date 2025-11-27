"use client"

import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { PARTNER_CITIES } from "@/lib/partner-city-types"

const { width } = Dimensions.get("window")

export default function CityDashboardScreen() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month")
  const { cityId } = useLocalSearchParams()
  const city = PARTNER_CITIES.find((c) => c.id === cityId)

  if (!city) return null

  const myStats = {
    cityRank: 23,
    totalCitizens: 1284,
    reportsThisMonth: 15,
    earningsThisMonth: 324,
    contribution: "Top 5%",
  }

  const cityStats = {
    totalReports: 892,
    totalFacilities: 47,
    avgCondition: "Good",
    mostActiveTime: "6-8 PM",
    topReporters: [
      { id: "1", name: "Sarah M.", reports: 43, badge: "👑" },
      { id: "2", name: "Mike T.", reports: 38, badge: "💎" },
      { id: "3", name: "Jessica L.", reports: 35, badge: "⭐" },
    ],
  }

  const facilityBreakdown = [
    { sport: "Basketball", count: 18, reports: 342 },
    { sport: "Tennis", count: 15, reports: 289 },
    { sport: "Volleyball", count: 4, reports: 98 },
    { sport: "Soccer", count: 6, reports: 123 },
    { sport: "Pickleball", count: 3, reports: 28 },
    { sport: "Golf", count: 1, reports: 12 },
  ]

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
            <Text className="text-2xl font-bold text-foreground ml-4">{city.name} Dashboard</Text>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <Text className="text-4xl mr-3">{city.badge}</Text>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">Your City Rank</Text>
                <Text className="text-muted-foreground">
                  #{myStats.cityRank} of {myStats.totalCitizens} citizens
                </Text>
              </View>
              <View className="bg-primary/20 rounded-xl px-4 py-2">
                <Text className="text-primary font-bold">{myStats.contribution}</Text>
              </View>
            </View>

            <View className="bg-background rounded-xl p-4">
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="text-foreground font-bold text-2xl">{myStats.reportsThisMonth}</Text>
                  <Text className="text-muted-foreground text-sm">Reports This Month</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-bold text-2xl">${myStats.earningsThisMonth}</Text>
                  <Text className="text-muted-foreground text-sm">Earnings</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row mb-4">
            {(["week", "month", "all"] as const).map((range) => (
              <TouchableOpacity
                key={range}
                className={`flex-1 py-3 rounded-xl mr-2 last:mr-0 ${
                  timeRange === range ? "bg-primary" : "bg-card border border-border"
                }`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setTimeRange(range)
                }}
              >
                <Text
                  className={`text-center font-bold capitalize ${
                    timeRange === range ? "text-background" : "text-foreground"
                  }`}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-xl mb-3">City Overview</Text>

            <View className="bg-card border border-border rounded-2xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-primary">{cityStats.totalReports}</Text>
                  <Text className="text-muted-foreground text-sm">Total Reports</Text>
                </View>
                <View className="w-px h-12 bg-border" />
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-accent">{cityStats.totalFacilities}</Text>
                  <Text className="text-muted-foreground text-sm">Facilities</Text>
                </View>
                <View className="w-px h-12 bg-border" />
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-foreground">{cityStats.avgCondition}</Text>
                  <Text className="text-muted-foreground text-sm">Avg Condition</Text>
                </View>
              </View>

              <View className="bg-background rounded-xl p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground">Most Active Time</Text>
                  <Text className="text-foreground font-bold">{cityStats.mostActiveTime}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-xl mb-3">Facility Breakdown</Text>
            {facilityBreakdown.map((item) => (
              <View key={item.sport} className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-foreground font-bold text-lg">{item.sport}</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={16} color="#7ED957" />
                    <Text className="text-primary font-bold ml-1">{item.count}</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="document-text" size={14} color="#666" />
                  <Text className="text-muted-foreground text-sm ml-1">{item.reports} reports this month</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-xl mb-3">Top Contributors</Text>
            {cityStats.topReporters.map((reporter, index) => (
              <View key={reporter.id} className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                      index === 0 ? "bg-primary/20" : index === 1 ? "bg-accent/20" : "bg-muted"
                    }`}
                  >
                    <Text className="text-2xl">{reporter.badge}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold">{reporter.name}</Text>
                    <Text className="text-muted-foreground text-sm">{reporter.reports} reports</Text>
                  </View>
                  <View
                    className={`rounded-lg px-3 py-1 ${
                      index === 0 ? "bg-primary/20" : index === 1 ? "bg-accent/20" : "bg-muted"
                    }`}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        index === 0 ? "text-primary" : index === 1 ? "text-accent" : "text-foreground"
                      }`}
                    >
                      #{index + 1}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-4"
            onPress={() => router.push(`/report-facility/${cityId}`)}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="add-circle" size={20} color="#0A0A0A" />
              <Text className="text-background font-bold text-lg ml-2">Submit Report (2x Rewards)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
