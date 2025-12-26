import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "@/lib/auth-context"
import { useUserPreferences } from "@/lib/user-preferences"
import firebase, { db, auth } from "@/lib/firebase-config"
import * as AppleAuthentication from "expo-apple-authentication"
import * as Crypto from "expo-crypto"

// Generate a secure random nonce for Apple Sign In
// This is required for replay attack protection
const generateNonce = async (length = 32): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(length)
  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Hash the nonce using SHA256 for Firebase
const sha256 = async (input: string): Promise<string> => {
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input)
  return digest
}

export default function AuthScreen() {
  const router = useRouter()
  const { login, signup, continueAsGuest, loginWithBiometrics, hasBiometricCredentials, getStoredEmail } = useAuth()
  const { setPreferences } = useUserPreferences()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false)
  const [storedEmail, setStoredEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check if Apple Sign In is available (iOS 13+, not available in Expo Go)
    AppleAuthentication.isAvailableAsync().then((available) => {
      console.log("Apple Sign In available:", available)
      setAppleAuthAvailable(available)
    })

    // Check for stored email for biometric login
    if (hasBiometricCredentials) {
      getStoredEmail().then(setStoredEmail)
    }
  }, [hasBiometricCredentials])

  const handleBiometricLogin = async () => {
    setLoading(true)
    try {
      const success = await loginWithBiometrics()
      if (success) {
        router.replace("/(tabs)")
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Biometric authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please fill in all fields", [{ text: "OK" }])
      return
    }

    if (!isLogin && !name) {
      Alert.alert("Missing Information", "Please enter your name", [{ text: "OK" }])
      return
    }

    // Check if Firebase is available
    if (!auth) {
      Alert.alert(
        "Service Unavailable",
        "Authentication service is temporarily unavailable. Please try again later.",
        [{ text: "OK" }]
      )
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)

        // Demo account gets master access to all features
        const isDemoAccount = email.toLowerCase() === "anthonye4259@gmail.com"

        if (isDemoAccount) {
          // Master demo account - full access to all paths
          setPreferences({
            userType: "both", // Access to trainer AND instructor features
            activities: ["Basketball", "Tennis", "Pickleball", "Swimming", "Golf", "Yoga", "Pilates"],
            primaryActivity: "Basketball",
            isStudioUser: true,
            isRecUser: true,
            name: "Demo User",
            onboardingComplete: true,
            isPremium: true, // Pro features enabled
          })
          router.replace("/(tabs)")
          return
        }

        // Check if user already has preferences (from dashboard signup)
        if (db && auth) {
          try {
            const currentUser = auth.currentUser
            if (currentUser) {
              const userDoc = await db.collection("users").doc(currentUser.uid).get()
              if (userDoc.exists) {
                const userData = userDoc.data() || {}

                // If user has userType set (trainer/instructor from dashboard), sync and skip onboarding
                if (userData.userType) {
                  setPreferences({
                    userType: userData.userType,
                    activities: userData.activities?.length > 0 ? userData.activities : ["Basketball"],
                    primaryActivity: userData.primaryActivity || "Basketball",
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
        router.replace("/onboarding/index")
      } else {
        await signup(email, password, name)
        // Save name to preferences for persistence
        setPreferences({ name })
        // Go through onboarding to collect userType and activities
        router.replace("/onboarding/index")
      }
    } catch (error: any) {
      console.error("Login error:", error.code, error.message)

      // User-friendly error messages
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        Alert.alert("Sign In Failed", "Invalid email or password. Please try again.", [{ text: "OK" }])
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Please enter a valid email address.", [{ text: "OK" }])
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Too Many Attempts", "Please wait a few minutes and try again.", [{ text: "OK" }])
      } else if (error.code === "auth/network-request-failed") {
        Alert.alert("Network Error", "Please check your internet connection and try again.", [{ text: "OK" }])
      } else if (error.code === "auth/invalid-credential") {
        Alert.alert("Sign In Failed", "Invalid email or password. Please try again.", [{ text: "OK" }])
      } else {
        Alert.alert("Sign In Failed", error.message || "Authentication failed. Please try again.", [{ text: "OK" }])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      setLoading(true)

      // Check if Apple auth is available first
      const isAvailable = await AppleAuthentication.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert(
          "Not Available",
          "Apple Sign In is not available on this device. Please use email and password to sign in.",
          [{ text: "OK" }]
        )
        return
      }

      // Check if Firebase is initialized
      if (!auth) {
        console.error("❌ Firebase auth not initialized")
        Alert.alert(
          "Service Unavailable",
          "Authentication service is temporarily unavailable. Please try again or use email/password.",
          [{ text: "OK" }]
        )
        return
      }

      // Generate a secure nonce for replay attack protection
      // This is required for iPad and newer iOS versions
      let rawNonce: string
      let hashedNonce: string

      try {
        rawNonce = await generateNonce()
        hashedNonce = await sha256(rawNonce)
      } catch (nonceError) {
        console.error("❌ Nonce generation failed:", nonceError)
        Alert.alert(
          "Security Error",
          "Could not generate secure authentication. Please try email/password sign in.",
          [{ text: "OK" }]
        )
        return
      }

      console.log("📱 Starting Apple Sign In...")

      let credential
      try {
        credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        })
      } catch (appleError: any) {
        if (appleError.code === "ERR_REQUEST_CANCELED" || appleError.code === "ERR_CANCELED") {
          // User cancelled - do nothing
          console.log("User cancelled Apple Sign In")
          return
        }
        console.error("❌ Apple authentication failed:", appleError)
        Alert.alert(
          "Apple Sign In Failed",
          "Could not authenticate with Apple. Please try again or use email/password.",
          [{ text: "OK" }]
        )
        return
      }

      console.log("✅ Got Apple credential, creating Firebase credential...")

      // Create Firebase credential from Apple credential
      const { identityToken } = credential
      if (!identityToken) {
        console.error("❌ No identity token from Apple")
        Alert.alert(
          "Authentication Error",
          "Apple did not provide login credentials. Please try again.",
          [{ text: "OK" }]
        )
        return
      }

      // Use compat SDK for OAuth
      let oAuthCredential
      try {
        const provider = new firebase.auth.OAuthProvider("apple.com")
        oAuthCredential = provider.credential({
          idToken: identityToken,
          rawNonce: rawNonce,
        })
      } catch (credError) {
        console.error("❌ Firebase credential creation failed:", credError)
        Alert.alert(
          "Authentication Error",
          "Could not create login credentials. Please try email/password.",
          [{ text: "OK" }]
        )
        return
      }

      console.log("🔥 Signing in with Firebase...")

      let userCredential
      try {
        userCredential = await auth.signInWithCredential(oAuthCredential)
      } catch (firebaseError: any) {
        console.error("❌ Firebase sign in failed:", firebaseError)

        if (firebaseError.code === "auth/invalid-credential") {
          Alert.alert("Sign In Error", "Could not verify your Apple ID. Please try again.")
        } else if (firebaseError.code === "auth/network-request-failed") {
          Alert.alert("Network Error", "Please check your internet connection and try again.")
        } else if (firebaseError.code === "auth/user-disabled") {
          Alert.alert("Account Disabled", "This account has been disabled. Please contact support.")
        } else if (firebaseError.code === "auth/operation-not-allowed") {
          // Apple Sign In not enabled in Firebase Console
          Alert.alert(
            "Sign In Unavailable",
            "Apple Sign In is currently unavailable. Please use email/password to sign in.",
            [{ text: "OK" }]
          )
        } else {
          Alert.alert(
            "Sign In Failed",
            "Could not sign in with Apple. Please try email/password instead.",
            [{ text: "OK" }]
          )
        }
        return
      }

      const user = userCredential.user!
      console.log("✅ Firebase sign in successful:", user.uid)

      // Get user's name from Apple or Firebase
      const userName = credential.fullName?.givenName
        ? `${credential.fullName.givenName} ${credential.fullName.familyName || ""}`.trim()
        : user.displayName || "User"

      // Check if user already has preferences (compat SDK)
      if (db) {
        try {
          const userDoc = await db.collection("users").doc(user.uid).get()
          if (userDoc.exists) {
            const userData = userDoc.data() || {}
            if (userData.userType) {
              setPreferences({
                userType: userData.userType,
                activities: userData.activities || ["Basketball"], // Default to prevent crashes
                primaryActivity: userData.primaryActivity,
                isStudioUser: userData.userType === "instructor",
                isRecUser: userData.userType === "trainer",
                name: userData.name || userName,
              })
              router.replace("/(tabs)")
              return
            }
          }
        } catch (e) {
          console.log("Could not check for existing preferences:", e)
        }
      }

      // Store name from Apple if available (only provided on first sign in)
      if (userName) {
        setPreferences({ name: userName })
      }

      // New Apple user - go to onboarding
      console.log("➡️ Navigating to onboarding...")
      router.replace("/onboarding/index")
    } catch (error: any) {
      console.error("❌ Unexpected Apple Sign In error:", error)
      Alert.alert(
        "Sign In Error",
        "An unexpected error occurred. Please try email/password instead.",
        [{ text: "OK" }]
      )
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
            {/* Biometric login - Face ID / Touch ID */}
            {hasBiometricCredentials && storedEmail && (
              <>
                <TouchableOpacity
                  onPress={handleBiometricLogin}
                  disabled={loading}
                  className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
                  style={{ backgroundColor: "#7ED957" }}
                >
                  <Text className="text-lg font-semibold mr-2" style={{ color: "#000" }}>
                    Continue as {storedEmail.split('@')[0]}
                  </Text>
                  <Text style={{ fontSize: 20 }}>🔐</Text>
                </TouchableOpacity>
                <View className="flex-row items-center my-2">
                  <View className="flex-1 h-px bg-border" />
                  <Text className="text-muted-foreground mx-4">or sign in manually</Text>
                  <View className="flex-1 h-px bg-border" />
                </View>
              </>
            )}

            {/* Sign in with Apple - Required by Apple for apps with third-party login */}
            {appleAuthAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={12}
                style={{ height: 54, width: "100%" }}
                onPress={handleAppleSignIn}
              />
            )}

            {appleAuthAvailable && (
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-muted-foreground mx-4">or</Text>
                <View className="flex-1 h-px bg-border" />
              </View>
            )}

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

            <TouchableOpacity
              onPress={() => router.push("/facility/onboarding-v2")}
              className="py-4 border-t border-border mt-2"
            >
              <Text className="text-center" style={{ color: "#FFD700" }}>
                🏢 I manage a Facility
              </Text>
              <Text className="text-center text-muted-foreground text-xs mt-1">
                Owner or manager? List your courts or studios and start earning
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}
