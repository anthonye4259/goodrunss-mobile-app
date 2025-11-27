"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Share2,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react"

const leagueData = {
  id: 1,
  name: "NYC Summer Basketball League",
  sport: "Basketball",
  image: "/basketball-league.png",
  skillLevel: "Intermediate",
  teams: 12,
  players: 96,
  startDate: "June 15, 2024",
  endDate: "August 30, 2024",
  location: "Manhattan Sports Complex",
  address: "123 Sports Ave, Manhattan, NY 10001",
  distance: "1.2 mi",
  price: "$150/season",
  status: "Registration Open",
  description:
    "Join NYC's premier summer basketball league powered by GEE (Global Elite Events)! Compete against teams at your skill level in a professionally organized league with certified referees, stat tracking, and championship playoffs.",
  features: [
    "Weekly games (Saturdays)",
    "Professional referees",
    "Stat tracking & standings",
    "Championship playoffs",
    "Team jerseys included",
    "Post-game social events",
  ],
  schedule: [
    { week: 1, date: "June 15", matchup: "Team A vs Team B", time: "6:00 PM" },
    { week: 2, date: "June 22", matchup: "Team C vs Team D", time: "7:00 PM" },
    { week: 3, date: "June 29", matchup: "Team E vs Team F", time: "6:30 PM" },
  ],
  standings: [
    { rank: 1, team: "Thunder", wins: 8, losses: 2, points: 856 },
    { rank: 2, team: "Lightning", wins: 7, losses: 3, points: 823 },
    { rank: 3, team: "Storm", wins: 6, losses: 4, points: 791 },
    { rank: 4, team: "Blaze", wins: 5, losses: 5, points: 768 },
  ],
  topPlayers: [
    { name: "Marcus Johnson", team: "Thunder", ppg: 24.5, avatar: "/placeholder.svg" },
    { name: "Sarah Chen", team: "Lightning", ppg: 22.8, avatar: "/placeholder.svg" },
    { name: "James Rodriguez", team: "Storm", ppg: 21.3, avatar: "/placeholder.svg" },
  ],
}

export function LeagueDetailScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-64">
        <img
          src={leagueData.image || "/placeholder.svg"}
          alt={leagueData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="glass-card">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="glass-card">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/90 backdrop-blur-sm border-0 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              GEE League
            </Badge>
            <Badge className="bg-green-500/90 backdrop-blur-sm border-0 text-white">
              <Clock className="h-3 w-3 mr-1" />
              {leagueData.status}
            </Badge>
            <Badge variant="outline" className="backdrop-blur-sm">
              {leagueData.sport}
            </Badge>
            <Badge variant="outline" className="backdrop-blur-sm">
              {leagueData.skillLevel}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{leagueData.name}</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <Card className="glass-card border-primary/30 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary mb-1">
                <Users className="h-5 w-5" />
                {leagueData.teams}
              </div>
              <p className="text-xs text-muted-foreground">Teams</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary mb-1">
                <Users className="h-5 w-5" />
                {leagueData.players}
              </div>
              <p className="text-xs text-muted-foreground">Players</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">{leagueData.price}</div>
              <p className="text-xs text-muted-foreground">Per Season</p>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="glass-card border-primary/30 p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">About This GEE League</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{leagueData.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">What's Included:</h4>
                <div className="space-y-2">
                  {leagueData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="glass-card border-primary/30 p-6 space-y-3">
              <h3 className="font-bold text-lg">League Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Season Dates</p>
                    <p className="text-sm text-muted-foreground">
                      {leagueData.startDate} - {leagueData.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{leagueData.location}</p>
                    <p className="text-sm text-muted-foreground">{leagueData.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Registration Fee</p>
                    <p className="text-sm text-muted-foreground">{leagueData.price} per player</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card border-primary/30 p-6 space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Players
              </h3>
              <div className="space-y-3">
                {leagueData.topPlayers.map((player, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground w-6">{index + 1}</div>
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={player.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.team}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{player.ppg}</p>
                      <p className="text-xs text-muted-foreground">PPG</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="standings" className="space-y-4 mt-4">
            <Card className="glass-card border-primary/30 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Current Standings
              </h3>
              <div className="space-y-3">
                {leagueData.standings.map((team) => (
                  <div
                    key={team.rank}
                    className="flex items-center gap-3 p-3 rounded-lg glass-card border border-border/50"
                  >
                    <div className="text-xl font-bold text-primary w-8">{team.rank}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{team.team}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.wins}W - {team.losses}L
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{team.points}</p>
                      <p className="text-xs text-muted-foreground">PTS</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card className="glass-card border-primary/30 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Games
              </h3>
              <div className="space-y-3">
                {leagueData.schedule.map((game) => (
                  <div key={game.week} className="p-4 rounded-lg glass-card border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Week {game.week}</Badge>
                      <p className="text-sm text-muted-foreground">{game.date}</p>
                    </div>
                    <p className="font-semibold mb-1">{game.matchup}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {game.time}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Button className="w-full bg-gradient-to-r from-primary to-accent glow-primary h-12 text-base font-semibold">
          Register for GEE League
        </Button>
      </div>
    </div>
  )
}
