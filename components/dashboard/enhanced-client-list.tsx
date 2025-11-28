
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const clients = [
  {
    name: "John Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JS",
    sessions: 24,
    nextSession: "Today, 3:00 PM",
    revenue: 1200,
    progress: 85,
    trend: "+12%",
  },
  {
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SJ",
    sessions: 18,
    nextSession: "Tomorrow, 10:00 AM",
    revenue: 900,
    progress: 72,
    trend: "+8%",
  },
  {
    name: "Mike Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MD",
    sessions: 32,
    nextSession: "Today, 5:00 PM",
    revenue: 1600,
    progress: 92,
    trend: "+15%",
  },
  {
    name: "Emily Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "EC",
    sessions: 15,
    nextSession: "Wed, 2:00 PM",
    revenue: 750,
    progress: 68,
    trend: "+5%",
  },
]

export function EnhancedClientList() {
  return (
    <Card className="p-6 glass-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Active Clients</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage your client relationships</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {clients.map((client, i) => (
          <div
            key={i}
            className="p-5 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/30">
                  <AvatarImage src={client.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                    {client.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.sessions} sessions completed</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold gradient-text">${client.revenue}</p>
                <div className="flex items-center gap-1 text-sm text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span>{client.trend}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to goal</span>
                  <span>{client.progress}%</span>
                </div>
                <Progress value={client.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Next: {client.nextSession}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
