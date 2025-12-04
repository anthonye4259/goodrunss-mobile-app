
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { type AmbassadorRole, AMBASSADOR_ROLES } from "@/lib/ambassador-types"

export default function AmbassadorApplicationScreen() {
  const [selectedRole, setSelectedRole] = useState<AmbassadorRole | null>(null)
  const [motivation, setMotivation] = useState("")
  const [experience, setExperience] = useState("")
  const [instagram, setInstagram] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const roles: AmbassadorRole[] = ["court_captain", "ugc_creator", "ambassador"]

  const handleSubmit = async () => {
    if (!selectedRole || !motivation.trim() || !experience.trim()) return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setSubmitting(true)

    // Call API to submit application
    await new Promise((resolve) => setTimeout(resolve, 1500))

    router.back()
    router.push("/ambassador/dashboard")
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.back()
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground ml-4">Become an Ambassador</Text>
          </View>

          <View className="bg-primary/10 border border-primary rounded-2xl p-6 mb-6">
            <Text className="text-foreground font-bold text-lg mb-2">Join Our Community Team</Text>
            <Text className="text-muted-foreground">
              Help build the GoodRunss community and earn rewards. Choose a role that fits your strengths.
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Select Role</Text>
            {roles.map((role) => {
              const roleInfo = AMBASSADOR_ROLES[role]
              const isSelected = selectedRole === role
              return (
                <TouchableOpacity
                  key={role}
                  className={`rounded-2xl p-6 mb-4 border ${
                    isSelected ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setSelectedRole(role)
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <Text className="text-4xl mr-3">{roleInfo.icon}</Text>
                    <View className="flex-1">
                      <Text className={`font-bold text-lg ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {roleInfo.name}
                      </Text>
                      <Text className="text-muted-foreground text-sm">{roleInfo.description}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color="#7ED957" />}
                  </View>

                  {isSelected && (
                    <View className="mt-3 pt-3 border-t border-border">
                      <Text className="text-foreground font-semibold mb-2">Responsibilities:</Text>
                      {roleInfo.responsibilities.map((resp, index) => (
                        <View key={index} className="flex-row items-start mb-1">
                          <Text className="text-primary mr-2">•</Text>
                          <Text className="text-muted-foreground text-sm flex-1">{resp}</Text>
                        </View>
                      ))}

                      <Text className="text-foreground font-semibold mt-3 mb-2">Bronze Tier Perks:</Text>
                      {roleInfo.perks.bronze.map((perk, index) => (
                        <View key={index} className="flex-row items-start mb-1">
                          <Ionicons name="checkmark" size={16} color="#7ED957" />
                          <Text className="text-muted-foreground text-sm ml-2">{perk}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {selectedRole && (
            <>
              <View className="mb-6">
                <Text className="text-foreground font-bold text-lg mb-3">Why do you want this role?</Text>
                <TextInput
                  className="bg-card border border-border rounded-xl p-4 text-foreground min-h-[120px]"
                  placeholder="Tell us what motivates you..."
                  placeholderTextColor="#666"
                  multiline
                  value={motivation}
                  onChangeText={setMotivation}
                  textAlignVertical="top"
                />
              </View>

              <View className="mb-6">
                <Text className="text-foreground font-bold text-lg mb-3">Relevant Experience</Text>
                <TextInput
                  className="bg-card border border-border rounded-xl p-4 text-foreground min-h-[120px]"
                  placeholder="Share your background and experience..."
                  placeholderTextColor="#666"
                  multiline
                  value={experience}
                  onChangeText={setExperience}
                  textAlignVertical="top"
                />
              </View>

              {selectedRole === "ugc_creator" && (
                <View className="mb-6">
                  <Text className="text-foreground font-bold text-lg mb-3">Social Media (Optional)</Text>
                  <TextInput
                    className="bg-card border border-border rounded-xl p-4 text-foreground mb-3"
                    placeholder="Instagram handle"
                    placeholderTextColor="#666"
                    value={instagram}
                    onChangeText={setInstagram}
                    autoCapitalize="none"
                  />
                </View>
              )}

              <TouchableOpacity
                className={`rounded-xl py-4 ${submitting || !motivation.trim() || !experience.trim() ? "bg-muted" : "bg-primary"}`}
                onPress={handleSubmit}
                disabled={submitting || !motivation.trim() || !experience.trim()}
              >
                <Text className="text-background font-bold text-center text-lg">
                  {submitting ? "Submitting..." : "Submit Application"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
