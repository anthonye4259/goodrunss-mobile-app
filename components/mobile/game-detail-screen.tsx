"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Users, Star, MessageSquare, Share2, Calendar } from "lucide-react"

export function GameDetailScreen() {
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(false)

  const game = {
    id: "1",
    court: "Downtown Sports Complex",
    address: "123 Main St, New York, NY 10001",
    sport: "Basketball",
    distance: "0.8 miles",
    playersNeeded: 2,
    currentPlayers: 8,
    totalPlayers: 10,
    skillLevel: "Intermediate",
    startTime: "Today at 6:00 PM",
    duration: "2 hours",
    description: "Casual pickup game, all skill levels welcome! We'll play full court 5v5. Bring water and good vibes.",
    organizer: {
      name: "Marcus Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.8,
      gamesOrganized: 47,
    },
    players: [
      { name: "Alex Rivera", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Advanced" },
      { name: "Sarah Chen", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Intermediate" },
      { name: "Mike Thompson", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Beginner" },
      { name: "Lisa Wang", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Intermediate" },
      { name: "James Brown", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Advanced" },
      { name: "Emma Davis", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Intermediate" },
      { name: "Carlos Martinez", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Beginner" },
      { name: "Nina Patel", avatar: "/placeholder.svg?height=100&width=100", skillLevel: "Advanced" },
    ],
  }

  const handleJoinGame = () => {
    setIsJoined(true)
    console.log("[v0] Joined game:", game.id)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg flex-1">Game Details</h1>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        <Card className="glass-card border-2 border-primary/30 p-6 glow-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-primary to-accent">{game.sport}</Badge>
                <Badge variant="secondary">{game.skillLevel}</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-2">{game.court}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{game.address}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">{game.startTime}</p>
                <p className="text-xs text-muted-foreground">{game.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">
                  {game.currentPlayers}/{game.totalPlayers} Players
                </p>
                <p className="text-xs text-muted-foreground">Need {game.playersNeeded} more</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-6">
          <h3 className="font-bold text-lg mb-3">About This Game</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{game.description}</p>
        </Card>

        <Card className="glass-card border-primary/30 p-6">
          <h3 className="font-bold text-lg mb-4">Organizer</h3>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={game.organizer.avatar || "/placeholder.svg"} />
              <AvatarFallback>{game.organizer.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">{game.organizer.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>{game.organizer.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">{game.organizer.gamesOrganized} games organized</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="glass-card bg-transparent">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Players ({game.currentPlayers})</h3>
            <Badge variant="secondary">{game.playersNeeded} spots left</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {game.players.map((player, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg glass-card">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={player.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.skillLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>{game.distance} away</span>
          </div>
          <Button variant="outline" className="w-full glass-card bg-transparent">
            View on Map
          </Button>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 p-4">
        <div className="max-w-md mx-auto">
          {isJoined ? (
            <div className="space-y-2">
              <Button className="w-full bg-green-500 hover:bg-green-600" disabled>
                <Calendar className="h-5 w-5 mr-2" />
                You're In! Added to Calendar
              </Button>
              <Button variant="outline" className="w-full glass-card bg-transparent">
                Leave Game
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleJoinGame}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Join Game
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
