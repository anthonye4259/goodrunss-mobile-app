"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Calendar, Target, Sparkles } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts"

const revenueData = [
  { month: "Jan", revenue: 4200, sessions: 56 },
  { month: "Feb", revenue: 3800, sessions: 51 },
  { month: "Mar", revenue: 5100, sessions: 68 },
  { month: "Apr", revenue: 4600, sessions: 61 },
  { month: "May", revenue: 5800, sessions: 77 },
  { month: "Jun", revenue: 6200, sessions: 83 },
]

const clientGrowthData = [
  { month: "Jan", clients: 32 },
  { month: "Feb", clients: 38 },
  { month: "Mar", clients: 42 },
  { month: "Apr", clients: 45 },
  { month: "May", clients: 47 },
  { month: "Jun", clients: 48 },
]

const performanceData = [
  { metric: "Client Retention", value: 92 },
  { metric: "Session Completion", value: 88 },
  { metric: "Client Satisfaction", value: 96 },
  { metric: "Booking Rate", value: 85 },
]

export function InsightsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Business Insights</h2>
          <p className="text-muted-foreground mt-1">AI-powered analytics and performance metrics</p>
        </div>
      </div>

      {/* AI Insights Panel */}
      <Card className="p-6 glass-card gradient-border glow-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl glow-primary-strong">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Key Insights from GIA</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                • Revenue increased 24% this quarter - your Saturday sessions are driving 40% of total revenue
              </p>
              <p className="text-muted-foreground">
                • Client retention at 92% - 15% above industry average. Your personalized approach is working
              </p>
              <p className="text-muted-foreground">
                • Optimal pricing opportunity: Consider raising rates by $10-15 during peak hours (5-7 PM)
              </p>
              <p className="text-muted-foreground">
                • Client acquisition cost decreased 18% - referral program is highly effective
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 glass-card border-border/50 hover:glow-primary transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-2 gradient-text">$6,200</p>
              <p className="text-sm text-primary mt-1">+24% vs last month</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50 hover:glow-primary transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-3xl font-bold mt-2 gradient-text">83</p>
              <p className="text-sm text-primary mt-1">+15 from last month</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50 hover:glow-primary transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Client Growth</p>
              <p className="text-3xl font-bold mt-2 gradient-text">+16</p>
              <p className="text-sm text-primary mt-1">New clients this quarter</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50 hover:glow-primary transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Session Rate</p>
              <p className="text-3xl font-bold mt-2 gradient-text">$75</p>
              <p className="text-sm text-primary mt-1">+$5 from last month</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Revenue & Sessions Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Client Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clientGrowthData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="clients"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--accent))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6 glass-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceData.map((item) => (
            <div key={item.metric} className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{item.metric}</p>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold gradient-text">{item.value}%</p>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
