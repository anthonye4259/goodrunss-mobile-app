
import React, { useState } from "react"
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"

export default function PrivacyScreen() {
  // Mock State - In real app, connect to UserPreferencesContext
  const [ghostMode, setGhostMode] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState("public") // public, friends, private
  const [showActivity, setShowActivity] = useState(true)
  const [allowTagging, setAllowTagging] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  const toggleSwitch = (setter: (val: boolean) => void, val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setter(!val)
  }

  const handleVisionExplanation = () => {
    Alert.alert(
      "Ghost Mode 👻",
      "When enabled, your location is hidden from the Live Map and 'Nearby' searches. You can still see venues, but players won't see you.",
      [{ text: "Got it" }]
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Control</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>

          {/* Ghost Mode (Hero Feature) */}
          <View style={styles.ghostCard}>
            <LinearGradient
              colors={ghostMode ? ['#374151', '#1F2937'] : ['#1F2937', '#111']}
              style={styles.ghostGradient}
            >
              <View style={styles.ghostHeader}>
                <View style={styles.ghostIcon}>
                  <Ionicons name={ghostMode ? "eye-off" : "eye"} size={26} color={ghostMode ? "#F87171" : "#7ED957"} />
                </View>
                <View style={styles.ghostText}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.ghostTitle}>Ghost Mode</Text>
                    <TouchableOpacity onPress={handleVisionExplanation}>
                      <Ionicons name="information-circle" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.ghostDesc}>
                    {ghostMode ? "You are invisible on the map." : "You are visible to nearby players."}
                  </Text>
                </View>
                <Switch
                  value={ghostMode}
                  onValueChange={(val) => toggleSwitch(setGhostMode, ghostMode)}
                  trackColor={{ false: "#374151", true: "#DC2626" }} // Red for Ghost Mode active
                  thumbColor="#FFF"
                />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Visibility</Text>

          <View style={styles.settingsGroup}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Who can see my profile?</Text>
                <Text style={styles.rowDesc}>Control who views your stats & history.</Text>
              </View>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => {
                  // Cycle for demo: Public -> Friends -> Private
                  const next = profileVisibility === 'public' ? 'friends' : profileVisibility === 'friends' ? 'private' : 'public'
                  setProfileVisibility(next)
                  Haptics.selectionAsync()
                }}
              >
                <Text style={styles.selectText}>
                  {profileVisibility === 'public' ? 'Everyone' : profileVisibility === 'friends' ? 'Friends' : 'Only Me'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Activity Status</Text>
                <Text style={styles.rowDesc}>Show when you're online or in-game.</Text>
              </View>
              <Switch
                value={showActivity}
                onValueChange={(val) => toggleSwitch(setShowActivity, showActivity)}
                trackColor={{ false: "#374151", true: "#7ED957" }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Interactions</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Allow Tagging</Text>
                <Text style={styles.rowDesc}>Friends can tag you in posts/games.</Text>
              </View>
              <Switch
                value={allowTagging}
                onValueChange={(val) => toggleSwitch(setAllowTagging, allowTagging)}
                trackColor={{ false: "#374151", true: "#3B82F6" }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Data & Safety</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Blocked Users</Text>
                <Text style={styles.rowDesc}>Manage 3 blocked accounts.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </View>

          <Text style={styles.footnote}>
            Changes are auto-saved. Your privacy is our top priority.
          </Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  content: { flex: 1, padding: 20 },

  ghostCard: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  ghostGradient: { padding: 20 },
  ghostHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ghostIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center'
  },
  ghostText: { flex: 1 },
  ghostTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  ghostDesc: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },

  sectionTitle: {
    color: '#6B7280', fontSize: 12, fontWeight: 'bold', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 12, marginLeft: 4
  },
  settingsGroup: {
    backgroundColor: '#111', borderRadius: 16, padding: 4, marginBottom: 24,
    borderWidth: 1, borderColor: '#222'
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16
  },
  rowInfo: { flex: 1, paddingRight: 10 },
  rowTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  rowDesc: { color: '#6B7280', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#222', marginLeft: 16 },

  selectBtn: {
    backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8
  },
  selectText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  footnote: { textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 10, paddingBottom: 40 }
})
