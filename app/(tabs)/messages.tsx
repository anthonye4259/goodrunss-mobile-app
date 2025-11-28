
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { EmptyState } from "@/components/empty-state"
import { SkeletonLoader } from "@/components/skeleton-loader"

interface Conversation {
  id: string
  otherUser: {
    name: string
    role: string
  }
  lastMessage: string
  timestamp: Timestamp
  unread: boolean
}

export default function MessagesScreen() {
  const { preferences } = useUserPreferences()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const conversationsRef = collection(db, "conversations")
    const q = query(
      conversationsRef,
      where("participants", "array-contains", preferences.userId || "user123"),
      orderBy("lastMessageTime", "desc"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos: Conversation[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          otherUser: {
            name: data.otherUserName || "Unknown User",
            role: data.otherUserRole || "player",
          },
          lastMessage: data.lastMessage || "",
          timestamp: data.lastMessageTime,
          unread: data.unreadCount > 0,
        }
      })
      setConversations(convos)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [preferences.userId])

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (hours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <View className="px-6 pt-16 pb-4">
        <Text className="text-foreground font-bold text-3xl mb-6">Messages</Text>

        {/* Search Bar */}
        <View className="bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-foreground"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {loading ? (
          <View className="gap-3">
            <SkeletonLoader width="100%" height={80} />
            <SkeletonLoader width="100%" height={80} />
            <SkeletonLoader width="100%" height={80} />
          </View>
        ) : filteredConversations.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            description="Book a session to start chatting with trainers and other players"
            actionText="Explore Trainers"
            onAction={() => router.push("/(tabs)/explore")}
          />
        ) : (
          filteredConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              onPress={() => router.push(`/chat/${conversation.id}`)}
              className="bg-card border border-border rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                <Text className="text-primary font-bold text-lg">{conversation.otherUser.name.charAt(0)}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-foreground font-bold text-base">{conversation.otherUser.name}</Text>
                  <Text className="text-muted-foreground text-xs">{formatTime(conversation.timestamp)}</Text>
                </View>
                <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                  {conversation.lastMessage}
                </Text>
              </View>

              {conversation.unread && <View className="bg-primary rounded-full w-2 h-2 ml-2" />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  )
}
