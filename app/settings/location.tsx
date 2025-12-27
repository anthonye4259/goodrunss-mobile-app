import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import * as Location from "expo-location"
import Slider from "@react-native-community/slider"

import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"

const DISTANCE_OPTIONS = [1, 5, 10, 25, 50, 100]

export default function LocationSettingsScreen() {
  const { preferences, setPreferences } = useUserPreferences()
  const { location, requestLocation, loading } = useLocation()
  const [searchRadius, setSearchRadius] = useState(preferences.searchRadius || 10)
  const [locationPermission, setLocationPermission] = useState<"denied" | "foreground" | "always">("denied")
  const [checkingPermission, setCheckingPermission] = useState(true)

  useEffect(() => {
    checkLocationPermission()
  }, [])

  const checkLocationPermission = async () => {
    setCheckingPermission(true)
    try {
      const { status: foreground } = await Location.getForegroundPermissionsAsync()
      const { status: background } = await Location.getBackgroundPermissionsAsync()

      if (background === "granted") {
        setLocationPermission("always")
      } else if (foreground === "granted") {
        setLocationPermission("foreground")
      } else {
        setLocationPermission("denied")
      }
    } catch (error) {
      console.log("Permission check error:", error)
    }
    setCheckingPermission(false)
  }

  const handleRequestAlwaysLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // First request foreground if not granted
    const { status: foreground } = await Location.requestForegroundPermissionsAsync()
    if (foreground !== "granted") {
      Alert.alert(
        "Location Required",
        "GoodRunss needs your location to find courts and players near you. Please enable location in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      )
      return
    }

    // Then request background (always)
    const { status: background } = await Location.requestBackgroundPermissionsAsync()
    if (background === "granted") {
      setLocationPermission("always")
      setPreferences({ locationAlwaysOn: true })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert("🎉 Perfect!", "You'll now see the most accurate nearby courts and players, even when the app is in the background.")
    } else {
      // Direct to settings if they declined
      Alert.alert(
        "Enable 'Always' Location",
        "For the best experience, allow GoodRunss to access your location 'Always'. This helps us:\n\n• Show nearby courts in real-time\n• Alert you when friends are playing\n• Find pickup games automatically",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }

  const handleSaveRadius = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPreferences({ searchRadius })
    Alert.alert("Saved!", `Showing courts and players within ${searchRadius} miles.`)
  }

  const getPermissionColor = () => {
    switch (locationPermission) {
      case "always": return "#22C55E"
      case "foreground": return "#FBBF24"
      default: return "#EF4444"
    }
  }

  const getPermissionLabel = () => {
    switch (locationPermission) {
      case "always": return "Always On ✓"
      case "foreground": return "While Using App"
      default: return "Denied"
    }
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Location Settings</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Location Permission Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location Access</Text>
            <View style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <View style={[styles.permissionDot, { backgroundColor: getPermissionColor() }]} />
                <Text style={[styles.permissionStatus, { color: getPermissionColor() }]}>
                  {getPermissionLabel()}
                </Text>
              </View>

              {locationPermission !== "always" && (
                <>
                  <Text style={styles.permissionDescription}>
                    {locationPermission === "foreground"
                      ? "Upgrade to 'Always' for the best experience. Get real-time alerts when friends are playing nearby!"
                      : "Enable location to find courts, players, and trainers near you."
                    }
                  </Text>

                  <View style={styles.benefitsList}>
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                      <Text style={styles.benefitText}>See courts within your radius</Text>
                    </View>
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                      <Text style={styles.benefitText}>Get notified when friends play</Text>
                    </View>
                    <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                      <Text style={styles.benefitText}>Auto-detect court for reports</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.enableButton}
                    onPress={handleRequestAlwaysLocation}
                  >
                    <LinearGradient
                      colors={["#7ED957", "#65A30D"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.enableButtonGradient}
                    >
                      <Ionicons name="location" size={20} color="#000" />
                      <Text style={styles.enableButtonText}>
                        {locationPermission === "foreground" ? "Enable Always On" : "Enable Location"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {locationPermission === "always" && (
                <View style={styles.enabledCheck}>
                  <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                  <Text style={styles.enabledText}>Location is set up perfectly!</Text>
                </View>
              )}
            </View>
          </View>

          {/* Distance Radius Slider - Like Tinder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Search Radius</Text>
            <View style={styles.radiusCard}>
              <View style={styles.radiusHeader}>
                <Text style={styles.radiusLabel}>Show courts within</Text>
                <Text style={styles.radiusValue}>{searchRadius} miles</Text>
              </View>

              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={searchRadius}
                onValueChange={(value) => setSearchRadius(value)}
                minimumTrackTintColor="#7ED957"
                maximumTrackTintColor="#333"
                thumbTintColor="#7ED957"
              />

              <View style={styles.radiusMarkers}>
                <Text style={styles.radiusMarker}>1 mi</Text>
                <Text style={styles.radiusMarker}>25 mi</Text>
                <Text style={styles.radiusMarker}>50 mi</Text>
                <Text style={styles.radiusMarker}>100 mi</Text>
              </View>

              {/* Quick preset buttons */}
              <View style={styles.presetContainer}>
                {DISTANCE_OPTIONS.map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.presetButton,
                      searchRadius === distance && styles.presetButtonActive
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setSearchRadius(distance)
                    }}
                  >
                    <Text style={[
                      styles.presetText,
                      searchRadius === distance && styles.presetTextActive
                    ]}>{distance} mi</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveRadius}
              >
                <Text style={styles.saveButtonText}>Save Distance</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Current Location */}
          {location && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📌 Current Location</Text>
              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <Ionicons name="navigate" size={20} color="#7ED957" />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationCity}>
                      {location.city || preferences.city || "Unknown City"}
                    </Text>
                    <Text style={styles.locationState}>
                      {location.state || preferences.state || ""}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    requestLocation()
                  }}
                >
                  <Ionicons name="refresh" size={20} color="#7ED957" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 12,
  },
  permissionCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#252525",
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  permissionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  permissionStatus: {
    fontSize: 16,
    fontWeight: "700",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 10,
  },
  enableButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  enableButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  enableButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  enabledCheck: {
    alignItems: "center",
    paddingVertical: 16,
  },
  enabledText: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  radiusCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#252525",
  },
  radiusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  radiusLabel: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  radiusValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#7ED957",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  radiusMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  radiusMarker: {
    fontSize: 11,
    color: "#666",
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: "#333",
  },
  presetButtonActive: {
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    borderColor: "#7ED957",
  },
  presetText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  presetTextActive: {
    color: "#7ED957",
  },
  saveButton: {
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  locationCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#252525",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationCity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  locationState: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
})
