"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Animated } from "react-native"
import { Users, Plus, DollarSign, Share2, Image as ImageIcon, X } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useUserPreferences } from "@/lib/user-preferences"
import { useRouter } from "next/navigation"

type Client = {
  id: string
  name: string
  email: string
  sessionsCompleted: number
  nextSession?: string
  status: "active" | "inactive"
}

export default function TrainerDashboard() {
  const { preferences } = useUserPreferences()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      sessionsCompleted: 12,
      nextSession: "Today, 3:00 PM",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah@example.com",
      sessionsCompleted: 8,
      nextSession: "Tomorrow, 10:00 AM",
      status: "active",
    },
  ])
  const [showAddClient, setShowAddClient] = useState(false)
  const [showPromoGenerator, setShowPromoGenerator] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleAddClient = () => {
    if (!newClientName.trim() || !newClientEmail.trim()) return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    const newClient: Client = {
      id: Date.now().toString(),
      name: newClientName,
      email: newClientEmail,
      sessionsCompleted: 0,
      status: "active",
    }

    setClients((prev) => [...prev, newClient])
    setNewClientName("")
    setNewClientEmail("")
    setShowAddClient(false)
  }

  const generatePromoPost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowPromoGenerator(true)
  }

  const shareToInstagram = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const promoText = "Check out my GoodRunss profile! Book sessions with me."
    // In production: Share.share({ message: promoText })
    alert("Sharing to Instagram...")
  }

  const shareToTwitter = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const promoText = "Train with me on GoodRunss! #Fitness #Training"
    // In production: Share.share({ message: promoText })
    alert("Sharing to Twitter...")
  }

  const openCanva = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const canvaUrl = "https://www.canva.com/create/instagram-posts/"
    // In production: Linking.openURL(canvaUrl)
    alert("Opening Canva editor...")
  }

  const openWebDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const webDashboardUrl = "https://goodrunss.com/dashboard/personas"
    // In production: Linking.openURL(webDashboardUrl)
    alert("Opening web dashboard for persona management")
  }

  return (
    <View className="flex-1 bg-black">
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="px-6 pt-16 pb-6">
            <Text className="text-white text-3xl font-bold mb-2">Trainer Dashboard</Text>
            <Text className="text-zinc-400 text-base">
              {preferences.activityType === "studio" ? "Wellness Instructor" : "Basketball Coach"}
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="px-6 mb-6">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 rounded-2xl p-4 border border-lime-500/30">
                <Users size={24} color="#84cc16" />
                <Text className="text-white text-2xl font-bold mt-2">{clients.length}</Text>
                <Text className="text-zinc-400 text-sm">Active Clients</Text>
              </View>
              <View className="flex-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-500/30">
                <DollarSign size={24} color="#3b82f6" />
                <Text className="text-white text-2xl font-bold mt-2">$2,450</Text>
                <Text className="text-zinc-400 text-sm">This Month</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  setShowAddClient(true)
                }}
                className="bg-lime-500 rounded-xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <Plus size={24} color="#000" />
                  <Text className="text-black text-lg font-semibold">Add New Client</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={generatePromoPost}
                className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-4 flex-row items-center justify-between border border-pink-400/30"
              >
                <View className="flex-row items-center gap-3">
                  <Share2 size={24} color="#fff" />
                  <Text className="text-white text-lg font-semibold">Generate Promo Post</Text>
                </View>
                <Text className="text-white/70 text-sm">AI Powered</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openWebDashboard}
                className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 flex-row items-center justify-between border border-purple-400/30"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="sparkles" size={24} color="#fff" />
                  <View>
                    <Text className="text-white text-lg font-semibold">Manage AI Persona</Text>
                    <Text className="text-white/70 text-xs">Create on web dashboard</Text>
                  </View>
                </View>
                <Ionicons name="open-outline" size={20} color="#fff" />
              </TouchableOpacity>

              {/* Manage Waitlist button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  router.push("/waitlist/manage")
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 flex-row items-center justify-between border border-orange-400/30"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="list" size={24} color="#fff" />
                  <View>
                    <Text className="text-white text-lg font-semibold">Manage Waitlist</Text>
                    <Text className="text-white/70 text-xs">3 people waiting</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Clients List */}
          <View className="px-6 mb-6">
            <Text className="text-white text-xl font-bold mb-4">Your Clients</Text>
            <View className="gap-3">
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white text-lg font-semibold">{client.name}</Text>
                    <View className="bg-lime-500/20 rounded-full px-3 py-1">
                      <Text className="text-lime-500 text-xs font-medium">{client.status}</Text>
                    </View>
                  </View>
                  <Text className="text-zinc-400 text-sm mb-2">{client.email}</Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-zinc-500 text-sm">{client.sessionsCompleted} sessions completed</Text>
                    {client.nextSession && <Text className="text-lime-500 text-sm">{client.nextSession}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Add Client Modal */}
      <Modal visible={showAddClient} transparent animationType="slide" onRequestClose={() => setShowAddClient(false)}>
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-2xl font-bold">Add New Client</Text>
              <TouchableOpacity onPress={() => setShowAddClient(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="gap-4 mb-6">
              <View>
                <Text className="text-zinc-400 text-sm mb-2">Client Name</Text>
                <TextInput
                  value={newClientName}
                  onChangeText={setNewClientName}
                  placeholder="Enter name..."
                  placeholderTextColor="#71717a"
                  className="bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-sm mb-2">Email Address</Text>
                <TextInput
                  value={newClientEmail}
                  onChangeText={setNewClientEmail}
                  placeholder="Enter email..."
                  placeholderTextColor="#71717a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-zinc-800 text-white rounded-xl px-4 py-3 border border-zinc-700"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddClient}
              disabled={!newClientName.trim() || !newClientEmail.trim()}
              className={`rounded-xl p-4 ${
                newClientName.trim() && newClientEmail.trim() ? "bg-lime-500" : "bg-zinc-800"
              }`}
            >
              <Text
                className={`text-center text-lg font-semibold ${
                  newClientName.trim() && newClientEmail.trim() ? "text-black" : "text-zinc-600"
                }`}
              >
                Add Client
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Promo Generator Modal */}
      <Modal
        visible={showPromoGenerator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPromoGenerator(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-2xl font-bold">Generate Promo Post</Text>
              <TouchableOpacity onPress={() => setShowPromoGenerator(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Preview */}
            <View className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 mb-6 border border-pink-400/30">
              <View className="items-center">
                <ImageIcon size={48} color="#fff" className="mb-4" />
                <Text className="text-white text-xl font-bold text-center mb-2">
                  {preferences.activityType === "studio" ? "🧘‍♀️ Transform Your Practice" : "🏀 Level Up Your Game"}
                </Text>
                <Text className="text-white/90 text-center mb-4">
                  {preferences.activityType === "studio"
                    ? "Join me for personalized yoga sessions. Build strength, flexibility, and mindfulness."
                    : "Elite basketball training with proven results. Take your skills to the next level."}
                </Text>
                <View className="bg-white/20 rounded-full px-4 py-2">
                  <Text className="text-white font-semibold">Book Now on GoodRunss</Text>
                </View>
              </View>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                onPress={shareToInstagram}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4"
              >
                <Text className="text-white text-center text-lg font-semibold">Share to Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={shareToTwitter} className="bg-blue-500 rounded-xl p-4">
                <Text className="text-white text-center text-lg font-semibold">Share to Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openCanva} className="bg-cyan-500 rounded-xl p-4">
                <Text className="text-white text-center text-lg font-semibold">Edit in Canva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
