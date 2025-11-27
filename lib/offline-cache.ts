import AsyncStorage from "@react-native-async-storage/async-storage"

export class OfflineCache {
  private static instance: OfflineCache
  private cachePrefix = "@goodrunss_cache:"

  private constructor() {}

  static getInstance(): OfflineCache {
    if (!OfflineCache.instance) {
      OfflineCache.instance = new OfflineCache()
    }
    return OfflineCache.instance
  }

  async set(key: string, value: any, expiryMinutes = 60): Promise<void> {
    try {
      const item = {
        value,
        expiry: Date.now() + expiryMinutes * 60 * 1000,
      }
      await AsyncStorage.setItem(`${this.cachePrefix}${key}`, JSON.stringify(item))
    } catch (error) {
      console.error("[v0] Cache set error:", error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(`${this.cachePrefix}${key}`)
      if (!item) return null

      const parsed = JSON.parse(item)
      if (Date.now() > parsed.expiry) {
        await this.remove(key)
        return null
      }

      return parsed.value as T
    } catch (error) {
      console.error("[v0] Cache get error:", error)
      return null
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.cachePrefix}${key}`)
    } catch (error) {
      console.error("[v0] Cache remove error:", error)
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const cacheKeys = keys.filter((key) => key.startsWith(this.cachePrefix))
      await AsyncStorage.multiRemove(cacheKeys)
    } catch (error) {
      console.error("[v0] Cache clear error:", error)
    }
  }

  // Cache trainers data
  async cacheTrainers(trainers: any[]): Promise<void> {
    await this.set("trainers", trainers, 30)
  }

  async getCachedTrainers(): Promise<any[] | null> {
    return await this.get<any[]>("trainers")
  }

  // Cache venues data
  async cacheVenues(venues: any[]): Promise<void> {
    await this.set("venues", venues, 30)
  }

  async getCachedVenues(): Promise<any[] | null> {
    return await this.get<any[]>("venues")
  }

  // Cache user profile
  async cacheUserProfile(profile: any): Promise<void> {
    await this.set("user_profile", profile, 120)
  }

  async getCachedUserProfile(): Promise<any | null> {
    return await this.get<any>("user_profile")
  }
}
