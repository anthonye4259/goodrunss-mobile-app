"use client"

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
} from "react-native"
import { MessageCircle, Send } from "lucide-react-native"
import { useUserPreferences } from "@/lib/user-preferences"
import * as Haptics from "expo-haptics"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function GIAScreen() {
  const { preferences } = useUserPreferences()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hey! I'm GIA, your ${preferences.activityType === "studio" ? "wellness" : "basketball"} AI assistant. How can I help you today?`,
      timestamp: new Date(),
      suggestions:
        preferences.activityType === "studio"
          ? ["Find a yoga studio", "Generate home workout", "Book a class", "Track my progress"]
          : ["Find a court nearby", "Get a workout plan", "Find pickup games", "Track my stats"],
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

    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("coach") || lowerInput.includes("trainer") || lowerInput.includes("persona")) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I can connect you with AI personas of top coaches! Would you like me to recommend one based on your goals?\n\nFor example:\n• **Coach Mike** - Basketball conditioning & defense\n• **Coach Sarah** - Tennis agility & footwork\n• **Coach Jay** - Pickleball strategy\n\nEach persona can create custom workouts, analyze your performance, and give you personalized advice. Want to try one?",
          timestamp: new Date(),
          suggestions: ["Show me Coach Mike", "Browse all personas", "Create my own persona"],
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }, 1500)
      return
    }

    // Simulate AI response
    setTimeout(() => {
      const response = generateGIAResponse(input, preferences.activityType)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 1500)
  }

  const handleSuggestion = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setInput(suggestion)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
      keyboardVerticalOffset={100}
    >
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 items-center justify-center">
              <MessageCircle size={24} color="#000" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">GIA</Text>
              <Text className="text-zinc-400 text-sm">Your AI Assistant</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <Animated.View
              key={message.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <View className={`mb-4 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <View
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user" ? "bg-lime-500" : "bg-zinc-900 border border-zinc-800"
                  }`}
                >
                  <Text
                    className={`${message.role === "user" ? "text-black" : "text-white"} text-base leading-relaxed`}
                  >
                    {message.content}
                  </Text>
                </View>

                {/* Suggestions */}
                {message.suggestions && message.role === "assistant" && index === messages.length - 1 && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => handleSuggestion(suggestion)}
                        className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2"
                      >
                        <Text className="text-zinc-400 text-sm">{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </Animated.View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View className="items-start mb-4">
              <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <View className="flex-row gap-1">
                  <View className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                  <View className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <View className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: "0.4s" }} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-6 py-4 border-t border-zinc-800 bg-black">
          <View className="flex-row items-center gap-3 bg-zinc-900 rounded-full px-4 py-2 border border-zinc-800">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask GIA anything..."
              placeholderTextColor="#71717a"
              className="flex-1 text-white text-base py-2"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                input.trim() ? "bg-lime-500" : "bg-zinc-800"
              }`}
            >
              <Send size={20} color={input.trim() ? "#000" : "#71717a"} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

function generateGIAResponse(input: string, activityType: string): { content: string; suggestions: string[] } {
  const lowerInput = input.toLowerCase()

  // Court/Studio Finder
  if (
    lowerInput.includes("court") ||
    lowerInput.includes("find") ||
    lowerInput.includes("nearby") ||
    lowerInput.includes("studio") ||
    lowerInput.includes("gym")
  ) {
    return {
      content:
        activityType === "studio"
          ? "I found 3 yoga studios near you:\n\n1. **Zen Flow Studio** - 0.8 mi away\n   • Drop-in: $25\n   • Next class: 6:00 PM Vinyasa\n\n2. **CorePower Yoga** - 1.2 mi away\n   • Drop-in: $30\n   • Next class: 5:30 PM Hot Yoga\n\n3. **Mindful Movement** - 1.5 mi away\n   • Drop-in: $20\n   • Next class: 7:00 PM Restorative\n\nWant me to book one for you?"
          : "I found 3 basketball courts near you:\n\n1. **Venice Beach Courts** - 0.5 mi away\n   • Outdoor, 4 courts\n   • Currently: 6 players\n\n2. **LA Fitness** - 1.2 mi away\n   • Indoor, 2 courts\n   • Members only\n\n3. **Westwood Rec Center** - 1.8 mi away\n   • Indoor, 3 courts\n   • $5 day pass\n\nWant directions to any of these?",
      suggestions: ["Book a session", "Get directions", "See more courts"],
    }
  }

  // Home Workout
  if (lowerInput.includes("workout") || lowerInput.includes("exercise") || lowerInput.includes("train")) {
    return {
      content:
        activityType === "studio"
          ? "Here's a 30-minute home yoga flow I created for you:\n\n**Warm-up (5 min)**\n• Cat-Cow: 10 reps\n• Child's Pose: 2 min\n• Sun Salutation A: 3 rounds\n\n**Main Flow (20 min)**\n• Warrior I & II: 1 min each side\n• Triangle Pose: 1 min each side\n• Tree Pose: 1 min each side\n• Pigeon Pose: 2 min each side\n\n**Cool-down (5 min)**\n• Seated Forward Fold: 3 min\n• Savasana: 2 min\n\nReady to start?"
          : "Here's a 45-minute basketball workout I created for you:\n\n**Warm-up (10 min)**\n• Dynamic stretching\n• Light jogging\n• Ball handling drills\n\n**Shooting (15 min)**\n• Form shooting: 50 shots\n• Free throws: 25 shots\n• 3-pointers: 25 shots\n\n**Conditioning (15 min)**\n• Suicides: 5 sets\n• Defensive slides: 3 min\n• Jump rope: 5 min\n\n**Cool-down (5 min)**\n• Static stretching\n\nWant me to track this workout?",
      suggestions: ["Start workout", "Modify difficulty", "Save for later"],
    }
  }

  // Booking
  if (lowerInput.includes("book") || lowerInput.includes("schedule") || lowerInput.includes("class")) {
    return {
      content:
        activityType === "studio"
          ? "I can help you book a class! Here are some options:\n\n• **Today at 6:00 PM** - Vinyasa Flow with Sarah\n• **Tomorrow at 9:00 AM** - Power Yoga with Mike\n• **Tomorrow at 7:00 PM** - Yin Yoga with Emma\n\nWhich one interests you?"
          : "I can help you book a training session! Here are available trainers:\n\n• **Coach Marcus** - $75/hr\n  Available: Today 5 PM, Tomorrow 10 AM\n\n• **Coach Sarah** - $60/hr\n  Available: Today 7 PM, Tomorrow 2 PM\n\nWho would you like to book with?",
      suggestions: ["Book now", "See more times", "View trainer profiles"],
    }
  }

  // Stats/Progress
  if (lowerInput.includes("stats") || lowerInput.includes("progress") || lowerInput.includes("track")) {
    return {
      content:
        activityType === "studio"
          ? "Your wellness stats this week:\n\n• **Classes attended**: 4\n• **Total minutes**: 240\n• **Streak**: 7 days 🔥\n• **Flexibility score**: 85/100 (+5)\n• **Mindfulness**: 92/100 (+3)\n\nYou're doing amazing! Keep it up!"
          : "Your basketball stats this week:\n\n• **Games played**: 5\n• **Points per game**: 18.4\n• **Field goal %**: 47%\n• **3-point %**: 38%\n• **Assists**: 6.2 per game\n\nYou're improving! Your 3-point shooting is up 5%!",
      suggestions: ["View detailed stats", "Set new goals", "Share progress"],
    }
  }

  // Persona help
  if (lowerInput.includes("coach") || lowerInput.includes("trainer") || lowerInput.includes("persona")) {
    return {
      content:
        "I can connect you with AI personas of top coaches! Would you like me to recommend one based on your goals?\n\nFor example:\n• **Coach Mike** - Basketball conditioning & defense\n• **Coach Sarah** - Tennis agility & footwork\n• **Coach Jay** - Pickleball strategy\n\nEach persona can create custom workouts, analyze your performance, and give you personalized advice. Want to try one?",
      suggestions: ["Show me Coach Mike", "Browse all personas", "Create my own persona"],
    }
  }

  // Default response
  return {
    content:
      activityType === "studio"
        ? "I can help you with:\n\n• Finding yoga studios and classes nearby\n• Creating personalized home workout flows\n• Booking classes with instructors\n• Tracking your wellness progress\n• Connecting with other yogis\n\nWhat would you like to do?"
        : "I can help you with:\n\n• Finding basketball courts nearby\n• Creating personalized workout plans\n• Booking training sessions\n• Tracking your stats and progress\n• Finding pickup games\n\nWhat would you like to do?",
    suggestions: ["Find courts", "Get workout", "Book trainer", "View stats"],
  }
}
