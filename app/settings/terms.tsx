"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

export default function TermsScreen() {
  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Terms & Privacy</Text>
        </View>

        {/* Content */}
        <View className="px-6 gap-4">
          <TouchableOpacity className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg mb-1">Terms of Service</Text>
                <Text className="text-muted-foreground text-sm">Last updated: January 2025</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg mb-1">Privacy Policy</Text>
                <Text className="text-muted-foreground text-sm">Last updated: January 2025</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-card border border-border rounded-2xl p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg mb-1">Cookie Policy</Text>
                <Text className="text-muted-foreground text-sm">Last updated: January 2025</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
