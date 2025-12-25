import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { useLocation } from "@/lib/location-context"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"
import { TrainerBookingModal } from "@/components/trainer-booking-modal"
import { ShareProfileCard } from "@/components/share-profile-card"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { SafeAreaView } from "react-native-safe-area-context"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"

const { width } = Dimensions.get("window")

export default function TrainerDetailScreen() {
  const { id } = useLocalSearchParams()
  const { preferences } = useUserPreferences()
  const { calculateDistance } = useLocation()
  const { isAuthenticated } = useAuth()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const primaryActivity = getPrimaryActivity(preferences.activities)
  const content = getActivityContent(primaryActivity)
  const trainer = content?.sampleTrainers?.[0] || {
    name: "Coach",
    rating: 4.5,
    reviews: 50,
    price: 75,
    location: "Local Sports Center",
    specialties: ["Training"],
    bio: "Professional coach",
    certifications: ["Certified"]
  }

  const distance = calculateDistance(40.7589, -73.9851)
  const isOwnProfile = preferences.userType === "trainer"

  const stats = [
    { label: "Sessions", value: "320+", icon: "fitness" },
    { label: "Experience", value: "8 yrs", icon: "trophy" },
    { label: "Response", value: "<1hr", icon: "time" },
  ]

  const startChat = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    router.push(`/chat/${id}`)
  }

  const handleBooking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    setShowBookingModal(true)
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop" }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(10,10,10,0.8)", "#0A0A0A"]}
            style={styles.heroGradient}
          />

          {/* Back Button */}
          <SafeAreaView style={styles.headerBar} edges={["top"]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Profile Info Overlay */}
          <View style={styles.profileOverlay}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={["#7ED957", "#5CB33D"]} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{trainer.name.charAt(0)}</Text>
              </LinearGradient>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#7ED957" />
              </View>
            </View>
            <Text style={styles.trainerName}>{trainer.name}</Text>
            <Text style={styles.trainerTagline}>Professional {content.trainerTitle}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>{trainer.rating}</Text>
              <Text style={styles.reviewCount}>({trainer.reviews} reviews)</Text>
              {distance && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.distanceText}>{distance.toFixed(1)} mi</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name={stat.icon as any} size={18} color="#7ED957" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.bioText}>{trainer.bio}</Text>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.chipRow}>
            {trainer.specialties.map((specialty, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.card}>
            {trainer.certifications.map((cert, index) => (
              <View key={index} style={[styles.certRow, index < trainer.certifications.length - 1 && styles.certBorder]}>
                <View style={styles.certIcon}>
                  <Ionicons name="ribbon" size={16} color="#7ED957" />
                </View>
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <LinearGradient colors={["#1A1A1A", "#111"]} style={styles.pricingCard}>
            <View>
              <Text style={styles.priceLabel}>Per Session</Text>
              <Text style={styles.priceValue}>${trainer.price}</Text>
            </View>
            <View style={styles.priceMeta}>
              <Text style={styles.priceMetaText}>60 min</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Best Value</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Reviews Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.reviewItem}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>J</Text>
              </View>
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>John D.</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={12} color="#FBBF24" />
                    <Text style={styles.reviewRatingText}>5.0</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>
                  Excellent {content.trainerTitle.toLowerCase()}! Really helped improve my technique.
                </Text>
                <Text style={styles.reviewDate}>2 days ago</Text>
              </View>
            </View>
          </View>
        </View>

        {isOwnProfile && (
          <ShareProfileCard trainerName={trainer.name} trainerId={id as string} activity={primaryActivity} />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <BlurView intensity={80} tint="dark" style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} onPress={startChat}>
          <Ionicons name="chatbubble-outline" size={22} color="#7ED957" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBooking}>
          <LinearGradient colors={["#7ED957", "#5CB33D"]} style={styles.bookBtnGradient}>
            <Text style={styles.bookBtnText}>Book Session • ${trainer.price}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>

      <TrainerBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        trainer={{
          name: trainer.name,
          price: trainer.price,
          activity: primaryActivity,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  scrollView: { flex: 1 },

  // Hero
  heroContainer: { height: 340, position: "relative" },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "80%" },
  headerBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  shareBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },

  profileOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center", paddingBottom: 20 },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatarGradient: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#0A0A0A" },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#000" },
  verifiedBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#0A0A0A", borderRadius: 12 },
  trainerName: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginBottom: 4 },
  trainerTagline: { fontSize: 14, color: "#999", marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "600", color: "#FFF", marginLeft: 4 },
  reviewCount: { fontSize: 13, color: "#999" },
  dot: { color: "#666", marginHorizontal: 6 },
  distanceText: { fontSize: 13, color: "#999", marginLeft: 2 },

  // Stats
  statsRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: -20, gap: 10 },
  statCard: { flex: 1, backgroundColor: "#1A1A1A", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#222" },
  statIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(126,217,87,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  statLabel: { fontSize: 11, color: "#666", marginTop: 2 },

  // Sections
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF", marginBottom: 12 },
  seeAll: { fontSize: 13, color: "#7ED957", fontWeight: "600" },
  card: { backgroundColor: "#1A1A1A", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#222" },
  bioText: { fontSize: 14, color: "#CCC", lineHeight: 22 },

  // Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(126,217,87,0.15)", borderWidth: 1, borderColor: "rgba(126,217,87,0.3)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: "#7ED957", fontSize: 13, fontWeight: "600" },

  // Certifications
  certRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  certBorder: { borderBottomWidth: 1, borderBottomColor: "#222" },
  certIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(126,217,87,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  certText: { fontSize: 14, color: "#FFF" },

  // Pricing
  pricingCard: { borderRadius: 16, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#222" },
  priceLabel: { fontSize: 12, color: "#999", marginBottom: 4 },
  priceValue: { fontSize: 32, fontWeight: "bold", color: "#7ED957" },
  priceMeta: { alignItems: "flex-end" },
  priceMetaText: { fontSize: 13, color: "#999", marginBottom: 8 },
  priceBadge: { backgroundColor: "rgba(126,217,87,0.15)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  priceBadgeText: { fontSize: 11, color: "#7ED957", fontWeight: "600" },

  // Reviews
  reviewItem: { flexDirection: "row" },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#222", alignItems: "center", justifyContent: "center", marginRight: 12 },
  reviewAvatarText: { fontSize: 16, fontWeight: "bold", color: "#7ED957" },
  reviewContent: { flex: 1 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  reviewName: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  reviewRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewRatingText: { fontSize: 12, color: "#FFF" },
  reviewText: { fontSize: 13, color: "#AAA", lineHeight: 20, marginBottom: 6 },
  reviewDate: { fontSize: 11, color: "#666" },

  // Bottom Bar
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 12, borderTopWidth: 1, borderTopColor: "#222" },
  chatBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(126,217,87,0.1)", borderWidth: 1, borderColor: "rgba(126,217,87,0.3)", alignItems: "center", justifyContent: "center" },
  bookBtn: { flex: 1, borderRadius: 16, overflow: "hidden" },
  bookBtnGradient: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  bookBtnText: { fontSize: 16, fontWeight: "bold", color: "#000" },
})
