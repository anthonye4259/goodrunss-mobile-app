"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Star } from "lucide-react"

export function ReviewScreen() {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trainer = {
    name: "Coach Mike Johnson",
    avatar: "/placeholder.svg?height=100&width=100",
    sport: "Basketball",
  }

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    console.log("[v0] Submitting review:", { rating, review })

    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/mobile/bookings")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg flex-1">Leave a Review</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <Card className="glass-card border-primary/30 p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={trainer.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {trainer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg">{trainer.name}</h2>
              <p className="text-sm text-muted-foreground">{trainer.sport}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold">How was your session?</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 5 && "Excellent!"}
                  {rating === 4 && "Great!"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Tell us more (optional)</label>
              <Textarea
                placeholder="Share your experience with this trainer..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="glass-card border-border/50 min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">{review.length}/500 characters</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-4">
          <h3 className="font-semibold mb-3">Quick Tags</h3>
          <div className="flex flex-wrap gap-2">
            {["Professional", "Knowledgeable", "Motivating", "Patient", "Punctual", "Great Communication"].map(
              (tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
                >
                  {tag}
                </button>
              ),
            )}
          </div>
        </Card>

        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">Your review helps other players find great trainers</p>
      </div>
    </div>
  )
}
