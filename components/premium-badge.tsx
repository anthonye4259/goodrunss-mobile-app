"use client"

import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumBadgeProps {
  variant?: "default" | "compact" | "icon"
  className?: string
}

export function PremiumBadge({ variant = "default", className }: PremiumBadgeProps) {
  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <Crown className="h-4 w-4 text-amber-400 fill-amber-400" />
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full text-xs font-semibold text-amber-400 border border-amber-500/30",
          className,
        )}
      >
        <Crown className="h-3 w-3 fill-amber-400" />
        PRO
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full text-sm font-semibold text-amber-400 border border-amber-500/30 glow-primary",
        className,
      )}
    >
      <Crown className="h-4 w-4 fill-amber-400" />
      Premium
    </span>
  )
}
