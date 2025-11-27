import { View, Text, TouchableOpacity, Modal } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

interface LoginPromptModalProps {
  visible: boolean
  onClose: () => void
  feature: string
  description: string
}

export function LoginPromptModal({ visible, onClose, feature, description }: LoginPromptModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 justify-center px-6">
        <View className="bg-card rounded-3xl overflow-hidden">
          <LinearGradient colors={["#7ED957", "#6BB642"]} className="p-6 items-center">
            <View className="bg-black/20 rounded-full p-4 mb-4">
              <Ionicons name="lock-closed" size={32} color="#000" />
            </View>
            <Text className="text-background font-bold text-2xl mb-2">{feature}</Text>
            <Text className="text-background/80 text-center">{description}</Text>
          </LinearGradient>

          <View className="p-6 space-y-3">
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4"
              onPress={() => {
                onClose()
                router.push("/auth")
              }}
            >
              <Text className="text-background font-bold text-center text-lg">Sign Up Free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border-2 border-primary rounded-2xl py-4"
              onPress={() => {
                onClose()
                router.push("/auth")
              }}
            >
              <Text className="text-primary font-bold text-center text-lg">Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3" onPress={onClose}>
              <Text className="text-muted-foreground text-center">Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
