
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, Clock, Check } from "lucide-react"
import { Card } from "@/components/ui/card"

interface TrainerBookingModalProps {
  trainer: {
    id: string
    name: string
    sport: string
    hourlyRate: number
    image: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function TrainerBookingModal({ trainer, isOpen, onClose }: TrainerBookingModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "success">("details")
  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    duration: 1,
    notes: "",
  })

  if (!trainer || !isOpen) return null

  const calculateTotal = () => {
    return trainer.hourlyRate * bookingDetails.duration
  }

  const handleSubmit = () => {
    if (step === "details") {
      setStep("payment")
    } else if (step === "payment") {
      setStep("success")
      setTimeout(() => {
        onClose()
        setStep("details")
      }, 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="glass-card rounded-3xl p-6 border-2 border-primary/50 glow-primary max-h-[90vh] overflow-y-auto">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>

          {step === "details" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Book Training Session</h2>
                <p className="text-sm text-muted-foreground">Schedule your session with {trainer.name}</p>
              </div>

              <Card className="p-4 glass-card border-border/50">
                <div className="flex gap-3">
                  <img
                    src={trainer.image || "/placeholder.svg"}
                    alt={trainer.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{trainer.name}</h3>
                    <p className="text-sm text-primary">{trainer.sport}</p>
                    <p className="text-lg font-bold gradient-text mt-1">${trainer.hourlyRate}/hr</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Session Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={bookingDetails.date}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                      className="pl-10 glass-card border-border/50"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={bookingDetails.time}
                      onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                      className="pl-10 glass-card border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={bookingDetails.duration}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, duration: Number(e.target.value) })}
                    className="glass-card border-border/50"
                    min={1}
                    max={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific goals or areas you'd like to focus on?"
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                    className="glass-card border-border/50 min-h-[100px]"
                  />
                </div>
              </div>

              <Card className="p-4 glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Session Cost</span>
                  <span className="font-semibold">${calculateTotal()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Service Fee</span>
                  <span className="font-semibold">${(calculateTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-border/50 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold gradient-text">${(calculateTotal() * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                onClick={handleSubmit}
                disabled={!bookingDetails.date || !bookingDetails.time}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Payment Details</h2>
                <p className="text-sm text-muted-foreground">Secure your training session</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" className="glass-card border-border/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" className="glass-card border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" className="glass-card border-border/50" maxLength={3} />
                  </div>
                </div>
              </div>

              <Card className="p-4 glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total to Pay</span>
                  <span className="text-2xl font-bold gradient-text">${(calculateTotal() * 1.05).toFixed(2)}</span>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 glass-card bg-transparent"
                  onClick={() => setStep("details")}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                  onClick={handleSubmit}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-full blur-2xl animate-pulse" />
                <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center glow-primary-strong">
                  <Check className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold gradient-text mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your training session with {trainer.name} is confirmed. Check your email for details.
                </p>
              </div>

              <Card className="p-4 glass-card border-primary/30">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-semibold">{new Date(bookingDetails.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="font-semibold">{bookingDetails.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-semibold">{bookingDetails.duration}h</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
