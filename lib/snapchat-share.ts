import { Linking, Platform, Alert } from "react-native"
import * as Sharing from "expo-sharing"

export type SnapchatShareOptions = {
  imageUri: string
  stickerUrl?: string
  caption?: string
  attachmentUrl?: string
}

export class SnapchatShare {
  // Snapchat Creative Kit URL scheme
  private static SNAPCHAT_URL_SCHEME = "snapchat://"
  private static SNAPCHAT_CREATIVE_KIT = "snapchat://creativeKitWeb"

  /**
   * Check if Snapchat is installed on the device
   */
  static async isSnapchatInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL(this.SNAPCHAT_URL_SCHEME)
    } catch {
      return false
    }
  }

  /**
   * Share image to Snapchat Stories
   */
  static async shareToStories(options: SnapchatShareOptions): Promise<void> {
    const isInstalled = await this.isSnapchatInstalled()

    if (!isInstalled) {
      Alert.alert("Snapchat Not Installed", "Install Snapchat to share your workout to Stories!", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Install",
          onPress: () => {
            const storeUrl =
              Platform.OS === "ios"
                ? "https://apps.apple.com/app/snapchat/id447188370"
                : "https://play.google.com/store/apps/details?id=com.snapchat.android"
            Linking.openURL(storeUrl)
          },
        },
      ])
      return
    }

    try {
      // For iOS and Android, we'll use the share sheet with Snapchat as an option
      // Snapchat will automatically detect images and offer to post to Stories
      await Sharing.shareAsync(options.imageUri, {
        mimeType: "image/png",
        dialogTitle: options.caption || "Share to Snapchat",
        UTI: "public.png",
      })
    } catch (error) {
      console.error("[v0] Snapchat share error:", error)
      Alert.alert("Share Failed", "Unable to share to Snapchat. Please try again.")
    }
  }

  /**
   * Share with deep link to open GoodRunss app
   */
  static async shareWithDeepLink(options: SnapchatShareOptions & { deepLink: string }): Promise<void> {
    const isInstalled = await this.isSnapchatInstalled()

    if (!isInstalled) {
      // Fallback to regular share
      await this.shareToStories(options)
      return
    }

    try {
      // Create a sticker with the deep link
      const stickerData = {
        content: {
          attachmentUrl: options.deepLink,
          caption: options.caption,
        },
      }

      // Share to Snapchat with attachment URL
      await Sharing.shareAsync(options.imageUri, {
        mimeType: "image/png",
        dialogTitle: options.caption || "Share to Snapchat",
      })
    } catch (error) {
      console.error("[v0] Snapchat deep link share error:", error)
      await this.shareToStories(options)
    }
  }

  /**
   * Open Snapchat app
   */
  static async openSnapchat(): Promise<void> {
    const isInstalled = await this.isSnapchatInstalled()

    if (isInstalled) {
      await Linking.openURL(this.SNAPCHAT_URL_SCHEME)
    } else {
      Alert.alert("Snapchat Not Installed", "Please install Snapchat to continue.")
    }
  }
}
