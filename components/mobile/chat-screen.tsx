
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles } from "lucide-react"

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi! I'm GIA, your GoodRunss Intelligence Assistant. I can help you find courts, book trainers, track your progress, and answer any questions about recreational sports. What would you like to know?",
  },
]

export function ChatScreen() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
    }

    setMessages([...messages, userMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        role: "assistant",
        content:
          "I'm processing your request. In a real implementation, I would provide personalized recommendations based on your location, preferences, and playing history.",
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">GIA</h1>
          <p className="text-sm text-muted-foreground">Your AI Sports Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border-border"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* Suggested Actions */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant="outline"
          size="sm"
          className="whitespace-nowrap bg-transparent"
          onClick={() => setInput("Find basketball courts near me")}
        >
          Find courts
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="whitespace-nowrap bg-transparent"
          onClick={() => setInput("Show my stats")}
        >
          My stats
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="whitespace-nowrap bg-transparent"
          onClick={() => setInput("Book a trainer")}
        >
          Book trainer
        </Button>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask GIA anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="bg-card border-border"
        />
        <Button size="icon" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
