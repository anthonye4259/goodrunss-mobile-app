import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ClientsView } from "@/components/dashboard/clients-view"
import { GiaAssistant } from "@/components/dashboard/gia-assistant"

export default function ClientsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <ClientsView />
        </main>
      </div>
      <GiaAssistant />
    </div>
  )
}
