"use client"

import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { SearchService, type SearchResult } from "@/lib/search-service"
import { SkeletonLoader } from "./skeleton-loader"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"

interface GlobalSearchProps {
  visible: boolean
  onClose: () => void
}

export function GlobalSearch({ visible, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const searchService = SearchService.getInstance()

  useEffect(() => {
    if (visible) {
      loadRecentSearches()
    }
  }, [visible])

  useEffect(() => {
    if (query.length > 2) {
      performSearch()
    } else {
      setResults([])
    }
  }, [query])

  const loadRecentSearches = async () => {
    const recent = await searchService.getRecentSearches()
    setRecentSearches(recent)
  }

  const performSearch = async () => {
    setLoading(true)
    try {
      const searchResults = await searchService.search(query)
      setResults(searchResults)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultPress = (result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    searchService.saveSearch(query)

    if (result.type === "trainer") {
      router.push(`/trainers/${result.id}`)
    } else if (result.type === "venue") {
      router.push(`/venues/${result.id}`)
    }

    onClose()
  }

  const handleRecentSearchPress = (search: string) => {
    setQuery(search)
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient colors={["#0A0A0A", "#141414"]} className="flex-1">
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1 glass-card rounded-xl flex-row items-center px-4 py-3">
              <Ionicons name="search" size={20} color="#7ED957" />
              <TextInput
                className="flex-1 ml-3 text-foreground"
                placeholder="Search trainers, venues, gear..."
                placeholderTextColor="#666"
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {query.length === 0 && recentSearches.length > 0 && (
              <View className="mb-6">
                <Text className="text-foreground font-bold text-lg mb-3">Recent Searches</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-3 border-b border-border"
                    onPress={() => handleRecentSearchPress(search)}
                  >
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text className="text-foreground ml-3 flex-1">{search}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {loading && (
              <View>
                <SkeletonLoader width="100%" height={80} className="mb-3" />
                <SkeletonLoader width="100%" height={80} className="mb-3" />
                <SkeletonLoader width="100%" height={80} className="mb-3" />
              </View>
            )}

            {!loading && results.length > 0 && (
              <View>
                <Text className="text-foreground font-bold text-lg mb-3">Results</Text>
                {results.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    className="bg-card border border-border rounded-xl p-4 mb-3"
                    onPress={() => handleResultPress(result)}
                  >
                    <View className="flex-row items-center">
                      <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-3">
                        <Ionicons
                          name={result.type === "trainer" ? "person" : result.type === "venue" ? "location" : "cart"}
                          size={24}
                          color="#7ED957"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground font-bold mb-1">{result.title}</Text>
                        <Text className="text-muted-foreground text-sm">{result.subtitle}</Text>
                        {result.distance && (
                          <Text className="text-muted-foreground text-xs mt-1">
                            {result.distance.toFixed(1)} mi away
                          </Text>
                        )}
                      </View>
                      {result.price && (
                        <View className="items-end">
                          <Text className="text-primary font-bold">${result.price}</Text>
                          {result.rating && (
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="star" size={12} color="#7ED957" />
                              <Text className="text-foreground text-xs ml-1">{result.rating}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!loading && query.length > 2 && results.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="search-outline" size={64} color="#666" />
                <Text className="text-muted-foreground text-lg mt-4">No results found</Text>
                <Text className="text-muted-foreground text-sm mt-2">Try a different search term</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </LinearGradient>
    </Modal>
  )
}
