"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"

export function TrialBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative overflow-hidden glass-card border border-primary/30 rounded-2xl p-4 mb-4">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-muted/50 rounded-full transition-colors z-10"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl glow-primary">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="text-sm font-bold gradient-text">7 Days Free Premium</h3>
            <p className="text-xs text-muted-foreground">All features unlocked. Cancel anytime.</p>
          </div>
        </div>

        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 glow-primary shrink-0"
        >
          Start Now
        </Button>
      </div>
    </div>
  )
}
