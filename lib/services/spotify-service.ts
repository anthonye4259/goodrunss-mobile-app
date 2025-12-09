/**
 * Spotify Integration Service
 * 
 * Features:
 * - Instructors connect Spotify account
 * - Post playlists to class listings
 * - Clients preview playlists before booking
 * - Playlist display on class cards
 */

import AsyncStorage from "@react-native-async-storage/async-storage"
import { db } from "@/lib/firebase-config"

// Spotify API endpoints
const SPOTIFY_API_URL = "https://api.spotify.com/v1"

// Types
export interface SpotifyPlaylist {
    id: string
    name: string
    description?: string
    images: { url: string; width: number; height: number }[]
    tracks: {
        total: number
        items?: SpotifyTrack[]
    }
    external_urls: {
        spotify: string
    }
    owner: {
        display_name: string
    }
}

export interface SpotifyTrack {
    track: {
        id: string
        name: string
        artists: { name: string }[]
        album: {
            name: string
            images: { url: string }[]
        }
        duration_ms: number
        preview_url?: string // 30-second preview
    }
}

export interface ClassPlaylist {
    classId: string
    playlistId: string
    playlistName: string
    playlistUrl: string
    coverImage?: string
    trackCount: number
    vibe?: string // "EDM Energy", "Chill Flow", etc.
    previewTracks?: {
        name: string
        artist: string
        previewUrl?: string
    }[]
    postedAt: Date
    postedBy: string // instructorId
}

// ============================================
// PLAYLIST CRUD
// ============================================

/**
 * Instructor posts a playlist to their class
 */
export async function postPlaylistToClass(
    classId: string,
    instructorId: string,
    spotifyPlaylistUrl: string,
    vibe?: string
): Promise<boolean> {
    if (!db) return false

    try {
        // Extract playlist ID from URL
        // URL format: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
        const playlistId = extractPlaylistId(spotifyPlaylistUrl)
        if (!playlistId) {
            console.error("[SpotifyService] Invalid playlist URL")
            return false
        }

        // Fetch playlist details from Spotify (public endpoint, no auth needed for public playlists)
        const playlistData = await fetchPublicPlaylist(playlistId)
        if (!playlistData) {
            console.error("[SpotifyService] Could not fetch playlist")
            return false
        }

        const { addDoc, collection, Timestamp } = await import("firebase/firestore")

        // Save to Firebase
        await addDoc(collection(db, "classPlaylists"), {
            classId,
            playlistId,
            playlistName: playlistData.name,
            playlistUrl: spotifyPlaylistUrl,
            coverImage: playlistData.images?.[0]?.url || null,
            trackCount: playlistData.tracks?.total || 0,
            vibe: vibe || generateVibe(playlistData.name),
            previewTracks: extractPreviewTracks(playlistData.tracks?.items || []),
            postedAt: Timestamp.now(),
            postedBy: instructorId,
        })

        // Also update the class document with playlist ref
        const { doc, updateDoc } = await import("firebase/firestore")
        await updateDoc(doc(db, "wellnessClasses", classId), {
            hasPlaylist: true,
            playlistName: playlistData.name,
            playlistCover: playlistData.images?.[0]?.url || null,
        })

        console.log(`[SpotifyService] Posted playlist ${playlistData.name} to class ${classId}`)
        return true
    } catch (error) {
        console.error("[SpotifyService] postPlaylistToClass error:", error)
        return false
    }
}

/**
 * Get playlist for a class
 */
export async function getClassPlaylist(classId: string): Promise<ClassPlaylist | null> {
    if (!db) return null

    try {
        const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "classPlaylists"),
            where("classId", "==", classId),
            orderBy("postedAt", "desc"),
            limit(1)
        )

        const snapshot = await getDocs(q)
        if (snapshot.empty) return null

        const doc = snapshot.docs[0]
        return {
            ...doc.data(),
            postedAt: doc.data().postedAt?.toDate() || new Date(),
        } as ClassPlaylist
    } catch (error) {
        console.error("[SpotifyService] getClassPlaylist error:", error)
        return null
    }
}

/**
 * Get all playlists for an instructor
 */
export async function getInstructorPlaylists(instructorId: string): Promise<ClassPlaylist[]> {
    if (!db) return []

    try {
        const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")

        const q = query(
            collection(db, "classPlaylists"),
            where("postedBy", "==", instructorId),
            orderBy("postedAt", "desc")
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            postedAt: doc.data().postedAt?.toDate() || new Date(),
        } as ClassPlaylist))
    } catch (error) {
        console.error("[SpotifyService] getInstructorPlaylists error:", error)
        return []
    }
}

/**
 * Remove playlist from class
 */
export async function removePlaylistFromClass(classId: string): Promise<boolean> {
    if (!db) return false

    try {
        const { collection, query, where, getDocs, deleteDoc, doc, updateDoc } = await import("firebase/firestore")

        // Delete playlist entry
        const q = query(
            collection(db, "classPlaylists"),
            where("classId", "==", classId)
        )
        const snapshot = await getDocs(q)

        for (const docSnap of snapshot.docs) {
            await deleteDoc(docSnap.ref)
        }

        // Update class document
        await updateDoc(doc(db, "wellnessClasses", classId), {
            hasPlaylist: false,
            playlistName: null,
            playlistCover: null,
        })

        return true
    } catch (error) {
        console.error("[SpotifyService] removePlaylistFromClass error:", error)
        return false
    }
}

