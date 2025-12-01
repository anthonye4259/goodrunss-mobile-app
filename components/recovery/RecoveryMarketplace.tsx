/**
 * Recovery Marketplace
 * 
 * Curated recovery products for injury prevention and recovery
 * Foam rollers, massage guns, compression gear, supplements, etc.
 */

import { View, Text, TouchableOpacity, ScrollView, Image, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

// Product Categories
export type ProductCategory =
  | 'foam_rollers'
  | 'massage_guns'
  | 'compression'
  | 'ice_heat'
  | 'stretching'
  | 'supplements'
  | 'wearables'
  | 'books'

// Product Interface
export interface RecoveryProduct {
  id: string
  name: string
  brand: string
  category: ProductCategory
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  imageUrl: string
  affiliateUrl: string
  features: string[]
  bestFor: string[]
  isPremium?: boolean
  isTopPick?: boolean
}

// Category Configuration
const CATEGORIES: { id: ProductCategory; name: string; icon: string; color: string }[] = [
  { id: 'foam_rollers', name: 'Foam Rollers', icon: 'fitness', color: '#F97316' },
  { id: 'massage_guns', name: 'Massage Guns', icon: 'flash', color: '#8B5CF6' },
  { id: 'compression', name: 'Compression', icon: 'body', color: '#3B82F6' },
  { id: 'ice_heat', name: 'Ice & Heat', icon: 'snow', color: '#06B6D4' },
  { id: 'stretching', name: 'Stretching', icon: 'expand', color: '#22C55E' },
  { id: 'supplements', name: 'Supplements', icon: 'nutrition', color: '#EAB308' },
  { id: 'wearables', name: 'Wearables', icon: 'watch', color: '#EC4899' },
  { id: 'books', name: 'Books', icon: 'book', color: '#6366F1' },
]

// Sample Products (In production, this would come from a backend/affiliate API)
const SAMPLE_PRODUCTS: RecoveryProduct[] = [
  {
    id: 'theragun-prime',
    name: 'Theragun Prime',
    brand: 'Therabody',
    category: 'massage_guns',
    description: 'Powerful percussion massage for deep muscle treatment',
    price: 299,
    originalPrice: 349,
    rating: 4.8,
    reviewCount: 12453,
    imageUrl: 'https://example.com/theragun.jpg',
    affiliateUrl: 'https://example.com/affiliate/theragun',
    features: ['4 attachments', '5 speed settings', '120 min battery', 'QuietForce Technology'],
    bestFor: ['Deep tissue', 'Post-workout', 'Muscle knots'],
    isTopPick: true,
  },
  {
    id: 'hyperice-vyper',
    name: 'Vyper 3 Vibrating Roller',
    brand: 'Hyperice',
    category: 'foam_rollers',
    description: 'High-intensity vibrating foam roller for enhanced recovery',
    price: 199,
    rating: 4.7,
    reviewCount: 3421,
    imageUrl: 'https://example.com/vyper.jpg',
    affiliateUrl: 'https://example.com/affiliate/vyper',
    features: ['3 vibration speeds', 'Rechargeable', 'TSA approved', 'Bluetooth app'],
    bestFor: ['IT band', 'Back', 'Quads'],
    isTopPick: true,
  },
  {
    id: 'normatec-3',
    name: 'Normatec 3 Legs',
    brand: 'Hyperice',
    category: 'compression',
    description: 'Dynamic air compression boots for enhanced circulation',
    price: 699,
    rating: 4.9,
    reviewCount: 2134,
    imageUrl: 'https://example.com/normatec.jpg',
    affiliateUrl: 'https://example.com/affiliate/normatec',
    features: ['7 levels of pressure', 'Bluetooth', 'Full leg coverage', 'Portable'],
    bestFor: ['Runners', 'Athletes', 'Recovery days'],
    isPremium: true,
  },
  {
    id: 'trigger-point-grid',
    name: 'GRID Foam Roller',
    brand: 'TriggerPoint',
    category: 'foam_rollers',
    description: 'The original foam roller with patented GRID surface',
    price: 39,
    rating: 4.6,
    reviewCount: 28765,
    imageUrl: 'https://example.com/grid.jpg',
    affiliateUrl: 'https://example.com/affiliate/grid',
    features: ['Hollow core', 'Multi-density', 'Compact size', 'Durable'],
    bestFor: ['Beginners', 'Travel', 'Daily use'],
  },
  {
    id: 'whoop-4',
    name: 'WHOOP 4.0',
    brand: 'WHOOP',
    category: 'wearables',
    description: '24/7 health and fitness tracker with recovery insights',
    price: 30, // Monthly subscription
    rating: 4.5,
    reviewCount: 9876,
    imageUrl: 'https://example.com/whoop.jpg',
    affiliateUrl: 'https://example.com/affiliate/whoop',
    features: ['HRV tracking', 'Sleep analysis', 'Strain coach', 'Recovery score'],
    bestFor: ['Athletes', 'Data lovers', 'Optimization'],
  },
  {
    id: 'ice-barrel',
    name: 'Ice Barrel',
    brand: 'Ice Barrel',
    category: 'ice_heat',
    description: 'Cold therapy tub for ice baths and cold immersion',
    price: 1199,
    rating: 4.7,
    reviewCount: 1543,
    imageUrl: 'https://example.com/ice-barrel.jpg',
    affiliateUrl: 'https://example.com/affiliate/ice-barrel',
    features: ['Insulated', 'Upright design', 'Fits tall users', 'No electricity needed'],
    bestFor: ['Cold therapy', 'Inflammation', 'Mental toughness'],
    isPremium: true,
  },
  {
    id: 'momentous-protein',
    name: 'Grass-Fed Whey Protein',
    brand: 'Momentous',
    category: 'supplements',
    description: 'Premium whey protein for optimal muscle recovery',
    price: 69,
    rating: 4.8,
    reviewCount: 4532,
    imageUrl: 'https://example.com/momentous.jpg',
    affiliateUrl: 'https://example.com/affiliate/momentous',
    features: ['24g protein', 'Grass-fed', 'NSF certified', 'Low lactose'],
    bestFor: ['Post-workout', 'Muscle recovery', 'Athletes'],
  },
  {
    id: 'stretch-strap',
    name: 'Stretch Out Strap',
    brand: 'OPTP',
    category: 'stretching',
    description: 'Multi-loop stretching strap for flexibility training',
    price: 19,
    rating: 4.7,
    reviewCount: 15678,
    imageUrl: 'https://example.com/stretch-strap.jpg',
    affiliateUrl: 'https://example.com/affiliate/stretch-strap',
    features: ['10 loops', 'Instructional guide', 'Durable nylon', 'Portable'],
    bestFor: ['Hamstrings', 'Shoulders', 'Physical therapy'],
  },
]

interface RecoveryMarketplaceProps {
  onProductPress?: (product: RecoveryProduct) => void
}

export function RecoveryMarketplace({ onProductPress }: RecoveryMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | 'all'>('all')

  const filteredProducts = selectedCategory === 'all'
    ? SAMPLE_PRODUCTS
    : SAMPLE_PRODUCTS.filter(p => p.category === selectedCategory)

  const topPicks = SAMPLE_PRODUCTS.filter(p => p.isTopPick)

  const handleProductPress = (product: RecoveryProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onProductPress) {
      onProductPress(product)
    } else {
      // Open affiliate link
      Linking.openURL(product.affiliateUrl)
    }
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-white text-2xl font-bold">Recovery Gear</Text>
          <Text className="text-gray-400 mt-1">
            Curated products to optimize your recovery
          </Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          <CategoryChip
            label="All"
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            color="#F97316"
          />
          {CATEGORIES.map(category => (
            <CategoryChip
              key={category.id}
              label={category.name}
              icon={category.icon}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              color={category.color}
            />
          ))}
        </ScrollView>

        {/* Top Picks */}
        {selectedCategory === 'all' && (
          <View className="mb-6">
            <View className="flex-row items-center px-4 mb-3">
              <Ionicons name="star" size={20} color="#FACC15" />
              <Text className="text-white font-semibold ml-2">Top Picks</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
            >
              {topPicks.map(product => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Product Grid */}
        <View className="px-4">
          <Text className="text-gray-400 text-sm mb-3">
            {filteredProducts.length} products
          </Text>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
            />
          ))}
        </View>

        {/* Affiliate Disclosure */}
        <View className="px-4 py-6">
          <Text className="text-gray-600 text-xs text-center">
            We may earn a commission from purchases made through these links.
            This helps support GoodRunss at no extra cost to you.
          </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  )
}

