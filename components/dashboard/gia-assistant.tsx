
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, X, Send, Settings, Mail, Calendar, MessageSquare, Video, FileText, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const integrations = [
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    description: "Sync emails and send automated responses",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    icon: Calendar,
    description: "Manage bookings and schedule sessions",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "slack",
    name: "Slack",
    icon: MessageSquare,
    description: "Send notifications to your team",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "zoom",
    name: "Zoom",
    icon: Video,
    description: "Create virtual training sessions",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    id: "notion",
    name: "Notion",
    icon: FileText,
    description: "Sync training plans and notes",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
  {
    id: "zapier",
    name: "Zapier",
    icon: Zap,
    description: "Connect to 5000+ apps",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
]

export function GiaAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<"chat" | "integrations">("chat")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm GIA, your AI assistant. How can I help you optimize your training business today?",
    },
  ])
  const [input, setInput] = useState("")
  const [enabledIntegrations, setEnabledIntegrations] = useState<Record<string, boolean>>({
    gmail: false,
    calendar: true,
    slack: false,
    zoom: false,
    notion: false,
    zapier: false,
  })

  const handleSend = () => {
    if (!input.trim()) return

    setMessages([...messages, { role: "user", content: input }])
    setInput("")

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm analyzing your request. This is a demo response - in production, I'd provide personalized insights based on your data.",
        },
      ])
    }, 1000)
  }

  const toggleIntegration = (id: string) => {
    setEnabledIntegrations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg glow-primary-strong transition-all duration-300",
          "bg-gradient-to-br from-primary to-accent hover:scale-110",
          isOpen && "scale-0",
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      {/* Chat Drawer */}
      <div
        className={cn(
          "fixed bottom-0 right-0 h-[600px] w-[400px] bg-card/95 backdrop-blur-xl border-l border-t border-border/50 rounded-tl-2xl shadow-2xl transition-transform duration-300 flex flex-col glass-card",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">GIA Assistant</h3>
              <p className="text-xs text-muted-foreground">AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setView(view === "chat" ? "integrations" : "chat")}
              className={cn(view === "integrations" && "bg-muted")}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === "chat" ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div key={i} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                          : "bg-muted/50 text-foreground",
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask GIA anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="bg-background/50 border-border/50"
                />
                <Button size="icon" onClick={handleSend} className="glow-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Integrations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect GIA to your favorite tools to automate your workflow
                </p>
              </div>

              <div className="space-y-3">
                {integrations.map((integration) => {
                  const Icon = integration.icon
                  const isEnabled = enabledIntegrations[integration.id]

                  return (
                    <div
                      key={integration.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        isEnabled
                          ? "border-primary/50 bg-primary/5 glow-primary"
                          : "border-border/50 bg-muted/20 hover:border-border",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg", integration.bgColor)}>
                          <Icon className={cn("h-5 w-5", integration.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{integration.name}</h4>
                            <Switch checked={isEnabled} onCheckedChange={() => toggleIntegration(integration.id)} />
                          </div>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                          {isEnabled && (
                            <div className="mt-2 pt-2 border-t border-border/30">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Configure
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">More integrations coming soon</p>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  )
}
