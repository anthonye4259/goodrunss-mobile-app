import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

export default function DetailedStatsScreen() {
  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Detailed Stats</Text>
          </View>
        </View>

        {/* Monthly Progress */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Monthly Progress</Text>
          <View className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between mb-6">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Sessions This Month</Text>
                <Text className="text-foreground text-3xl font-bold">28</Text>
              </View>
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Total Hours</Text>
                <Text className="text-foreground text-3xl font-bold">42</Text>
              </View>
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Calories</Text>
                <Text className="text-foreground text-3xl font-bold">8.2k</Text>
              </View>
            </View>

            {/* Graph placeholder */}
            <View className="bg-muted/30 rounded-xl h-48 items-center justify-center mb-4">
              <Ionicons name="bar-chart" size={64} color="#666" />
              <Text className="text-muted-foreground mt-2">Activity Graph</Text>
            </View>

            <View className="flex-row items-center justify-between bg-primary/10 rounded-xl p-4">
              <Ionicons name="trending-up" size={24} color="#7ED957" />
              <Text className="text-primary font-semibold">+23% from last month</Text>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Personal Records</Text>
          <View className="bg-card border border-border rounded-2xl p-4 space-y-3">
            {[
              { title: "Longest Session", value: "2.5 hours", date: "Mar 15, 2025" },
              { title: "Most Calories Burned", value: "850 cal", date: "Mar 8, 2025" },
              { title: "Best Performance Score", value: "94/100", date: "Mar 20, 2025" },
            ].map((record, index) => (
              <View key={index} className="flex-row items-center justify-between py-3 border-b border-border">
                <View>
                  <Text className="text-foreground font-bold">{record.title}</Text>
                  <Text className="text-muted-foreground text-sm">{record.date}</Text>
                </View>
                <Text className="text-primary font-bold text-lg">{record.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
