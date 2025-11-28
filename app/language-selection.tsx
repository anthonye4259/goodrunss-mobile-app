
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useTranslation } from "react-i18next"
import * as Haptics from "expo-haptics"

const LANGUAGES = [
  { code: "ar", name: "Arabic", nativeName: "عربي", region: "Saudi Arabia" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "Bangladesh" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "中文", region: "China" },
  { code: "en", name: "English", nativeName: "English", region: "United States" },
  { code: "fr", name: "French", nativeName: "Français", region: "France" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", region: "India" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "Brazil" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "Russia" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "Spain" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "Pakistan" },
]

export default function LanguageSelection() {
  const router = useRouter()
  const { i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en")
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const selectedLang = LANGUAGES.find((lang) => lang.code === selectedLanguage) || LANGUAGES[3]

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLanguageSelect = async (languageCode: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedLanguage(languageCode)
    setShowDropdown(false)
    await i18n.changeLanguage(languageCode)
  }

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await AsyncStorage.setItem("selectedLanguage", selectedLanguage)
    router.replace("/onboarding/gia-intro")
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* GoodRunss Logo/Icon */}
        <View className="w-16 h-16 bg-lime-500 rounded-full items-center justify-center mb-8">
          <Ionicons name="fitness" size={32} color="white" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Select Your Language</Text>
        <Text className="text-base text-gray-500 mb-8 text-center">Choose your preferred language to continue</Text>

        {/* Language Selector Card */}
        <View className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Selected Language Button */}
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="globe-outline" size={24} color="#84CC16" />
              <View>
                <Text className="text-lg font-semibold text-gray-900">{selectedLang.name}</Text>
                <Text className="text-sm text-gray-500">{selectedLang.region}</Text>
              </View>
            </View>
            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Search Bar */}
          {showDropdown && (
            <View className="px-5 py-3 border-b border-gray-200">
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-base text-gray-900"
                />
              </View>
            </View>
          )}

          {/* Language List */}
          {showDropdown && (
            <ScrollView className="max-h-96">
              {filteredLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language.code)}
                  className={`px-5 py-4 border-b border-gray-100 ${
                    selectedLanguage === language.code ? "bg-lime-50" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-medium text-gray-900">{language.name}</Text>
                      <Text className="text-sm text-gray-500 mt-0.5">{language.nativeName}</Text>
                    </View>
                    {selectedLanguage === language.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#84CC16" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          className="w-full max-w-md bg-lime-500 rounded-full py-4 mt-8 shadow-lg"
        >
          <Text className="text-white text-center text-lg font-semibold">Continue</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text className="text-sm text-gray-400 mt-6 text-center">You can change this later in settings</Text>
      </View>
    </SafeAreaView>
  )
}
