"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Settings,
  Trophy,
  Calendar,
  TrendingUp,
  MapPin,
  LogOut,
  Watch,
  ArrowRight,
  Mic,
  Gift,
  Plus,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { StreakWidget } from "./streak-widget"
import { RewardsModal } from "./rewards-modal"
import { ShareProfileLinkCard } from "./share-profile-link-card"
import { useState } from "react"
import { useUserPreferences } from "@/lib/user-preferences"

export function ProfileScreen() {
  const router = useRouter()
  const [showRewards, setShowRewards] = useState(false)
  const [isTrainer] = useState(true)
  const { preferences } = useUserPreferences()
  const isStudioOnly = preferences.isStudioOnly
  const isRecOnly = preferences.isRecOnly

  const [userSports, setUserSports] = useState(
    isStudioOnly ? ["Pilates", "Yoga", "Barre"] : ["Basketball", "Tennis", "Volleyball", "Soccer"],
  )
  const [showSportsModal, setShowSportsModal] = useState(false)

  const allSports = isStudioOnly
    ? ["Pilates", "Yoga", "Barre", "Lagree", "Meditation", "Cycling", "HIIT", "Dance"]
    : ["Basketball", "Tennis", "Soccer", "Volleyball", "Baseball", "Football", "Swimming", "Running", "Cycling", "Golf"]

  const removeSport = (sport: string) => {
    setUserSports(userSports.filter((s) => s !== sport))
  }

  const addSport = (sport: string) => {
    if (!userSports.includes(sport)) {
      setUserSports([...userSports, sport])
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button size="icon" variant="ghost" onClick={() => router.push("/mobile/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/diverse-group-athletes.png" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Alex Johnson</h2>
              <p className="text-muted-foreground">@alexj_hoops</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Share Profile Link Card for Trainers */}
        {isTrainer && <ShareProfileLinkCard />}

        {/* Streak Widget */}
        <StreakWidget />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card border-border text-center">
            <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Games</p>
          </Card>

          <Card className="p-4 bg-card border-border text-center">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </Card>

          <Card className="p-4 bg-card border-border text-center">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">8.5</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </Card>
        </div>

        {/* Achievements and Rewards Section */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/mobile/achievements">
            <Card className="glass-card border-2 border-primary/30 p-4 hover:border-primary/50 transition-all cursor-pointer group">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-full glow-primary group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">Achievements</p>
                  <p className="text-xs text-muted-foreground">View all badges</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card
            className="glass-card border-2 border-primary/30 p-4 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => setShowRewards(true)}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-3 bg-gradient-to-br from-accent to-primary rounded-full glow-cyan group-hover:scale-110 transition-transform">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">Rewards</p>
                <p className="text-xs text-muted-foreground">2,450 points</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Voice Assistant Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <Link href="/mobile/voice">
            <Card className="p-5 glass-card border-2 border-primary/30 hover:border-primary/50 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl glow-primary group-hover:glow-primary-strong transition-all">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Voice Activation</p>
                    <p className="text-xs text-muted-foreground">Talk to GIA hands-free</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Wearables Integration Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Connected Devices</h3>
          <Card className="p-5 glass-card border-2 border-primary/30 hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Watch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Wearables</p>
                  <p className="text-xs text-muted-foreground">Connect Apple Watch, Whoop & more</p>
                </div>
              </div>
              <Link href="/mobile/wearables">
                <Button size="sm" variant="ghost" className="text-primary">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Favorite Sports */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{isStudioOnly ? "My Activities" : "My Sports"}</h3>
            <Button size="sm" variant="ghost" className="text-primary" onClick={() => setShowSportsModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {isStudioOnly ? "Add Activity" : "Add Sport"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {userSports.map((sport) => (
              <div
                key={sport}
                className="group relative px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <span>{sport}</span>
                <button
                  onClick={() => removeSport(sport)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {userSports.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {isStudioOnly
                  ? "No activities selected. Add some to personalize your feed!"
                  : "No sports selected. Add some to personalize your feed!"}
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Card className="p-4 bg-card border-border">
            <div className="space-y-3">
              {isStudioOnly ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Vinyasa Flow Class</p>
                      <p className="text-sm text-muted-foreground">Serenity Wellness Studio</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pilates Reformer</p>
                      <p className="text-sm text-muted-foreground">with 8 students</p>
                    </div>
                    <span className="text-sm text-muted-foreground">5 days ago</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Basketball Game</p>
                      <p className="text-sm text-muted-foreground">Downtown Sports Complex</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tennis Training</p>
                      <p className="text-sm text-muted-foreground">with Coach Sarah</p>
                    </div>
                    <span className="text-sm text-muted-foreground">5 days ago</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
            onClick={() => router.push("/mobile/settings")}
          >
            <Settings className="h-4 w-4" />
            Account Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
            onClick={() => router.push("/auth")}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Sports Selection Modal */}
      {showSportsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="glass-card border-primary/30 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{isStudioOnly ? "Add Activities" : "Add Sports"}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSportsModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {isStudioOnly
                ? "Select activities you teach to customize your profile and attract the right students"
                : "Select sports you're interested in to customize your feed and discover relevant content"}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {allSports.map((sport) => {
                const isSelected = userSports.includes(sport)
                return (
                  <button
                    key={sport}
                    onClick={() => (isSelected ? removeSport(sport) : addSport(sport))}
                    className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    {sport}
                  </button>
                )
              })}
            </div>

            <Button
              className="w-full mt-6 bg-gradient-to-r from-primary to-accent"
              onClick={() => setShowSportsModal(false)}
            >
              Done
            </Button>
          </Card>
        </div>
      )}

      {/* Rewards Modal */}
      <RewardsModal isOpen={showRewards} onClose={() => setShowRewards(false)} />
    </div>
  )
}
