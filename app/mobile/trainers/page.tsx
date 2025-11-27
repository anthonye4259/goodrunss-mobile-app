import { MobileNav } from "@/components/mobile/mobile-nav"
import { TrainersScreen } from "@/components/mobile/trainers-screen"

export default function TrainersPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TrainersScreen />
      <MobileNav />
    </div>
  )
}
