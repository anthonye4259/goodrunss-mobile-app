import { CreateGameScreen } from "@/components/mobile/create-game-screen"
import { MobileNav } from "@/components/mobile/mobile-nav"

export default function CreateGamePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <CreateGameScreen />
      <MobileNav />
    </div>
  )
}
