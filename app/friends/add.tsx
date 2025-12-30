
import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { socialService } from "@/lib/services/social-service"
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore"
import { db, auth } from "@/lib/firebase-config"

interface UserSuggestion {
  id: string
  name: string
  username: string
  avatar?: string
  activities: string[]
  mutualFriends: number
  distance?: number
}

export default function AddFriendScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserSuggestion[]>([])
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const currentUserId = auth.currentUser?.uid
      if (!currentUserId) {
        setLoadingSuggestions(false)
        return
      }

      // Fetch suggested users (recent active users)
      const usersRef = collection(db, "users")
      const q = query(
        usersRef,
        where("__name__", "!=", currentUserId),
        limit(10)
      )
      const snapshot = await getDocs(q)

      const suggestedUsers: UserSuggestion[] = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.displayName || data.name || "User",
          username: data.username || doc.id.substring(0, 8),
          avatar: data.photoURL || data.avatar,
          activities: data.activities || data.sports || [],
          mutualFriends: 0,
          distance: undefined
        }
      })

      setSuggestions(suggestedUsers)
    } catch (error) {
      console.log("[Friends] Error loading suggestions:", error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const usersRef = collection(db, "users")
      const searchLower = searchQuery.toLowerCase()

      // Search by display name (case-insensitive search using range query)
      const q = query(
        usersRef,
        where("displayName", ">=", searchQuery),
        where("displayName", "<=", searchQuery + '\uf8ff'),
        limit(20)
      )
      const snapshot = await getDocs(q)

      const results: UserSuggestion[] = snapshot.docs
        .filter(doc => doc.id !== auth.currentUser?.uid)
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.displayName || data.name || "User",
            username: data.username || doc.id.substring(0, 8),
            avatar: data.photoURL || data.avatar,
            activities: data.activities || data.sports || [],
            mutualFriends: 0,
            distance: undefined
          }
        })

      setSearchResults(results)
    } catch (error) {
      console.log("[Friends] Error searching users:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await socialService.sendFriendRequest(userId)
      // Optimistic update
      setSuggestions((prev) => prev.filter((user) => user.id !== userId))
      setSearchResults((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.log("[Friends] Error sending friend request:", error)
    }
  }

  const displayedUsers = searchQuery.trim() ? searchResults : suggestions

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Friends</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username or name"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Invite Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Friends</Text>

          <TouchableOpacity style={styles.inviteCard} onPress={() => router.push("/friends/invite-contacts")}>
            <View style={styles.inviteIcon}>
              <Ionicons name="people" size={24} color="#7ED957" />
            </View>
            <View style={styles.inviteInfo}>
              <Text style={styles.inviteTitle}>Invite from Contacts</Text>
              <Text style={styles.inviteDescription}>Find friends already on GoodRunss</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inviteCard}>
            <View style={styles.inviteIcon}>
              <Ionicons name="share-social" size={24} color="#7ED957" />
            </View>
            <View style={styles.inviteInfo}>
              <Text style={styles.inviteTitle}>Share Invite Link</Text>
              <Text style={styles.inviteDescription}>Send invitation via SMS or social media</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inviteCard}>
            <View style={styles.inviteIcon}>
              <Ionicons name="qr-code" size={24} color="#7ED957" />
            </View>
            <View style={styles.inviteInfo}>
              <Text style={styles.inviteTitle}>QR Code</Text>
              <Text style={styles.inviteDescription}>Let friends scan your QR code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Suggested Friends */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim() ? "Search Results" : "Suggested for You"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {searchQuery.trim() ? `${displayedUsers.length} users found` : "Based on your activities and location"}
            </Text>
          </View>

          {loading || loadingSuggestions ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator color="#7ED957" />
            </View>
          ) : displayedUsers.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Ionicons name="people-outline" size={48} color="#333" />
              <Text style={{ color: "#666", marginTop: 12 }}>
                {searchQuery.trim() ? "No users found" : "No suggestions yet"}
              </Text>
            </View>
          ) : (
            displayedUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatar, { backgroundColor: "#7ED957", justifyContent: "center", alignItems: "center" }]}>
                    <Text style={{ color: "#000", fontSize: 24, fontWeight: "bold" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                  {user.activities.length > 0 && (
                    <View style={styles.userActivities}>
                      {user.activities.slice(0, 2).map((activity, index) => (
                        <View key={index} style={styles.activityTag}>
                          <Text style={styles.activityTagText}>{activity}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.userMeta}>
                    {user.distance && (
                      <View style={styles.metaItem}>
                        <Ionicons name="location" size={12} color="#7ED957" />
                        <Text style={styles.metaText}>{user.distance} mi</Text>
                      </View>
                    )}
                    {user.mutualFriends > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons name="people" size={12} color="#666" />
                        <Text style={styles.metaText}>{user.mutualFriends} mutual</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => handleSendRequest(user.id)}>
                  <Ionicons name="person-add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: "#7ED957",
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#999",
  },
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  inviteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteInfo: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  inviteDescription: {
    fontSize: 13,
    color: "#999",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    color: "#999",
    marginBottom: 8,
  },
  userActivities: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  activityTag: {
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activityTagText: {
    fontSize: 11,
    color: "#7ED957",
    fontWeight: "600",
  },
  userMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7ED957",
    justifyContent: "center",
    alignItems: "center",
  },
})
