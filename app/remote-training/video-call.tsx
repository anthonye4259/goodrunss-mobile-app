/**
 * Video Call Screen
 * 
 * Active video call using Daily.co
 * Features:
 * - Real-time video/audio
 * - Mute/camera toggle
 * - End call
 * - Session timer
 */

import { useState, useEffect, useRef, useCallback } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"
import Daily, { DailyCall, DailyParticipant } from "@daily-co/react-native-daily-js"

import { liveSessionService } from "@/lib/services/live-session-service"

const { width, height } = Dimensions.get("window")

export default function VideoCallScreen() {
    const params = useLocalSearchParams<{
        sessionId: string
        roomUrl: string
        token?: string
    }>()

    const [callObject, setCallObject] = useState<DailyCall | null>(null)
    const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({})
    const [isJoined, setIsJoined] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isCameraOff, setIsCameraOff] = useState(false)
    const [callDuration, setCallDuration] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        initCall()
        return () => {
            leaveCall()
        }
    }, [])

    // Start timer when joined
    useEffect(() => {
        if (isJoined) {
            timerRef.current = setInterval(() => {
                setCallDuration(d => d + 1)
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isJoined])

    const initCall = async () => {
        if (!params.roomUrl) {
            setError("No room URL provided")
            return
        }

        try {
            // Create Daily call object
            const call = Daily.createCallObject()
            setCallObject(call)

            // Set up event listeners
            call.on("joined-meeting", handleJoined)
            call.on("left-meeting", handleLeft)
            call.on("participant-joined", handleParticipantUpdate)
            call.on("participant-updated", handleParticipantUpdate)
            call.on("participant-left", handleParticipantUpdate)
            call.on("error", handleError)

            // Join the call
            await call.join({
                url: params.roomUrl,
                token: params.token || undefined,
            })
        } catch (err) {
            console.error("Failed to initialize call:", err)
            setError("Failed to connect to the call")
        }
    }

    const handleJoined = useCallback(() => {
        setIsJoined(true)
        // Mark session as started
        if (params.sessionId) {
            liveSessionService.startSession(params.sessionId)
        }
    }, [params.sessionId])

    const handleLeft = useCallback(() => {
        setIsJoined(false)
        router.back()
    }, [])

    const handleParticipantUpdate = useCallback(() => {
        if (callObject) {
            setParticipants({ ...callObject.participants() })
        }
    }, [callObject])

    const handleError = useCallback((event: any) => {
        console.error("Daily.co error:", event)
        setError(event?.errorMsg || "An error occurred")
    }, [])

    const leaveCall = async () => {
        if (callObject) {
            // Remove listeners
            callObject.off("joined-meeting", handleJoined)
            callObject.off("left-meeting", handleLeft)
            callObject.off("participant-joined", handleParticipantUpdate)
            callObject.off("participant-updated", handleParticipantUpdate)
            callObject.off("participant-left", handleParticipantUpdate)
            callObject.off("error", handleError)

            await callObject.leave()
            callObject.destroy()
        }

        // End session
        if (params.sessionId) {
            await liveSessionService.endSession(params.sessionId)
        }

        if (timerRef.current) clearInterval(timerRef.current)
    }

    const handleEndCall = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        Alert.alert(
            "End Session",
            "Are you sure you want to end this session?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "End",
                    style: "destructive",
                    onPress: () => {
                        leaveCall()
                        router.back()
                    },
                },
            ]
        )
    }

    const toggleMute = () => {
        Haptics.selectionAsync()
        if (callObject) {
            callObject.setLocalAudio(!isMuted)
            setIsMuted(!isMuted)
        }
    }

    const toggleCamera = () => {
        Haptics.selectionAsync()
        if (callObject) {
            callObject.setLocalVideo(!isCameraOff)
            setIsCameraOff(!isCameraOff)
        }
    }

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const participantCount = Object.keys(participants).length
    const otherParticipant = Object.values(participants).find(p => !p.local)

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={48} color="#EF4444" />
                    <Text style={styles.errorTitle}>Connection Error</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Video Area */}
            <View style={styles.videoArea}>
                {/* Remote participant (full screen) */}
                <View style={styles.remoteVideo}>
                    {otherParticipant ? (
                        // Daily.co video would render here
                        // In production: <DailyMediaView participant={otherParticipant} />
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="person" size={64} color="#6B9B5A" />
                            <Text style={styles.participantName}>Coach</Text>
                        </View>
                    ) : (
                        <View style={styles.waitingContainer}>
                            <Ionicons name="hourglass-outline" size={48} color="#666" />
                            <Text style={styles.waitingText}>Waiting for coach to join...</Text>
                        </View>
                    )}
                </View>

                {/* Local video (small overlay) */}
                <View style={styles.localVideo}>
                    {isCameraOff ? (
                        <View style={styles.localVideoOff}>
                            <Ionicons name="videocam-off" size={24} color="#666" />
                        </View>
                    ) : (
                        // In production: Local camera preview
                        <View style={styles.localVideoOn}>
                            <Ionicons name="person" size={32} color="#FFF" />
                        </View>
                    )}
                </View>

                {/* Call Duration */}
                <SafeAreaView style={styles.durationContainer} edges={["top"]}>
                    <View style={styles.durationBadge}>
                        <Ionicons name="radio-button-on" size={8} color="#EF4444" />
                        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
                    </View>
                </SafeAreaView>
            </View>

            {/* Controls */}
            <SafeAreaView style={styles.controlsContainer} edges={["bottom"]}>
                <View style={styles.controls}>
                    {/* Mute */}
                    <TouchableOpacity
                        style={[styles.controlButton, isMuted && styles.controlButtonActive]}
                        onPress={toggleMute}
                    >
                        <Ionicons
                            name={isMuted ? "mic-off" : "mic"}
                            size={28}
                            color={isMuted ? "#EF4444" : "#FFF"}
                        />
                    </TouchableOpacity>

                    {/* End Call */}
                    <TouchableOpacity
                        style={styles.endCallButton}
                        onPress={handleEndCall}
                    >
                        <Ionicons name="call" size={32} color="#FFF" />
                    </TouchableOpacity>

                    {/* Camera */}
                    <TouchableOpacity
                        style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
                        onPress={toggleCamera}
                    >
                        <Ionicons
                            name={isCameraOff ? "videocam-off" : "videocam"}
                            size={28}
                            color={isCameraOff ? "#EF4444" : "#FFF"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Connection Status */}
                <View style={styles.statusBar}>
                    <View style={[styles.statusDot, isJoined && styles.statusDotConnected]} />
                    <Text style={styles.statusText}>
                        {isJoined
                            ? `Connected • ${participantCount} participant${participantCount !== 1 ? "s" : ""}`
                            : "Connecting..."
                        }
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    videoArea: {
        flex: 1,
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: "#111",
    },
    videoPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
    },
    participantName: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 12,
    },
    waitingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    waitingText: {
        color: "#888",
        fontSize: 16,
        marginTop: 16,
    },
    localVideo: {
        position: "absolute",
        bottom: 100,
        right: 16,
        width: 100,
        height: 140,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#333",
    },
    localVideoOff: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
    },
    localVideoOn: {
        flex: 1,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
    },
    durationContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    durationBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 16,
    },
    durationText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    controlsContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        paddingTop: 20,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 32,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
    },
    controlButtonActive: {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
    endCallButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotate: "135deg" }],
    },
    statusBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 16,
        paddingBottom: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FBBF24",
    },
    statusDotConnected: {
        backgroundColor: "#6B9B5A",
    },
    statusText: {
        color: "#888",
        fontSize: 12,
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
    },
    errorText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "#333",
        borderRadius: 12,
    },
    retryButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
})
