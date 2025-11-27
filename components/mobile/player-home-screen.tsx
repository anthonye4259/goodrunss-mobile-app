"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Calendar, ArrowRight, Sparkles, Activity, Globe, Trophy, Compass, Dumbbell } from "lucide-react"
import { useUserPreferences } from "@/lib/user-preferences"
import { ActivityHeatMap } from "./activity-heat-map"
import { GiaAutomationsShowcase } from "../gia-automations-showcase"
import { TrialBanner } from "../trial-banner"
import { RecentActivityFeed } from "./recent-activity-feed"
import { ProgressTracking } from "./progress-tracking"
import { AchievementBadges } from "./achievement-badges"
import { AchievementUnlockModal } from "./achievement-unlock-modal"
import { WearablesIntegrationCard } from "./wearables-integration-card"

export function PlayerHomeScreen() {
  const router = useRouter()
  const { preferences } = useUserPreferences()
  const [achievementModal, setAchievementModal] = useState<{
    id: string
    icon: string
    name: string
    description: string
    points: number
    reward?: string
  } | null>(null)

  const demoAchievement = {
    id: "7-day-streak",
    icon: "🔥",
    name: "7-Day Streak",
    description: "You've checked in for 7 consecutive days! Keep the momentum going!",
    points: 100,
    reward: "Free Training Session",
  }

  const venueLabel = preferences.isStudioUser && !preferences.isRecUser ? "Studios" : "Courts"
  const leagueLabel = preferences.isStudioUser && !preferences.isRecUser ? "GEE Groups" : "GEE Leagues"
  const leagueSubtitle =
    preferences.isStudioUser && !preferences.isRecUser ? "Global Elite Experiences" : "Global Elite Events"

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-8">
        <div className="flex items-center gap-3 glass-card p-3 rounded-2xl border border-primary/30 w-fit glow-primary">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md" />
            <div className="relative z-10 p-2 bg-gradient-to-br from-primary to-accent rounded-xl">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <span className="text-lg font-bold gradient-text tracking-wide">GOODRUNSS</span>
        </div>

        <TrialBanner />

        <WearablesIntegrationCard />

        <Card
          className="p-4 glass-card border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer glow-primary"
          onClick={() => router.push("/mobile/explore-sports")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl glow-primary">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Explore New Things </h3>
              <p className="text-sm text-muted-foreground">Try something different and expand your horizons</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {preferences.isRecUser && (
            <Card
              className="p-4 glass-card border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => router.push("/mobile/courts")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-semibold">Find Courts</p>
              </div>
            </Card>
          )}

          {preferences.isStudioUser && (
            <Card
              className="p-4 glass-card border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => router.push("/mobile/studios")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-purple-500/20 rounded-2xl backdrop-blur-sm">
                  <Dumbbell className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-xs font-semibold">Studios</p>
              </div>
            </Card>
          )}

          <Card
            className="p-4 glass-card border-2 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => router.push("/mobile/trainers")}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs font-semibold">Book Session</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                {leagueLabel}
              </h2>
              <p className="text-xs text-muted-foreground">{leagueSubtitle}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/leagues")}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {preferences.isRecUser && (
            <Card className="p-0 glass-card border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden group hover:scale-[1.01] cursor-pointer glow-primary">
              <div className="relative h-40 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/basketball-league.png')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-semibold text-white">GEE Featured</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-white">Open</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">NYC Summer Basketball League</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>12 teams</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Starts June 15</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full glow-primary" onClick={() => router.push("/mobile/leagues/1")}>
                  View League
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {preferences.isStudioUser && !preferences.isRecUser && (
            <Card className="p-0 glass-card border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group hover:scale-[1.01] cursor-pointer glow-primary">
              <div className="relative h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/yoga-class-group.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-white" />
                    <span className="text-xs font-semibold text-white">GEE Featured</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-white">Open</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">Morning Vinyasa Flow Group</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>15 members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Mon, Wed, Fri</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full glow-primary" onClick={() => router.push("/mobile/groups/1")}>
                  View Group
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Progress</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => router.push("/mobile/achievements")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <ProgressTracking />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Achievements</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => router.push("/mobile/achievements")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <AchievementBadges onAchievementClick={(achievement) => setAchievementModal(achievement)} />
        </div>

        <Card className="p-6 glass-card border-2 border-primary/50 glow-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-primary rounded-2xl glow-primary-strong">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-foreground">GIA Recommends</h3>
                <span className="text-xs px-2 py-1 bg-primary/20 rounded-full text-primary font-semibold">AI</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Perfect match found! Join the pickup game at Downtown Courts today at 6 PM. 8 players at your skill
                level confirmed.
              </p>
              <Button size="sm" className="mt-2 h-8 text-xs glow-primary">
                View Details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/profile")}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <RecentActivityFeed />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 glass-card border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="space-y-3">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm w-fit">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold gradient-text">12</p>
                <p className="text-sm text-muted-foreground mt-1">Games Played</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card border-2 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]">
            <div className="space-y-3">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm w-fit">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-4xl font-bold gradient-text">8.5</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming</h2>
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/trainers")}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {preferences.isRecUser && (
            <Card className="p-0 glass-card border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
              <div className="relative h-32 bg-gradient-to-br from-primary/30 to-accent/20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/outdoor-basketball-court.png')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-bold text-xl text-foreground">Basketball Training</h3>
                  <p className="text-sm text-muted-foreground">with Coach Mike</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tomorrow, 3:00 PM</span>
                </div>
                <Button size="sm" className="glow-primary">
                  Join
                </Button>
              </div>
            </Card>
          )}

          {preferences.isStudioUser && !preferences.isRecUser && (
            <Card className="p-0 glass-card border-2 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
              <div className="relative h-32 bg-gradient-to-br from-purple-500/30 to-pink-500/20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pilates-studio.jpg')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-bold text-xl text-foreground">Pilates Reformer Class</h3>
                  <p className="text-sm text-muted-foreground">with Instructor Sarah</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Tomorrow, 9:00 AM</span>
                </div>
                <Button size="sm" className="glow-primary bg-purple-500 hover:bg-purple-600">
                  Join
                </Button>
              </div>
            </Card>
          )}
        </div>

        {preferences.isRecUser && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Court Activity</h2>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/courts")}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <ActivityHeatMap />
          </div>
        )}

        {preferences.isStudioUser && !preferences.isRecUser && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nearby Studios</h2>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/studios")}>
                See Map
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="p-0 glass-card border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden group hover:scale-[1.01]">
              <div className="relative h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/modern-pilates-studio.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-white">8 Classes Today</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">GoodRunss Studio</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>0.5 miles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Pilates, Yoga, Lagree</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full glow-primary" onClick={() => router.push("/mobile/studios/1")}>
                  View Studio
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {preferences.isRecUser && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nearby {venueLabel}</h2>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => router.push("/mobile/courts")}>
                See Map
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card className="p-0 glass-card border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden group hover:scale-[1.01]">
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/outdoor-basketball-court.jpg')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-primary-foreground">12 Active</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">Downtown Sports Complex</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>0.8 miles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>12 players</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full glow-primary" onClick={() => router.push("/mobile/courts/1")}>
                  View Court
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>

            <Card className="p-0 glass-card border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden group hover:scale-[1.01]">
              <div className="relative h-40 bg-gradient-to-br from-accent/20 to-primary/10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/tennis-courts.png')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-primary-foreground">8 Active</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">Riverside Tennis Courts</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>1.2 miles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>8 players</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full glow-primary" onClick={() => router.push("/mobile/courts/2")}>
                  View Court
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        <GiaAutomationsShowcase userType="player" />

        <Button
          onClick={() => setAchievementModal(demoAchievement)}
          className="w-full bg-gradient-to-r from-primary to-accent glow-primary"
        >
          🏆 Test Achievement Modal
        </Button>
      </div>

      <AchievementUnlockModal
        achievement={achievementModal}
        isOpen={!!achievementModal}
        onClose={() => setAchievementModal(null)}
      />
    </div>
  )
}
