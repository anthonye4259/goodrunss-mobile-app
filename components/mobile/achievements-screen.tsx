"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, Flame, Target, Star, Award, Zap, MapPin, Lock } from "lucide-react"

export function AchievementsScreen() {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")

  const userStats = {
    currentStreak: 7,
    longestStreak: 12,
    totalPoints: 2450,
    level: 8,
    nextLevelPoints: 3000,
  }

  const achievements = [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first check-in",
      icon: MapPin,
      points: 50,
      unlocked: true,
      unlockedDate: "2 weeks ago",
      progress: 100,
      category: "beginner",
    },
    {
      id: "2",
      title: "Week Warrior",
      description: "Maintain a 7-day check-in streak",
      icon: Flame,
      points: 200,
      unlocked: true,
      unlockedDate: "Today",
      progress: 100,
      category: "streak",
    },
    {
      id: "4",
      title: "Court Explorer",
      description: "Check in at 5 different courts",
      icon: MapPin,
      points: 300,
      unlocked: false,
      progress: 60,
      current: 3,
      total: 5,
      category: "exploration",
    },
    {
      id: "5",
      title: "Training Dedication",
      description: "Complete 10 trainer sessions",
      icon: Target,
      points: 500,
      unlocked: false,
      progress: 40,
      current: 4,
      total: 10,
      category: "training",
    },
    {
      id: "6",
      title: "Month Master",
      description: "Maintain a 30-day check-in streak",
      icon: Flame,
      points: 1000,
      unlocked: false,
      progress: 23,
      current: 7,
      total: 30,
      category: "streak",
    },
    {
      id: "8",
      title: "Elite Athlete",
      description: "Reach level 20",
      icon: Award,
      points: 2000,
      unlocked: false,
      progress: 40,
      current: 8,
      total: 20,
      category: "milestone",
    },
  ]

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return true
  })

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">Achievements</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
        <Card className="glass-card border-2 border-primary/30 p-6 glow-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold gradient-text">Level {userStats.level}</h2>
              <p className="text-sm text-muted-foreground">{userStats.totalPoints} total points</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-full glow-primary">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {userStats.level + 1}</span>
              <span className="font-semibold">
                {userStats.totalPoints}/{userStats.nextLevelPoints}
              </span>
            </div>
            <Progress value={(userStats.totalPoints / userStats.nextLevelPoints) * 100} className="h-3" />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-primary/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {unlockedCount}/{achievements.length}
                </p>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "unlocked", "locked"].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f as typeof filter)}
              className={filter === f ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`glass-card p-5 ${
                achievement.unlocked ? "border-primary/30 hover:border-primary/50" : "border-border/30 opacity-75"
              } transition-all`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-4 rounded-xl ${
                    achievement.unlocked ? "bg-gradient-to-br from-primary to-accent glow-primary" : "bg-muted"
                  }`}
                >
                  {achievement.unlocked ? (
                    <achievement.icon className="h-6 w-6 text-white" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge
                      className={
                        achievement.unlocked
                          ? "bg-gradient-to-r from-primary to-accent"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {achievement.points}
                    </Badge>
                  </div>

                  {achievement.unlocked ? (
                    <p className="text-xs text-primary font-semibold">Unlocked {achievement.unlockedDate}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {achievement.current}/{achievement.total}
                        </span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-primary/30 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-primary/20 rounded-full">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Keep Going!</h3>
            <p className="text-sm text-muted-foreground">
              Check in daily to maintain your streak and unlock more achievements
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
