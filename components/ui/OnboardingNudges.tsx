/**
 * Onboarding Nudges System
 * 
 * Context-aware tooltips and nudges for new users.
 * Tracks which nudges have been shown.
 */

import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from "react-native"
import { useEffect, useRef, useState, createContext, useContext } from "react"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"

const NUDGES_KEY = "shown_nudges"

type NudgeType =
    | "discover_live_traffic"
    | "first_favorite"
    | "complete_profile"
    | "report_earnings"

type NudgeConfig = {
    title: string
    message: string
    icon: string
    color: string
    action?: { label: string; route: string }
}

const NUDGE_CONFIGS: Record<NudgeType, NudgeConfig> = {
    discover_live_traffic: {
        title: "Live Court Traffic! 🔥",
        message: "Tap any court to see real-time player counts",
        icon: "people",
        color: "#22C55E",
    },
    first_favorite: {
        title: "Save Your Favorites ❤️",
        message: "Tap the heart to save this court for quick access",
        icon: "heart",
        color: "#EF4444",
    },
    complete_profile: {
        title: "Complete Your Profile",
        message: "Add a photo and bio to connect with more players",
        icon: "person",
        color: "#8B5CF6",
        action: { label: "Complete", route: "/settings/profile" },
    },
    report_earnings: {
        title: "Earn $5! 💰",
        message: "You're 1 report away from your first payout",
        icon: "cash",
        color: "#7ED957",
        action: { label: "Report Now", route: "/report-facility/quick" },
    },
}

type NudgesContextType = {
    showNudge: (type: NudgeType, position?: { x: number; y: number }) => void
    hasSeenNudge: (type: NudgeType) => Promise<boolean>
    markNudgeSeen: (type: NudgeType) => Promise<void>
}

const NudgesContext = createContext<NudgesContextType | null>(null)

export function useNudges() {
    const context = useContext(NudgesContext)
    if (!context) {
        throw new Error("useNudges must be used within NudgesProvider")
    }
    return context
}

export function NudgesProvider({ children }: { children: React.ReactNode }) {
    const [activeNudge, setActiveNudge] = useState<NudgeType | null>(null)
    const [position, setPosition] = useState({ x: 0, y: 100 })
    const [shownNudges, setShownNudges] = useState<Set<NudgeType>>(new Set())

    const slideAnim = useRef(new Animated.Value(-200)).current
    const opacityAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        loadShownNudges()
    }, [])

    const loadShownNudges = async () => {
        try {
            const stored = await AsyncStorage.getItem(NUDGES_KEY)
            if (stored) {
                setShownNudges(new Set(JSON.parse(stored)))
            }
        } catch (error) {
            console.log("Failed to load nudges:", error)
        }
    }

    const hasSeenNudge = async (type: NudgeType): Promise<boolean> => {
        return shownNudges.has(type)
    }

    const markNudgeSeen = async (type: NudgeType) => {
        const updated = new Set([...shownNudges, type])
        setShownNudges(updated)
        try {
            await AsyncStorage.setItem(NUDGES_KEY, JSON.stringify([...updated]))
        } catch (error) {
            console.log("Failed to save nudge:", error)
        }
    }

    const showNudge = async (type: NudgeType, pos?: { x: number; y: number }) => {
        if (shownNudges.has(type)) return

        setActiveNudge(type)
        if (pos) setPosition(pos)

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const hideNudge = () => {
        if (activeNudge) {
            markNudgeSeen(activeNudge)
        }

        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -200,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setActiveNudge(null))
    }

    const config = activeNudge ? NUDGE_CONFIGS[activeNudge] : null

    return (
        <NudgesContext.Provider value={{ showNudge, hasSeenNudge, markNudgeSeen }}>
            {children}
            {activeNudge && config && (
                <Animated.View
                    style={[
                        styles.nudgeContainer,
                        {
                            top: position.y,
                            transform: [{ translateY: slideAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    <View style={[styles.nudge, { borderColor: config.color + "60" }]}>
                        <View style={[styles.nudgeIcon, { backgroundColor: config.color + "20" }]}>
                            <Ionicons name={config.icon as any} size={20} color={config.color} />
                        </View>
                        <View style={styles.nudgeContent}>
                            <Text style={styles.nudgeTitle}>{config.title}</Text>
                            <Text style={styles.nudgeMessage}>{config.message}</Text>
                        </View>
                        <TouchableOpacity onPress={hideNudge} style={styles.dismissButton}>
                            <Ionicons name="close" size={18} color="#888" />
                        </TouchableOpacity>
                    </View>
                    {/* Arrow pointer */}
                    <View style={[styles.arrow, { borderTopColor: "#1A1A1A" }]} />
                </Animated.View>
            )}
        </NudgesContext.Provider>
    )
}

const styles = StyleSheet.create({
    nudgeContainer: {
        position: "absolute",
        left: 16,
        right: 16,
        zIndex: 9998,
        alignItems: "center",
    },
    nudge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    nudgeIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    nudgeContent: {
        flex: 1,
    },
    nudgeTitle: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 2,
    },
    nudgeMessage: {
        color: "#888",
        fontSize: 13,
    },
    dismissButton: {
        padding: 4,
    },
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
    },
})

export default NudgesProvider
