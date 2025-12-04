
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { getReportLevel, type ReportStats, type FacilityReport } from "@/lib/facility-report-types"

export default function ReportsDashboardScreen() {
  const [stats] = useState<ReportStats>({
    totalReports: 23,
    totalEarnings: 187,
    reportsThisWeek: 5,
    earningsThisWeek: 42,
    streak: 7,
    level: 2,
    nextLevelReports: 25,
  })

  const level = getReportLevel(stats.totalReports)
  const nextLevel = getReportLevel(stats.nextLevelReports)
  const progress = ((stats.totalReports - level.minReports) / (nextLevel.minReports - level.minReports)) * 100

  const recentReports: FacilityReport[] = [
    {
      id: "1",
      venueId: "v1",
      venueName: "Central Park Basketball Courts",
      userId: "u1",
      category: "maintenance",
      condition: "good",
      details: "Court surface is in good shape, nets are present",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reward: 8,
      status: "verified",
    },
    {
      id: "2",
      venueId: "v2",
      venueName: "Riverside Tennis Club",
      userId: "u1",
      category: "crowd",
      condition: "excellent",
      details: "4 players currently, moderate activity",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      reward: 3,
      status: "verified",
    },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Reporting Dashboard</Text>
            <TouchableOpacity onPress={() => router.push("/ambassador/apply")}>
              <Ionicons name="star" size={24} color="#7ED957" />
            </TouchableOpacity>
          </View>

          <View className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <Text className="text-4xl mr-3">{level.badge}</Text>
              <View>
                <Text className="text-foreground font-bold text-xl">{level.title}</Text>
                <Text className="text-muted-foreground">Level {level.level}</Text>
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-foreground text-sm">Progress to {nextLevel.title}</Text>
                <Text className="text-primary font-bold text-sm">
                  {stats.totalReports}/{nextLevel.minReports}
                </Text>
              </View>
              <View className="bg-muted rounded-full h-2">
                <View className="bg-primary rounded-full h-2" style={{ width: `${progress}%` }} />
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-primary">${stats.totalEarnings}</Text>
                <Text className="text-muted-foreground text-sm">Total Earnings</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-accent">{stats.streak}</Text>
                <Text className="text-muted-foreground text-sm">Day Streak</Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-3xl font-bold text-foreground">{stats.totalReports}</Text>
                <Text className="text-muted-foreground text-sm">Reports</Text>
              </View>
            </View>
          </View>

          <View className="bg-card border border-border rounded-2xl p-6 mb-6">
            <Text className="text-foreground font-bold text-lg mb-4">This Week</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-2xl font-bold text-primary">{stats.reportsThisWeek}</Text>
                <Text className="text-muted-foreground">Reports</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-primary">${stats.earningsThisWeek}</Text>
                <Text className="text-muted-foreground">Earned</Text>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Recent Reports</Text>
            {recentReports.map((report) => (
              <View key={report.id} className="bg-card border border-border rounded-xl p-4 mb-3">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold">{report.venueName}</Text>
                    <Text className="text-muted-foreground text-sm">{report.details}</Text>
                  </View>
                  <View
                    className={`rounded-lg px-3 py-1 ${
                      report.status === "verified"
                        ? "bg-primary/20"
                        : report.status === "pending"
                          ? "bg-accent/20"
                          : "bg-destructive/20"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        report.status === "verified"
                          ? "text-primary"
                          : report.status === "pending"
                            ? "text-accent"
                            : "text-destructive"
                      }`}
                    >
                      {report.status}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-sm">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="cash" size={16} color="#7ED957" />
                    <Text className="text-primary font-bold ml-1">${report.reward}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
