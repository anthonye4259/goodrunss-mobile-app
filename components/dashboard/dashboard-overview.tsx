"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, Users, Calendar, TrendingUp, ArrowUpRight } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"
import { ShareProfileCard } from "./share-profile-card"
import { GiaAutomationsShowcase } from "../gia-automations-showcase"
import { TrialBanner } from "../trial-banner"
import { InstantCashoutCard } from "./instant-cashout-card"
import { EnhancedClientList } from "./enhanced-client-list"
import { SessionCalendar } from "./session-calendar"

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 5100 },
  { month: "Apr", revenue: 4600 },
  { month: "May", revenue: 5800 },
  { month: "Jun", revenue: 6200 },
]

const bookingsData = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 15 },
  { day: "Wed", bookings: 10 },
  { day: "Thu", bookings: 18 },
  { day: "Fri", bookings: 14 },
  { day: "Sat", bookings: 22 },
  { day: "Sun", bookings: 16 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Your performance at a glance</p>
      </div>

      <TrialBanner />

      <InstantCashoutCard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 glass-card border-border/50 hover:glow-primary transition-all duration-300 hover:scale-[1.02]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl glow-primary">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-bold gradient-text">$6.2K</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-primary" />
                <p className="text-sm text-primary font-semibold">+12% from last month</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 glass-card border-border/50 hover:glow-primary transition-all duration-300 hover:scale-[1.02]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Active Clients</p>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl glow-primary">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-bold gradient-text">48</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-primary" />
                <p className="text-sm text-primary font-semibold">+8 new this month</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 glass-card border-border/50 hover:glow-primary transition-all duration-300 hover:scale-[1.02]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Sessions This Week</p>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl glow-primary">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-bold gradient-text">22</p>
              <p className="text-sm text-muted-foreground mt-2">5 remaining today</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 glass-card border-border/50 hover:glow-primary transition-all duration-300 hover:scale-[1.02]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Avg Rating</p>
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl glow-primary">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-5xl font-bold gradient-text">4.9</p>
              <p className="text-sm text-muted-foreground mt-2">127 reviews</p>
            </div>
          </div>
        </Card>
      </div>

      <ShareProfileCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedClientList />
        <SessionCalendar />
      </div>

      <GiaAutomationsShowcase userType="trainer" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <h3 className="text-lg font-semibold mb-4">Weekly Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsData}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card className="p-6 glass-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        <div className="space-y-3">
          {[
            { client: "John Smith", time: "Today, 3:00 PM", sport: "Basketball", type: "Individual" },
            { client: "Sarah Johnson", time: "Today, 5:00 PM", sport: "Basketball", type: "Group" },
            { client: "Mike Davis", time: "Tomorrow, 10:00 AM", sport: "Basketball", type: "Individual" },
          ].map((session, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{session.client}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.sport} • {session.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{session.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
