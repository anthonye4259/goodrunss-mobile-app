"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Flame, TrendingDown, TrendingUp, Clock } from "lucide-react"
import { ActivityHeatMap } from "./activity-heat-map"
import Link from "next/link"

const courts = [
  {
    id: 1,
    name: "Downtown Sports Complex",
    distance: "0.8 miles",
    rating: 4.8,
    activePlayers: 12,
    sports: ["Basketball", "Tennis", "Volleyball"],
    image: "/outdoor-basketball-court.png",
    crowdLevel: "medium" as const,
    bestTime: "8:00 AM",
    trend: "down" as const,
  },
  {
    id: 2,
    name: "Riverside Tennis Courts",
    distance: "1.2 miles",
    rating: 4.6,
    activePlayers: 8,
    sports: ["Tennis", "Pickleball"],
    image: "/outdoor-tennis-court.png",
    crowdLevel: "low" as const,
    bestTime: "Now",
    trend: "stable" as const,
  },
  {
    id: 3,
    name: "Westside Recreation Center",
    distance: "2.1 miles",
    rating: 4.9,
    activePlayers: 15,
    sports: ["Basketball", "Soccer", "Badminton"],
    image: "/recreation-center.jpg",
    crowdLevel: "high" as const,
    bestTime: "6:00 PM",
    trend: "up" as const,
  },
]

export function CourtsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"list" | "heatmap">("list")

  const getCrowdColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "from-primary to-accent"
      case "medium":
        return "from-yellow-500 to-orange-500"
      case "high":
        return "from-orange-500 to-red-500"
    }
  }

  const getCrowdLabel = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "Not Busy"
      case "medium":
        return "Moderate"
      case "high":
        return "Very Busy"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Discover Courts</h1>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courts, sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setView("list")}
            >
              List View
            </Button>
            <Button
              variant={view === "heatmap" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setView("heatmap")}
            >
              <Flame className="h-4 w-4 mr-2" />
              Heat Map
            </Button>
          </div>
        </div>

        {view === "heatmap" ? (
          <ActivityHeatMap />
        ) : (
          <div className="space-y-4">
            {courts.map((court) => (
              <Card key={court.id} className="overflow-hidden bg-card border-border">
                <div className="aspect-video w-full bg-muted relative">
                  <img
                    src={court.image || "/placeholder.svg"}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <Flame className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{court.rating}</span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={`bg-gradient-to-r ${getCrowdColor(court.crowdLevel)} text-white`}>
                      {getCrowdLabel(court.crowdLevel)}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{court.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Flame className="h-4 w-4" />
                      <span>{court.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{court.activePlayers} players active now</span>
                  </div>

                  <div className="flex items-center justify-between p-3 glass-card border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Best time:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold gradient-text">{court.bestTime}</span>
                      {court.trend === "down" && <TrendingDown className="h-4 w-4 text-primary" />}
                      {court.trend === "up" && <TrendingUp className="h-4 w-4 text-orange-500" />}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {court.sports.map((sport) => (
                      <span key={sport} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                        {sport}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/mobile/courts/${court.id}`} className="flex-1">
                      <Button className="w-full">View Details</Button>
                    </Link>
                    <Link href={`/mobile/courts/check-in?court=${encodeURIComponent(court.name)}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Check In
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
