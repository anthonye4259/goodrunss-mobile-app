
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import { useUserPreferences } from "@/lib/user-preferences"
import { useState, useEffect, useRef } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

interface Message {
  id: string
  text: string
  senderId: string
  timestamp: Timestamp
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams()
  const { preferences } = useUserPreferences()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [otherUserName, setOtherUserName] = useState("User")
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!db) return
    const messagesRef = collection(db, "conversations", id as string, "messages")
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        senderId: doc.data().senderId,
        timestamp: doc.data().timestamp,
      }))
      setMessages(msgs)
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100)
    })

    // Mark conversation as read
    const conversationRef = doc(db, "conversations", id as string)
    updateDoc(conversationRef, { unreadCount: 0 })

    return () => unsubscribe()
  }, [id])


  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for typing status
  useEffect(() => {
    const convoRef = doc(db, "conversations", id as string)
    const unsubscribe = onSnapshot(doc(db, "conversations", id as string), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        // Check if ANY other participant is typing
        // This assumes 'typing' field is a map: { [userId]: boolean }
        const typingMap = data.typing || {}
        // Determine if anyone ELSE is typing
        const othersTyping = Object.entries(typingMap).some(([uid, isTyping]) => uid !== (preferences.userId) && isTyping)
        setOtherUserTyping(othersTyping)
      }
    })
    return () => unsubscribe()
  }, [id, preferences.userId])

  const handleInputChange = (text: string) => {
    setInputText(text)

    // Update typing status
    if (!isTyping) {
      setIsTyping(true)
      updateTypingStatus(true)
    }

    // Debounce stop typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      updateTypingStatus(false)
    }, 2000)
  }

  const updateTypingStatus = async (status: boolean) => {
    if (!preferences.userId || !db) return
    try {
      const convoRef = doc(db, "conversations", id as string)
      // We use setDoc with merge to ensure doc exists
      const { setDoc } = await import("firebase/firestore")
      await setDoc(convoRef, {
        typing: { [preferences.userId]: status }
      }, { merge: true })
    } catch (error) {
      console.log("Error updating typing status", error)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !db) return

    const messagesRef = collection(db, "conversations", id as string, "messages")
    await addDoc(messagesRef, {
      text: inputText.trim(),
      senderId: preferences.userId || "user123",
      timestamp: Timestamp.now(),
    })

    // Update conversation last message
    const conversationRef = doc(db, "conversations", id as string)
    const { setDoc } = await import("firebase/firestore")
    await setDoc(conversationRef, {
      lastMessage: inputText.trim(),
      lastMessageTime: Timestamp.now(),
      participants: [preferences.userId, "otherUser_placeholder"], // ideally fetched from somewhere
      unreadCounts: { "otherUser_placeholder": 1 } // increment logic needed in cloud function usually
    }, { merge: true })

    setInputText("")
    setIsTyping(false)
    updateTypingStatus(false)
  }

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return ""
    const date = timestamp.toDate()
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-4 border-b border-border flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="bg-primary/20 rounded-full w-10 h-10 items-center justify-center mr-3">
            <Text className="text-primary font-bold">{otherUserName.charAt(0)}</Text>
          </View>
          <Text className="text-foreground font-bold text-lg">{otherUserName}</Text>
        </View>

        {/* Messages */}
        <ScrollView ref={scrollViewRef} className="flex-1 px-6 py-4" contentContainerClassName="pb-4">
          {messages.map((message) => {
            const isMe = message.senderId === (preferences.userId || "user123")
            return (
              <View key={message.id} className={`mb-4 ${isMe ? "items-end" : "items-start"}`}>
                <View
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? "bg-primary" : "bg-card border border-border"
                    }`}
                >
                  <Text className={isMe ? "text-background" : "text-foreground"}>{message.text}</Text>
                </View>
                <Text className="text-muted-foreground text-xs mt-1">{formatTime(message.timestamp)}</Text>
              </View>
            )
          })}
        </ScrollView>

        {otherUserTyping && (
          <View className="px-6 py-2">
            <Text className="text-muted-foreground text-xs italic">Typing...</Text>
          </View>
        )}

        {/* Input */}
        <View className="px-6 pb-8 pt-4 border-t border-border flex-row items-center">
          <View className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center mr-3">
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={handleInputChange}
              className="flex-1 text-foreground"
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            className="bg-primary rounded-full w-12 h-12 items-center justify-center"
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
