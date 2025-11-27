"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CourtCheckIn } from "@/components/mobile/court-check-in"
import { MobileNav } from "@/components/mobile/mobile-nav"

function CheckInContent() {
  const searchParams = useSearchParams()
  const courtName = searchParams.get("court") || "Selected Court"

  console.log("[v0] Check-in page loaded with court:", courtName)

  return (
    <div className="min-h-screen bg-background pb-20">
      <CourtCheckIn courtName={courtName} />
      <MobileNav />
    </div>
  )
}

export default function CheckInPage() {
  console.log("[v0] CheckInPage component rendering")

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground text-lg">Loading check-in...</p>
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  )
}
