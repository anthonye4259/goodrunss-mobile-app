/**
 * Video Upload Service
 * 
 * Handles video upload to Firebase Storage
 * Supports:
 * - Video compression
 * - Progress tracking
 * - Thumbnail generation
 * - Firestore metadata sync
 */

import * as ImagePicker from "expo-image-picker"
import * as VideoThumbnails from "expo-video-thumbnails"
import * as FileSystem from "expo-file-system"
import { storage, db, auth } from "@/lib/firebase-config"

// ============================================
// TYPES
// ============================================

export interface UploadProgress {
    bytesTransferred: number
    totalBytes: number
    percentComplete: number
}

export interface UploadedVideo {
    id: string
    url: string
    thumbnailUrl?: string
    fileName: string
    fileSize: number
    duration?: number
    uploadedBy: string
    uploadedAt: string
    metadata?: Record<string, any>
}

export type UploadPurpose =
    | "video_analysis"
    | "form_check"
    | "coach_feedback"
    | "profile_intro"

// ============================================
// VIDEO UPLOAD SERVICE
// ============================================

class VideoUploadService {
    private static instance: VideoUploadService

    static getInstance(): VideoUploadService {
        if (!VideoUploadService.instance) {
            VideoUploadService.instance = new VideoUploadService()
        }
        return VideoUploadService.instance
    }

    /**
     * Pick video from camera roll
     */
    async pickVideo(options?: {
        maxDuration?: number // seconds
    }): Promise<string | null> {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            console.error("Media library permission denied")
            return null
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.8,
            videoMaxDuration: options?.maxDuration || 120, // 2 min default
        })

        if (result.canceled || !result.assets?.[0]) {
            return null
        }

        return result.assets[0].uri
    }

    /**
     * Record video with camera
     */
    async recordVideo(options?: {
        maxDuration?: number
    }): Promise<string | null> {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
            console.error("Camera permission denied")
            return null
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.8,
            videoMaxDuration: options?.maxDuration || 120,
        })

        if (result.canceled || !result.assets?.[0]) {
            return null
        }

        return result.assets[0].uri
    }

    /**
     * Generate thumbnail from video
     */
    async generateThumbnail(videoUri: string): Promise<string | null> {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
                time: 1000, // 1 second in
                quality: 0.7,
            })
            return uri
        } catch (error) {
            console.error("Failed to generate thumbnail:", error)
            return null
        }
    }

    /**
     * Get file info (size, etc.)
     */
    async getFileInfo(uri: string): Promise<{ size: number, exists: boolean }> {
        try {
            const info = await FileSystem.getInfoAsync(uri)
            return {
                size: (info as any).size || 0,
                exists: info.exists,
            }
        } catch (error) {
            return { size: 0, exists: false }
        }
    }

    /**
     * Upload video to Firebase Storage
     */
    async uploadVideo(
        localUri: string,
        purpose: UploadPurpose,
        metadata?: Record<string, any>,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadedVideo | null> {
        if (!storage || !db) {
            console.error("Firebase not initialized")
            // Fallback to local storage for development
            return this.mockUpload(localUri, purpose, metadata)
        }

        try {
            const userId = auth?.currentUser?.uid || "anonymous"
            const timestamp = Date.now()
            const fileName = `${purpose}_${userId}_${timestamp}.mp4`
            const storagePath = `videos/${purpose}/${fileName}`

            // Get file info
            const fileInfo = await this.getFileInfo(localUri)
            if (!fileInfo.exists) {
                throw new Error("Video file not found")
            }

            // Import Firebase Storage functions
            const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage")

            // Read file as blob
            const response = await fetch(localUri)
            const blob = await response.blob()

            // Create storage reference
            const storageRef = ref(storage, storagePath)

            // Upload with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, blob, {
                contentType: "video/mp4",
                customMetadata: {
                    purpose,
                    uploadedBy: userId,
                    ...metadata,
                },
            })

            // Track progress
            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress: UploadProgress = {
                            bytesTransferred: snapshot.bytesTransferred,
                            totalBytes: snapshot.totalBytes,
                            percentComplete: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                        }
                        onProgress?.(progress)
                    },
                    (error) => {
                        console.error("Upload error:", error)
                        reject(error)
                    },
                    async () => {
                        // Get download URL
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)

                        // Generate and upload thumbnail
                        let thumbnailUrl: string | undefined
                        const thumbnailUri = await this.generateThumbnail(localUri)
                        if (thumbnailUri) {
                            const thumbFileName = `${purpose}_${userId}_${timestamp}_thumb.jpg`
                            const thumbPath = `thumbnails/${purpose}/${thumbFileName}`
                            const thumbRef = ref(storage, thumbPath)
                            const thumbResponse = await fetch(thumbnailUri)
                            const thumbBlob = await thumbResponse.blob()
                            const { uploadBytes } = await import("firebase/storage")
                            await uploadBytes(thumbRef, thumbBlob, { contentType: "image/jpeg" })
                            thumbnailUrl = await getDownloadURL(thumbRef)
                        }

                        // Create video record
                        const video: UploadedVideo = {
                            id: `video_${timestamp}`,
                            url: downloadUrl,
                            thumbnailUrl,
                            fileName,
                            fileSize: fileInfo.size,
                            uploadedBy: userId,
                            uploadedAt: new Date().toISOString(),
                            metadata,
                        }

                        // Save to Firestore
                        const { doc, setDoc, collection } = await import("firebase/firestore")
                        await setDoc(doc(collection(db, "videos"), video.id), video)

                        resolve(video)
                    }
                )
            })
        } catch (error) {
            console.error("Upload failed:", error)
            return null
        }
    }

    /**
     * Mock upload for development (no Firebase)
     */
    private async mockUpload(
        localUri: string,
        purpose: UploadPurpose,
        metadata?: Record<string, any>
    ): Promise<UploadedVideo> {
        const userId = auth?.currentUser?.uid || "local_user"
        const timestamp = Date.now()
        const fileInfo = await this.getFileInfo(localUri)
        const thumbnailUri = await this.generateThumbnail(localUri)

        return {
            id: `video_${timestamp}`,
            url: localUri, // Use local URI as "URL" in dev
            thumbnailUrl: thumbnailUri || undefined,
            fileName: `${purpose}_${timestamp}.mp4`,
            fileSize: fileInfo.size,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            metadata,
        }
    }

    /**
     * Delete video from storage
     */
    async deleteVideo(videoId: string, storagePath: string): Promise<boolean> {
        if (!storage || !db) return false

        try {
            const { ref, deleteObject } = await import("firebase/storage")
            const { doc, deleteDoc } = await import("firebase/firestore")

            // Delete from storage
            await deleteObject(ref(storage, storagePath))

            // Delete from Firestore
            await deleteDoc(doc(db, "videos", videoId))

            return true
        } catch (error) {
            console.error("Delete failed:", error)
            return false
        }
    }
}

export const videoUploadService = VideoUploadService.getInstance()
