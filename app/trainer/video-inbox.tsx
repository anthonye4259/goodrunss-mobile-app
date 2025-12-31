/**
 * Video Inbox (Coach)
 * 
 * Coach's inbox for reviewing player videos and sending feedback
 * Features:
 * - View pending video submissions
 * - Watch player videos
 * - Record/send feedback
 * - Mark as complete
 */

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { Video, ResizeMode } from "expo-av"

import { remoteTrainingService } from "@/lib/services/remote-training-service"
import { videoUploadService } from "@/lib/services/video-upload-service"
import type { RemoteBooking } from "@/lib/types/remote-training"
import { SERVICE_TYPE_COLORS, SERVICE_TYPE_LABELS } from "@/lib/types/remote-training"

export default function VideoInboxScreen() {
    const [bookings, setBookings] = useState<RemoteBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<RemoteBooking | null>(null)
    const [feedbackText, setFeedbackText] = useState("")
    const [recording, setRecording] = useState(false)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        loadBookings()
    }, [])

    const loadBookings = async () => {
        setLoading(true)
        try {
            // Get bookings that are pending review (video analysis, form check)
            const allBookings = await remoteTrainingService.getTrainerBookings()
            const pending = allBookings.filter(b =>
                b.status === "pending_review" && b.playerVideoUrl
            )
            setBookings(pending)
        } catch (error) {
            console.error("Error loading bookings:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectBooking = (booking: RemoteBooking) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedBooking(booking)
        setFeedbackText("")
    }

    const handleRecordFeedback = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setRecording(true)

        try {
            // Record a feedback video
            const videoUri = await videoUploadService.recordVideo({ maxDuration: 300 }) // 5 min max

            if (videoUri) {
                // Upload the feedback video
                const uploaded = await videoUploadService.uploadVideo(
                    videoUri,
                    "coach_feedback",
                    { bookingId: selectedBooking?.id },
                    (progress) => {
                        console.log(`Upload progress: ${progress.percentComplete}%`)
                    }
                )

                if (uploaded && selectedBooking) {
                    await sendFeedback(uploaded.url)
                }
            }
        } catch (error) {
            console.error("Recording failed:", error)
            Alert.alert("Error", "Failed to record feedback video")
        } finally {
            setRecording(false)
        }
    }

    const handleSendTextFeedback = async () => {
        if (!feedbackText.trim()) {
            Alert.alert("Error", "Please enter your feedback")
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        await sendFeedback(undefined, feedbackText)
    }

    const sendFeedback = async (videoUrl?: string, text?: string) => {
        if (!selectedBooking) return

        setSending(true)
        try {
            await remoteTrainingService.sendFeedback(selectedBooking.id, {
                videoUrl,
                text,
            })

            Alert.alert("Success", "Feedback sent to player!")

            // Remove from list and reset
            setBookings(bookings.filter(b => b.id !== selectedBooking.id))
            setSelectedBooking(null)
            setFeedbackText("")
        } catch (error) {
            console.error("Send feedback failed:", error)
            Alert.alert("Error", "Failed to send feedback")
        } finally {
            setSending(false)
        }
    }

    const getTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diff < 1) return "Just now"
        if (diff < 24) return `${diff}h ago`
        if (diff < 48) return "Yesterday"
        return `${Math.floor(diff / 24)}d ago`
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
                    <Text style={styles.headerTitle}>Video Inbox</Text>
                    <TouchableOpacity onPress={loadBookings}>
                        <Ionicons name="refresh" size={24} color="#6B9B5A" />
                    </TouchableOpacity>
                </View>

                {selectedBooking ? (
                    // Detail View
                    <ScrollView contentContainerStyle={styles.detailContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setSelectedBooking(null)}
                        >
                            <Ionicons name="arrow-back" size={16} color="#6B9B5A" />
                            <Text style={styles.backButtonText}>Back to Inbox</Text>
                        </TouchableOpacity>

                        {/* Player Video */}
                        <View style={styles.videoSection}>
                            <Text style={styles.sectionTitle}>Player's Video</Text>
                            {selectedBooking.playerVideoUrl && (
                                <Video
                                    source={{ uri: selectedBooking.playerVideoUrl }}
                                    style={styles.videoPlayer}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    shouldPlay={false}
                                />
                            )}
                        </View>

                        {/* Player Notes */}
                        {selectedBooking.notes && (
                            <View style={styles.notesSection}>
                                <Text style={styles.sectionTitle}>Player's Notes</Text>
                                <Text style={styles.notesText}>{selectedBooking.notes}</Text>
                            </View>
                        )}

                        {/* Service Info */}
                        <View style={styles.serviceInfo}>
                            <View style={[
                                styles.serviceBadge,
                                { backgroundColor: `${SERVICE_TYPE_COLORS[selectedBooking.service.type]}20` }
                            ]}>
                                <Text style={[
                                    styles.serviceBadgeText,
                                    { color: SERVICE_TYPE_COLORS[selectedBooking.service.type] }
                                ]}>
                                    {SERVICE_TYPE_LABELS[selectedBooking.service.type]}
                                </Text>
                            </View>
                            <Text style={styles.servicePrice}>
                                ${selectedBooking.service.price}
                            </Text>
                        </View>

                        {/* Feedback Section */}
                        <View style={styles.feedbackSection}>
                            <Text style={styles.sectionTitle}>Your Feedback</Text>

                            {/* Record Video Option */}
                            <TouchableOpacity
                                style={styles.recordButton}
                                onPress={handleRecordFeedback}
                                disabled={recording}
                            >
                                <LinearGradient
                                    colors={["#EF4444", "#DC2626"]}
                                    style={styles.recordButtonGradient}
                                >
                                    <Ionicons
                                        name={recording ? "stop" : "videocam"}
                                        size={24}
                                        color="#FFF"
                                    />
                                    <Text style={styles.recordButtonText}>
                                        {recording ? "Recording..." : "Record Video Feedback"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <Text style={styles.orText}>— or send text feedback —</Text>

                            {/* Text Feedback */}
                            <TextInput
                                style={styles.feedbackInput}
                                placeholder="Type your feedback here..."
                                placeholderTextColor="#666"
                                value={feedbackText}
                                onChangeText={setFeedbackText}
                                multiline
                                numberOfLines={6}
                            />

                            <TouchableOpacity
                                style={[styles.sendButton, !feedbackText.trim() && styles.sendButtonDisabled]}
                                onPress={handleSendTextFeedback}
                                disabled={!feedbackText.trim() || sending}
                            >
                                <Text style={styles.sendButtonText}>
                                    {sending ? "Sending..." : "Send Text Feedback"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    // Inbox List View
                    <ScrollView contentContainerStyle={styles.content}>
                        {loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.loadingText}>Loading...</Text>
                            </View>
                        ) : bookings.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="videocam-off-outline" size={48} color="#666" />
                                <Text style={styles.emptyTitle}>No pending videos</Text>
                                <Text style={styles.emptyText}>
                                    When players submit videos for analysis, they'll appear here.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.inboxCount}>
                                    {bookings.length} video{bookings.length !== 1 ? "s" : ""} awaiting review
                                </Text>
                                {bookings.map(booking => (
                                    <TouchableOpacity
                                        key={booking.id}
                                        style={styles.bookingCard}
                                        onPress={() => handleSelectBooking(booking)}
                                    >
                                        <LinearGradient
                                            colors={["#1A1A1A", "#0F0F0F"]}
                                            style={styles.bookingGradient}
                                        >
                                            {/* Thumbnail */}
                                            <View style={styles.thumbnail}>
                                                <Ionicons name="play-circle" size={32} color="#6B9B5A" />
                                            </View>

                                            {/* Info */}
                                            <View style={styles.bookingInfo}>
                                                <Text style={styles.bookingService}>
                                                    {booking.service.name}
                                                </Text>
                                                <Text style={styles.bookingTime}>
                                                    Submitted {getTimeAgo(booking.createdAt)}
                                                </Text>
                                                <View style={[
                                                    styles.typeBadge,
                                                    { backgroundColor: `${SERVICE_TYPE_COLORS[booking.service.type]}20` }
                                                ]}>
                                                    <Text style={[
                                                        styles.typeBadgeText,
                                                        { color: SERVICE_TYPE_COLORS[booking.service.type] }
                                                    ]}>
                                                        {SERVICE_TYPE_LABELS[booking.service.type]}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Arrow */}
                                            <Ionicons name="chevron-forward" size={20} color="#666" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    safeArea: { flex: 1 },
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
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    detailContent: {
        padding: 20,
        paddingBottom: 100,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
    },
    backButtonText: {
        color: "#6B9B5A",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
    },
    loadingText: {
        color: "#666",
        fontSize: 14,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginTop: 8,
    },
    inboxCount: {
        fontSize: 14,
        color: "#888",
        marginBottom: 16,
    },
    bookingCard: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
    },
    bookingGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        borderRadius: 16,
    },
    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    bookingInfo: {
        flex: 1,
        marginLeft: 12,
    },
    bookingService: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
    bookingTime: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    typeBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    videoSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 12,
    },
    videoPlayer: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        backgroundColor: "#000",
    },
    notesSection: {
        marginBottom: 24,
    },
    notesText: {
        fontSize: 14,
        color: "#AAA",
        backgroundColor: "#1A1A1A",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    serviceInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    serviceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    serviceBadgeText: {
        fontSize: 13,
        fontWeight: "600",
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#6B9B5A",
    },
    feedbackSection: {
        marginBottom: 24,
    },
    recordButton: {
        borderRadius: 12,
        overflow: "hidden",
    },
    recordButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 16,
    },
    recordButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
    orText: {
        textAlign: "center",
        color: "#666",
        fontSize: 12,
        marginVertical: 16,
    },
    feedbackInput: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: "#FFF",
        borderWidth: 1,
        borderColor: "#2A2A2A",
        minHeight: 120,
        textAlignVertical: "top",
        marginBottom: 16,
    },
    sendButton: {
        backgroundColor: "#6B9B5A",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#333",
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
})
