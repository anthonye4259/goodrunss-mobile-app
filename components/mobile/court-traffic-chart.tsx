"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface TrafficData {
  hour: string
  players: number
  level: "low" | "medium" | "high"
}

export function CourtTrafficChart() {
  const trafficData: TrafficData[] = [
    { hour: "6 AM", players: 5, level: "low" },
    { hour: "8 AM", players: 12, level: "medium" },
    { hour: "10 AM", players: 8, level: "low" },
    { hour: "12 PM", players: 18, level: "high" },
    { hour: "2 PM", players: 15, level: "medium" },
    { hour: "4 PM", players: 22, level: "high" },
    { hour: "6 PM", players: 25, level: "high" },
    { hour: "8 PM", players: 12, level: "medium" },
  ]

  const maxPlayers = Math.max(...trafficData.map((d) => d.players))
  const currentHour = new Date().getHours()
  const currentIndex = Math.floor(currentHour / 2) % trafficData.length

  const getBarColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "bg-gradient-to-t from-primary to-accent"
      case "medium":
        return "bg-gradient-to-t from-yellow-500 to-orange-500"
      case "high":
        return "bg-gradient-to-t from-orange-500 to-red-500"
    }
  }

  return (
    <Card className="glass-card border-primary/30 p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold">Traffic Predictions</h3>
            <p className="text-xs text-muted-foreground">Based on historical data</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Today
          </Badge>
        </div>

        <div className="flex items-end justify-between gap-2 h-40">
          {trafficData.map((data, index) => {
            const heightPercent = (data.players / maxPlayers) * 100
            const isCurrent = index === currentIndex

            return (
              <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${getBarColor(data.level)} ${
                      isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  {isCurrent && (
                    <div className="absolute -top-6 text-xs font-bold text-primary whitespace-nowrap">Now</div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold">{data.hour}</p>
                  <p className="text-xs text-muted-foreground">{data.players}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
