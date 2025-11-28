
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Gift, Star, Zap, ShoppingBag, Ticket } from "lucide-react"

interface RewardsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  if (!isOpen) return null

  const userPoints = 2450

  const rewards = [
    {
      id: "1",
      title: "10% Off Marketplace",
      description: "Get 10% off your next marketplace purchase",
      points: 500,
      icon: ShoppingBag,
      available: true,
    },
    {
      id: "2",
      title: "Free Trainer Session",
      description: "Redeem for one free 1-hour trainer session",
      points: 1000,
      icon: Ticket,
      available: true,
    },
    {
      id: "3",
      title: "Premium Badge",
      description: "Show off your dedication with a premium profile badge",
      points: 1500,
      icon: Star,
      available: true,
    },
    {
      id: "4",
      title: "VIP Court Access",
      description: "Priority booking at premium courts for 1 month",
      points: 2000,
      icon: Zap,
      available: true,
    },
    {
      id: "5",
      title: "Exclusive Merch",
      description: "Limited edition GoodRunss merchandise",
      points: 3000,
      icon: Gift,
      available: false,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />
      <Card className="relative glass-card border-2 border-primary/30 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl">
        <div className="sticky top-0 glass-card border-b border-border/50 p-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg">Rewards Store</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <Card className="glass-card border-2 border-primary/30 p-5 glow-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Your Points</h3>
                <p className="text-sm text-muted-foreground">Earn more by staying active</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold gradient-text">{userPoints}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                className={`glass-card p-5 ${
                  reward.available ? "border-primary/30 hover:border-primary/50" : "border-border/30 opacity-60"
                } transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-4 rounded-xl ${
                      reward.available ? "bg-gradient-to-br from-primary to-accent glow-primary" : "bg-muted"
                    }`}
                  >
                    <reward.icon className={`h-6 w-6 ${reward.available ? "text-white" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Badge
                        className={
                          reward.available
                            ? "bg-gradient-to-r from-primary to-accent"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {reward.points} points
                      </Badge>
                      <Button
                        size="sm"
                        disabled={!reward.available || userPoints < reward.points}
                        className={
                          reward.available && userPoints >= reward.points
                            ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                            : ""
                        }
                      >
                        {userPoints < reward.points ? "Not enough points" : "Redeem"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
