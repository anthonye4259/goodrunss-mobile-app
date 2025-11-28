
import { useState } from "react"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function FloatingGIAChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm GIA, your AI assistant. How can I help you today?",
    },
  ])

  const handleSend = () => {
    if (!message.trim()) return

    setMessages([...messages, { role: "user", content: message }])
    setMessage("")

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm here to help! This is a demo response. In production, I'd provide personalized recommendations based on your activity.",
        },
      ])
    }, 1000)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-50 p-4 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg hover:scale-110 transition-transform duration-300 glow-primary-strong animate-pulse"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Expanded Chat Interface */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="glass-card border-b border-border/50 p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-full glow-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-lg gradient-text">GIA Assistant</h2>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 pb-24 max-w-md mx-auto">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full h-fit">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl p-4",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                        : "glass-card border border-border/50",
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 p-4">
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask GIA anything..."
                className="flex-1 glass-card border-border/50"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-gradient-to-br from-primary to-accent hover:opacity-90 glow-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
