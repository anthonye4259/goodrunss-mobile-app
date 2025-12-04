import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import * as Haptics from "expo-haptics"

export default function MarketplaceItemScreen() {
  const { id } = useLocalSearchParams()

  const item = {
    id,
    name: "Nike Basketball Shoes",
    price: 120,
    originalPrice: 200,
    condition: "Like New",
    seller: "Mike Johnson",
    rating: 4.8,
    description: "Barely used Nike basketball shoes in excellent condition. Worn only 3 times. Original box included.",
    size: "US 10",
    images: ["/nike-basketball-shoes.jpg"],
  }

  return (
    <LinearGradient colors={["#0A0A0A", "#141414"]} style={{ flex: 1 }}>
      <ScrollView className="flex-1">
        <View className="relative">
          <Image source={{ uri: item.images[0] }} className="w-full h-96" resizeMode="cover" />
          <TouchableOpacity
            className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-6">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2">{item.name}</Text>
            <View className="flex-row items-center mb-4">
              <Text className="text-3xl font-bold text-primary mr-3">${item.price}</Text>
              <Text className="text-muted-foreground line-through text-lg">${item.originalPrice}</Text>
              <View className="bg-accent/20 rounded-full px-3 py-1 ml-3">
                <Text className="text-accent font-bold text-sm">
                  {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <View className="bg-card border border-border rounded-lg px-3 py-1">
                <Text className="text-foreground font-medium">{item.condition}</Text>
              </View>
              <View className="bg-card border border-border rounded-lg px-3 py-1">
                <Text className="text-foreground font-medium">Size {item.size}</Text>
              </View>
            </View>
          </View>

          <View className="bg-card border border-border rounded-2xl p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">Description</Text>
            <Text className="text-muted-foreground">{item.description}</Text>
          </View>

          <View className="bg-card border border-border rounded-2xl p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Seller</Text>
            <View className="flex-row items-center">
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                <Text className="text-primary font-bold text-lg">{item.seller.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold">{item.seller}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={14} color="#7ED957" />
                  <Text className="text-muted-foreground text-sm ml-1">{item.rating} rating</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-primary rounded-xl px-4 py-2">
                <Text className="text-background font-bold">Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-card border border-primary rounded-xl py-4">
              <View className="items-center">
                <Ionicons name="chatbubble-outline" size={20} color="#7ED957" />
                <Text className="text-primary font-bold mt-1">Ask Question</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-xl py-4"
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                alert("Purchase initiated! Payment processing coming soon.")
              }}
            >
              <View className="items-center">
                <Ionicons name="cart" size={20} color="#000" />
                <Text className="text-background font-bold mt-1">Buy Now</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
