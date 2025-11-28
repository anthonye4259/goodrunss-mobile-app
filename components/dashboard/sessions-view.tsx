
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, MapPin, Sparkles, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const upcomingSessions = [
  {
    id: 1,
    client: "John Smith",
    date: "Today",
    time: "3:00 PM - 4:00 PM",
    sport: "Basketball",
    type: "Individual",
    location: "Downtown Court",
    status: "confirmed",
    notes: "Focus on shooting form and footwork",
  },
  {
    id: 2,
    client: "Sarah Johnson",
    date: "Today",
    time: "5:00 PM - 6:30 PM",
    sport: "Tennis",
    type: "Group",
    location: "Riverside Courts",
    status: "confirmed",
    notes: "Group lesson - 4 participants, beginner level",
  },
  {
    id: 3,
    client: "Mike Davis",
    date: "Tomorrow",
    time: "10:00 AM - 11:00 AM",
    sport: "Basketball",
    type: "Individual",
    location: "Downtown Court",
    status: "pending",
    notes: "First session - assessment needed",
  },
  {
    id: 4,
    client: "Emily Chen",
    date: "Tomorrow",
    time: "2:00 PM - 3:00 PM",
    sport: "Volleyball",
    type: "Individual",
    location: "Beach Courts",
    status: "confirmed",
    notes: "Advanced serving techniques",
  },
]

export function SessionsView() {
  const [selectedSession, setSelectedSession] = useState<(typeof upcomingSessions)[0] | null>(null)
  const [aiNotes, setAiNotes] = useState<string>("")

  const generateAiNotes = (session: (typeof upcomingSessions)[0]) => {
    setAiNotes("Analyzing session data...")
    setTimeout(() => {
      setAiNotes(`AI Insights for ${session.client}:

• Performance Trend: ${session.client} has shown 15% improvement in the last 3 sessions
• Recommended Focus: Continue working on ${session.notes.toLowerCase()}
• Optimal Duration: Based on past sessions, ${session.client} performs best in 60-minute sessions
• Engagement Level: High - consistently arrives 5 minutes early
• Next Steps: Consider introducing advanced drills in the next 2 sessions`)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Training Sessions</h2>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past sessions</p>
        </div>
        <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule New Session
        </Button>
      </div>

      {/* Sessions Table */}
      <Card className="glass-card border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{session.client}</p>
                      <Badge variant={session.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
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
                          setSelectedSession(session)
                          generateAiNotes(session)
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                        AI Notes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="gradient-text">AI-Generated Session Insights</DialogTitle>
                        <DialogDescription>
                          Personalized insights powered by GIA for {selectedSession?.client}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-xl">
                            <h4 className="font-semibold mb-2">Session Details</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Sport: {selectedSession?.sport}</p>
                              <p>Type: {selectedSession?.type}</p>
                              <p>Location: {selectedSession?.location}</p>
                              <p>Notes: {selectedSession?.notes}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                            <div className="flex items-start gap-3 mb-3">
                              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                              <h4 className="font-semibold">GIA Analysis</h4>
                            </div>
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                              {aiNotes || "Click 'AI Notes' to generate insights..."}
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
