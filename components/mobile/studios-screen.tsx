
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, MapPin, Star, Filter, Clock, DollarSign, Sparkles, TrendingUp, Brain } from "lucide-react"

const studios = [
  {
    id: 1,
    name: "Goodrunss Studio",
    owner: "Featured Partner",
    location: "Manhattan, NY",
    distance: "0.5 mi",
    rating: 5.0,
    reviews: 89,
    image: "/modern-pilates-studio.jpg",
    types: ["Pilates", "Yoga", "Lagree"],
    nextClass: "Today at 6:00 PM",
    price: "$25-35/class",
    amenities: ["Showers", "Lockers", "Retail", "Parking"],
    featured: true,
    aiPredictions: {
      popularityTrend: "+15%",
      bestTimeToBook: "6-7 PM weekdays",
      matchScore: 95,
      crowdLevel: "Moderate",
    },
  },
  {
    id: 2,
    name: "Core Power Studio",
    owner: "Sarah Mitchell",
    location: "Brooklyn, NY",
    distance: "1.2 mi",
    rating: 4.8,
    reviews: 156,
    image: "/yoga-studio-interior.png",
    types: ["Yoga", "Barre"],
    nextClass: "Tomorrow at 7:00 AM",
    price: "$20-30/class",
    amenities: ["Mats Provided", "Showers", "Cafe"],
    aiPredictions: {
      popularityTrend: "+8%",
      bestTimeToBook: "Morning classes",
      matchScore: 88,
      crowdLevel: "Low",
    },
  },
  {
    id: 3,
    name: "Lagree Fitness NYC",
    owner: "Mike Chen",
    location: "Chelsea, NY",
    distance: "1.8 mi",
    rating: 4.9,
    reviews: 203,
    image: "/lagree-megaformer-studio.jpg",
    types: ["Lagree", "Strength"],
    nextClass: "Today at 5:30 PM",
    price: "$35-45/class",
    amenities: ["Megaformers", "Showers", "Towels"],
    aiPredictions: {
      popularityTrend: "+22%",
      bestTimeToBook: "5-6 PM",
      matchScore: 92,
      crowdLevel: "High",
    },
  },
  {
    id: 4,
    name: "Zen Flow Studio",
    owner: "Jessica Park",
    location: "Upper West Side, NY",
    distance: "2.3 mi",
    rating: 4.7,
    reviews: 124,
    image: "/peaceful-yoga-studio.jpg",
    types: ["Yoga", "Meditation"],
    nextClass: "Today at 8:00 PM",
    price: "$18-28/class",
    amenities: ["Tea Bar", "Mats Provided", "Quiet Room"],
    aiPredictions: {
      popularityTrend: "+5%",
      bestTimeToBook: "Evening classes",
      matchScore: 85,
      crowdLevel: "Low",
    },
  },
]

export function StudiosScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const types = ["All", "Pilates", "Yoga", "Lagree", "Barre", "Meditation"]

  const filteredStudios = studios.filter((studio) => {
    const matchesSearch =
      studio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studio.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || selectedType === "All" || studio.types.includes(selectedType)
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-lg flex-1">Fitness Studios</h1>
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search studios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-border/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type === "All" ? null : type)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  (type === "All" && !selectedType) || selectedType === type
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "glass-card border border-border/50 hover:border-primary/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        <Card className="glass-card border-2 border-primary/50 p-4 glow-primary">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm">GIA Insights</h3>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">AI</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your preferences, evening Pilates classes at Goodrunss Studio are 95% match for you
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filteredStudios.length} studios found</p>
        </div>

        {filteredStudios.map((studio) => (
          <Card
            key={studio.id}
            onClick={() => router.push(`/mobile/studios/${studio.id}`)}
            className={`glass-card overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform ${
              studio.featured ? "border-2 border-primary glow-primary" : "border-primary/30"
            }`}
          >
            {studio.featured && (
              <div className="bg-gradient-to-r from-primary to-accent p-2 text-center">
                <p className="text-white text-sm font-bold flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  FEATURED PARTNER
                </p>
              </div>
            )}

            <div className="relative h-48">
              <img src={studio.image || "/placeholder.svg"} alt={studio.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                {studio.types.map((type) => (
                  <Badge key={type} className="bg-background/90 backdrop-blur-sm border-primary/30">
                    {type}
                  </Badge>
                ))}
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary/90 backdrop-blur-sm border-0 text-white">
                  <Brain className="h-3 w-3 mr-1" />
                  {studio.aiPredictions.matchScore}% Match
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{studio.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    <span>{studio.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{studio.nextClass}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {studio.rating}
                  </div>
                  <p className="text-xs text-muted-foreground">{studio.reviews} reviews</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold text-green-500 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    {studio.aiPredictions.popularityTrend}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Trending</p>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-primary mb-1">{studio.aiPredictions.crowdLevel}</div>
                  <p className="text-[10px] text-muted-foreground">Crowd</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs font-semibold text-primary mb-1">
                    <Clock className="h-3 w-3" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Best Time</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {studio.distance}
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <DollarSign className="h-4 w-4" />
                    {studio.price}
                  </div>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                  View Classes
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {studio.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
