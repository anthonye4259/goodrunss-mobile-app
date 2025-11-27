"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, TrendingUp, Calendar, Sparkles, Mail, Phone, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

const clients = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    sport: "Basketball",
    level: "Intermediate",
    sessionsCompleted: 24,
    totalSessions: 30,
    joinDate: "Jan 2025",
    lastSession: "2 days ago",
    progress: 80,
    status: "active",
    goals: "Improve shooting accuracy and defensive positioning",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    sport: "Tennis",
    level: "Beginner",
    sessionsCompleted: 8,
    totalSessions: 12,
    joinDate: "Feb 2025",
    lastSession: "1 day ago",
    progress: 67,
    status: "active",
    goals: "Master basic serves and improve footwork",
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "(555) 345-6789",
    sport: "Basketball",
    level: "Advanced",
    sessionsCompleted: 45,
    totalSessions: 50,
    joinDate: "Nov 2024",
    lastSession: "5 days ago",
    progress: 90,
    status: "active",
    goals: "Prepare for competitive league play",
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily.chen@email.com",
    phone: "(555) 456-7890",
    sport: "Volleyball",
    level: "Intermediate",
    sessionsCompleted: 15,
    totalSessions: 20,
    joinDate: "Dec 2024",
    lastSession: "1 week ago",
    progress: 75,
    status: "inactive",
    goals: "Advanced serving techniques and team coordination",
  },
]

export function ClientsView() {
  const [selectedClient, setSelectedClient] = useState<(typeof clients)[0] | null>(null)
  const [aiInsights, setAiInsights] = useState<string>("")

  const generateAiInsights = (client: (typeof clients)[0]) => {
    setAiInsights("Analyzing client data...")
    setTimeout(() => {
      setAiInsights(`AI Insights for ${client.name}:

• Overall Progress: ${client.progress}% completion rate - ${client.progress >= 80 ? "Excellent" : client.progress >= 60 ? "Good" : "Needs attention"}
• Attendance Pattern: ${client.status === "active" ? "Consistent attendance, last session " + client.lastSession : "Inactive - consider follow-up"}
• Skill Development: ${client.level} level showing steady improvement in ${client.sport.toLowerCase()}
• Engagement Score: ${client.progress >= 80 ? "High" : client.progress >= 60 ? "Medium" : "Low"} - ${client.status === "active" ? "actively engaged" : "may need re-engagement"}
• Recommended Actions: 
  ${client.status === "inactive" ? "• Send re-engagement message\n  " : ""}• Schedule ${client.totalSessions - client.sessionsCompleted} remaining sessions
  • Focus on: ${client.goals}
• Revenue Impact: $${(client.sessionsCompleted * 75).toLocaleString()} generated, $${((client.totalSessions - client.sessionsCompleted) * 75).toLocaleString()} potential`)
    }, 1500)
  }

  const activeClients = clients.filter((c) => c.status === "active").length
  const totalRevenue = clients.reduce((sum, c) => sum + c.sessionsCompleted * 75, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Client Management</h2>
          <p className="text-muted-foreground mt-1">Track and manage your training clients</p>
        </div>
        <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
          <User className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 glass-card border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-3xl font-bold mt-2 gradient-text">{clients.length}</p>
              <p className="text-sm text-primary mt-1">{activeClients} active</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold mt-2 gradient-text">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-primary mt-1">
                From {clients.reduce((sum, c) => sum + c.sessionsCompleted, 0)} sessions
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <p className="text-3xl font-bold mt-2 gradient-text">
                {Math.round(clients.reduce((sum, c) => sum + c.progress, 0) / clients.length)}%
              </p>
              <p className="text-sm text-primary mt-1">Across all clients</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Clients List */}
      <Card className="glass-card border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Clients</h3>
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/generic-placeholder-icon.png?height=48&width=48`} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{client.name}</p>
                      <Badge variant={client.status === "active" ? "default" : "secondary"} className="text-xs">
                        {client.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {client.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={client.progress} className="h-2 flex-1 max-w-xs" />
                      <span className="text-xs text-muted-foreground">
                        {client.sessionsCompleted}/{client.totalSessions} sessions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => {
                          setSelectedClient(client)
                          generateAiInsights(client)
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                        AI Insights
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="gradient-text">AI-Generated Client Insights</DialogTitle>
                        <DialogDescription>
                          Personalized insights powered by GIA for {selectedClient?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-xl">
                            <h4 className="font-semibold mb-2">Client Profile</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Sport: {selectedClient?.sport}</p>
                              <p>Level: {selectedClient?.level}</p>
                              <p>Member Since: {selectedClient?.joinDate}</p>
                              <p>Last Session: {selectedClient?.lastSession}</p>
                              <p>Goals: {selectedClient?.goals}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                            <div className="flex items-start gap-3 mb-3">
                              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                              <h4 className="font-semibold">GIA Analysis</h4>
                            </div>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                              {aiInsights || "Click 'AI Insights' to generate analysis..."}
                            </pre>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="ghost">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
