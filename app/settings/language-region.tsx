
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import * as Haptics from "expo-haptics"
import { useTranslation } from "react-i18next"
import {
  setGlobalSettings,
  getGlobalSettings,
  type Currency,
  type DistanceUnit,
  formatCurrency,
  formatDistance,
} from "@/lib/global-format"

export default function LanguageRegionSettings() {
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState(getGlobalSettings())

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ]

  const currencies: { code: Currency; name: string; example: string }[] = [
    { code: "USD", name: "US Dollar", example: "$50" },
    { code: "EUR", name: "Euro", example: "€50" },
    { code: "GBP", name: "British Pound", example: "£50" },
    { code: "JPY", name: "Japanese Yen", example: "¥5000" },
    { code: "CNY", name: "Chinese Yuan", example: "¥350" },
    { code: "INR", name: "Indian Rupee", example: "₹4000" },
    { code: "BRL", name: "Brazilian Real", example: "R$250" },
    { code: "MXN", name: "Mexican Peso", example: "$1000" },
    { code: "CAD", name: "Canadian Dollar", example: "C$65" },
    { code: "AUD", name: "Australian Dollar", example: "A$75" },
  ]

  const updateLanguage = async (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await i18n.changeLanguage(code)
  }

  const updateCurrency = (code: Currency) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const newSettings = { ...settings, currency: code }
    setSettings(newSettings)
    setGlobalSettings(newSettings)
  }

  const updateDistanceUnit = (unit: DistanceUnit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const newSettings = { ...settings, distanceUnit: unit, weightUnit: unit === "miles" ? "lbs" : "kg" }
    setSettings(newSettings)
    setGlobalSettings(newSettings)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Header */}
        <View className="px-6 pt-16 pb-6 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#7ED957" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Language & Region</Text>
        </View>

        {/* Language Selection */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Language</Text>
          <View className="glass-card rounded-2xl overflow-hidden">
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                className={`flex-row items-center justify-between p-4 ${
                  index !== languages.length - 1 ? "border-b border-border" : ""
                }`}
                onPress={() => updateLanguage(lang.code)}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">{lang.flag}</Text>
                  <Text className="text-foreground font-medium">{lang.name}</Text>
                </View>
                {i18n.language === lang.code && <Ionicons name="checkmark-circle" size={24} color="#7ED957" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency Selection */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Currency</Text>
          <View className="glass-card rounded-2xl overflow-hidden">
            {currencies.map((curr, index) => (
              <TouchableOpacity
                key={curr.code}
                className={`flex-row items-center justify-between p-4 ${
                  index !== currencies.length - 1 ? "border-b border-border" : ""
                }`}
                onPress={() => updateCurrency(curr.code)}
              >
                <View>
                  <Text className="text-foreground font-medium">{curr.name}</Text>
                  <Text className="text-muted-foreground text-sm">{curr.example}</Text>
                </View>
                {settings.currency === curr.code && <Ionicons name="checkmark-circle" size={24} color="#7ED957" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance Unit Selection */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Distance Unit</Text>
          <View className="glass-card rounded-2xl overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-border"
              onPress={() => updateDistanceUnit("miles")}
            >
              <View>
                <Text className="text-foreground font-medium">Miles</Text>
                <Text className="text-muted-foreground text-sm">Used in US, UK</Text>
              </View>
              {settings.distanceUnit === "miles" && <Ionicons name="checkmark-circle" size={24} color="#7ED957" />}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => updateDistanceUnit("kilometers")}
            >
              <View>
                <Text className="text-foreground font-medium">Kilometers</Text>
                <Text className="text-muted-foreground text-sm">Used globally</Text>
              </View>
              {settings.distanceUnit === "kilometers" && <Ionicons name="checkmark-circle" size={24} color="#7ED957" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview */}
        <View className="px-6">
          <Text className="text-lg font-bold text-foreground mb-3">Preview</Text>
          <View className="glass-card rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-muted-foreground">Trainer Session:</Text>
              <Text className="text-foreground font-bold">{formatCurrency(75)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-muted-foreground">Distance to venue:</Text>
              <Text className="text-foreground font-bold">{formatDistance(2.5)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground">Today:</Text>
              <Text className="text-foreground font-bold">
                {new Date().toLocaleDateString(settings.locale, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
