import { Linking, Platform, Alert } from "react-native"
import * as Sharing from "expo-sharing"

export type ShareOptions = {
  imageUri?: string
  text: string
  url?: string
  hashtags?: string[]
}

export class SocialShare {
  private static TWITTER_URL_SCHEME = "twitter://"
  private static TWITTER_WEB_INTENT = "https://twitter.com/intent/tweet"

  /**
   * Check if Twitter/X is installed on the device
   */
  static async isTwitterInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL(this.TWITTER_URL_SCHEME)
    } catch {
      return false
    }
  }

  /**
   * Share to Twitter/X
   */
  static async shareToTwitter(options: ShareOptions): Promise<void> {
    const isInstalled = await this.isTwitterInstalled()

    // Build tweet text
    let tweetText = options.text
    if (options.hashtags && options.hashtags.length > 0) {
      tweetText += " " + options.hashtags.map((tag) => `#${tag}`).join(" ")
    }
    if (options.url) {
      tweetText += ` ${options.url}`
    }

    const encodedText = encodeURIComponent(tweetText)

    if (isInstalled) {
      // Try to open native Twitter app
      try {
        const twitterUrl = `twitter://post?message=${encodedText}`
        await Linking.openURL(twitterUrl)
      } catch {
        // Fallback to web intent
        await Linking.openURL(`${this.TWITTER_WEB_INTENT}?text=${encodedText}`)
      }
    } else {
      // Open web intent
      Alert.alert("Share to Twitter", "Opening Twitter in browser...", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => Linking.openURL(`${this.TWITTER_WEB_INTENT}?text=${encodedText}`),
        },
      ])
    }
  }

  private static SNAPCHAT_URL_SCHEME = "snapchat://"

  static async isSnapchatInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL(this.SNAPCHAT_URL_SCHEME)
    } catch {
      return false
    }
  }

  static async shareToSnapchat(options: { imageUri: string; caption?: string; deepLink?: string }): Promise<void> {
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

  private static INSTAGRAM_URL_SCHEME = "instagram://"

  static async isInstagramInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL(this.INSTAGRAM_URL_SCHEME)
    } catch {
      return false
    }
  }

  static async shareToInstagram(options: { imageUri: string; caption?: string }): Promise<void> {
    const isInstalled = await this.isInstagramInstalled()

    if (!isInstalled) {
      Alert.alert("Instagram Not Installed", "Install Instagram to share your workout to Stories!", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Install",
          onPress: () => {
            const storeUrl =
              Platform.OS === "ios"
                ? "https://apps.apple.com/app/instagram/id389801252"
                : "https://play.google.com/store/apps/details?id=com.instagram.android"
            Linking.openURL(storeUrl)
          },
        },
      ])
      return
    }

    try {
      await Sharing.shareAsync(options.imageUri, {
        mimeType: "image/png",
        dialogTitle: options.caption || "Share to Instagram",
        UTI: "public.png",
      })
    } catch (error) {
      console.error("[v0] Instagram share error:", error)
      Alert.alert("Share Failed", "Unable to share to Instagram. Please try again.")
    }
  }
}
