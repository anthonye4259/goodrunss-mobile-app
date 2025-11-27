import Image from "next/image"
import { cn } from "@/lib/utils"

interface GoodRunssLogoProps {
  variant?: "default" | "compact" | "hero"
  className?: string
}

export function GoodRunssLogo({ variant = "default", className }: GoodRunssLogoProps) {
  const sizes = {
    default: { width: 40, height: 40 },
    compact: { width: 32, height: 32 },
    hero: { width: 80, height: 80 },
  }

  const size = sizes[variant]

  return (
    <div className={cn("flex items-center gap-3", variant === "hero" && "flex-col gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl",
          variant === "default" && "p-2 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20",
          variant === "compact" && "p-1.5",
          variant === "hero" && "p-4 glass-card border-2 border-primary/30 glow-primary",
        )}
      >
        <Image
          src="/goodrunss-logo.png"
          alt="GoodRunss"
          width={size.width}
          height={size.height}
          className="mix-blend-screen brightness-150 contrast-125"
          priority
        />
      </div>
      <div className={cn("flex flex-col", variant === "hero" && "items-center")}>
        <span
          className={cn(
            "font-bold tracking-tight gradient-text",
            variant === "default" && "text-lg",
            variant === "compact" && "text-base",
            variant === "hero" && "text-2xl",
          )}
        >
          GoodRunss
        </span>
        {variant === "hero" && <span className="text-sm text-muted-foreground">Where the World Plays</span>}
      </div>
    </div>
  )
}
