import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { subscriptionService, type SubscriptionPeriod } from "@/lib/services/subscription-service"

type PlanPeriod = "monthly" | "3months" | "6months"

interface Plan {
  id: PlanPeriod
  name: string
  price: number
  perMonth: number
  savings?: string
  popular?: boolean
}

const PLANS: Plan[] = [
  { id: "6months", name: "6 Months", price: 75, perMonth: 12.50, savings: "Save 17%" },
  { id: "3months", name: "3 Months", price: 40, perMonth: 13.33, savings: "Save 11%", popular: true },
  { id: "monthly", name: "Monthly", price: 15, perMonth: 15, savings: "Flexible" },
]

const FEATURES = [
  { icon: "sparkles", color: "#7ED957", title: "GIA AI Assistant", description: "Your 24/7 business copilot" },
  { icon: "analytics", color: "#8B5CF6", title: "Advanced Analytics", description: "Deep insights into your business" },
  { icon: "people", color: "#06B6D4", title: "Smart Lead Matching", description: "AI finds your ideal clients" },
  { icon: "notifications", color: "#FBBF24", title: "Auto-Reminders", description: "Never miss a client again" },
  { icon: "medal", color: "#EC4899", title: "Priority Placement", description: "Get seen first in search" },
  { icon: "megaphone", color: "#10B981", title: "Bulk Messaging", description: "Reach all clients at once" },
]

