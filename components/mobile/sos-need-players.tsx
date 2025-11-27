"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Zap, MapPin, Users, Clock, CheckCircle } from "lucide-react"

export function SOSNeedPlayers() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "success">("form")
  const [sport, setSport] = useState("basketball")
  const [playersNeeded, setPlayersNeeded] = useState(2)
  const [skillLevel, setSkillLevel] = useState("all")

  const handleSubmit = () => {
    setStep("success")
    setTimeout(() => {
      router.push("/mobile/pickup-games")
    }, 2000)
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card border-2 border-primary/30 p-8 max-w-md w-full text-center glow-primary">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/20 rounded-full">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">SOS Sent!</h2>
          <p className="text-muted-foreground">
            Players nearby have been notified. You'll get notifications when someone wants to join.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg">SOS - Need Players</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
        <Card className="glass-card border-2 border-orange-500/30 p-6 glow-primary">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Emergency Player Request</h3>
              <p className="text-sm text-muted-foreground">Broadcast to nearby players instantly</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Sport</Label>
            <div className="grid grid-cols-3 gap-2">
              {["basketball", "tennis", "soccer"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`p-3 rounded-lg border-2 font-semibold capitalize transition-all ${
                    sport === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Current Location</Label>
            <div className="flex items-center gap-2 p-3 glass-card border border-border/50 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm">Downtown Sports Complex</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Players Needed</Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setPlayersNeeded(num)}
                  className={`p-3 rounded-lg border-2 font-bold transition-all ${
                    playersNeeded === num
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Skill Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {["all", "beginner", "advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`p-3 rounded-lg border-2 font-semibold capitalize transition-all ${
                    skillLevel === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  {level === "all" ? "All Levels" : level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold">
              Message (Optional)
            </Label>
            <Input
              id="message"
              placeholder="e.g., Looking for a quick game, all welcome!"
              className="glass-card border-border/50"
            />
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-4">
          <h3 className="font-bold mb-3">Your SOS will be sent to:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>47 players within 2 miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Active in the last 30 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Instant push notifications</span>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 glow-primary"
        >
          <Zap className="h-5 w-5 mr-2" />
          Send SOS to Nearby Players
        </Button>
      </div>
    </div>
  )
}
