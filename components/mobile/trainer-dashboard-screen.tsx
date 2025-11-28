
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ShareProfileLinkCard } from "./share-profile-link-card"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  MessageCircle,
} from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"

export function TrainerDashboardScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "clients" | "earnings">("overview")
  const { preferences } = useUserPreferences()
  const isStudioTrainer = preferences.isStudioOnly

  const stats = {
    todayEarnings: 240,
    weekEarnings: 1280,
    monthEarnings: 5420,
    totalClients: 24,
    activeClients: 18,
    sessionsToday: 3,
    sessionsWeek: 12,
    rating: 4.8,
    reviews: 45,
  }

  const upcomingSessions = isStudioTrainer
    ? [
        {
          id: 1,
          client: "Emma Wilson",
          avatar: "/placeholder.svg?height=100&width=100",
          time: "2:00 PM",
          duration: "1 hour",
          sport: "Vinyasa Flow",
          location: "Serenity Wellness Studio",
          status: "confirmed",
        },
        {
          id: 2,
          client: "Sarah Johnson",
          avatar: "/placeholder.svg?height=100&width=100",
          time: "4:00 PM",
          duration: "1.5 hours",
          sport: "Pilates Reformer",
          location: "Core Balance Studio",
          status: "confirmed",
        },
        {
          id: 3,
          client: "Lisa Martinez",
          avatar: "/placeholder.svg?height=100&width=100",
          time: "6:00 PM",
          duration: "1 hour",
          sport: "Barre Class",
          location: "Serenity Wellness Studio",
          status: "pending",
        },
      ]
    : [
        {
          id: 1,
          client: "Sarah Johnson",
          avatar: "/placeholder.svg?height=100&width=100",
          time: "2:00 PM",
          duration: "1 hour",
          sport: "Basketball",
          location: "Rucker Park",
          status: "confirmed",
        },
        {
          id: 2,
          client: "Mike Chen",
          avatar: "/placeholder.svg?height=100&width=100",
          time: "4:00 PM",
          duration: "1.5 hours",
          sport: "Tennis",
          location: "Central Park Courts",
          status: "confirmed",
        },
        {
          id: 3,
          client: "Emma Davis",
          avatar: "/placeholder.svg?height=100&width=100",
          time: "6:00 PM",
          duration: "2 hours",
          sport: "Basketball",
          location: "Brooklyn Bridge Park",
          status: "pending",
        },
      ]

  const recentClients = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      sessions: 12,
      lastSession: "2 days ago",
      progress: 85,
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=100&width=100",
      sessions: 8,
      lastSession: "1 week ago",
      progress: 72,
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=100&width=100",
      sessions: 15,
      lastSession: "Yesterday",
      progress: 90,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {isStudioTrainer ? "Manage your wellness business" : "Manage your training business"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push("/mobile/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <ShareProfileLinkCard />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold gradient-text">${stats.todayEarnings}</p>
          </Card>

          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">{isStudioTrainer ? "Classes" : "Sessions"}</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{stats.sessionsToday}</p>
          </Card>

          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{isStudioTrainer ? "Students" : "Clients"}</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{stats.activeClients}</p>
          </Card>

          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Star className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">Rating</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{stats.rating}</p>
          </Card>
        </div>

        {/* Earnings Overview */}
        <Card className="glass-card border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Earnings
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => router.push("/mobile/trainer-dashboard/earnings")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span className="font-bold text-lg">${stats.weekEarnings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-bold text-lg">${stats.monthEarnings}</span>
            </div>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="glass-card border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Schedule
            </h3>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/schedule")}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="glass-card border-border/50 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={session.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{session.client[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="font-semibold text-sm">{session.client}</h4>
                        <p className="text-xs text-muted-foreground">{session.sport}</p>
                      </div>
                      <Badge
                        variant={session.status === "confirmed" ? "default" : "secondary"}
                        className={
                          session.status === "confirmed" ? "bg-gradient-to-r from-primary to-accent" : "bg-muted"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </span>
                      <span>•</span>
                      <span>{session.duration}</span>
                    </div>
                    {session.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 glass-card bg-transparent">
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Recent Clients */}
        <Card className="glass-card border-primary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {isStudioTrainer ? "Recent Students" : "Recent Clients"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => router.push("/mobile/trainer-dashboard/clients")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentClients.map((client) => (
              <Card
                key={client.id}
                className="glass-card border-border/50 p-4 cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => router.push(`/mobile/trainer-dashboard/clients/${client.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={client.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{client.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{client.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {client.sessions} {isStudioTrainer ? "classes" : "sessions"} • Last: {client.lastSession}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{client.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="glass-card h-auto py-4 flex-col gap-2 bg-transparent"
            onClick={() => router.push("/mobile/schedule/add")}
          >
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">{isStudioTrainer ? "Add Class" : "Add Session"}</span>
          </Button>
          <Button
            variant="outline"
            className="glass-card h-auto py-4 flex-col gap-2 bg-transparent"
            onClick={() => router.push("/mobile/trainer-dashboard/analytics")}
          >
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
