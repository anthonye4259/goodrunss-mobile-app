
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

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
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([
    {
      id: "1",
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=80&width=80",
      activities: ["Basketball", "Tennis"],
      mutualFriends: 3,
      distance: 1.2,
    },
    {
      id: "2",
      name: "James Lee",
      username: "jameslee",
      avatar: "/placeholder.svg?height=80&width=80",
      activities: ["Soccer", "Basketball"],
      mutualFriends: 5,
      distance: 3.5,
    },
  ])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/search?q=${searchQuery}`);
      // const data = await response.json();
      setSearchResults(suggestions) // Mock
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/friends/requests', {
      //   method: 'POST',
      //   body: JSON.stringify({ toUserId: userId }),
      // });
      setSuggestions((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

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
            <Text style={styles.sectionTitle}>Suggested for You</Text>
            <Text style={styles.sectionSubtitle}>Based on your activities and location</Text>
          </View>

          {suggestions.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userUsername}>@{user.username}</Text>
                <View style={styles.userActivities}>
                  {user.activities.slice(0, 2).map((activity, index) => (
                    <View key={index} style={styles.activityTag}>
                      <Text style={styles.activityTagText}>{activity}</Text>
                    </View>
                  ))}
                </View>
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
          ))}
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
