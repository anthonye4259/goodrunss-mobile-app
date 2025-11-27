"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Clock, Shield, TrendingUp, CheckCircle2, ArrowLeft, DollarSign } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function InstantPayoutInterface() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const availableBalance = 247.5
  const pendingBalance = 125.0
  const grossEarnings = 372.5
  const platformFee = 18.63

  const recentPayouts = [
    { id: 1, amount: 180.0, date: "2024-01-15", arrivalTime: "18 minutes", status: "Completed" },
    { id: 2, amount: 225.5, date: "2024-01-12", arrivalTime: "22 minutes", status: "Completed" },
    { id: 3, amount: 150.0, date: "2024-01-08", arrivalTime: "15 minutes", status: "Completed" },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Instant Payout</h1>
              <p className="text-muted-foreground">Get paid the same day you work</p>
            </div>
          </div>

          <Card className="glass-card p-8 gradient-border glow-primary-strong relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-pulse" />

            <div className="relative space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-7xl font-bold gradient-text">${availableBalance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Pending: ${pendingBalance.toFixed(2)}</p>
              </div>

              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-primary-strong"
              >
                <Zap className="h-6 w-6 mr-2" />
                Cash Out Instantly
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">Money in 30 minutes or less</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <Card className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Earnings Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
              <span className="text-muted-foreground">Gross Earnings</span>
              <span className="text-xl font-bold">${grossEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
              <span className="text-muted-foreground">Platform Fee (5%)</span>
              <span className="text-xl font-bold text-destructive">-${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/30">
              <span className="font-bold">Net Available</span>
              <span className="text-2xl font-bold gradient-text">${availableBalance.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Click "Cash Out Instantly"</h3>
                <p className="text-sm text-muted-foreground">Your available balance is ready to transfer immediately</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold">We process instantly</h3>
                <p className="text-sm text-muted-foreground">
                  Unlike other platforms that make you wait days, we start processing immediately
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Money arrives in 30 minutes</h3>
                <p className="text-sm text-muted-foreground">
                  Average arrival time is 18 minutes. Get paid the same day you work
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-card p-4 space-y-2">
            <Clock className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">18 min average</h3>
            <p className="text-sm text-muted-foreground">Fastest payouts in the industry</p>
          </Card>

          <Card className="glass-card p-4 space-y-2">
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Bank-level security</h3>
            <p className="text-sm text-muted-foreground">Your money is always protected</p>
          </Card>

          <Card className="glass-card p-4 space-y-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">No hidden fees</h3>
            <p className="text-sm text-muted-foreground">What you see is what you get</p>
          </Card>
        </div>

        {/* Recent Payouts */}
        <Card className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Recent Payouts</h2>
          <div className="space-y-3">
            {recentPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">${payout.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{payout.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{payout.arrivalTime}</p>
                  <p className="text-xs text-muted-foreground">{payout.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Why GoodRunss is Different */}
        <Card className="glass-card p-6 space-y-4 bg-primary/5 border-primary/30">
          <h2 className="text-xl font-bold">Why GoodRunss is Different</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Get paid the same day you work</p>
                <p className="text-sm text-muted-foreground">
                  Other platforms make you wait 3-7 days. We pay you in 30 minutes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">No minimum payout amount</p>
                <p className="text-sm text-muted-foreground">Cash out any amount, any time. Your money, your choice.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Transparent 5% fee</p>
                <p className="text-sm text-muted-foreground">
                  No hidden charges. Just a simple 5% platform fee on gross earnings.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">Confirm Instant Cashout</DialogTitle>
            <DialogDescription>Review your payout details</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <p className="text-5xl font-bold gradient-text">${availableBalance.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Will be deposited to your account</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Estimated arrival</p>
                  <p className="text-xs text-muted-foreground">18-30 minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Secure transfer</p>
                  <p className="text-xs text-muted-foreground">Bank-level encryption</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">No additional fees</p>
                  <p className="text-xs text-muted-foreground">5% platform fee already deducted</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowConfirmDialog(false)
                // Handle payout logic here
              }}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent glow-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Confirm Cashout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
