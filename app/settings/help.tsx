
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"

const SUPPORT_EMAIL = "helpdesk@teamgoodrunss.com"

export default function HelpScreen() {
  const helpTopics = [
    { title: "Getting Started", icon: "rocket", articles: 8 },
    { title: "Booking & Payments", icon: "card", articles: 12 },
    { title: "Account Settings", icon: "settings", articles: 6 },
    { title: "Troubleshooting", icon: "construct", articles: 15 },
  ]

  const handleEmailSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=GoodRunss Support Request`)
      .catch(() => {
        Alert.alert(
          "Contact Support",
          `Email us at:\n\n${SUPPORT_EMAIL}\n\nWe respond within 24 hours!`,
          [{ text: "OK" }]
        )
      })
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 24/7 Support Banner */}
          <View style={styles.supportBanner}>
            <LinearGradient
              colors={["rgba(126, 217, 87, 0.15)", "rgba(126, 217, 87, 0.05)"]}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerIcon}>
                <Ionicons name="headset" size={28} color="#7ED957" />
              </View>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>24/7 Support Team</Text>
                <Text style={styles.bannerSubtitle}>We're here to help anytime</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Contact Options */}
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport}>
            <View style={[styles.contactIcon, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
              <Ionicons name="mail" size={24} color="#3B82F6" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactEmail}>{SUPPORT_EMAIL}</Text>
              <Text style={styles.contactResponse}>Usually responds within 24 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push("/(tabs)/gia")
            }}
          >
            <View style={[styles.contactIcon, { backgroundColor: "rgba(126, 217, 87, 0.15)" }]}>
              <Ionicons name="chatbubbles" size={24} color="#7ED957" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat with GIA</Text>
              <Text style={styles.contactSubtitle}>AI Assistant for quick answers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Help Topics */}
          <Text style={styles.sectionTitle}>Help Topics</Text>

          {helpTopics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              style={styles.topicCard}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.topicIcon}>
                <Ionicons name={topic.icon as any} size={22} color="#7ED957" />
              </View>
              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicArticles}>{topic.articles} articles</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}

          {/* Emergency Support */}
          <View style={styles.emergencyCard}>
            <Ionicons name="alert-circle" size={20} color="#FBBF24" />
            <Text style={styles.emergencyText}>
              For urgent issues or billing problems, email us with "URGENT" in the subject line for priority response.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },

  supportBanner: {
    marginVertical: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.3)",
  },
  bannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bannerContent: {},
  bannerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  bannerSubtitle: { fontSize: 14, color: "#7ED957" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: "600", color: "#FFF", marginBottom: 2 },
  contactEmail: { fontSize: 14, color: "#7ED957", marginBottom: 2 },
  contactSubtitle: { fontSize: 13, color: "#888" },
  contactResponse: { fontSize: 12, color: "#666" },

  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#222",
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicInfo: { flex: 1 },
  topicTitle: { fontSize: 15, fontWeight: "600", color: "#FFF" },
  topicArticles: { fontSize: 12, color: "#666", marginTop: 2 },

  emergencyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  emergencyText: { flex: 1, fontSize: 13, color: "#FBBF24", lineHeight: 18 },
})
