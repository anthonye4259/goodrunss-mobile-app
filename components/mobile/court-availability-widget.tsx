"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Clock, Users, Zap } from "lucide-react"

interface CourtAvailabilityWidgetProps {
  courtName: string
  currentCrowdLevel: "low" | "medium" | "high"
  predictedCrowdLevel: "low" | "medium" | "high"
  bestTimeToVisit: string
  currentPlayers: number
  averagePlayers: number
}

export function CourtAvailabilityWidget({
  courtName,
  currentCrowdLevel,
  predictedCrowdLevel,
  bestTimeToVisit,
  currentPlayers,
  averagePlayers,
}: CourtAvailabilityWidgetProps) {
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

  const trend = currentPlayers > averagePlayers ? "up" : "down"

  return (
    <Card className="glass-card border-2 border-primary/30 p-5 glow-primary">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Live Availability</h3>
            <p className="text-xs text-muted-foreground">AI-powered predictions</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-full">
            <Zap className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Current Status</p>
            <Badge className={`bg-gradient-to-r ${getCrowdColor(currentCrowdLevel)} text-white w-full justify-center`}>
              {getCrowdLabel(currentCrowdLevel)}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold">{currentPlayers} players</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">In 1 Hour</p>
            <Badge
              className={`bg-gradient-to-r ${getCrowdColor(predictedCrowdLevel)} text-white w-full justify-center`}
            >
              {getCrowdLabel(predictedCrowdLevel)}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-orange-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-primary" />
              )}
              <span className="font-semibold">{trend === "up" ? "Getting busier" : "Clearing up"}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Best time to visit</span>
            </div>
            <span className="text-sm font-bold gradient-text">{bestTimeToVisit}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
