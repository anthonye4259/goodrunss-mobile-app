import { MobileNav } from "@/components/mobile/mobile-nav"
import { CourtDetailScreen } from "@/components/mobile/court-detail-screen"

export default function CourtDetailPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <CourtDetailScreen />
      <MobileNav />
    </div>
  )
}
