import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useUserPreferences } from "@/lib/user-preferences"

const { width } = Dimensions.get("window")

interface FeatureSlide {
    id: string
    icon: string
    color: string
    title: string
    subtitle: string
    description: string
    findAt: string
    tabIcon?: string
}

// ========== PLAYER (REC) FEATURES ==========
const PLAYER_FEATURES: FeatureSlide[] = [
    {
        id: "live-data",
        icon: "pulse",
        color: "#EF4444",
        title: "Real-Time Court Data",
        subtitle: "THE WAZE OF SPORTS",
        description: "See live court conditions, player counts, and wait times—all reported by the community. No more wasted trips!",
        findAt: "Home → Nearest Venue Widget",
    },
    {
        id: "live-map",
        icon: "map",
        color: "#3B82F6",
        title: "Live Activity Map",
        subtitle: "SEE WHO'S PLAYING NOW",
        description: "Watch real-time player activity across your city. Find busy courts, quiet spots, and games that need players.",
        findAt: "Tab Bar → Live Map",
        tabIcon: "map",
    },
    {
        id: "earn-money",
        icon: "cash",
        color: "#22C55E",
        title: "Earn Money Reporting",
        subtitle: "GET PAID $1-31 PER REPORT",
        description: "Snap a photo, report court conditions, help the community. Earn real cash and level up from Rookie to Legend!",
        findAt: "Tab Bar → Report ($$$)",
        tabIcon: "camera",
    },
    {
        id: "leagues",
        icon: "trophy",
        color: "#F59E0B",
        title: "Join Local Leagues",
        subtitle: "COMPETE & CONNECT",
        description: "Find basketball, tennis, and pickleball leagues in your area. All skill levels welcome—from casual to competitive.",
        findAt: "Home → Quick Actions → Leagues",
    },
    {
        id: "gia",
        icon: "sparkles",
        color: "#EC4899",
        title: "GIA AI Assistant",
        subtitle: "YOUR PERSONAL SPORTS AI",
        description: "Ask anything! Find courts, get workout plans, discover games—GIA knows your preferences and helps you play more.",
        findAt: "Tab Bar → GIA",
        tabIcon: "sparkles",
    },
    {
        id: "community",
        icon: "people",
        color: "#06B6D4",
        title: "Never Play Alone",
        subtitle: "FIND PLAYERS INSTANTLY",
        description: "See who needs players at nearby courts. Join games, challenge opponents, build your sports network.",
        findAt: "Live Map → Need Players",
    },
]


// ========== TRAINER (REC) FEATURES ==========
const TRAINER_FEATURES: FeatureSlide[] = [
    {
        id: "earnings",
        icon: "cash",
        color: "#22C55E",
        title: "Maximize Your Earnings",
        subtitle: "GROW YOUR BUSINESS",
        description: "Track daily, weekly, and monthly earnings. Set your rates and see your income grow.",
        findAt: "Home → Earnings Dashboard",
    },
    {
        id: "bookings",
        icon: "calendar",
        color: "#3B82F6",
        title: "Manage Bookings",
        subtitle: "NEVER MISS A CLIENT",
        description: "Accept or decline requests, view your schedule, and get notified of new opportunities.",
        findAt: "Home → Pending Requests",
    },
    {
        id: "live-map",
        icon: "map",
        color: "#EF4444",
        title: "Find Training Venues",
        subtitle: "REAL-TIME AVAILABILITY",
        description: "See which courts are available for training sessions. Community-reported data helps you find the best spots.",
        findAt: "Tab Bar → Live Map",
        tabIcon: "map",
    },
    {
        id: "clients",
        icon: "people",
        color: "#8B5CF6",
        title: "Build Your Client Base",
        subtitle: "GET DISCOVERED",
        description: "Your profile reaches thousands of local athletes. Get reviews, build reputation, grow your business.",
        findAt: "Trainers Tab → Your Profile",
    },
    {
        id: "gia",
        icon: "sparkles",
        color: "#EC4899",
        title: "GIA Coaching Assistant",
        subtitle: "AI FOR COACHES",
        description: "Get training tips, session ideas, and client management help. GIA is your coaching assistant.",
        findAt: "Tab Bar → GIA",
        tabIcon: "sparkles",
    },
    {
        id: "referrals",
        icon: "gift",
        color: "#F59E0B",
        title: "Earn From Referrals",
        subtitle: "SHARE & EARN",
        description: "Invite other trainers and athletes. Earn bonuses when they book or get booked.",
        findAt: "Profile → Referrals",
    },
]

