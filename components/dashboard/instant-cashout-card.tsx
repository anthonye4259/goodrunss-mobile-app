"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Clock, Shield } from "lucide-react"
import Link from "next/link"

export function InstantCashoutCard() {
  const availableBalance = 247.5
  const pendingBalance = 125.0
  const grossEarnings = 372.5
  const platformFee = 18.63 // 5% of gross

  return (
    <>
      <Card className="p-8 glass-card gradient-border glow-primary-strong relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-pulse" />

        <div className="relative space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <p className="text-sm font-semibold text-primary">Instant Cashout Available</p>
              </div>
              <p className="text-6xl font-bold gradient-text">${availableBalance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Pending: ${pendingBalance.toFixed(2)}</p>
            </div>

            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>30 min or less</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure & instant</span>
              </div>
            </div>
          </div>

          <Link href="/dashboard/payout">
            <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-primary-strong">
              <Zap className="h-5 w-5 mr-2" />
              Cash Out Instantly
            </Button>
          </Link>

          <div className="pt-4 border-t border-border/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="font-semibold">${grossEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (5%)</span>
              <span className="text-destructive">-${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border/30">
              <span>Net Available</span>
              <span className="gradient-text">${availableBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
