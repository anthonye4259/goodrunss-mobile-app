
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Trophy, Users, MapPin, Sparkles } from "lucide-react"

const leagues = [
  {
    id: 1,
    name: "NYC Summer Basketball League",
    sport: "Basketball",
    image: "/basketball-league.png",
    skillLevel: "Intermediate",
    teams: 12,
    players: 96,
    startDate: "June 15, 2024",
    endDate: "August 30, 2024",
    location: "Manhattan, NY",
    distance: "1.2 mi",
    price: "$150/season",
    status: "Registration Open",
    featured: true,
    description: "Competitive summer league with weekly games and playoffs",
  },
  {
    id: 2,
    name: "Brooklyn Tennis League",
    sport: "Tennis",
    image: "/tennis-league.jpg",
    skillLevel: "Advanced",
    teams: 8,
    players: 32,
    startDate: "July 1, 2024",
    endDate: "September 15, 2024",
    location: "Brooklyn, NY",
    distance: "2.5 mi",
    price: "$200/season",
    status: "Registration Open",
    featured: false,
    description: "Singles and doubles tournament-style league",
  },
  {
    id: 3,
    name: "Queens Soccer League",
    sport: "Soccer",
    image: "/vibrant-soccer-league.png",
    skillLevel: "All Levels",
    teams: 16,
    players: 176,
    startDate: "May 20, 2024",
    endDate: "October 15, 2024",
    location: "Queens, NY",
    distance: "3.8 mi",
    price: "$180/season",
    status: "In Progress",
    featured: false,
    description: "11v11 outdoor league with divisions by skill level",
  },
  {
    id: 4,
    name: "Manhattan Volleyball League",
    sport: "Volleyball",
    image: "/volleyball-league.jpg",
    skillLevel: "Beginner",
    teams: 10,
    players: 60,
    startDate: "June 1, 2024",
    endDate: "August 15, 2024",
    location: "Manhattan, NY",
    distance: "0.9 mi",
    price: "$120/season",
    status: "Registration Open",
    featured: true,
    description: "Beginner-friendly indoor league with coaching sessions",
  },
  {
    id: 5,
    name: "Bronx Baseball League",
    sport: "Baseball",
    image: "/baseball-league.png",
    skillLevel: "Intermediate",
    teams: 14,
    players: 168,
    startDate: "April 15, 2024",
    endDate: "September 30, 2024",
    location: "Bronx, NY",
    distance: "5.2 mi",
    price: "$250/season",
    status: "In Progress",
    featured: false,
    description: "Competitive adult baseball league with umpires",
  },
]

export function LeaguesScreen({ sport }: { sport?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSport, setSelectedSport] = useState<string | null>(sport || searchParams.get("sport") || null)

  useEffect(() => {
    if (sport) {
      setSelectedSport(sport)
    }
  }, [sport])

  const sports = ["All", "Basketball", "Tennis", "Soccer", "Volleyball", "Swimming", "Baseball"]

  const filteredLeagues = leagues.filter((league) => {
    const matchesSearch =
      league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.sport.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = !selectedSport || selectedSport === "All" || league.sport === selectedSport
    return matchesSearch && matchesSport
  })

  const featuredLeagues = filteredLeagues.filter((l) => l.featured)
  const otherLeagues = filteredLeagues.filter((l) => !l.featured)

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg gradient-text">
                {selectedSport && selectedSport !== "All" ? `${selectedSport} GEE Leagues` : "GEE Leagues"}
              </h1>
              <p className="text-xs text-muted-foreground">Global Elite Events</p>
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search leagues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-border/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport === "All" ? null : sport)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  (sport === "All" && !selectedSport) || selectedSport === sport
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "glass-card border border-border/50 hover:border-primary/50"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {featuredLeagues.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary fill-primary" />
              <h2 className="text-lg font-bold">Featured GEE Leagues</h2>
            </div>

            {featuredLeagues.map((league) => (
              <Card
                key={league.id}
                onClick={() => router.push(`/mobile/leagues/${league.id}`)}
                className="glass-card border-2 border-primary/30 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform glow-primary"
              >
                <div className="relative h-48">
                  <img
                    src={league.image || "/placeholder.svg"}
                    alt={league.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-primary/90 backdrop-blur-sm border-0 text-white">
                      <Sparkles className="h-3 w-3 mr-1 fill-white" />
                      GEE Featured
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-xl mb-1">{league.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {league.sport}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {league.skillLevel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{league.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {league.teams} teams • {league.players} players
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{league.distance} away</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Season</p>
                      <p className="text-sm font-semibold">{league.startDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-semibold text-primary">{league.price}</p>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-primary to-accent">
                    {league.status === "Registration Open" ? "Register Now" : "View Details"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {otherLeagues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">All GEE Leagues</h2>

            {otherLeagues.map((league) => (
              <Card
                key={league.id}
                onClick={() => router.push(`/mobile/leagues/${league.id}`)}
                className="glass-card border-primary/30 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <div className="relative h-40">
                  <img
                    src={league.image || "/placeholder.svg"}
                    alt={league.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`${
                        league.status === "Registration Open" ? "bg-green-500/90" : "bg-orange-500/90"
                      } backdrop-blur-sm border-0 text-white`}
                    >
                      {league.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-lg mb-1">{league.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {league.sport}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {league.skillLevel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{league.teams} teams</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{league.distance}</span>
                    </div>
                    <div className="font-semibold text-primary">{league.price}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredLeagues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No leagues found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
