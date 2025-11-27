import { MobileNav } from "@/components/mobile/mobile-nav"
import { ProfileScreen } from "@/components/mobile/profile-screen"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <ProfileScreen />
      <MobileNav />
    </div>
  )
}
