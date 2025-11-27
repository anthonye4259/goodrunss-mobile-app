import { PickupGameFinder } from "@/components/mobile/pickup-game-finder"
import { MobileNav } from "@/components/mobile/mobile-nav"

export default function PickupGamesPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PickupGameFinder />
      <MobileNav />
    </div>
  )
}