// Category Chip Component
function CategoryChip({
  label,
  icon,
  selected,
  onPress,
  color,
}: {
  label: string
  icon?: string
  selected: boolean
  onPress: () => void
  color: string
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        selected ? '' : 'bg-gray-800'
      }`}
      style={selected ? { backgroundColor: color } : undefined}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={16}
          color={selected ? 'white' : color}
        />
      )}
      <Text
        className={`font-medium ${icon ? 'ml-1' : ''} ${
          selected ? 'text-white' : 'text-gray-300'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// Featured Product Card (Horizontal scroll)
function FeaturedProductCard({
  product,
  onPress,
}: {
  product: RecoveryProduct
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-800 rounded-2xl p-4 mr-3 w-64"
    >
      {/* Image Placeholder */}
      <View className="bg-gray-700 rounded-xl h-32 items-center justify-center mb-3">
        <Ionicons name="image" size={40} color="#4B5563" />
      </View>

      {/* Top Pick Badge */}
      {product.isTopPick && (
        <View className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded-full">
          <Text className="text-black text-xs font-bold">TOP PICK</Text>
        </View>
      )}

      {/* Details */}
      <Text className="text-gray-400 text-xs">{product.brand}</Text>
      <Text className="text-white font-semibold" numberOfLines={1}>
        {product.name}
      </Text>

      {/* Rating */}
      <View className="flex-row items-center mt-1">
        <Ionicons name="star" size={14} color="#FACC15" />
        <Text className="text-gray-400 text-sm ml-1">
          {product.rating} ({product.reviewCount.toLocaleString()})
        </Text>
      </View>

      {/* Price */}
      <View className="flex-row items-center mt-2">
        <Text className="text-white font-bold text-lg">${product.price}</Text>
        {product.originalPrice && (
          <Text className="text-gray-500 text-sm ml-2 line-through">
            ${product.originalPrice}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

// Product Card (List view)
function ProductCard({
  product,
  onPress,
}: {
  product: RecoveryProduct
  onPress: () => void
}) {
  const category = CATEGORIES.find(c => c.id === product.category)

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-800 rounded-2xl p-4 mb-3 flex-row"
    >
      {/* Image Placeholder */}
      <View className="bg-gray-700 rounded-xl w-24 h-24 items-center justify-center">
        <Ionicons
          name={category?.icon as any || 'cube'}
          size={32}
          color={category?.color || '#9CA3AF'}
        />
      </View>

      {/* Details */}
      <View className="flex-1 ml-4">
        {/* Premium Badge */}
        {product.isPremium && (
          <View className="bg-purple-500/20 px-2 py-0.5 rounded self-start mb-1">
            <Text className="text-purple-400 text-xs font-semibold">PREMIUM</Text>
          </View>
        )}

        <Text className="text-gray-400 text-xs">{product.brand}</Text>
        <Text className="text-white font-semibold" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
          {product.description}
        </Text>

        {/* Rating & Price */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#FACC15" />
            <Text className="text-gray-400 text-xs ml-1">
              {product.rating}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-white font-bold">${product.price}</Text>
            {product.originalPrice && (
              <Text className="text-gray-500 text-xs ml-1 line-through">
                ${product.originalPrice}
              </Text>
            )}
          </View>
        </View>

        {/* Best For Tags */}
        <View className="flex-row flex-wrap mt-2">
          {product.bestFor.slice(0, 2).map((tag, index) => (
            <View key={index} className="bg-gray-700 px-2 py-0.5 rounded mr-1">
              <Text className="text-gray-400 text-xs">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Arrow */}
      <View className="justify-center">
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  )
}

// Need React import for useState
import React from 'react'

export default RecoveryMarketplace

