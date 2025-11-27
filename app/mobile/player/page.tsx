import { MobileNav } from "@/components/mobile/mobile-nav"
import { PlayerHomeScreen } from "@/components/mobile/player-home-screen"

export default function PlayerHomePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <PlayerHomeScreen />
      <MobileNav userType="player" />
    </div>
  )
}
