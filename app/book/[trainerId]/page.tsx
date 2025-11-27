import { MobileNav } from "@/components/mobile/mobile-nav"
import { TrainerBookingScreen } from "@/components/mobile/trainer-booking-screen"

export default function TrainerBookingPage({ params }: { params: { trainerId: string } }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TrainerBookingScreen trainerId={params.trainerId} />
      <MobileNav />
    </div>
  )
}
