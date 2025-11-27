import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SettingsView } from "@/components/dashboard/settings-view"
import { GiaAssistant } from "@/components/dashboard/gia-assistant"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <SettingsView />
        </main>
      </div>
      <GiaAssistant />
    </div>
  )
}
