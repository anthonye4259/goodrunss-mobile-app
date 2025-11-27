import type { Activity } from "./activity-content"

export interface SearchResult {
  id: string
  type: "trainer" | "venue" | "marketplace"
  title: string
  subtitle: string
  rating?: number
  price?: number
  distance?: number
  activity: Activity
  imageUrl?: string
}

export interface SearchFilters {
  activity?: Activity
  priceRange?: { min: number; max: number }
  distance?: number
  rating?: number
  availability?: "now" | "today" | "week"
  sortBy?: "distance" | "price" | "rating" | "popular"
}

export class SearchService {
  private static instance: SearchService

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    // TODO: Replace with actual API call
    console.log("[v0] Searching for:", query, "with filters:", filters)

    // Mock search results
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockResults: SearchResult[] = [
      {
        id: "1",
        type: "trainer",
        title: "Sarah Johnson",
        subtitle: "Certified Basketball Coach",
        rating: 4.9,
        price: 75,
        distance: 1.2,
        activity: "Basketball",
      },
      {
        id: "2",
        type: "venue",
        title: "Central Park Courts",
        subtitle: "Outdoor Basketball Court",
        rating: 4.5,
        distance: 0.8,
        activity: "Basketball",
      },
      {
        id: "3",
        type: "trainer",
        title: "Mike Chen",
        subtitle: "Professional Yoga Instructor",
        rating: 4.8,
        price: 60,
        distance: 2.1,
        activity: "Yoga",
      },
    ]

    // Filter results based on query
    return mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase()),
    )
  }

  async getRecentSearches(): Promise<string[]> {
    // TODO: Get from AsyncStorage
    return ["Basketball trainers near me", "Yoga studios", "Tennis courts"]
  }

  async saveSearch(query: string): Promise<void> {
    // TODO: Save to AsyncStorage
    console.log("[v0] Saving search:", query)
  }
}
