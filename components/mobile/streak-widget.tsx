
import { Card } from "@/components/ui/card"
import { Flame } from "lucide-react"
import Link from "next/link"

export function StreakWidget() {
  const currentStreak = 7
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"]
  const checkedIn = [true, true, true, true, true, true, true]

  return (
    <Link href="/mobile/achievements">
      <Card className="glass-card border-2 border-orange-500/30 p-5 hover:border-orange-500/50 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-full group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{currentStreak} Day Streak</h3>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>

        <div className="flex justify-between gap-1">
          {weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{day}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  checkedIn[index] ? "bg-gradient-to-br from-orange-500 to-red-500 glow-primary" : "bg-muted"
                }`}
              >
                {checkedIn[index] && <Flame className="h-4 w-4 text-white" />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  )
}
