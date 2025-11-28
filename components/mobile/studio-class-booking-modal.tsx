
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Clock, Check, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudioClassBookingModalProps {
  classItem: {
    id: string
    name: string
    instructor: string
    time: string
    duration: string
    price: number
    spots: number
    level: string
  } | null
  studioName: string
  isOpen: boolean
  onClose: () => void
}

export function StudioClassBookingModal({ classItem, studioName, isOpen, onClose }: StudioClassBookingModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "success">("details")

  if (!classItem || !isOpen) return null

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
                <h2 className="text-2xl font-bold gradient-text mb-2">Book Class</h2>
                <p className="text-sm text-muted-foreground">Reserve your spot</p>
              </div>

              <Card className="p-4 glass-card border-border/50">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{classItem.name}</h3>
                    <p className="text-sm text-muted-foreground">with {classItem.instructor}</p>
                    <p className="text-sm text-muted-foreground">{studioName}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{classItem.time}</span>
                    </div>
                    <Badge variant="outline">{classItem.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className={classItem.spots <= 3 ? "text-orange-500 font-semibold" : ""}>
                        {classItem.spots} spots left
                      </span>
                    </div>
                    <p className="text-2xl font-bold gradient-text">${classItem.price}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Class Fee</span>
                  <span className="font-semibold">${classItem.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Service Fee</span>
                  <span className="font-semibold">${(classItem.price * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-border/50 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold gradient-text">${(classItem.price * 1.05).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary"
                onClick={handleSubmit}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Payment Details</h2>
                <p className="text-sm text-muted-foreground">Secure your class reservation</p>
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
                  <span className="text-2xl font-bold gradient-text">${(classItem.price * 1.05).toFixed(2)}</span>
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
                <h2 className="text-3xl font-bold gradient-text mb-2">Class Booked!</h2>
                <p className="text-muted-foreground">
                  Your spot in {classItem.name} is confirmed. Check your email for details.
                </p>
              </div>

              <Card className="p-4 glass-card border-primary/30">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Class</span>
                    <span className="font-semibold">{classItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Instructor</span>
                    <span className="font-semibold">{classItem.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="font-semibold">{classItem.time}</span>
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
