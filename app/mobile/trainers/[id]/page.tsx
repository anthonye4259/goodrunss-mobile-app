import { MobileNav } from "@/components/mobile/mobile-nav"
import { TrainerDetailScreen } from "@/components/mobile/trainer-detail-screen"

export default function TrainerDetailPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TrainerDetailScreen />
      <MobileNav />
    </div>
  )
}
