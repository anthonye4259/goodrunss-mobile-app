import { MobileNav } from "@/components/mobile/mobile-nav"
import { JoinScreen } from "@/components/mobile/join-screen"

export default function JoinPage({ searchParams }: { searchParams: { ref?: string } }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <JoinScreen referralCode={searchParams.ref} />
      <MobileNav />
    </div>
  )
}
