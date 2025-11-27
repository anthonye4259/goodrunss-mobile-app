import { NotificationsScreen } from "@/components/mobile/notifications-screen"
import { MobileNav } from "@/components/mobile/mobile-nav"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <NotificationsScreen />
      <MobileNav />
    </div>
  )
}
