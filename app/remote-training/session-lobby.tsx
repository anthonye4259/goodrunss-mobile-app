/**
 * Live Session Lobby
 * 
 * Pre-call lobby for live coaching sessions
 * Features:
 * - Camera preview
 * - Mic/Camera toggles
 * - Join call button
 * - Session info display
 */

import { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import { Camera, CameraView } from "expo-camera"

import { liveSessionService, LiveSession } from "@/lib/services/live-session-service"

export default function LiveSessionLobbyScreen() {
    const params = useLocalSearchParams<{ sessionId: string }>()
    const [session, setSession] = useState<LiveSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)
    const [cameraOn, setCameraOn] = useState(true)
    const [micOn, setMicOn] = useState(true)
    const [hasPermission, setHasPermission] = useState(false)
    const [timeUntil, setTimeUntil] = useState<string>("")

    useEffect(() => {
        loadSession()
        requestPermissions()
    }, [params.sessionId])

    useEffect(() => {
        if (!session) return

        const updateTime = () => {
            const mins = liveSessionService.getTimeUntilSession(session)
            if (mins < 0) {
                setTimeUntil("In progress")
            } else if (mins < 1) {
                setTimeUntil("Starting now")
            } else if (mins < 60) {
                setTimeUntil(`Starts in ${mins} min`)
            } else {
                setTimeUntil(`Starts in ${Math.floor(mins / 60)}h ${mins % 60}m`)
            }
        }

        updateTime()
        const interval = setInterval(updateTime, 60000)
        return () => clearInterval(interval)
    }, [session])

    const loadSession = async () => {
        if (!params.sessionId) {
            Alert.alert("Error", "No session ID provided")
            router.back()
            return
        }

        setLoading(true)
        try {
            const sessions = await liveSessionService.getUpcomingSessions()
            const found = sessions.find(s => s.id === params.sessionId)

            if (found) {
                setSession(found)
            } else {
                Alert.alert("Error", "Session not found")
                router.back()
            }
        } catch (error) {
            console.error("Error loading session:", error)
        } finally {
            setLoading(false)
        }
    }

    const requestPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync()
        const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync()
        setHasPermission(status === "granted" && micStatus === "granted")
    }

    const handleJoinCall = async () => {
        if (!session) return

        // Check if session is joinable (within 15 min of start)
        if (!liveSessionService.isSessionJoinable(session)) {
            Alert.alert(
                "Too Early",
                "You can join the session 15 minutes before the scheduled time."
            )
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setJoining(true)

        try {
            const joinData = await liveSessionService.joinSession(session.id)

            if (joinData?.url) {
                // Navigate to the actual video call screen
                router.push({
                    pathname: "/remote-training/video-call",
                    params: {
                        sessionId: session.id,
                        roomUrl: joinData.url,
                        token: joinData.token || "",
                    },
                })
            }
        } catch (error) {
            console.error("Failed to join call:", error)
            Alert.alert("Error", "Failed to join the call. Please try again.")
        } finally {
            setJoining(false)
        }
    }

    const toggleCamera = () => {
        Haptics.selectionAsync()
        setCameraOn(!cameraOn)
    }

    const toggleMic = () => {
        Haptics.selectionAsync()
        setMicOn(!micOn)
    }

    const canJoin = session && liveSessionService.isSessionJoinable(session)

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading session...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={["#0A0A0A", "#111"]} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Session Lobby</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Camera Preview */}
                <View style={styles.cameraContainer}>
                    {hasPermission && cameraOn ? (
                        <CameraView
                            style={styles.camera}
                            facing="front"
                        />
                    ) : (
                        <View style={styles.cameraPlaceholder}>
                            <Ionicons name="person" size={64} color="#666" />
                            <Text style={styles.cameraOffText}>
                                {!hasPermission ? "Camera access denied" : "Camera off"}
                            </Text>
                        </View>
                    )}

                    {/* Mic indicator */}
                    <View style={[styles.micIndicator, !micOn && styles.micIndicatorOff]}>
                        <Ionicons
                            name={micOn ? "mic" : "mic-off"}
                            size={16}
                            color={micOn ? "#6B9B5A" : "#EF4444"}
                        />
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.controlButton, !micOn && styles.controlButtonOff]}
                        onPress={toggleMic}
                    >
                        <Ionicons
                            name={micOn ? "mic" : "mic-off"}
                            size={24}
                            color={micOn ? "#FFF" : "#EF4444"}
                        />
                        <Text style={[styles.controlLabel, !micOn && styles.controlLabelOff]}>
                            {micOn ? "Mic On" : "Mic Off"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, !cameraOn && styles.controlButtonOff]}
                        onPress={toggleCamera}
                    >
                        <Ionicons
                            name={cameraOn ? "videocam" : "videocam-off"}
                            size={24}
                            color={cameraOn ? "#FFF" : "#EF4444"}
                        />
                        <Text style={[styles.controlLabel, !cameraOn && styles.controlLabelOff]}>
                            {cameraOn ? "Camera On" : "Camera Off"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Session Info */}
                <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTime}>{timeUntil}</Text>
                    <Text style={styles.sessionDuration}>
                        {session?.duration} minute session
                    </Text>
                </View>

                {/* Join Button */}
                <TouchableOpacity
                    style={[styles.joinButton, !canJoin && styles.joinButtonDisabled]}
                    onPress={handleJoinCall}
                    disabled={!canJoin || joining}
                >
                    <LinearGradient
                        colors={canJoin ? ["#6B9B5A", "#4A7A3A"] : ["#333", "#222"]}
                        style={styles.joinButtonGradient}
                    >
                        <Ionicons name="videocam" size={24} color="#FFF" />
                        <Text style={styles.joinButtonText}>
                            {joining ? "Connecting..." : canJoin ? "Join Session" : "Not Yet Available"}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Tips */}
                <View style={styles.tips}>
                    <Text style={styles.tipTitle}>Quick Tips</Text>
                    <View style={styles.tip}>
                        <Ionicons name="checkmark-circle" size={16} color="#6B9B5A" />
                        <Text style={styles.tipText}>Find a quiet, well-lit space</Text>
                    </View>
                    <View style={styles.tip}>
                        <Ionicons name="checkmark-circle" size={16} color="#6B9B5A" />
                        <Text style={styles.tipText}>Check your internet connection</Text>
                    </View>
                    <View style={styles.tip}>
                        <Ionicons name="checkmark-circle" size={16} color="#6B9B5A" />
                        <Text style={styles.tipText}>Have your racket/equipment ready</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "#888",
        fontSize: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    cameraContainer: {
        marginHorizontal: 20,
        height: 300,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#1A1A1A",
    },
    camera: {
        flex: 1,
    },
    cameraPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    cameraOffText: {
        color: "#666",
        fontSize: 14,
        marginTop: 12,
    },
    micIndicator: {
        position: "absolute",
        bottom: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    micIndicatorOff: {
        backgroundColor: "#EF444420",
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
        marginTop: 24,
    },
    controlButton: {
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#2A2A2A",
        minWidth: 100,
    },
    controlButtonOff: {
        backgroundColor: "#2A2A2A",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    controlLabel: {
        color: "#FFF",
        fontSize: 12,
        marginTop: 8,
    },
    controlLabelOff: {
        color: "#EF4444",
    },
    sessionInfo: {
        alignItems: "center",
        marginTop: 24,
    },
    sessionTime: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    sessionDuration: {
        fontSize: 14,
        color: "#888",
        marginTop: 4,
    },
    joinButton: {
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 16,
        overflow: "hidden",
    },
    joinButtonDisabled: {
        opacity: 0.6,
    },
    joinButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 18,
    },
    joinButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    tips: {
        marginHorizontal: 20,
        marginTop: 32,
        padding: 16,
        backgroundColor: "#1A1A1A",
        borderRadius: 16,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 12,
    },
    tip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: "#AAA",
    },
})
