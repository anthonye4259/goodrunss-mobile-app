"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Watch, Activity, Heart, TrendingUp, Zap, Moon, Battery, CheckCircle2, XCircle } from "lucide-react"

export function WearablesScreen() {
  const [appleWatchConnected, setAppleWatchConnected] = useState(true)
  const [whoopConnected, setWhoopConnected] = useState(true)

  const appleWatchData = {
    weeklyWorkouts: 5,
    caloriesBurned: 2450,
    avgHeartRate: 145,
    lastSync: "2 minutes ago",
  }

  const whoopData = {
    recoveryScore: 67,
    dailyStrain: 12.5,
    sleep: 7.5,
    hrv: 65,
    lastSync: "5 minutes ago",
  }

  const getRecoveryColor = (score: number) => {
    if (score >= 67) return "text-green-500"
    if (score >= 34) return "text-yellow-500"
    return "text-red-500"
  }

  const getRecoveryStatus = (score: number) => {
    if (score >= 67) return "GREEN"
    if (score >= 34) return "YELLOW"
    return "RED"
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Wearables</h1>
          <p className="text-muted-foreground">Connect your devices to track performance and get AI-powered insights</p>
        </div>

        {/* Apple Watch Section */}
        <Card className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Watch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Apple Watch</h2>
                <div className="flex items-center gap-2 mt-1">
                  {appleWatchConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!appleWatchConnected && (
              <Button onClick={() => setAppleWatchConnected(true)} className="bg-primary">
                Connect
              </Button>
            )}
          </div>

          {appleWatchConnected && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Weekly Workouts</span>
                  </div>
                  <p className="text-3xl font-bold gradient-text">{appleWatchData.weeklyWorkouts}</p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Calories Burned</span>
                  </div>
                  <p className="text-3xl font-bold gradient-text">{appleWatchData.caloriesBurned.toLocaleString()}</p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Avg Heart Rate</span>
                  </div>
                  <p className="text-3xl font-bold gradient-text">
                    {appleWatchData.avgHeartRate} <span className="text-lg">bpm</span>
                  </p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Battery className="h-4 w-4" />
                    <span className="text-sm">Last Sync</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{appleWatchData.lastSync}</p>
                </div>
              </div>

              {/* Weekly Trend Chart */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Weekly Activity</h3>
                <div className="flex items-end justify-between gap-2 h-32">
                  {[65, 80, 45, 90, 70, 85, 95].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Whoop Section */}
        <Card className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center border border-white/20">
                <span className="text-white font-bold text-sm">WHOOP</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Whoop</h2>
                <div className="flex items-center gap-2 mt-1">
                  {whoopConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!whoopConnected && (
              <Button onClick={() => setWhoopConnected(true)} className="bg-primary">
                Connect
              </Button>
            )}
          </div>

          {whoopConnected && (
            <>
              {/* Recovery Score - Prominent */}
              <div className="glass-card p-6 space-y-3 gradient-border glow-primary">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">Recovery Score</h3>
                  <span className={`text-sm font-bold ${getRecoveryColor(whoopData.recoveryScore)}`}>
                    {getRecoveryStatus(whoopData.recoveryScore)}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <p className={`text-6xl font-bold ${getRecoveryColor(whoopData.recoveryScore)}`}>
                    {whoopData.recoveryScore}%
                  </p>
                  <TrendingUp className={`h-8 w-8 mb-2 ${getRecoveryColor(whoopData.recoveryScore)}`} />
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      whoopData.recoveryScore >= 67
                        ? "bg-green-500"
                        : whoopData.recoveryScore >= 34
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${whoopData.recoveryScore}%` }}
                  />
                </div>
              </div>

              {/* Other Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Daily Strain</span>
                  </div>
                  <p className="text-3xl font-bold gradient-text">{whoopData.dailyStrain}</p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Moon className="h-4 w-4" />
                    <span className="text-sm">Sleep</span>
                  </div>
                  <p className="text-3xl font-bold gradient-text">
                    {whoopData.sleep} <span className="text-lg">hrs</span>
                  </p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">HRV</span>
                  </div>
                  <p className="text-3xl font-bold gradient-text">
                    {whoopData.hrv} <span className="text-lg">ms</span>
                  </p>
                </div>

                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Battery className="h-4 w-4" />
                    <span className="text-sm">Last Sync</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{whoopData.lastSync}</p>
                </div>
              </div>

              {/* GIA Recommendation */}
              <div className="glass-card p-4 space-y-3 bg-primary/5 border-primary/30">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-xs font-bold">GIA</span>
                  </div>
                  <h3 className="font-semibold">AI Recommendation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your recovery is at {whoopData.recoveryScore}% (GREEN). You're ready for a high-intensity session
                  today. Consider booking a trainer for skill development or joining a competitive pickup game.
                </p>
              </div>
            </>
          )}
        </Card>

        {/* Benefits Card */}
        <Card className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold">Why Connect Wearables?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Personalized AI Insights</p>
                <p className="text-sm text-muted-foreground">
                  GIA analyzes your recovery and suggests optimal training times
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Track Progress</p>
                <p className="text-sm text-muted-foreground">See how your performance improves over time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Prevent Overtraining</p>
                <p className="text-sm text-muted-foreground">Get alerts when you need rest based on recovery data</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
