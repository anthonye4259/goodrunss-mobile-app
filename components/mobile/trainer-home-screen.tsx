"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShareProfileLinkCard } from "./share-profile-link-card"
import { Calendar, DollarSign, Users, TrendingUp, Clock, Star } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"
import { getActivityContent, getPrimaryActivity, type Activity } from "@/lib/activity-content"

export function TrainerHomeScreen() {
  const router = useRouter()
  const { preferences } = useUserPreferences()

  const primaryActivity = getPrimaryActivity(preferences.activities) || "Basketball"
  const activityContent = getActivityContent(primaryActivity as Activity)
  const isStudioTrainer = activityContent.category === "studio"
  const trainerName = activityContent.sampleTrainers[0]?.name || "Coach Mike"
  const sessions = activityContent.sampleSessions.slice(0, 2)

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome, {trainerName.split(" ")[0]} {trainerName.split(" ")[1]}
          </h1>
          <p className="text-muted-foreground">Your {isStudioTrainer ? "wellness" : "training"} dashboard</p>
        </div>

        <ShareProfileLinkCard />

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 glass-card border-2 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">$2.4K</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card border-2 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-xl backdrop-blur-sm">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Active Clients</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today's Schedule</h2>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-primary/10"
              onClick={() => router.push("/mobile/trainer-dashboard")}
            >
              View All
            </Button>
          </div>

          {sessions.map((session, index) => (
            <Card key={index} className="p-5 glass-card border-2 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{session.time}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.participants ? `${session.participants} participants` : `at ${session.location}`}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="glass-card border-2 bg-transparent">
                  Start
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">This Week</h2>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 glass-card border-2 text-center hover:border-primary/50 transition-all duration-300">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">18</p>
              <p className="text-xs text-muted-foreground">{activityContent.sessionType}s</p>
            </Card>

            <Card className="p-4 glass-card border-2 text-center hover:border-primary/50 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">32h</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </Card>

            <Card className="p-4 glass-card border-2 text-center hover:border-primary/50 transition-all duration-300">
              <Star className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">4.9</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            className="h-auto py-5 flex-col gap-2 glow-primary"
            onClick={() => router.push("/mobile/trainer-dashboard")}
          >
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Add {activityContent.sessionType}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-5 flex-col gap-2 glass-card border-2 hover:border-primary/50 bg-transparent"
            onClick={() => router.push("/mobile/trainer-dashboard")}
          >
            <Users className="h-5 w-5" />
            <span className="font-semibold">View {isStudioTrainer ? "Students" : "Clients"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
