/**
 * Playlist Components
 * 
 * UI for displaying Spotify playlists on class cards
 */

import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Linking,
    Modal,
    TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

import type { ClassPlaylist } from "@/lib/services/spotify-service"
import { VIBE_PRESETS, postPlaylistToClass } from "@/lib/services/spotify-service"

// ============================================
// PLAYLIST BADGE (for class cards)
// ============================================

interface PlaylistBadgeProps {
    playlistName?: string
    coverImage?: string
    vibe?: string
    onPress?: () => void
}

export function PlaylistBadge({ playlistName, coverImage, vibe, onPress }: PlaylistBadgeProps) {
    if (!playlistName) return null

    return (
        <TouchableOpacity style={styles.playlistBadge} onPress={onPress} activeOpacity={0.8}>
            {coverImage && (
                <Image source={{ uri: coverImage }} style={styles.playlistCover} />
            )}
            <View style={styles.playlistBadgeText}>
                <View style={styles.spotifyRow}>
                    <Ionicons name="musical-notes" size={12} color="#1DB954" />
                    <Text style={styles.spotifyLabel}>Playlist</Text>
                </View>
                <Text style={styles.vibeName} numberOfLines={1}>
                    {vibe || playlistName}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

// ============================================
// PLAYLIST PREVIEW (expandable)
// ============================================

interface PlaylistPreviewProps {
    playlist: ClassPlaylist
}

export function PlaylistPreview({ playlist }: PlaylistPreviewProps) {
    const handleOpenSpotify = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        Linking.openURL(playlist.playlistUrl)
    }

    return (
        <View style={styles.playlistPreview}>
            {/* Header */}
            <View style={styles.previewHeader}>
                {playlist.coverImage && (
                    <Image source={{ uri: playlist.coverImage }} style={styles.previewCover} />
                )}
                <View style={styles.previewInfo}>
                    <View style={styles.spotifyTag}>
                        <Ionicons name="logo-closed-captioning" size={14} color="#1DB954" />
                        <Text style={styles.spotifyTagText}>Spotify</Text>
                    </View>
                    <Text style={styles.previewName}>{playlist.playlistName}</Text>
                    <Text style={styles.previewVibe}>{playlist.vibe}</Text>
                </View>
            </View>

            {/* Preview Tracks */}
            {playlist.previewTracks && playlist.previewTracks.length > 0 && (
                <View style={styles.trackList}>
                    {playlist.previewTracks.slice(0, 3).map((track, index) => (
                        <View key={index} style={styles.trackRow}>
                            <Text style={styles.trackNumber}>{index + 1}</Text>
                            <View style={styles.trackInfo}>
                                <Text style={styles.trackName} numberOfLines={1}>
                                    {track.name}
                                </Text>
                                <Text style={styles.trackArtist} numberOfLines={1}>
                                    {track.artist}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Open in Spotify Button */}
            <TouchableOpacity style={styles.openSpotifyButton} onPress={handleOpenSpotify}>
                <Ionicons name="play-circle" size={20} color="#1DB954" />
                <Text style={styles.openSpotifyText}>Open in Spotify</Text>
            </TouchableOpacity>
        </View>
    )
}

// ============================================
// PLAYLIST POST MODAL (for instructors)
// ============================================

interface PlaylistPostModalProps {
    visible: boolean
    onClose: () => void
    classId: string
    instructorId: string
    onSuccess?: () => void
}

export function PlaylistPostModal({
    visible,
    onClose,
    classId,
    instructorId,
    onSuccess,
}: PlaylistPostModalProps) {
    const [url, setUrl] = useState("")
    const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handlePost = async () => {
        if (!url.includes("spotify.com/playlist")) {
            // Could show error
            return
        }

        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        const vibe = selectedVibe
            ? VIBE_PRESETS.find(v => v.id === selectedVibe)?.label + " " + VIBE_PRESETS.find(v => v.id === selectedVibe)?.emoji
            : undefined

        const success = await postPlaylistToClass(classId, instructorId, url, vibe)

        setLoading(false)

        if (success) {
            onSuccess?.()
            onClose()
            setUrl("")
            setSelectedVibe(null)
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Playlist</Text>
                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={!url || loading}
                        style={[styles.postButton, (!url || loading) && styles.postButtonDisabled]}
                    >
                        <Text style={styles.postButtonText}>
                            {loading ? "Posting..." : "Post"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Spotify URL Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Spotify Playlist URL</Text>
                    <View style={styles.urlInput}>
                        <Ionicons name="link" size={18} color="#6B7280" />
                        <TextInput
                            style={styles.urlTextInput}
                            placeholder="https://open.spotify.com/playlist/..."
                            placeholderTextColor="#6B7280"
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                    <Text style={styles.inputHint}>
                        Paste the link from Spotify's "Share" menu
                    </Text>
                </View>

                {/* Vibe Selection */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>What's the vibe?</Text>
                    <View style={styles.vibeGrid}>
                        {VIBE_PRESETS.map(vibe => (
                            <TouchableOpacity
                                key={vibe.id}
                                style={[
                                    styles.vibeChip,
                                    selectedVibe === vibe.id && styles.vibeChipSelected,
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    setSelectedVibe(selectedVibe === vibe.id ? null : vibe.id)
                                }}
                            >
                                <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                                <Text style={[
                                    styles.vibeLabel,
                                    selectedVibe === vibe.id && styles.vibeLabelSelected,
                                ]}>
                                    {vibe.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview */}
                <View style={styles.previewSection}>
                    <Text style={styles.inputLabel}>Why share your playlist?</Text>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitRow}>
                            <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                            <Text style={styles.benefitText}>
                                Clients see the vibe before booking
                            </Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                            <Text style={styles.benefitText}>
                                Music lovers find classes they'll love
                            </Text>
                        </View>
                        <View style={styles.benefitRow}>
                            <Ionicons name="checkmark-circle" size={18} color="#7ED957" />
                            <Text style={styles.benefitText}>
                                Stand out with unique class experience
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    // Playlist Badge
    playlistBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(29, 185, 84, 0.15)",
        borderRadius: 8,
        padding: 8,
        gap: 8,
    },
    playlistCover: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
    playlistBadgeText: {},
    spotifyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    spotifyLabel: {
        fontSize: 10,
        color: "#1DB954",
        fontWeight: "600",
    },
    vibeName: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "500",
    },

    // Playlist Preview
    playlistPreview: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#1DB95440",
    },
    previewHeader: {
        flexDirection: "row",
        gap: 12,
    },
    previewCover: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    previewInfo: {
        flex: 1,
    },
    spotifyTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    spotifyTagText: {
        fontSize: 11,
        color: "#1DB954",
        fontWeight: "600",
    },
    previewName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 4,
    },
    previewVibe: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 2,
    },
    trackList: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingTop: 12,
    },
    trackRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 10,
    },
    trackNumber: {
        width: 20,
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
    },
    trackInfo: {
        flex: 1,
    },
    trackName: {
        fontSize: 13,
        color: "#FFFFFF",
    },
    trackArtist: {
        fontSize: 11,
        color: "#6B7280",
    },
    openSpotifyButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1DB95420",
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
        gap: 6,
    },
    openSpotifyText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1DB954",
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: "#0A0A0A",
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    postButton: {
        backgroundColor: "#1DB954",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    postButtonDisabled: {
        opacity: 0.5,
    },
    postButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    urlInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 10,
        padding: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: "#333",
    },
    urlTextInput: {
        flex: 1,
        fontSize: 14,
        color: "#FFFFFF",
    },
    inputHint: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 6,
    },
    vibeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    vibeChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#333",
        gap: 4,
    },
    vibeChipSelected: {
        borderColor: "#1DB954",
        backgroundColor: "rgba(29, 185, 84, 0.1)",
    },
    vibeEmoji: {
        fontSize: 14,
    },
    vibeLabel: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    vibeLabelSelected: {
        color: "#1DB954",
    },
    previewSection: {
        marginTop: 20,
    },
    benefitsList: {
        gap: 10,
    },
    benefitRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    benefitText: {
        fontSize: 13,
        color: "#9CA3AF",
    },
})

export default {
    PlaylistBadge,
    PlaylistPreview,
    PlaylistPostModal,
}
