
import { useState, useEffect } from "react"
import { X, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SocialShareButtons } from "@/components/social-share-buttons"

interface Achievement {
  id: string
  icon: string
  name: string
  description: string
  points: number
  reward?: string
}

interface AchievementUnlockModalProps {
  achievement: Achievement | null
  isOpen: boolean
  onClose: () => void
}

export function AchievementUnlockModal({ achievement, isOpen, onClose }: AchievementUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [isOpen])

  if (!achievement || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                backgroundColor: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--accent))" : "#FFD700",
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="glass-card rounded-3xl p-8 border-2 border-primary/50 glow-primary-strong">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full blur-2xl animate-pulse" />
              <div className="relative text-8xl animate-bounce">{achievement.icon}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-wider">Achievement Unlocked!</p>
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">{achievement.name}</h2>
            </div>

            <p className="text-muted-foreground text-lg">{achievement.description}</p>

            <div className="glass-card rounded-2xl px-6 py-3 border border-primary/30">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold gradient-text">+{achievement.points}</span>
                <span className="text-muted-foreground">points</span>
              </div>
            </div>

            {achievement.reward && (
              <div className="w-full glass-card rounded-2xl p-4 border border-accent/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <p className="text-sm text-muted-foreground mb-1">Reward Unlocked</p>
                <p className="text-lg font-semibold text-foreground">{achievement.reward}</p>
              </div>
            )}

            <div className="w-full space-y-3">
              <p className="text-sm text-muted-foreground">Share your achievement</p>
              <SocialShareButtons
                text={`I just unlocked "${achievement.name}" on GoodRunss! ${achievement.icon}`}
                size="sm"
                showLabels={false}
              />
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary text-lg font-semibold"
              onClick={onClose}
            >
              {achievement.reward ? "Claim Reward" : "Awesome!"}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
