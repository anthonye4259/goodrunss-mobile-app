"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, ExternalLink } from "lucide-react"

export function ShareProfileCard() {
  const [copied, setCopied] = useState(false)

  const trainerId = "coach-mike-johnson" // In production, this would be dynamic
  const bookingLink = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${trainerId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy:", err)
    }
  }

  return (
    <Card className="p-6 glass-card gradient-border glow-primary">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Share Your Profile</h3>
            <p className="text-sm text-muted-foreground">Let clients book sessions with you</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your Booking Link</label>
          <div className="flex gap-2">
            <Input value={bookingLink} readOnly className="bg-background/50 border-border/50 font-mono text-sm" />
            <Button size="icon" onClick={handleCopy} className={copied ? "bg-primary glow-primary" : ""}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button className="w-full gap-2 glow-primary" onClick={() => window.open(bookingLink, "_blank")}>
          <ExternalLink className="h-4 w-4" />
          Preview Your Profile
        </Button>
      </div>
    </Card>
  )
}
