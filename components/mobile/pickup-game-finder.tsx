
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Users, Clock, Zap, Filter, TrendingUp } from "lucide-react"

export function PickupGameFinder() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "basketball" | "tennis" | "soccer">("all")

  const activeGames = [
    {
      id: "1",
      court: "Downtown Sports Complex",
      sport: "Basketball",
      distance: "0.8 miles",
      playersNeeded: 2,
      currentPlayers: 8,
      totalPlayers: 10,
      skillLevel: "Intermediate",
      startTime: "Now",
      organizer: {
        name: "Marcus J.",
        avatar: "/placeholder.svg?height=100&width=100",
        rating: 4.8,
      },
      players: [
        { name: "Alex", avatar: "/placeholder.svg?height=100&width=100" },
        { name: "Sarah", avatar: "/placeholder.svg?height=100&width=100" },
        { name: "Mike", avatar: "/placeholder.svg?height=100&width=100" },
      ],
    },
    {
      id: "2",
      court: "Riverside Tennis Courts",
      sport: "Tennis",
      distance: "1.2 miles",
      playersNeeded: 1,
      currentPlayers: 3,
      totalPlayers: 4,
      skillLevel: "Advanced",
      startTime: "15 min",
      organizer: {
        name: "Emma W.",
        avatar: "/placeholder.svg?height=100&width=100",
        rating: 4.9,
      },
      players: [
        { name: "John", avatar: "/placeholder.svg?height=100&width=100" },
        { name: "Lisa", avatar: "/placeholder.svg?height=100&width=100" },
      ],
    },
    {
      id: "3",
      court: "Central Park Fields",
      sport: "Soccer",
      distance: "2.1 miles",
      playersNeeded: 4,
      currentPlayers: 18,
      totalPlayers: 22,
      skillLevel: "All Levels",
      startTime: "30 min",
      organizer: {
        name: "Carlos R.",
        avatar: "/placeholder.svg?height=100&width=100",
        rating: 4.7,
      },
      players: [
        { name: "David", avatar: "/placeholder.svg?height=100&width=100" },
        { name: "Maria", avatar: "/placeholder.svg?height=100&width=100" },
        { name: "Tom", avatar: "/placeholder.svg?height=100&width=100" },
      ],
    },
  ]

  const filteredGames =
    filter === "all" ? activeGames : activeGames.filter((game) => game.sport.toLowerCase() === filter)

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Find Pickup Games</h1>
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
        <Card className="glass-card border-2 border-primary/30 p-4 glow-primary">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Live Games Near You</h3>
              <p className="text-sm text-muted-foreground">{activeGames.length} active games right now</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "basketball", "tennis", "soccer"].map((sport) => (
            <Button
              key={sport}
              size="sm"
              variant={filter === sport ? "default" : "outline"}
              onClick={() => setFilter(sport as typeof filter)}
              className={filter === sport ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
            >
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredGames.map((game) => (
            <Card key={game.id} className="glass-card border-primary/30 p-5 hover:border-primary/50 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gradient-to-r from-primary to-accent">{game.sport}</Badge>
                      <Badge variant="secondary">{game.skillLevel}</Badge>
                    </div>
                    <h3 className="font-bold text-lg">{game.court}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{game.distance}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <Clock className="h-4 w-4" />
                      <span>{game.startTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={game.organizer.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{game.organizer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{game.organizer.name}</p>
                      <p className="text-xs text-muted-foreground">Organizer</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {game.players.slice(0, 3).map((player, index) => (
                      <Avatar key={index} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={player.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {game.currentPlayers > 3 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold">
                        +{game.currentPlayers - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">
                      {game.currentPlayers}/{game.totalPlayers} players
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Need {game.playersNeeded}
                    </Badge>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Join Game
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-primary/30 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-primary/20 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Can't find a game?</h3>
            <p className="text-sm text-muted-foreground">Start your own and invite players nearby</p>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 w-full">
              Create Pickup Game
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
