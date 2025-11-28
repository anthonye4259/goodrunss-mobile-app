
import { Card } from "@/components/ui/card"
import { Trophy, Flame, Target, Zap, Award, Star } from "lucide-react"
import { PremiumBadge } from "../premium-badge"

const achievements = [
  {
    id: "10-sessions",
    icon: Trophy,
    label: "10 Sessions",
    unlocked: true,
    color: "from-primary to-accent",
    name: "Session Master",
    description: "Completed 10 training sessions",
    points: 50,
  },
  {
    id: "5-day-streak",
    icon: Flame,
    label: "5 Day Streak",
    unlocked: true,
    color: "from-accent to-primary",
    name: "Consistency King",
    description: "Checked in for 5 consecutive days",
    points: 75,
  },
  {
    id: "perfect-game",
    icon: Target,
    label: "Perfect Game",
    unlocked: true,
    color: "from-primary/80 to-accent/80",
    name: "Perfect Performance",
    description: "Achieved a perfect game score",
    points: 100,
    reward: "Free Training Session",
  },
  {
    id: "quick-learner",
    icon: Zap,
    label: "Quick Learner",
    unlocked: false,
    color: "from-muted to-muted",
    premium: true,
    name: "Quick Learner",
    description: "Improve your skill rating by 2 points in one week",
    points: 150,
  },
  {
    id: "mvp",
    icon: Award,
    label: "MVP",
    unlocked: false,
    color: "from-muted to-muted",
    premium: true,
    name: "MVP Status",
    description: "Be voted MVP in 5 games",
    points: 200,
  },
  {
    id: "all-star",
    icon: Star,
    label: "All-Star",
    unlocked: false,
    color: "from-muted to-muted",
    premium: true,
    name: "All-Star Player",
    description: "Reach the top 10% of players in your region",
    points: 500,
  },
]

interface AchievementBadgesProps {
  onAchievementClick?: (achievement: {
    id: string
    icon: string
    name: string
    description: string
    points: number
    reward?: string
  }) => void
}

export function AchievementBadges({ onAchievementClick }: AchievementBadgesProps) {
  const handleClick = (achievement: (typeof achievements)[0]) => {
    if (achievement.unlocked && onAchievementClick) {
      // Convert Lucide icon to emoji for the modal
      const iconMap: Record<string, string> = {
        "10-sessions": "🏆",
        "5-day-streak": "🔥",
        "perfect-game": "🎯",
      }

      onAchievementClick({
        id: achievement.id,
        icon: iconMap[achievement.id] || "🏆",
        name: achievement.name,
        description: achievement.description,
        points: achievement.points,
        reward: achievement.reward,
      })
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {achievements.map((achievement, i) => {
        const Icon = achievement.icon
        return (
          <Card
            key={i}
            onClick={() => handleClick(achievement)}
            className={`p-4 glass-card border transition-all duration-300 relative ${
              achievement.unlocked
                ? "border-primary/50 hover:border-primary hover:scale-105 glow-primary cursor-pointer"
                : "border-border/30 opacity-50"
            }`}
          >
            {achievement.premium && (
              <div className="absolute -top-2 -right-2">
                <PremiumBadge size="sm" />
              </div>
            )}
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className={`p-3 bg-gradient-to-br ${achievement.color} rounded-xl ${achievement.unlocked ? "glow-primary" : ""}`}
              >
                <Icon
                  className={`h-6 w-6 ${achievement.unlocked ? "text-primary-foreground" : "text-muted-foreground"}`}
                />
              </div>
              <p className="text-xs font-semibold leading-tight">{achievement.label}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
