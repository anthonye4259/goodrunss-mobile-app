"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Users, MapPin, Calendar } from "lucide-react"

const sportsData = [
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    color: "from-orange-500 to-red-500",
    stats: { players: "2.4k", courts: 156, games: "340/week" },
    trending: true,
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "🎾",
    color: "from-green-500 to-emerald-500",
    stats: { players: "1.8k", courts: 89, games: "210/week" },
    trending: false,
  },
  {
    id: "soccer",
    name: "Soccer",
    icon: "⚽",
    color: "from-blue-500 to-cyan-500",
    stats: { players: "3.1k", courts: 124, games: "450/week" },
    trending: true,
  },
  {
    id: "volleyball",
    name: "Volleyball",
    icon: "🏐",
    color: "from-purple-500 to-pink-500",
    stats: { players: "1.2k", courts: 67, games: "180/week" },
    trending: false,
  },
  {
    id: "baseball",
    name: "Baseball",
    icon: "⚾",
    color: "from-red-500 to-orange-500",
    stats: { players: "980", courts: 45, games: "120/week" },
    trending: false,
  },
  {
    id: "football",
    name: "Football",
    icon: "🏈",
    color: "from-amber-500 to-yellow-500",
    stats: { players: "1.5k", courts: 78, games: "200/week" },
    trending: true,
  },
]

export function ExploreSportsScreen() {
  const router = useRouter()
  const [selectedSports, setSelectedSports] = useState<string[]>(["basketball", "tennis"])

  const toggleSport = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter((id) => id !== sportId))
    } else {
      setSelectedSports([...selectedSports, sportId])
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">Explore Sports</h1>
              <p className="text-xs text-muted-foreground">Discover new activities</p>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent" onClick={() => router.back()}>
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        <div className="text-center space-y-2 py-6">
          <h2 className="text-2xl font-bold gradient-text">Try Something New</h2>
          <p className="text-muted-foreground">
            Select sports to customize your feed and discover courts, trainers, and games
          </p>
        </div>

        <div className="space-y-3">
          {sportsData.map((sport) => {
            const isSelected = selectedSports.includes(sport.id)
            return (
              <Card
                key={sport.id}
                onClick={() => toggleSport(sport.id)}
                className={`glass-card p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                  isSelected ? "border-2 border-primary glow-primary" : "border-border/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sport.color} flex items-center justify-center text-3xl`}
                  >
                    {sport.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{sport.name}</h3>
                      {sport.trending && (
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {sport.stats.players}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {sport.stats.courts}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {sport.stats.games}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-primary bg-primary" : "border-border/50"
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="glass-card border-primary/30 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Selected {selectedSports.length} {selectedSports.length === 1 ? "sport" : "sports"}
          </p>
          <Button className="w-full bg-gradient-to-r from-primary to-accent" onClick={() => router.back()}>
            Update My Feed
          </Button>
        </Card>
      </div>
    </div>
  )
}
