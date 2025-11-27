# Friends Feature - Complete Code

Copy these files into your Cursor project for the complete Friends social feature.

---

## File 1: `lib/friends-types.ts`

\`\`\`typescript
export interface Friend {
  id: string
  userId: string
  name: string
  username: string
  avatar?: string
  activities: string[]
  location?: {
    city: string
    state: string
    distance?: number
  }
  stats: {
    totalSessions: number
    streak: number
    credits: number
  }
  privacy: {
    shareLocation: boolean
    shareActivity: boolean
    shareStats: boolean
  }
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: "pending" | "accepted" | "blocked"
  createdAt: string
  acceptedAt?: string
  friend: Friend
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  fromUser: {
    id: string
    name: string
    username: string
    avatar?: string
    activities: string[]
  }
}

export interface FriendActivity {
  id: string
  userId: string
  username: string
  avatar?: string
  type: "checkin" | "booking" | "achievement" | "challenge" | "report"
  activity: string
  title: string
  description: string
  location?: {
    venueName: string
    venueId: string
    distance?: number
  }
  timestamp: string
  isNearby: boolean
}

export interface ContactInvite {
  name: string
  phoneNumber: string
  isInvited: boolean
  invitedAt?: string
}
\`\`\`

---

## File 2: `app/social/friends.tsx`

\`\`\`typescript
"use client"

import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import { SkeletonLoader } from "@/components/skeleton-loader"

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "find">("friends")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const friends = [
    { id: 1, name: "Sarah Johnson", username: "@sarahj", activity: "Basketball", mutualFriends: 12, avatar: "SJ" },
    { id: 2, name: "Mike Chen", username: "@mikechen", activity: "Tennis", mutualFriends: 8, avatar: "MC" },
    { id: 3, name: "Emma Davis", username: "@emmad", activity: "Yoga", mutualFriends: 15, avatar: "ED" },
  ]

  const requests = [
    { id: 4, name: "Alex Martinez", username: "@alexm", activity: "Golf", mutualFriends: 5, avatar: "AM" },
    { id: 5, name: "Lisa Wong", username: "@lisaw", activity: "Pilates", mutualFriends: 3, avatar: "LW" },
  ]

  const suggestions = [
    { id: 6, name: "Tom Anderson", username: "@toma", activity: "Basketball", mutualFriends: 7, avatar: "TA" },
    { id: 7, name: "Rachel Green", username: "@rachelg", activity: "Tennis", mutualFriends: 4, avatar: "RG" },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Friends</Text>
            <TouchableOpacity onPress={() => console.log("Settings")}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row bg-card border border-border rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "friends" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("friends")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "friends" ? "text-background" : "text-muted-foreground"}`}
              >
                Friends ({friends.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "requests" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("requests")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "requests" ? "text-background" : "text-muted-foreground"}`}
              >
                Requests ({requests.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${activeTab === "find" ? "bg-primary" : ""}`}
              onPress={() => setActiveTab("find")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "find" ? "text-background" : "text-muted-foreground"}`}
              >
                Find
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === "find" && (
          <View className="px-6 mb-6">
            <View className="bg-card border border-border rounded-xl flex-row items-center px-4 py-3">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 text-foreground"
                placeholder="Search by name or username..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        <View className="px-6">
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : (
            <>
              {activeTab === "friends" &&
                friends.map((friend) => (
                  <View key={friend.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                          <Text className="text-primary font-bold text-lg">{friend.avatar}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-bold text-lg">{friend.name}</Text>
                          <Text className="text-muted-foreground text-sm">{friend.username}</Text>
                          <Text className="text-muted-foreground text-xs mt-1">
                            {friend.activity} • {friend.mutualFriends} mutual friends
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        className="bg-primary rounded-xl px-4 py-2"
                        onPress={() => router.push(`/chat/${friend.id}`)}
                      >
                        <Text className="text-background font-bold">Message</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

              {activeTab === "requests" &&
                requests.map((request) => (
                  <View key={request.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                        <Text className="text-primary font-bold text-lg">{request.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg">{request.name}</Text>
                        <Text className="text-muted-foreground text-sm">{request.username}</Text>
                        <Text className="text-muted-foreground text-xs mt-1">
                          {request.activity} • {request.mutualFriends} mutual friends
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity className="flex-1 bg-primary rounded-xl py-3">
                        <Text className="text-background font-bold text-center">Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-card border border-border rounded-xl py-3">
                        <Text className="text-muted-foreground font-bold text-center">Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

              {activeTab === "find" &&
                suggestions.map((suggestion) => (
                  <View key={suggestion.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-primary/20 rounded-full w-14 h-14 items-center justify-center mr-4">
                          <Text className="text-primary font-bold text-lg">{suggestion.avatar}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-foreground font-bold text-lg">{suggestion.name}</Text>
                          <Text className="text-muted-foreground text-sm">{suggestion.username}</Text>
                          <Text className="text-muted-foreground text-xs mt-1">
                            {suggestion.activity} • {suggestion.mutualFriends} mutual friends
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity className="bg-primary rounded-xl px-4 py-2">
                        <Text className="text-background font-bold">Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
\`\`\`

---

## File 3: `app/social/feed.tsx`

\`\`\`typescript
"use client"

import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { useState } from "react"

export default function FeedScreen() {
  const [loading, setLoading] = useState(false)

  const feedItems = [
    {
      id: 1,
      user: { name: "Sarah Johnson", avatar: "SJ" },
      type: "check-in",
      activity: "Basketball",
      location: "Downtown Courts",
      time: "2 hours ago",
      likes: 24,
      comments: 5,
    },
    {
      id: 2,
      user: { name: "Mike Chen", avatar: "MC" },
      type: "achievement",
      achievement: "10 Day Streak",
      activity: "Tennis",
      time: "5 hours ago",
      likes: 42,
      comments: 8,
    },
    {
      id: 3,
      user: { name: "Emma Davis", avatar: "ED" },
      type: "booking",
      trainer: "Alex Martinez",
      activity: "Yoga",
      time: "1 day ago",
      likes: 18,
      comments: 3,
    },
  ]

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground">Activity Feed</Text>
            <TouchableOpacity>
              <Ionicons name="filter-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : (
            feedItems.map((item) => (
              <View key={item.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                    <Text className="text-primary font-bold">{item.user.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold">{item.user.name}</Text>
                    <Text className="text-muted-foreground text-xs">{item.time}</Text>
                  </View>
                </View>

                {item.type === "check-in" && (
                  <View className="mb-3">
                    <Text className="text-foreground mb-2">
                      Checked in at <Text className="text-primary font-bold">{item.location}</Text> for {item.activity}
                    </Text>
                  </View>
                )}

                {item.type === "achievement" && (
                  <View className="bg-primary/10 border border-primary rounded-xl p-4 mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="trophy" size={32} color="#7ED957" />
                      <View className="ml-3">
                        <Text className="text-primary font-bold text-lg">{item.achievement}</Text>
                        <Text className="text-muted-foreground text-sm">{item.activity}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {item.type === "booking" && (
                  <View className="mb-3">
                    <Text className="text-foreground">
                      Booked a session with <Text className="text-primary font-bold">{item.trainer}</Text> for{" "}
                      {item.activity}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between pt-3 border-t border-border">
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="heart-outline" size={20} color="#7ED957" />
                    <Text className="text-muted-foreground ml-2">{item.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="chatbubble-outline" size={20} color="#7ED957" />
                    <Text className="text-muted-foreground ml-2">{item.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="share-outline" size={20} color="#7ED957" />
                    <Text className="text-muted-foreground ml-2">Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
\`\`\`

---

## File 4: `app/friends/add.tsx`

\`\`\`typescript
"use client"

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
\`\`\`

---

## File 5: `app/friends/invite-contacts.tsx`

\`\`\`typescript
"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import * as Contacts from "expo-contacts"
import type { ContactInvite } from "@/lib/friends-types"

export default function InviteContactsScreen() {
  const [contacts, setContacts] = useState<ContactInvite[]>([])
  const [loading, setLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    const { status } = await Contacts.requestPermissionsAsync()
    setHasPermission(status === "granted")

    if (status === "granted") {
      loadContacts()
    }
  }

  const loadContacts = async () => {
    setLoading(true)
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      })

      // TODO: Replace with actual API call to check which contacts are on the app
      // const response = await fetch('/api/friends/check-contacts', {
      //   method: 'POST',
      //   body: JSON.stringify({ phoneNumbers: data.map(c => c.phoneNumbers?.[0]?.number) }),
      // });

      const contactsData: ContactInvite[] = data
        .filter((contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .slice(0, 20) // Limit to 20 for demo
        .map((contact) => ({
          name: contact.name || "Unknown",
          phoneNumber: contact.phoneNumbers![0].number || "",
          isInvited: false,
        }))

      setContacts(contactsData)
    } catch (error) {
      console.error("Error loading contacts:", error)
      Alert.alert("Error", "Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (phoneNumber: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/friends/invite', {
      //   method: 'POST',
      //   body: JSON.stringify({ phoneNumber }),
      // });

      setContacts((prev) =>
        prev.map((contact) =>
          contact.phoneNumber === phoneNumber
            ? { ...contact, isInvited: true, invitedAt: new Date().toISOString() }
            : contact,
        ),
      )

      Alert.alert("Success", "Invitation sent!")
    } catch (error) {
      console.error("Error sending invite:", error)
      Alert.alert("Error", "Failed to send invitation")
    }
  }

  const handleInviteAll = async () => {
    Alert.alert("Invite All Contacts", `Send invitations to ${contacts.filter((c) => !c.isInvited).length} contacts?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          // TODO: Batch invite API call
          setContacts((prev) =>
            prev.map((contact) => ({
              ...contact,
              isInvited: true,
              invitedAt: new Date().toISOString(),
            })),
          )
        },
      },
    ])
  }

  if (!hasPermission) {
    return (
      <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Contacts</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.permissionContainer}>
          <Ionicons name="people-circle-outline" size={80} color="#666" />
          <Text style={styles.permissionTitle}>Access Your Contacts</Text>
          <Text style={styles.permissionText}>
            To help you find friends, we need permission to access your contacts.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={checkPermissions}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Contacts</Text>
        <TouchableOpacity onPress={handleInviteAll}>
          <Text style={styles.inviteAllText}>Invite All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="gift" size={24} color="#7ED957" />
        <Text style={styles.infoText}>Earn 50 credits for each friend who joins with your invitation!</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : (
          contacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
              </View>
              {contact.isInvited ? (
                <View style={styles.invitedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#7ED957" />
                  <Text style={styles.invitedText}>Invited</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.inviteButton} onPress={() => handleInvite(contact.phoneNumber)}>
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
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
  inviteAllText: {
    fontSize: 15,
    color: "#7ED957",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(126, 217, 87, 0.1)",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#7ED957",
    fontWeight: "500",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: "#7ED957",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7ED957",
    justifyContent: "center",
    alignItems: "center",
  },
  contactAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 13,
    color: "#999",
  },
  inviteButton: {
    backgroundColor: "#7ED957",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  invitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  invitedText: {
    fontSize: 14,
    color: "#7ED957",
    fontWeight: "600",
  },
})
\`\`\`

---

## Backend API Endpoints Needed

Connect these screens to your backend with the following endpoints:

### Friends Management
\`\`\`typescript
// Get user's friends list
GET /api/friends
Response: { friends: Friend[], pendingRequests: FriendRequest[] }

// Send friend request
POST /api/friends/requests
Body: { toUserId: string }

// Accept/Reject friend request
PUT /api/friends/requests/:requestId
Body: { action: 'accept' | 'reject' }

// Search users
GET /api/users/search?q=username
Response: { users: UserSuggestion[] }

// Get friend suggestions (based on activities, location, mutual friends)
GET /api/friends/suggestions
Response: { suggestions: UserSuggestion[] }
\`\`\`

### Contact Invitations
\`\`\`typescript
// Check which contacts are on the app
POST /api/friends/check-contacts
Body: { phoneNumbers: string[] }
Response: { existingUsers: User[], notOnApp: string[] }

// Send SMS invitation
POST /api/friends/invite
Body: { phoneNumber: string }

// Batch invite
POST /api/friends/invite-batch
Body: { phoneNumbers: string[] }
\`\`\`

### Activity Feed
\`\`\`typescript
// Get friend activity feed
GET /api/friends/activity?limit=20&offset=0
Response: { activities: FriendActivity[] }

// Like activity
POST /api/friends/activity/:activityId/like

// Comment on activity
POST /api/friends/activity/:activityId/comment
Body: { comment: string }
\`\`\`

---

## Installation Instructions

1. **Copy Type Definitions**
   \`\`\`bash
   # Copy lib/friends-types.ts to your project
   \`\`\`

2. **Copy Screen Files**
   \`\`\`bash
   # Copy all 4 screen files to respective directories
   app/social/friends.tsx
   app/social/feed.tsx
   app/friends/add.tsx
   app/friends/invite-contacts.tsx
   \`\`\`

3. **Install Dependencies**
   \`\`\`bash
   npm install expo-contacts
   \`\`\`

4. **Update app.json for Contacts Permission**
   \`\`\`json
   {
     "expo": {
       "ios": {
         "infoPlist": {
           "NSContactsUsageDescription": "We need access to your contacts to help you find friends on GoodRunss."
         }
       },
       "android": {
         "permissions": [
           "READ_CONTACTS"
         ]
       }
     }
   }
   \`\`\`

5. **Connect to Backend APIs**
   - Replace all `// TODO: Replace with actual API call` comments with your backend endpoints
   - Update mock data with real API responses

---

Copy all these files into your Cursor project and you'll have a complete Friends feature with social connections, contact invitations, and activity feed!
