import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function GIAScreen() {
  const { preferences } = useUserPreferences()
  const activityType = preferences.activityType || "rec"
  const userType = preferences.userType || "player"

  // Get personalized greeting based on user type
  const getGreeting = () => {
    switch (userType) {
      case "trainer":
        return "Hey Coach! I'm GIA, your coaching assistant. How can I help you grow your business today?"
      case "instructor":
        return "Hey! I'm GIA, your teaching assistant. How can I help you manage your practice today?"
      case "both":
        return "Hey! I'm GIA, your personal assistant. Whether you're training or teaching, I'm here to help!"
      default:
        return "Hey! I'm GIA, your sports AI assistant. How can I help you today?"
    }
  }

  // Get personalized suggestions based on user type
  const getSuggestions = () => {
    switch (userType) {
      case "trainer":
        return ["View my schedule", "Message clients", "Track earnings", "Find training venues"]
      case "instructor":
        return ["View my classes", "Message students", "Track earnings", "Set availability"]
      case "both":
        return ["Find a court", "View my bookings", "Check client messages", "Track my stats"]
      default:
        return ["Find a court nearby", "Get a workout plan", "Find pickup games", "Track my stats"]
    }
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: getGreeting(),
      timestamp: new Date(),
      suggestions: getSuggestions(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Get AI response from OpenAI
      const { giaService } = await import("@/lib/services/gia-service")

      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await giaService.sendMessage(
        [...conversationHistory, { role: "user", content: userMessage.content }],
        {
          location: preferences.location ? {
            city: preferences.location.city,
            state: preferences.location.state
          } : undefined,
          sport: preferences.primaryActivity,
          userType: preferences.userType || "player"
        }
      )

      const suggestions = giaService.getSuggestions(userMessage.content, preferences)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Fallback message if API fails
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        suggestions: ["Find nearby courts", "Book a trainer", "Report conditions", "Find players"],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setInput(suggestion)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.giaAvatar}>
                <Ionicons name="sparkles" size={24} color="#8B5CF6" />
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.headerTitle}>GIA</Text>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionText}>g0</Text>
                  </View>
                </View>
                <Text style={styles.headerSubtitle}>Your AI Assistant</Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          <Animated.ScrollView
            ref={scrollViewRef}
            style={[styles.messagesContainer, { opacity: fadeAnim }]}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.role === "user" ? styles.userMessageWrapper : styles.assistantMessageWrapper,
                ]}
              >
                {message.role === "assistant" && (
                  <View style={styles.assistantAvatar}>
                    <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.role === "user" ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={[styles.messageText, message.role === "user" && styles.userMessageText]}>
                    {message.content}
                  </Text>
                </View>
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageWrapper, styles.assistantMessageWrapper]}>
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                </View>
                <View style={[styles.messageBubble, styles.assistantBubble]}>
                  <Text style={styles.typingText}>GIA is typing...</Text>
                </View>
              </View>
            )}

            {/* Suggestions */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && !isTyping && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionsContainer}
                contentContainerStyle={styles.suggestionsContent}
              >
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Ask GIA anything..."
                placeholderTextColor="#666"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color={input.trim() ? "#000" : "#666"} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  giaAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  versionBadge: {
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7ED957",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  assistantMessageWrapper: {
    justifyContent: "flex-start",
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#7ED957",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#1A1A1A",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#000000",
  },
  typingText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsContent: {
    paddingRight: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: "#7ED957",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    backgroundColor: "#0A0A0A",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#333",
  },
})
