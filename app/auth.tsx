import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

export default function AuthScreen() {
  const router = useRouter()
  const { login, signup, continueAsGuest } = useAuth()
  const { setPreferences } = useUserPreferences()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please enter your name")
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)

        // Check if user already has preferences (from dashboard signup)
        if (db) {
          try {
            const auth = await import("firebase/auth")
            const currentUser = auth.getAuth().currentUser
            if (currentUser) {
              const userDoc = await getDoc(doc(db, "users", currentUser.uid))
              if (userDoc.exists()) {
                const userData = userDoc.data()

                // If user has userType set (trainer/instructor from dashboard), sync and skip onboarding
                if (userData.userType) {
                  setPreferences({
                    userType: userData.userType,
                    activities: userData.activities || [],
                    primaryActivity: userData.primaryActivity,
                    isStudioUser: userData.userType === "instructor",
                    isRecUser: userData.userType === "trainer",
                    name: userData.name,
                  })

                  // Skip to main app - they're a returning trainer/instructor
                  router.replace("/(tabs)")
                  return
                }
              }
            }
          } catch (e) {
            console.log("Could not check for existing preferences:", e)
          }
        }

        // New user or no preferences - go through onboarding
        router.replace("/onboarding")
      } else {
        await signup(email, password, name)
        // New signup always goes to onboarding
        router.replace("/onboarding")
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGuestMode = () => {
    continueAsGuest()
    router.replace("/onboarding")
  }


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <LinearGradient colors={["#0A0A0A", "#141414", "#0A0A0A"]} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="flex-1 px-6 justify-center">
          <View className="mb-12 items-center">
            <Image
              source={require("@/assets/images/goodrunss-logo-white.png")}
              style={{ width: 120, height: 120, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-foreground mb-2">GoodRunss</Text>
            <Text className="text-lg text-muted-foreground">Where the World Plays</Text>
          </View>

          {/* Dashboard User Callout */}
          {!isLogin && (
            <TouchableOpacity
              onPress={() => setIsLogin(true)}
              className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6"
            >
              <Text className="text-primary font-semibold text-center">
                👋 Already have a Dashboard account?
              </Text>
              <Text className="text-muted-foreground text-center text-sm mt-1">
                Tap here to sign in and sync your data
              </Text>
            </TouchableOpacity>
          )}

          <View className="space-y-4">
            {!isLogin && (
              <View>
                <Text className="text-foreground mb-2 font-medium">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                  autoCapitalize="words"
                  className="bg-card border border-border rounded-xl px-4 py-4 text-foreground"
                />
              </View>
            )}

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

            <TouchableOpacity
              onPress={handleAuth}
              className="bg-primary rounded-xl py-4 mt-4"
              disabled={loading}
            >
              <Text className="text-center text-background font-bold text-lg">
                {loading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
              </Text>
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
