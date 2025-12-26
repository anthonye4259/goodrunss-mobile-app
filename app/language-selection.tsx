import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, Image } from "react-native"
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
  const { i18n, t } = useTranslation()
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* GoodRunss Logo/Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/goodrunss-logo-white.png")}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('selectLanguage')}</Text>
        <Text style={styles.subtitle}>{t('selectLanguage')}</Text>

        {/* Language Selector Card */}
        <View style={styles.card}>
          {/* Selected Language Button */}
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            style={styles.selectedButton}
          >
            <View style={styles.selectedRow}>
              <Ionicons name="globe-outline" size={24} color="#7ED957" />
              <View style={styles.selectedText}>
                <Text style={styles.selectedName}>{selectedLang.name}</Text>
                <Text style={styles.selectedRegion}>{selectedLang.region}</Text>
              </View>
            </View>
            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Search Bar */}
          {showDropdown && (
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('search')}
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>
            </View>
          )}

          {/* Language List */}
          {showDropdown && (
            <ScrollView style={styles.languageList}>
              {filteredLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language.code)}
                  style={[
                    styles.languageItem,
                    selectedLanguage === language.code && styles.languageItemSelected
                  ]}
                >
                  <View style={styles.languageItemContent}>
                    <View>
                      <Text style={styles.languageName}>{language.name}</Text>
                      <Text style={styles.languageNative}>{language.nativeName}</Text>
                    </View>
                    {selectedLanguage === language.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
          <Text style={styles.continueText}>{t('continue')}</Text>
        </TouchableOpacity>

        {/* Facility Owner Entry */}
        <TouchableOpacity
          onPress={() => router.push("/facility/onboarding-v2")}
          style={styles.facilityButton}
        >
          <Ionicons name="business-outline" size={20} color="#FFD700" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.facilityText}>I manage a Facility</Text>
            <Text style={styles.facilitySubtext}>Owner or manager? List your courts or studios</Text>
          </View>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footer}>{t('selectLanguage')}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#7ED957",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 32,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  selectedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedText: {
    marginLeft: 12,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  selectedRegion: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  languageItemSelected: {
    backgroundColor: "#1a2e0a",
  },
  languageItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  languageNative: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#7ED957",
    borderRadius: 50,
    paddingVertical: 16,
    marginTop: 32,
  },
  continueText: {
    color: "#000000",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    fontSize: 14,
    color: "#666",
    marginTop: 24,
    textAlign: "center",
  },
  facilityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    width: "100%",
  },
  facilityText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "600",
  },
  facilitySubtext: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
})
