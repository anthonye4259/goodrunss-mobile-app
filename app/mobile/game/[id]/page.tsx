import { GameDetailScreen } from "@/components/mobile/game-detail-screen"
import { MobileNav } from "@/components/mobile/mobile-nav"

export default function GameDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <GameDetailScreen />
      <MobileNav />
    </div>
  )
}