export default function ProDashboardScreen() {
  const [selectedPlan, setSelectedPlan] = useState<PlanPeriod>("3months")
  const [isProcessing, setIsProcessing] = useState(false)
  const { isPro, isTrialing, trialDaysRemaining, refresh, isLoading } = useSubscription()

  const handleStartTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsProcessing(true)
    
    try {
      await subscriptionService.startTrial()
      await refresh()
      
      Alert.alert(
        "🎉 Trial Started!",
        "You now have 7 days of Pro access! All premium features are unlocked in the app AND on the web dashboard.",
        [{ text: "Let's Go!", onPress: () => router.back() }]
      )
    } catch (error) {
      Alert.alert("Error", "Failed to start trial. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsProcessing(true)

    try {
      // For now, simulate subscription activation
      // In production, this would open Stripe checkout
      const mockCustomerId = `cus_${Date.now()}`
      const mockSubscriptionId = `sub_${Date.now()}`
      
      await subscriptionService.activateSubscription(
        selectedPlan as SubscriptionPeriod,
        mockCustomerId,
        mockSubscriptionId
      )
      await refresh()

      Alert.alert(
        "🎉 Welcome to Pro!",
        "Your subscription is now active! Premium features are unlocked on BOTH mobile and web dashboard.",
        [{ text: "Awesome!", onPress: () => router.back() }]
      )
    } catch (error) {
      Alert.alert("Error", "Failed to process subscription. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert(
      "Open Web Dashboard",
      "Your Pro subscription works on both mobile and web! Open the dashboard in your browser.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => Linking.openURL("https://dashboard.goodrunss.com") }
      ]
    )
  }

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan)

  // If already Pro, show success state
  if (isPro && !isLoading) {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pro Dashboard</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.proActiveContent}>
            <View style={styles.proActiveCard}>
              <View style={styles.proBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#000" />
                <Text style={styles.proBadgeText}>PRO ACTIVE</Text>
              </View>
              
              <Text style={styles.proActiveTitle}>You're a Pro! 🎉</Text>
              
              {isTrialing && (
                <View style={styles.trialInfo}>
                  <Ionicons name="time" size={16} color="#FBBF24" />
                  <Text style={styles.trialInfoText}>{trialDaysRemaining} days left in trial</Text>
                </View>
              )}
              
              <Text style={styles.proActiveSubtitle}>
                All premium features are unlocked on both mobile and web dashboard.
              </Text>

              <View style={styles.unlockedFeatures}>
                <Text style={styles.unlockedTitle}>✨ Unlocked Features:</Text>
                {FEATURES.map((feature, index) => (
                  <View key={index} style={styles.unlockedRow}>
                    <Ionicons name="checkmark" size={16} color="#7ED957" />
                    <Text style={styles.unlockedText}>{feature.title}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.dashboardButton} onPress={handleOpenDashboard}>
                <Ionicons name="desktop-outline" size={20} color="#FFF" />
                <Text style={styles.dashboardButtonText}>Open Web Dashboard</Text>
                <Ionicons name="open-outline" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  // Regular pricing screen
  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pro Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Ionicons name="rocket" size={14} color="#7ED957" />
              <Text style={styles.heroBadgeText}>GROW YOUR BUSINESS</Text>
            </View>
            <Text style={styles.heroTitle}>Unlock the Full Power of GoodRunss</Text>
            <Text style={styles.heroSubtitle}>
              AI-powered tools to find more clients, save time, and increase your earnings
            </Text>
          </View>

          {/* Sync Banner */}
          <View style={styles.syncBanner}>
            <Ionicons name="sync" size={20} color="#06B6D4" />
            <Text style={styles.syncText}>Subscribe once, use everywhere! Your Pro access syncs between mobile app and web dashboard.</Text>
          </View>

          {/* Dashboard Preview */}
          <View style={styles.previewCard}>
            <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.previewGradient}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>Actual Dashboard Preview</Text>
              </View>
              <View style={styles.previewContent}>
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatValue}>$12,450</Text>
                  <Text style={styles.previewStatLabel}>Monthly Earnings</Text>
                </View>
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatValue}>42</Text>
                  <Text style={styles.previewStatLabel}>Active Clients</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Pricing Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            <View style={styles.plansRow}>
              {PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                    plan.popular && styles.planCardPopular,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setSelectedPlan(plan.id)
                  }}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>${plan.price}</Text>
                  <Text style={styles.planPerMonth}>${plan.perMonth.toFixed(2)}/mo</Text>
                  <Text style={styles.planSavings}>{plan.savings}</Text>
                  {selectedPlan === plan.id && (
                    <View style={styles.selectedCheckmark}>
                      <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Everything Included</Text>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Access Info */}
          <View style={styles.accessCard}>
            <Ionicons name="phone-portrait" size={24} color="#7ED957" />
            <Ionicons name="add" size={16} color="#666" />
            <Ionicons name="desktop" size={24} color="#7ED957" />
            <Text style={styles.accessText}>Access on mobile + web dashboard</Text>
          </View>

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* Fixed CTAs */}
        <View style={styles.ctaContainer}>
          {/* Start Trial Button */}
          <TouchableOpacity 
            style={styles.trialButton} 
            onPress={handleStartTrial}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#7ED957" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#7ED957" />
                <Text style={styles.trialButtonText}>Start 7-Day Free Trial</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Subscribe Button */}
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.ctaButtonText}>
                  Subscribe - ${selectedPlanData?.price}/{selectedPlanData?.id === "monthly" ? "mo" : selectedPlanData?.id === "3months" ? "3mo" : "6mo"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.ctaSubtext}>Cancel anytime • Works on mobile + web</Text>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  
  // Pro Active State
  proActiveContent: { paddingVertical: 24 },
  proActiveCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7ED957",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7ED957",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  proBadgeText: { fontSize: 12, fontWeight: "bold", color: "#000" },
  proActiveTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginBottom: 8 },
  trialInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  trialInfoText: { fontSize: 13, color: "#FBBF24", fontWeight: "500" },
  proActiveSubtitle: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22 },
  unlockedFeatures: { marginTop: 24, width: "100%" },
  unlockedTitle: { fontSize: 14, fontWeight: "600", color: "#FFF", marginBottom: 12 },
  unlockedRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  unlockedText: { fontSize: 14, color: "#E2E8F0" },
  dashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 24,
    width: "100%",
    justifyContent: "center",
  },
  dashboardButtonText: { fontSize: 15, fontWeight: "600", color: "#FFF" },
  
  // Pricing Screen
  hero: { alignItems: "center", paddingVertical: 24 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(126, 217, 87, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  heroBadgeText: { fontSize: 11, fontWeight: "bold", color: "#7ED957", letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: "bold", color: "#FFF", textAlign: "center", marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22 },
  
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  syncText: { flex: 1, fontSize: 13, color: "#06B6D4", lineHeight: 18 },
  
  previewCard: { borderRadius: 16, overflow: "hidden", marginVertical: 16 },
  previewGradient: { padding: 16 },
  previewHeader: { marginBottom: 16 },
  previewLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  previewContent: { flexDirection: "row", justifyContent: "space-around" },
  previewStat: { alignItems: "center" },
  previewStatValue: { fontSize: 28, fontWeight: "bold", color: "#7ED957" },
  previewStatLabel: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  
  plansSection: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF", marginBottom: 16 },
  plansRow: { flexDirection: "row", gap: 10 },
  planCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  planCardSelected: { borderColor: "#7ED957" },
  planCardPopular: { backgroundColor: "#1E293B" },
  popularBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#7ED957",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularBadgeText: { fontSize: 8, fontWeight: "bold", color: "#000" },
  planName: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
  planPrice: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginVertical: 4 },
  planPerMonth: { fontSize: 11, color: "#666" },
  planSavings: { fontSize: 11, color: "#7ED957", marginTop: 4 },
  selectedCheckmark: { position: "absolute", top: 8, right: 8 },
  
  featuresSection: { marginVertical: 16 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "600", color: "#FFF", marginBottom: 2 },
  featureDescription: { fontSize: 13, color: "#9CA3AF" },
  
  accessCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  accessText: { fontSize: 14, color: "#7ED957", fontWeight: "500" },
  
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#222",
    gap: 10,
  },
  trialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#7ED957",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  trialButtonText: { fontSize: 15, fontWeight: "600", color: "#7ED957" },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7ED957",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: { fontSize: 17, fontWeight: "bold", color: "#000" },
  ctaSubtext: { fontSize: 12, color: "#666", textAlign: "center" },
})