// ========== INSTRUCTOR (STUDIO) FEATURES ==========
const INSTRUCTOR_FEATURES: FeatureSlide[] = [
    {
        id: "low-fee",
        icon: "cash",
        color: "#22C55E",
        title: "Keep 94% of Your Earnings",
        subtitle: "LOWEST FEES IN THE INDUSTRY",
        description: "Only 6% platform fee—you keep 94% of every session. ClassPass takes 50%+. We believe instructors should keep what they earn.",
        findAt: "Your Business → Earnings",
    },
    {
        id: "pro-revenue",
        icon: "star",
        color: "#F59E0B",
        title: "Earn From Pro Members",
        subtitle: "$3/MONTH PER PRO CLIENT",
        description: "When your students subscribe to Pro ($10/mo), you get $3/month from each. The more loyal clients you have, the more you earn!",
        findAt: "Your Business → Pro Bonus",
    },
    {
        id: "private-sessions",
        icon: "person",
        color: "#EC4899",
        title: "Offer Private Sessions",
        subtitle: "SET YOUR OWN RATES",
        description: "Clients can book 1-on-1 sessions directly. You set rates, availability, and location. Premium clients, premium rates.",
        findAt: "Instructor Profile → Availability",
    },
    {
        id: "spotify",
        icon: "musical-notes",
        color: "#1DB954",
        title: "Share Your Playlists",
        subtitle: "LET THEM FEEL THE VIBE",
        description: "Post your Spotify playlist before class. Clients see the energy before they book. Great playlists = more sign-ups!",
        findAt: "Class Details → Add Playlist",
    },
    {
        id: "pro-priority",
        icon: "flash",
        color: "#8B5CF6",
        title: "Control Waitlist Priority",
        subtitle: "YOU DECIDE THE RULES",
        description: "Toggle Pro Priority on or off for each class. You control whether Pro members get waitlist priority—it's your class.",
        findAt: "Your Business → Settings",
    },
    {
        id: "dashboard",
        icon: "desktop",
        color: "#3B82F6",
        title: "Full Dashboard Access",
        subtitle: "MANAGE YOUR BUSINESS",
        description: "Mobile app syncs with web dashboard. Manage clients, analytics, messages, and calendar from anywhere.",
        findAt: "Your Business → Open Dashboard",
    },
]


// ========== BOTH (HYBRID) FEATURES ==========
const BOTH_FEATURES: FeatureSlide[] = [
    {
        id: "live-data",
        icon: "pulse",
        color: "#EF4444",
        title: "Real-Time Venue Data",
        subtitle: "THE WAZE OF SPORTS & WELLNESS",
        description: "See live conditions at courts and studios—all crowdsourced. Know before you go, whether training or teaching.",
        findAt: "Home → Nearest Venue Widget",
    },
    {
        id: "dual-mode",
        icon: "sync",
        color: "#06B6D4",
        title: "Player + Teacher Mode",
        subtitle: "SWITCH ANYTIME",
        description: "Your home dashboard adapts to what you need. Practice mode for playing, business mode for teaching.",
        findAt: "Profile → My Preferences",
    },
    {
        id: "earnings",
        icon: "cash",
        color: "#22C55E",
        title: "Track Your Earnings",
        subtitle: "TEACH & EARN",
        description: "See your coaching/teaching income alongside court reporting earnings. Multiple revenue streams!",
        findAt: "Home → Earnings Dashboard",
    },
    {
        id: "live-map",
        icon: "map",
        color: "#3B82F6",
        title: "Find Any Venue",
        subtitle: "COURTS + STUDIOS",
        description: "Whether you need a court to play or a space to teach, find it with real-time community data.",
        findAt: "Tab Bar → Live Map",
        tabIcon: "map",
    },
    {
        id: "gia",
        icon: "sparkles",
        color: "#EC4899",
        title: "GIA Your Way",
        subtitle: "CONTEXT-AWARE AI",
        description: "GIA adapts to you—coaching tips when teaching, game finder when playing. Your personal assistant.",
        findAt: "Tab Bar → GIA",
        tabIcon: "sparkles",
    },
    {
        id: "community",
        icon: "people",
        color: "#8B5CF6",
        title: "Build Your Network",
        subtitle: "PLAYERS + CLIENTS",
        description: "Connect with players for games and clients for sessions. One app for your entire sports life.",
        findAt: "Live Map + Trainers Tab",
    },
]

// Get features based on user type
const getFeaturesForUserType = (userType: string | null): FeatureSlide[] => {
    switch (userType) {
        case "player":
            return PLAYER_FEATURES
        case "trainer":
            return TRAINER_FEATURES
        case "instructor":
            return INSTRUCTOR_FEATURES
        case "both":
            return BOTH_FEATURES
        default:
            return PLAYER_FEATURES
    }
}