// ============================================
// SPOTIFY API HELPERS
// ============================================

/**
 * Extract playlist ID from Spotify URL
 */
function extractPlaylistId(url: string): string | null {
    // Formats:
    // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M

    const urlMatch = url.match(/playlist\/([a-zA-Z0-9]+)/)
    if (urlMatch) return urlMatch[1]

    const uriMatch = url.match(/playlist:([a-zA-Z0-9]+)/)
    if (uriMatch) return uriMatch[1]

    return null
}

/**
 * Fetch public playlist data (no auth needed for public playlists)
 */
async function fetchPublicPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
    try {
        // Use oEmbed endpoint which works without authentication
        const oEmbedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`

        const response = await fetch(oEmbedUrl)
        if (!response.ok) return null

        const oEmbed = await response.json()

        // Return basic info from oEmbed
        return {
            id: playlistId,
            name: oEmbed.title || "Unknown Playlist",
            description: oEmbed.provider_name,
            images: oEmbed.thumbnail_url ? [{ url: oEmbed.thumbnail_url, width: 300, height: 300 }] : [],
            tracks: { total: 0 }, // Can't get track count from oEmbed
            external_urls: { spotify: `https://open.spotify.com/playlist/${playlistId}` },
            owner: { display_name: oEmbed.author_name || "Unknown" },
        }
    } catch (error) {
        console.error("[SpotifyService] fetchPublicPlaylist error:", error)
        return null
    }
}

/**
 * Extract preview tracks from playlist
 */
function extractPreviewTracks(items: SpotifyTrack[]): ClassPlaylist["previewTracks"] {
    return items.slice(0, 5).map(item => ({
        name: item.track?.name || "Unknown",
        artist: item.track?.artists?.[0]?.name || "Unknown Artist",
        previewUrl: item.track?.preview_url || undefined,
    }))
}

/**
 * Auto-generate vibe from playlist name
 */
function generateVibe(playlistName: string): string {
    const lower = playlistName.toLowerCase()

    if (lower.includes("chill") || lower.includes("relax")) return "Chill Flow 🧘"
    if (lower.includes("energy") || lower.includes("pump")) return "High Energy 🔥"
    if (lower.includes("edm") || lower.includes("dance")) return "EDM Dance 🎧"
    if (lower.includes("hip hop") || lower.includes("rap")) return "Hip Hop Vibes 🎤"
    if (lower.includes("yoga") || lower.includes("meditation")) return "Zen Mode 🌙"
    if (lower.includes("rock") || lower.includes("metal")) return "Rock Power 🤘"
    if (lower.includes("latin") || lower.includes("reggae")) return "Latin Heat 💃"
    if (lower.includes("indie")) return "Indie Alternative 🎸"

    return "Good Music 🎵"
}

// ============================================
// PRE-CLASS PLAYLIST POSTING
// ============================================

/**
 * Schedule playlist post for future class
 */
export async function schedulePlaylistPost(
    classId: string,
    instructorId: string,
    spotifyPlaylistUrl: string,
    vibe: string,
    postAt: Date // e.g., 24 hours before class
): Promise<boolean> {
    if (!db) return false

    try {
        const { addDoc, collection, Timestamp } = await import("firebase/firestore")

        await addDoc(collection(db, "scheduledPlaylistPosts"), {
            classId,
            instructorId,
            spotifyPlaylistUrl,
            vibe,
            scheduledFor: Timestamp.fromDate(postAt),
            status: "pending",
            createdAt: Timestamp.now(),
        })

        return true
    } catch (error) {
        console.error("[SpotifyService] schedulePlaylistPost error:", error)
        return false
    }
}

// ============================================
// VIBE PRESETS
// ============================================

export const VIBE_PRESETS = [
    { id: "chill", label: "Chill Flow", emoji: "🧘" },
    { id: "energy", label: "High Energy", emoji: "🔥" },
    { id: "edm", label: "EDM Dance", emoji: "🎧" },
    { id: "hiphop", label: "Hip Hop Vibes", emoji: "🎤" },
    { id: "zen", label: "Zen Mode", emoji: "🌙" },
    { id: "rock", label: "Rock Power", emoji: "🤘" },
    { id: "latin", label: "Latin Heat", emoji: "💃" },
    { id: "indie", label: "Indie Alternative", emoji: "🎸" },
    { id: "pop", label: "Pop Hits", emoji: "✨" },
    { id: "motivational", label: "Motivational", emoji: "💪" },
]

export default {
    postPlaylistToClass,
    getClassPlaylist,
    getInstructorPlaylists,
    removePlaylistFromClass,
    schedulePlaylistPost,
    extractPlaylistId,
    VIBE_PRESETS,
}
