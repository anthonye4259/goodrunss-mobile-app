import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

type Conversation = {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  isOnline?: boolean
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Coach Mike",
    lastMessage: "Great session today! See you next week.",
    time: "2m ago",
    unread: 2,
    avatar: "M",
    isOnline: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    lastMessage: "Are you free for a match tomorrow?",
    time: "1h ago",
    unread: 0,
    avatar: "S",
    isOnline: true,
  },
  {
    id: "3",
    name: "Downtown Courts",
    lastMessage: "Your booking is confirmed for Saturday.",
    time: "3h ago",
    unread: 1,
    avatar: "D",
  },
  {
    id: "4",
    name: "Alex Chen",
    lastMessage: "Thanks for the tip!",
    time: "Yesterday",
    unread: 0,
    avatar: "A",
  },
]

export default function MessagesScreen() {
  const { t } = useTranslation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const { preferences } = useUserPreferences()
  const { user } = useAuth()
  const userId = user?.id || preferences.userId

  useEffect(() => {
    if (!userId || !db) return

    // Query conversations where current user is a participant
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => {
        const data = doc.data()
        // Determine other user's name/avatar logic here (requires user fetching or storing in convo)
        // For now, using a placeholder or stored name if available
        const otherParticipant = data.participantNames?.[data.participants.find((p: string) => p !== userId)] || "User"

        return {
          id: doc.id,
          name: otherParticipant, // Simplified
          lastMessage: data.lastMessage || "",
          time: data.lastMessageTime ? formatTime(data.lastMessageTime) : "",
          unread: data.unreadCounts?.[userId] || 0,
          avatar: otherParticipant.charAt(0),
          isOnline: false // Presence not implemented yet
        }
      })
      setConversations(convos)
    })

    return () => unsubscribe()
  }, [userId])

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/chat/${id}`)
  }

  const formatTime = (timestamp: any) => {
    // Handle Firestore Timestamp or Date
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString()
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('messages.title')}</Text>
            <TouchableOpacity style={styles.newMessageButton} onPress={() => router.push("/friends")}>
              <Ionicons name="create-outline" size={24} color="#7ED957" />
            </TouchableOpacity>
          </View>

          {/* Conversations */}
          {conversations.length > 0 ? (
            <View style={styles.conversationsContainer}>
              {conversations.map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  style={styles.conversationItem}
                  onPress={() => handlePress(conversation.id)}
                >
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{conversation.avatar}</Text>
                    </View>
                    {conversation.isOnline && <View style={styles.onlineIndicator} />}
                  </View>

                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text style={styles.conversationName}>{conversation.name}</Text>
                      <Text style={styles.conversationTime}>{conversation.time}</Text>
                    </View>
                    <View style={styles.conversationFooter}>
                      <Text style={[styles.lastMessage, conversation.unread > 0 && styles.lastMessageBold]} numberOfLines={1}>
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{conversation.unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles-outline" size={64} color="#333" />
              </View>
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyDescription}>
                Start a conversation with a trainer or player to see your messages here.
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={() => router.push("/friends")}>
                <Text style={styles.startButtonText}>Find People</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  conversationsContainer: {
    paddingHorizontal: 24,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(132, 204, 22, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7ED957",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  conversationTime: {
    fontSize: 13,
    color: "#666",
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    color: "#9CA3AF",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#7ED957",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: "#7ED957",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  lastMessageBold: {
    fontWeight: 'bold',
    color: '#FFF'
  }
})
