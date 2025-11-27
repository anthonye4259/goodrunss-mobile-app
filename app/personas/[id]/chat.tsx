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
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function PersonaChatScreen() {
  const { id } = useLocalSearchParams()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hey! I'm Coach Mike's AI persona. I've trained hundreds of players using his proven methods. What aspect of your game do you want to work on today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
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

    // Simulate AI response
    setTimeout(() => {
      const response = generatePersonaResponse(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 1500)
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Header */}
          <View className="px-6 pt-16 pb-4 border-b border-zinc-800 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity onPress={() => router.back()} className="mr-4">
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View className="bg-lime-500/20 rounded-full w-10 h-10 items-center justify-center mr-3">
                <Text className="text-xl">🏀</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-white text-lg font-bold">Coach Mike</Text>
                  <View className="bg-purple-500/20 rounded-full px-2 py-0.5">
                    <Text className="text-purple-400 text-xs font-medium">AI</Text>
                  </View>
                </View>
                <Text className="text-zinc-400 text-xs">AI Persona • Online</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                setVoiceEnabled(!voiceEnabled)
              }}
              className={`rounded-full p-2 ${voiceEnabled ? "bg-blue-500" : "bg-zinc-800"}`}
            >
              <Ionicons name="mic" size={20} color={voiceEnabled ? "#000" : "#71717a"} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-6 py-4"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => (
              <View key={message.id} className={`mb-4 ${message.role === "user" ? "items-end" : "items-start"}`}>
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
              </View>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <View className="items-start mb-4">
                <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <View className="flex-row gap-1">
                    <View className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                    <View className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                    <View className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
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
                placeholder="Ask Coach Mike anything..."
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
                <Ionicons name="send" size={20} color={input.trim() ? "#000" : "#71717a"} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

function generatePersonaResponse(input: string): string {
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("defense") || lowerInput.includes("defend")) {
    return "Great question! Defense wins championships. Here's my 3-step defensive drill:\n\n1. **Stance Work** - Stay low, feet shoulder-width apart. Practice sliding for 30 seconds without crossing your feet.\n\n2. **Mirror Drill** - Have a partner make quick moves. Mirror them without reaching. Focus on staying in front.\n\n3. **Closeout Drill** - Sprint to the shooter, then chop your feet to control momentum. Hand up, contest the shot.\n\nDo 3 sets of each. Your defense will improve in 2 weeks. Want me to create a full defensive workout plan?"
  }

  if (lowerInput.includes("footwork") || lowerInput.includes("agility")) {
    return "Footwork is the foundation of everything! Here's what I teach:\n\n**Ladder Drills** (10 min)\n- High knees through ladder\n- Lateral shuffles\n- In-and-out hops\n\n**Cone Drills** (10 min)\n- Figure 8s around cones\n- Defensive slides\n- Quick direction changes\n\n**Jump Rope** (5 min)\n- Single leg hops\n- Double unders\n- Crossovers\n\nDo this 3x per week. Your first step will be explosive. Ready to start?"
  }

  if (lowerInput.includes("workout") || lowerInput.includes("training")) {
    return "Let's build you a custom workout! Based on Coach Mike's methods:\n\n**Warm-up** (10 min)\n- Dynamic stretching\n- Light jogging\n- Ball handling\n\n**Skill Work** (30 min)\n- Form shooting: 100 shots\n- Game speed moves\n- Finishing at rim\n\n**Conditioning** (15 min)\n- Suicides: 5 sets\n- Defensive slides: 3 min\n- Core work\n\n**Cool-down** (5 min)\n- Static stretching\n- Recovery\n\nThis is what NBA players do. Want me to track your progress?"
  }

  return "I love your dedication! As Coach Mike always says: 'Champions are made in the off-season.' Whether it's defense, shooting, or conditioning, I can help you level up. What specific skill do you want to master? I'll create a personalized plan using Coach Mike's proven methods."
}
