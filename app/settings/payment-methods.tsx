"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

export default function PaymentMethodsScreen() {
  const paymentMethods = [
    { id: 1, type: "card", last4: "4242", brand: "Visa", isDefault: true },
    { id: 2, type: "card", last4: "5555", brand: "Mastercard", isDefault: false },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground mb-2">Payment Methods</Text>
        </View>

        {/* Payment Methods */}
        <View className="px-6 gap-4">
          {paymentMethods.map((method) => (
            <View key={method.id} className="bg-card border border-border rounded-2xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="card" size={24} color="#7ED957" />
                  <View className="ml-4">
                    <Text className="text-foreground font-bold">{method.brand}</Text>
                    <Text className="text-muted-foreground">•••• {method.last4}</Text>
                  </View>
                </View>
                {method.isDefault && (
                  <View className="bg-primary/20 rounded-lg px-3 py-1">
                    <Text className="text-primary text-xs font-semibold">Default</Text>
                  </View>
                )}
              </View>
              <View className="flex-row gap-2">
                {!method.isDefault && (
                  <TouchableOpacity
                    className="flex-1 bg-primary rounded-xl py-3"
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  >
                    <Text className="text-background font-bold text-center">Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="bg-card border border-destructive rounded-xl px-4 py-3"
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <Text className="text-destructive font-bold">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Ionicons name="add" size={24} color="#000" />
            <Text className="text-background font-bold ml-2">Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
