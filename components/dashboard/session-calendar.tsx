
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { useState } from "react"

const sessions = [
  { day: 15, time: "3:00 PM", client: "John Smith", type: "Individual" },
  { day: 15, time: "5:00 PM", client: "Sarah Johnson", type: "Group" },
  { day: 16, time: "10:00 AM", client: "Mike Davis", type: "Individual" },
  { day: 17, time: "2:00 PM", client: "Emily Chen", type: "Individual" },
  { day: 18, time: "4:00 PM", client: "John Smith", type: "Individual" },
  { day: 20, time: "11:00 AM", client: "Sarah Johnson", type: "Group" },
]

export function SessionCalendar() {
  const [currentMonth] = useState("October 2025")

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
  const sessionsPerDay = sessions.reduce(
    (acc, session) => {
      acc[session.day] = (acc[session.day] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  return (
    <Card className="p-6 glass-card border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Session Calendar</h3>
          <p className="text-sm text-muted-foreground mt-1">{currentMonth}</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
          const sessionCount = sessionsPerDay[day] || 0
          const hasSession = sessionCount > 0

          return (
            <button
              key={day}
              className={`
                aspect-square p-2 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  hasSession
                    ? "bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/50 glow-primary hover:scale-105"
                    : "bg-muted/30 hover:bg-muted/50"
                }
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day}</span>
                {hasSession && <span className="text-xs text-primary font-bold mt-1">{sessionCount}</span>}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border/50">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Upcoming This Week
        </h4>
        <div className="space-y-2">
          {sessions.slice(0, 3).map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">{session.client}</p>
                <p className="text-xs text-muted-foreground">{session.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">Oct {session.day}</p>
                <p className="text-xs text-muted-foreground">{session.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
