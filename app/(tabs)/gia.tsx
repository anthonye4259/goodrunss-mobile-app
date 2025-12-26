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
  ActivityIndicator,
  LayoutAnimation,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useUserPreferences } from "@/lib/user-preferences"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"

// New Premium Components
import { AIOrb } from "@/components/GIA/AIOrb"
import { MessageBubble } from "@/components/GIA/MessageBubble"
import { TypingIndicator } from "@/components/GIA/TypingIndicator"
import { ActionChip } from "@/components/GIA/ActionChip"
import { ActivityRings } from "@/components/GIA/ActivityRings"
import { WidgetRenderer } from "@/components/GIA/Widgets/WidgetRenderer"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: { label: string; icon?: string }[]
  widget?: string; // Type of widget to render (e.g. 'trainers', 'conditions')
}

export default function GIAScreen() {
  const { preferences } = useUserPreferences()
  const rawUserType = preferences.userType || "player"

  // For "both" users, check their active mode to determine context
  const isBothUser = rawUserType === "both"
  const activeMode = preferences.activeMode || "trainer"

  // Effective user type for GIA context
  const userType = isBothUser ? activeMode : rawUserType
  const isTrainerMode = userType === "trainer" || userType === "instructor"

  const [hasHealthAccess, setHasHealthAccess] = useState(false)
  const [showRings, setShowRings] = useState(true)

  // Get personalized greeting - now context-aware for "both" users
  const getGreeting = () => {
    if (isBothUser && activeMode === "trainer") {
      return "Hey Coach! I'm GIA, ready to help grow your business. (Trainer Mode)"
    }
    if (isBothUser && activeMode === "player") {
      return "Hey! I'm GIA, your personal sports AI. (Player Mode)"
    }
    switch (userType) {
      case "trainer":
        return "Hey Coach! I'm GIA, ready to help grow your business."
      case "instructor":
        return "Hey Instructor! I'm GIA, here to manage your classes."
      default:
        return "Hey! I'm GIA, your personal sports AI assistant."
    }
  }

  // Get smart suggestions with icons - context-aware
  const getSuggestions = (): { label: string; icon?: string }[] => {
    const playerSuggestions = [
      { label: "Find courts nearby", icon: "location-outline" },
      { label: "Get a workout plan", icon: "fitness-outline" },
      { label: "Can I play outside?", icon: "sunny-outline" },
      { label: "Find a coach", icon: "search-outline" },
    ]

    const trainerSuggestions = [
      { label: "Find leads", icon: "people-outline" },
      { label: "Send invoice", icon: "receipt-outline" },
      { label: "Blast message", icon: "megaphone-outline" },
    ]

    // For "both" users, return suggestions based on active mode
    if (isTrainerMode) {
      return trainerSuggestions
    }
    return playerSuggestions
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

  const handleSend = async () => {
    if (!input.trim()) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const userText = input
    setInput("") // Clear immediately

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Collapse rings when chatting starts to save space
    if (showRings) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowRings(false);
    }

    // Simulate AI delay for "thinking" effect
    setTimeout(async () => {
      // Mock Response Logic
      let responseText = "I can definitely help with that! "
      let nextSuggestions = getSuggestions()
      let widgetType = undefined;

      const lowerText = userText.toLowerCase();

      if (lowerText.includes("court")) {
        responseText += "I found 3 basketball courts nearby nicely rated. Would you like to see them on the map?"
        nextSuggestions = [
          { label: "Show on map", icon: "map-outline" },
          { label: "Filter by rating", icon: "filter-outline" }
        ]
      } else if (lowerText.includes("coach") || lowerText.includes("trainer")) {
        responseText += "Here are the top rated coaches in your area available this week:"
        widgetType = 'trainers';
        nextSuggestions = [
          { label: "View all profiles", icon: "person-outline" },
          { label: "Check availability", icon: "calendar-outline" }
        ]
      } else if (lowerText.includes("invoice") || lowerText.includes("bill")) {
        responseText += "I can handle that. Here is a draft invoice for Mike Ross based on his last session."
        widgetType = 'invoice';
        nextSuggestions = [
          { label: "Change amount", icon: "create-outline" },
          { label: "Send to someone else", icon: "people-outline" }
        ]
      } else if (lowerText.includes("leads") || lowerText.includes("clients") || lowerText.includes("grow")) {
        responseText += " found some new potential clients that match your profile:"
        widgetType = 'leads';
        nextSuggestions = [
          { label: "Message all", icon: "chatbubbles-outline" },
          { label: "View full list", icon: "list-outline" }
        ]
      } else if (lowerText.includes("blast") || lowerText.includes("campaign") || lowerText.includes("message all")) {
        responseText += "good idea. I've drafted a campaign for your active clients:"
        widgetType = 'campaign';
        nextSuggestions = [
          { label: "Edit message", icon: "create-outline" },
          { label: "Send now", icon: "paper-plane-outline" }
        ]
      } else if (lowerText.includes("health") || lowerText.includes("apple") || lowerText.includes("sync")) {
        responseText += "I can sync with Apple Health to track your Move, Exercise, and Stand goals. Tap the button above to connect! ⌚️"
        setHasHealthAccess(true); // Simulate auto-connect for demo
        setShowRings(true); // Show rings again
      } else if (lowerText.includes("play outside") || lowerText.includes("weather") || lowerText.includes("condition")) {
        responseText += "Conditions are looking great! "
        widgetType = 'conditions';
        nextSuggestions = [
          { label: "Find outdoor courts", icon: "sunny-outline" },
          { label: "Set alert", icon: "notifications-outline" }
        ]
      } else {
        responseText += "What specifically are you looking to achieve today?"
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        suggestions: nextSuggestions,
        widget: widgetType,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 1200)
  }

  const handleSuggestionPress = (suggestionLabel: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setInput(suggestionLabel)
  }

  const toggleHealthSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setHasHealthAccess(!hasHealthAccess)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#111111"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerOrbContainer}>
              <AIOrb size={50} isThinking={isTyping} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>GIA</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? "Thinking..." : "AI Assistant"}
              </Text>
            </View>
            {/* Context/Version Badge */}
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>BETA</Text>
            </View>
          </View>

          {/* Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {/* Daily Brief / Health Dashboard */}
            {showRings && (
              <View style={styles.dashboardCard}>
                <View style={styles.dashboardHeader}>
                  <View>
                    <Text style={styles.dashboardTitle}>Daily Activity</Text>
                    <Text style={styles.dashboardDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.syncButton, hasHealthAccess && styles.syncButtonActive]}
                    onPress={toggleHealthSync}
                  >
                    <Ionicons name={hasHealthAccess ? "checkmark-circle" : "sync"} size={16} color={hasHealthAccess ? "#000" : "#7ED957"} />
                    <Text style={[styles.syncButtonText, hasHealthAccess && { color: "#000" }]}>
                      {hasHealthAccess ? "Synced" : "Sync Health"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.ringsContainer}>
                  <ActivityRings
                    size={140}
                    movePercentage={hasHealthAccess ? 0.65 : 0}
                    exercisePercentage={hasHealthAccess ? 0.45 : 0}
                    standPercentage={hasHealthAccess ? 0.8 : 0}
                  />
                  <View style={styles.statsColumn}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: "#FA114F" }]}>{hasHealthAccess ? "450" : "--"}</Text>
                      <Text style={styles.statLabel}>MOVE / 700</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: "#A4FF00" }]}>{hasHealthAccess ? "28" : "--"}</Text>
                      <Text style={styles.statLabel}>EXERCISE / 60</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: "#00D9FF" }]}>{hasHealthAccess ? "8" : "--"}</Text>
                      <Text style={styles.statLabel}>STAND / 12</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Welcome Spacer */}
            {!showRings && <View style={{ height: 20 }} />}

            {messages.map((message) => (
              <View key={message.id}>
                <View style={styles.messageRow}>
                  {message.role === 'assistant' && (
                    <View style={styles.messageAvatar}>
                      <AIOrb size={28} isThinking={false} />
                    </View>
                  )}
                  <MessageBubble content={message.content} role={message.role} />
                </View>

                {/* Render Widget if Present */}
                {message.widget && (
                  <View style={styles.widgetContainer}>
                    <WidgetRenderer type={message.widget} />
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View style={styles.messageRow}>
                <View style={styles.messageAvatar}>
                  <AIOrb size={28} isThinking={true} />
                </View>
                <View style={styles.typingBubble}>
                  <TypingIndicator />
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Smart Suggestions (Quick Actions) */}
          {!isTyping && messages.length > 0 && messages[messages.length - 1].suggestions && (
            <View style={styles.suggestionsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContent}
              >
                {messages[messages.length - 1].suggestions?.map((suggestion, idx) => (
                  <ActionChip
                    key={idx}
                    label={suggestion.label}
                    icon={suggestion.icon}
                    onPress={() => handleSuggestionPress(suggestion.label)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <LinearGradient
              colors={['#1A1A1A', '#1A1A1A']}
              style={styles.inputGradient}
            >
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
                <Ionicons name="arrow-up" size={20} color={input.trim() ? "#000" : "#666"} />
              </TouchableOpacity>
            </LinearGradient>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
    backgroundColor: "rgba(10, 10, 10, 0.95)", // slightly transparent
    zIndex: 10,
  },
  headerOrbContainer: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  versionBadge: {
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.2)",
  },
  versionText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#7ED957",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // Dashboard Card Styles
  dashboardCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
  },
  dashboardDate: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#666",
    marginTop: 2,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.3)",
  },
  syncButtonActive: {
    backgroundColor: "#7ED957",
    borderColor: "#7ED957",
  },
  syncButtonText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#7ED957",
  },
  ringsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statsColumn: {
    gap: 16,
    alignItems: "flex-start",
  },
  statItem: {

  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#666",
    letterSpacing: 0.5,
  },

  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  widgetContainer: {
    marginLeft: 36, // Align with bubble (Avatar 28 + margin 8)
    marginBottom: 16,
  },
  messageAvatar: {
    marginRight: 8,
    justifyContent: 'flex-end',
    marginBottom: 4, // Align with bottom of bubble
  },
  typingBubble: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  suggestionsWrapper: {
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  suggestionsContent: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: "#0A0A0A",
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7ED957",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#333",
  },
})
