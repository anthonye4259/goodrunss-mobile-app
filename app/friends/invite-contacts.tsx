
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

      // Native Share Strategy:
      // We rely on the system share sheet for viral growth (SMS/WhatsApp/IG).
      // Backend contact sync can be added in Phase 2 for "Connect with existing friends".

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // Viral Loop: Send the generalized invite link
      // in production this would be an SMS deeplink or backend trigger
      // but for "Share Sheet" universality we use the native share
      const result = await Share.share({
        message: `Join me on GoodRunss! Use code ANTH2025 to get a free month of premium. https://goodrunss.com/invite/ANTH2025`,
        title: "Join GoodRunss"
      })

      if (result.action === Share.sharedAction) {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.phoneNumber === phoneNumber
              ? { ...contact, isInvited: true, invitedAt: new Date().toISOString() }
              : contact,
          ),
        )
      }
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
          // Batch Strategy: Mark as invited locally.
          // In production, we encourage individual SMS via the share sheet for better conversion.
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
