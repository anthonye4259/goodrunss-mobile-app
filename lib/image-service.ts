import * as ImagePicker from "expo-image-picker"
import * as ImageManipulator from "expo-image-manipulator"

export interface ImageUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  allowsEditing?: boolean
}

export class ImageService {
  private static instance: ImageService

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService()
    }
    return ImageService.instance
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      console.log("[v0] Image picker permissions denied")
      return false
    }
    return true
  }

  async pickImage(options: ImageUploadOptions = {}): Promise<string | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return null

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: options.allowsEditing ?? true,
      aspect: [1, 1],
      quality: options.quality ?? 0.8,
    })

    if (result.canceled) return null

    return await this.compressImage(result.assets[0].uri, options)
  }

  async takePhoto(options: ImageUploadOptions = {}): Promise<string | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      console.log("[v0] Camera permissions denied")
      return null
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options.allowsEditing ?? true,
      aspect: [1, 1],
      quality: options.quality ?? 0.8,
    })

    if (result.canceled) return null

    return await this.compressImage(result.assets[0].uri, options)
  }

  private async compressImage(uri: string, options: ImageUploadOptions): Promise<string> {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: options.maxWidth ?? 1024,
            height: options.maxHeight ?? 1024,
          },
        },
      ],
      {
        compress: options.quality ?? 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    )

    return manipResult.uri
  }

  async uploadImage(uri: string, type: "profile" | "venue" | "trainer"): Promise<string> {
    // TODO: Replace with actual upload to your backend/storage
    console.log("[v0] Uploading image:", uri, "type:", type)

    // Mock upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock URL
    return `https://api.goodrunss.com/images/${type}/${Date.now()}.jpg`
  }

  async deleteImage(url: string): Promise<void> {
    // TODO: Delete from backend/storage
    console.log("[v0] Deleting image:", url)
  }
}
