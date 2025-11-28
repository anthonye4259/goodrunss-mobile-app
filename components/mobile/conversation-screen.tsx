
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Phone, Video, MoreVertical, Calendar } from "lucide-react"

export function ConversationScreen({ userName = "Marcus Thompson", userAvatar = "/placeholder.svg" }) {
  const router = useRouter()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "other",
      content: "Hey! Thanks for booking a session with me. Looking forward to working with you!",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      content: "Thanks! I'm excited to improve my shooting form.",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      content: "Great! We'll focus on your mechanics and footwork. Do you have any specific areas you want to work on?",
      time: "10:33 AM",
    },
    {
      id: 4,
      sender: "me",
      content: "Mainly my three-point shot consistency and off-the-dribble shooting.",
      time: "10:35 AM",
    },
    {
      id: 5,
      sender: "other",
      content: "Perfect! I have some drills that will help with that. See you tomorrow at 3 PM!",
      time: "10:36 AM",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: "me" as const,
      content: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setInput("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={userAvatar || "/placeholder.svg"} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-bold">{userName}</h2>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 max-w-md mx-auto w-full">
        <Card className="glass-card border-primary/30 p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full glass-card justify-start bg-transparent"
            onClick={() => router.push("/mobile/bookings")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Booking Details
          </Button>
        </Card>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] ${message.sender === "me" ? "order-2" : "order-1"}`}>
              <Card
                className={`p-3 ${
                  message.sender === "me"
                    ? "bg-gradient-to-r from-primary to-accent text-white border-0"
                    : "glass-card border-primary/30"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </Card>
              <p
                className={`text-xs text-muted-foreground mt-1 ${message.sender === "me" ? "text-right" : "text-left"}`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="glass-card border-t border-border/50 p-4 sticky bottom-0">
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="glass-card border-border/50"
          />
          <Button size="icon" onClick={handleSend} className="bg-gradient-to-r from-primary to-accent">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
