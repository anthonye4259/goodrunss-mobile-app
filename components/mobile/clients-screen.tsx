
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Search,
  Calendar,
  DollarSign,
  Star,
  MessageCircle,
  MoreVertical,
  Users,
  Clock,
  Activity,
} from "lucide-react"

export function ClientsScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const clients = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=100&width=100",
      sport: "Basketball",
      totalSessions: 24,
      upcomingSessions: 2,
      lastSession: "2 days ago",
      nextSession: "Tomorrow, 3:00 PM",
      totalSpent: 1440,
      joinedDate: "Jan 2025",
      progress: 85,
      goals: "Improve shooting accuracy",
      status: "active",
      rating: 5,
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=100&width=100",
      sport: "Tennis",
      totalSessions: 18,
      upcomingSessions: 1,
      lastSession: "5 days ago",
      nextSession: "Friday, 10:00 AM",
      totalSpent: 1080,
      joinedDate: "Dec 2024",
      progress: 72,
      goals: "Master serve technique",
      status: "active",
      rating: 5,
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?height=100&width=100",
      sport: "Soccer",
      totalSessions: 32,
      upcomingSessions: 3,
      lastSession: "Yesterday",
      nextSession: "Today, 5:00 PM",
      totalSpent: 1920,
      joinedDate: "Nov 2024",
      progress: 91,
      goals: "Increase speed and agility",
      status: "active",
      rating: 5,
    },
    {
      id: "4",
      name: "James Wilson",
      avatar: "/placeholder.svg?height=100&width=100",
      sport: "Basketball",
      totalSessions: 12,
      upcomingSessions: 0,
      lastSession: "3 weeks ago",
      nextSession: null,
      totalSpent: 720,
      joinedDate: "Feb 2025",
      progress: 45,
      goals: "Build endurance",
      status: "inactive",
      rating: 4,
    },
    {
      id: "5",
      name: "Lisa Anderson",
      avatar: "/placeholder.svg?height=100&width=100",
      sport: "Volleyball",
      totalSessions: 8,
      upcomingSessions: 1,
      lastSession: "1 week ago",
      nextSession: "Next Monday, 4:00 PM",
      totalSpent: 480,
      joinedDate: "Mar 2025",
      progress: 38,
      goals: "Improve blocking skills",
      status: "active",
      rating: 5,
    },
  ]

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && client.status === "active") ||
      (activeTab === "inactive" && client.status === "inactive")
    return matchesSearch && matchesTab
  })

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "active").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSessions: Math.round(clients.reduce((sum, c) => sum + c.totalSessions, 0) / clients.length),
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-lg">My Clients</h1>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-border/50"
            />
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Clients</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{stats.totalClients}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeClients} active</p>
          </Card>

          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold gradient-text">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="all">All ({clients.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.activeClients})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({clients.length - stats.activeClients})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {filteredClients.length === 0 ? (
              <Card className="glass-card border-primary/30 p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No clients found</p>
              </Card>
            ) : (
              filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="glass-card border-primary/30 p-4 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => router.push(`/mobile/clients/${client.id}`)}
                >
                  <div className="flex gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={client.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{client.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-bold">{client.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {client.sport}
                            </Badge>
                            {client.status === "active" ? (
                              <Badge className="text-xs bg-green-500/20 text-green-500 border-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-sm font-semibold">{client.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            <span>{client.totalSessions} sessions</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>${client.totalSpent}</span>
                          </div>
                        </div>

                        {client.nextSession ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">Next: {client.nextSession}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Last: {client.lastSession}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-border/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent"
                              style={{ width: `${client.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{client.progress}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 glass-card bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/mobile/chat`)
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-primary to-accent"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/mobile/schedule/add?client=${client.id}`)
                          }}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
