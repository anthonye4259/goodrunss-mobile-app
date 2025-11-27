"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Watch, Activity, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function WearablesIntegrationCard() {
  return (
    <Card className="p-6 glass-card border-2 border-primary/50 glow-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl glow-primary-strong">
              <Watch className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Connect Wearables</h3>
              <p className="text-xs text-muted-foreground">Unlock AI-powered insights</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 bg-primary/20 rounded-full text-primary font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            PRO
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm flex items-center justify-center border border-border">
              <span className="text-2xl">⌚</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Apple Watch</p>
              <p className="text-xs text-muted-foreground">Track workouts & heart rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm flex items-center justify-center border border-border">
              <span className="text-2xl">💪</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Whoop</p>
              <p className="text-xs text-muted-foreground">Recovery & strain analysis</p>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Get personalized training recommendations based on your recovery data</span>
          </div>
        </div>

        <Link href="/mobile/wearables">
          <Button className="w-full glow-primary">
            Connect Devices
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
