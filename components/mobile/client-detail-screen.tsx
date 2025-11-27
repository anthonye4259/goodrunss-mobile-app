"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Star,
  Calendar,
  DollarSign,
  MessageCircle,
  MoreVertical,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Activity,
} from "lucide-react"

export function ClientDetailScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const client = {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=100&width=100",
    sport: "Basketball",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    totalSessions: 24,
    completedSessions: 22,
    canceledSessions: 2,
    upcomingSessions: 2,
    lastSession: "2 days ago",
    nextSession: "Tomorrow, 3:00 PM",
    totalSpent: 1440,
    joinedDate: "Jan 15, 2025",
    progress: 85,
    goals: "Improve shooting accuracy and defensive positioning",
    status: "active",
    rating: 5,
    notes: "Very dedicated student. Shows consistent improvement. Prefers morning sessions.",
  }

  const sessions = [
    {
      id: "1",
      date: "Mar 18, 2025",
      time: "3:00 PM",
      duration: "1 hour",
      status: "upcoming",
      location: "Brooklyn Basketball Court",
      focus: "Shooting drills",
    },
    {
      id: "2",
      date: "Mar 20, 2025",
      time: "3:00 PM",
      duration: "1 hour",
      status: "upcoming",
      location: "Brooklyn Basketball Court",
      focus: "Defense techniques",
    },
    {
      id: "3",
      date: "Mar 15, 2025",
      time: "3:00 PM",
      duration: "1 hour",
      status: "completed",
      location: "Brooklyn Basketball Court",
      focus: "Ball handling",
      rating: 5,
    },
    {
      id: "4",
      date: "Mar 13, 2025",
      time: "3:00 PM",
      duration: "1 hour",
      status: "completed",
      location: "Brooklyn Basketball Court",
      focus: "Shooting practice",
      rating: 5,
    },
    {
      id: "5",
      date: "Mar 11, 2025",
      time: "3:00 PM",
      duration: "1 hour",
      status: "canceled",
      location: "Brooklyn Basketball Court",
      focus: "Conditioning",
    },
  ]

  const progressMetrics = [
    { label: "Shooting Accuracy", value: 78, change: "+12%" },
    { label: "Defensive Skills", value: 85, change: "+8%" },
    { label: "Ball Handling", value: 72, change: "+15%" },
    { label: "Physical Fitness", value: 90, change: "+5%" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Client Details</h1>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <Card className="glass-card border-2 border-primary/30 p-6 glow-primary">
          <div className="flex gap-4 mb-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={client.avatar || "/placeholder.svg"} />
              <AvatarFallback>{client.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-xl font-bold gradient-text mb-1">{client.name}</h2>
              <Badge className="bg-gradient-to-r from-primary to-accent mb-2">{client.sport}</Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{client.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">rating</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold">{client.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-semibold">{client.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Since</span>
              <span className="font-semibold">{client.joinedDate}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 glass-card bg-transparent"
              onClick={() => router.push("/mobile/chat")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              onClick={() => router.push(`/mobile/schedule/add?client=${client.id}`)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card border-primary/30 p-3 text-center">
            <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{client.completedSessions}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </Card>
          <Card className="glass-card border-primary/30 p-3 text-center">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{client.upcomingSessions}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </Card>
          <Card className="glass-card border-primary/30 p-3 text-center">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">${client.totalSpent}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="glass-card border-primary/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Goals</h3>
              </div>
              <p className="text-sm text-muted-foreground">{client.goals}</p>
            </Card>

            <Card className="glass-card border-primary/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Trainer Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground">{client.notes}</p>
            </Card>

            <Card className="glass-card border-primary/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Overall Progress</h3>
                <span className="text-sm font-semibold text-primary">{client.progress}%</span>
              </div>
              <div className="h-3 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${client.progress}%` }}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-3 mt-4">
            {sessions.map((session) => (
              <Card key={session.id} className="glass-card border-primary/30 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold">{session.date}</p>
                    <p className="text-sm text-muted-foreground">{session.time}</p>
                  </div>
                  {session.status === "upcoming" && (
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Upcoming</Badge>
                  )}
                  {session.status === "completed" && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>
                  )}
                  {session.status === "canceled" && (
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Canceled</Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{session.duration}</span>
                  </div>
                  <p className="text-muted-foreground">{session.location}</p>
                  <p className="font-semibold">Focus: {session.focus}</p>
                  {session.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs font-semibold">{session.rating}/5</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-3 mt-4">
            {progressMetrics.map((metric) => (
              <Card key={metric.label} className="glass-card border-primary/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{metric.label}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-500">{metric.change}</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{metric.value}%</span>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
