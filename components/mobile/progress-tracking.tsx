"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Target, Zap } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

const progressData = [
  { week: "W1", score: 65 },
  { week: "W2", score: 68 },
  { week: "W3", score: 72 },
  { week: "W4", score: 75 },
  { week: "W5", score: 78 },
  { week: "W6", score: 82 },
]

const stats = [
  { label: "Win Rate", value: "68%", change: "+12%", icon: Target },
  { label: "Skill Level", value: "8.5", change: "+1.2", icon: TrendingUp },
  { label: "Streak", value: "5 days", change: "New!", icon: Zap },
]

export function ProgressTracking() {
  return (
    <div className="space-y-4">
      <Card className="p-6 glass-card border-2 border-primary/30 glow-primary">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Your Progress</h3>
              <p className="text-sm text-muted-foreground">Last 6 weeks</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold gradient-text">82</p>
              <p className="text-xs text-primary">+17 points</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={progressData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 glass-card border border-border/50 hover:border-primary/50 transition-all">
              <div className="space-y-2">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  <p className="text-xs text-primary font-semibold mt-1">{stat.change}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
