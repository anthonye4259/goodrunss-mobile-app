import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "@/lib/auth-context"

export default function AuthScreen() {
  const router = useRouter()
  const { continueAsGuest } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleAuth = async () => {
    await AsyncStorage.setItem("isAuthenticated", "true")
    router.replace("/(tabs)")
  }

  const handleGuestMode = () => {
    continueAsGuest()
    router.replace("/(tabs)")
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A0A0A", "#141414", "#0A0A0A"]} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="flex-1 px-6 justify-center">
          <View className="mb-12">
            <Text className="text-5xl font-bold text-primary mb-2">GoodRunss</Text>
            <Text className="text-lg text-muted-foreground">Where the World Plays</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-foreground mb-2 font-medium">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <View>
              <Text className="text-foreground mb-2 font-medium">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                secureTextEntry
                className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
              />
            </View>

            <TouchableOpacity onPress={handleAuth} className="bg-primary rounded-xl py-4 mt-4">
              <Text className="text-center text-background font-bold text-lg">{isLogin ? "Sign In" : "Sign Up"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGuestMode} className="border-2 border-border rounded-xl py-4">
              <Text className="text-center text-foreground font-bold text-lg">Continue as Guest</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="py-4">
              <Text className="text-center text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text className="text-primary font-semibold">{isLogin ? "Sign Up" : "Sign In"}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}
