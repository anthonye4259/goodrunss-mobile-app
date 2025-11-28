
import { Card } from "@/components/ui/card"
import { Trophy, Calendar, Users, TrendingUp } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"

export function RecentActivityFeed() {
  const { preferences } = useUserPreferences()

  const recActivities = [
    {
      type: "achievement",
      icon: Trophy,
      title: "Achievement Unlocked!",
      description: "Completed 10 training sessions",
      time: "2 hours ago",
      color: "from-primary to-accent",
    },
    {
      type: "session",
      icon: Calendar,
      title: "Session Completed",
      description: "Basketball training with Coach Mike",
      time: "Yesterday",
      color: "from-accent to-primary",
    },
    {
      type: "social",
      icon: Users,
      title: "New Friend",
      description: "Sarah joined your training group",
      time: "2 days ago",
      color: "from-primary/80 to-accent/80",
    },
    {
      type: "milestone",
      icon: TrendingUp,
      title: "Skill Improved",
      description: "Your shooting accuracy increased by 15%",
      time: "3 days ago",
      color: "from-accent/80 to-primary/60",
    },
  ]

  const studioActivities = [
    {
      type: "achievement",
      icon: Trophy,
      title: "Achievement Unlocked!",
      description: "Completed 10 Pilates sessions",
      time: "2 hours ago",
      color: "from-purple-500 to-pink-500",
    },
    {
      type: "session",
      icon: Calendar,
      title: "Class Completed",
      description: "Vinyasa Flow with Instructor Sarah",
      time: "Yesterday",
      color: "from-pink-500 to-purple-500",
    },
    {
      type: "social",
      icon: Users,
      title: "New Friend",
      description: "Emma joined your yoga group",
      time: "2 days ago",
      color: "from-purple-500/80 to-pink-500/80",
    },
    {
      type: "milestone",
      icon: TrendingUp,
      title: "Progress Made",
      description: "Your flexibility improved by 15%",
      time: "3 days ago",
      color: "from-pink-500/80 to-purple-500/60",
    },
  ]

  const activities = preferences.isStudioUser && !preferences.isRecUser ? studioActivities : recActivities

  return (
    <div className="space-y-3">
      {activities.map((activity, i) => {
        const Icon = activity.icon
        return (
          <Card
            key={i}
            className="p-4 glass-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 bg-gradient-to-br ${activity.color} rounded-xl glow-primary`}>
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{activity.time}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
