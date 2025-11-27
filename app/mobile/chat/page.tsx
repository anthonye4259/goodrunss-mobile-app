import { MobileNav } from "@/components/mobile/mobile-nav"
import { ChatScreen } from "@/components/mobile/chat-screen"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <ChatScreen />
      <MobileNav />
    </div>
  )
}