export default function FeaturesScreen() {
    const { preferences } = useUserPreferences()
    const features = getFeaturesForUserType(preferences.userType)

    const [currentIndex, setCurrentIndex] = useState(0)
    const slideAnim = useRef(new Animated.Value(0)).current
    const fadeAnim = useRef(new Animated.Value(1)).current

    const currentSlide = features[currentIndex]
    const isLastSlide = currentIndex === features.length - 1

    useEffect(() => {
        // Animate in on mount
        Animated.spring(slideAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start()
    }, [])

    const animateToNext = (callback: () => void) => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            callback()
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start()
        })
    }

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (isLastSlide) {
            handleComplete()
        } else {
            animateToNext(() => setCurrentIndex(currentIndex + 1))
        }
    }

    const handleSkip = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        handleComplete()
    }

    const handleComplete = async () => {
        await AsyncStorage.setItem("hasSeenFeatures", "true")
        await AsyncStorage.setItem("hasCompletedOnboarding", "true")
        router.replace("/(tabs)")
    }

    const handleDotPress = (index: number) => {
        if (index !== currentIndex) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            animateToNext(() => setCurrentIndex(index))
        }
    }

    // Get personalized header based on user type
    const getHeader = () => {
        switch (preferences.userType) {
            case "trainer":
                return "Your Coaching Toolkit"
            case "instructor":
                return "Your Teaching Toolkit"
            case "both":
                return "Your Complete Toolkit"
            default:
                return "Your Sports Toolkit"
        }
    }

    return (
        <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Skip Button */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>{getHeader()}</Text>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: slideAnim }],
                        }
                    ]}
                >
                    {/* Feature Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: `${currentSlide.color}20` }]}>
                        <View style={[styles.iconRing, { borderColor: currentSlide.color }]}>
                            <Ionicons name={currentSlide.icon as any} size={56} color={currentSlide.color} />
                        </View>
                    </View>

                    {/* Badge */}
                    <View style={[styles.badge, { backgroundColor: `${currentSlide.color}30` }]}>
                        <Text style={[styles.badgeText, { color: currentSlide.color }]}>{currentSlide.subtitle}</Text>
                    </View>

                    {/* Title & Description */}
                    <Text style={styles.title}>{currentSlide.title}</Text>
                    <Text style={styles.description}>{currentSlide.description}</Text>

                    {/* Find At */}
                    <View style={styles.findAtContainer}>
                        <Ionicons name="location" size={16} color="#7ED957" />
                        <Text style={styles.findAtText}>{currentSlide.findAt}</Text>
                    </View>

                    {/* Tab Preview (if applicable) */}
                    {currentSlide.tabIcon && (
                        <View style={styles.tabPreview}>
                            <View style={styles.tabPreviewIcon}>
                                <Ionicons name={currentSlide.tabIcon as any} size={20} color={currentSlide.color} />
                            </View>
                            <Text style={styles.tabPreviewText}>In your tab bar</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Progress Dots */}
                    <View style={styles.dotsContainer}>
                        {features.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleDotPress(index)}
                                style={[
                                    styles.dot,
                                    index === currentIndex && [styles.dotActive, { backgroundColor: currentSlide.color }]
                                ]}
                            />
                        ))}
                    </View>

                    {/* Counter */}
                    <Text style={styles.counter}>
                        {currentIndex + 1} of {features.length}
                    </Text>

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={handleNext}
                        style={[styles.continueButton, { backgroundColor: currentSlide.color }]}
                    >
                        <Text style={styles.continueText}>
                            {isLastSlide ? "Let's Go!" : "Next"}
                        </Text>
                        <Ionicons
                            name={isLastSlide ? "rocket" : "arrow-forward"}
                            size={20}
                            color="#FFF"
                        />
                    </TouchableOpacity>
                </View>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    headerText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        position: "relative",
    },
    emoji: {
        position: "absolute",
        top: 8,
        right: 12,
        fontSize: 32,
    },
    iconRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    badge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    findAtContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(126, 217, 87, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    findAtText: {
        fontSize: 14,
        color: "#7ED957",
        fontWeight: "500",
    },
    tabPreview: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        gap: 8,
    },
    tabPreviewIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center",
    },
    tabPreviewText: {
        fontSize: 13,
        color: "#666",
    },
    bottomSection: {
        paddingHorizontal: 32,
        paddingBottom: 32,
        alignItems: "center",
    },
    dotsContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#333",
    },
    dotActive: {
        width: 24,
        borderRadius: 4,
    },
    counter: {
        fontSize: 12,
        color: "#666",
        marginBottom: 20,
    },
    continueButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        gap: 8,
        width: "100%",
    },
    continueText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
})
