
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

type SubscriptionPlan = "monthly" | "yearly"

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("yearly")

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedPlan(plan)
  }

  const handleStartTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    // TODO: Connect to Stripe backend for subscription
    console.log("[v0] Starting trial with plan:", selectedPlan)
    router.back()
  }

  const monthlyPrice = 9.99
  const yearlyPrice = 59.99
  const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2)

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Text className="text-foreground font-bold text-3xl mb-2">Start your 7-day FREE{"\n"}trial to continue.</Text>
        </View>

        {/* Timeline */}
        <View className="px-6 mb-8">
          {/* Today */}
          <View className="flex-row mb-6">
            <View className="items-center mr-4">
              <View className="bg-primary rounded-full w-10 h-10 items-center justify-center">
                <Ionicons name="checkmark" size={20} color="#000" />
              </View>
              <View className="bg-border w-0.5 flex-1 mt-2" />
            </View>
            <View className="flex-1 pb-4">
              <Text className="text-foreground font-bold text-lg mb-1">Today</Text>
              <Text className="text-muted-foreground">
                Unlock the app's features like AI court finder, trainer booking, and player alerts
              </Text>
            </View>
          </View>

          {/* In 5 Days - Reminder */}
          <View className="flex-row mb-6">
            <View className="items-center mr-4">
              <View className="bg-primary rounded-full w-10 h-10 items-center justify-center">
                <Ionicons name="mail" size={20} color="#000" />
              </View>
              <View className="bg-border w-0.5 flex-1 mt-2" />
            </View>
            <View className="flex-1 pb-4">
              <Text className="text-foreground font-bold text-lg mb-1">In 5 Days - Reminder</Text>
              <Text className="text-muted-foreground">
                We'll email you a reminder so you can cancel anytime before billing
              </Text>
            </View>
          </View>

          {/* In 7 Days - Billing Starts */}
          <View className="flex-row">
            <View className="items-center mr-4">
              <View className="bg-muted-foreground rounded-full w-10 h-10 items-center justify-center">
                <Ionicons name="card" size={20} color="#000" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-lg mb-1">In 7 Days - Billing Starts</Text>
              <Text className="text-muted-foreground">You'll be charged only if you don't cancel anytime before</Text>
            </View>
          </View>
        </View>

        {/* Subscription Plans */}
        <View className="px-6 mb-6">
          {/* Monthly Plan */}
          <TouchableOpacity
            onPress={() => handlePlanSelect("monthly")}
            className={`rounded-2xl p-5 mb-4 border-2 ${
              selectedPlan === "monthly" ? "bg-card border-primary" : "bg-card/50 border-border"
            }`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg mb-1">Monthly</Text>
                <Text className="text-muted-foreground text-sm">${monthlyPrice}/month</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlan === "monthly" ? "bg-primary border-primary" : "border-border"
                }`}
              >
                {selectedPlan === "monthly" && <Ionicons name="checkmark" size={16} color="#000" />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity
            onPress={() => handlePlanSelect("yearly")}
            className={`rounded-2xl p-5 border-2 ${
              selectedPlan === "yearly" ? "bg-foreground border-foreground" : "bg-card/50 border-border"
            }`}
            activeOpacity={0.8}
          >
            <View className="absolute -top-3 right-4 bg-primary rounded-full px-3 py-1">
              <Text className="text-black font-bold text-xs">BEST VALUE</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className={`font-bold text-lg mb-1 ${
                    selectedPlan === "yearly" ? "text-background" : "text-foreground"
                  }`}
                >
                  Yearly
                </Text>
                <Text
                  className={`text-sm ${selectedPlan === "yearly" ? "text-background/70" : "text-muted-foreground"}`}
                >
                  ${yearlyPrice}/year (${yearlyMonthlyEquivalent}/mo)
                </Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlan === "yearly" ? "bg-primary border-primary" : "bg-transparent border-border"
                }`}
              >
                {selectedPlan === "yearly" && <Ionicons name="checkmark" size={16} color="#000" />}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* No Payment Due Now */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
            <Text className="text-foreground font-semibold ml-2">No Payment Due Now</Text>
          </View>
        </View>

        {/* CTA Button */}
        <View className="px-6 mb-4">
          <TouchableOpacity
            onPress={handleStartTrial}
            className="bg-foreground rounded-2xl py-5 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-background font-bold text-lg">Start My 7-Day Free Trial</Text>
          </TouchableOpacity>
        </View>

        {/* Pricing Details */}
        <View className="px-6">
          <Text className="text-muted-foreground text-center text-sm">
            7 days free, then ${selectedPlan === "monthly" ? monthlyPrice : yearlyPrice} per{" "}
            {selectedPlan === "monthly" ? "month" : "year"}
            {selectedPlan === "yearly" && ` ($${yearlyMonthlyEquivalent}/mo)`}
          </Text>
          <Text className="text-muted-foreground text-center text-xs mt-2">Cancel anytime. Terms apply.</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
