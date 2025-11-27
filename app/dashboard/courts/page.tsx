import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { CourtsView } from "@/components/dashboard/courts-view"
import { GiaAssistant } from "@/components/dashboard/gia-assistant"

export default function CourtsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <CourtsView />
        </main>
      </div>
      <GiaAssistant />
    </div>
  )
}
