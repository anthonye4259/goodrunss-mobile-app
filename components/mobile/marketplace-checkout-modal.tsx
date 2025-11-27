"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Calendar, DollarSign, CreditCard, Check } from "lucide-react"
import { Card } from "@/components/ui/card"

interface MarketplaceCheckoutModalProps {
  item: {
    id: string
    title: string
    price: number
    type: "sell" | "rent"
    seller: string
    image: string
    rentalPeriod?: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export function MarketplaceCheckoutModal({ item, isOpen, onClose }: MarketplaceCheckoutModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "success">("details")
  const [rentalDates, setRentalDates] = useState({ start: "", end: "" })
  const [bidAmount, setBidAmount] = useState(item?.price || 0)
  const [isBidding, setIsBidding] = useState(false)

  if (!item || !isOpen) return null

  const calculateRentalDays = () => {
    if (!rentalDates.start || !rentalDates.end) return 0
    const start = new Date(rentalDates.start)
    const end = new Date(rentalDates.end)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (item.type === "rent") {
      const days = calculateRentalDays()
      return days * item.price
    }
    return isBidding ? bidAmount : item.price
  }

  const handleSubmit = () => {
    if (step === "details") {
      setStep("payment")
    } else if (step === "payment") {
      setStep("success")
      setTimeout(() => {
        onClose()
        setStep("details")
        setIsBidding(false)
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
                <h2 className="text-2xl font-bold gradient-text mb-2">
                  {item.type === "sell" ? "Purchase Item" : "Rent Item"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Complete your {item.type === "sell" ? "purchase" : "rental"}
                </p>
              </div>

              <Card className="p-4 glass-card border-border/50">
                <div className="flex gap-3">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">by {item.seller}</p>
                    <p className="text-lg font-bold gradient-text mt-1">
                      ${item.price}
                      {item.rentalPeriod && ` ${item.rentalPeriod}`}
                    </p>
                  </div>
                </div>
              </Card>

              {item.type === "rent" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="start-date"
                        type="date"
                        value={rentalDates.start}
                        onChange={(e) => setRentalDates({ ...rentalDates, start: e.target.value })}
                        className="pl-10 glass-card border-border/50"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="end-date"
                        type="date"
                        value={rentalDates.end}
                        onChange={(e) => setRentalDates({ ...rentalDates, end: e.target.value })}
                        className="pl-10 glass-card border-border/50"
                        min={rentalDates.start || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  {calculateRentalDays() > 0 && (
                    <Card className="p-4 glass-card border-primary/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rental Duration</span>
                        <span className="font-semibold">{calculateRentalDays()} days</span>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {item.type === "sell" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-card rounded-xl border border-border/50">
                    <span className="text-sm font-medium">Make an offer instead?</span>
                    <Button
                      size="sm"
                      variant={isBidding ? "default" : "outline"}
                      onClick={() => setIsBidding(!isBidding)}
                      className={isBidding ? "bg-gradient-to-r from-primary to-accent" : ""}
                    >
                      {isBidding ? "Cancel Bid" : "Place Bid"}
                    </Button>
                  </div>

                  {isBidding && (
                    <div className="space-y-2">
                      <Label htmlFor="bid-amount">Your Offer</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bid-amount"
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          className="pl-10 glass-card border-border/50"
                          min={1}
                          max={item.price}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Seller will be notified of your offer. They can accept, counter, or decline.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Card className="p-4 glass-card border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
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
                disabled={item.type === "rent" && calculateRentalDays() === 0}
              >
                {isBidding ? "Submit Offer" : "Continue to Payment"}
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Payment Details</h2>
                <p className="text-sm text-muted-foreground">Enter your payment information</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      className="pl-10 glass-card border-border/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" className="glass-card border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" className="glass-card border-border/50" maxLength={3} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input id="name" placeholder="John Doe" className="glass-card border-border/50" />
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
                  {isBidding ? "Submit Offer" : "Complete Purchase"}
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
                <h2 className="text-3xl font-bold gradient-text mb-2">{isBidding ? "Offer Submitted!" : "Success!"}</h2>
                <p className="text-muted-foreground">
                  {isBidding
                    ? "The seller will review your offer and respond soon."
                    : item.type === "sell"
                      ? "Your purchase is complete. Check your email for details."
                      : "Your rental is confirmed. Check your email for pickup details."}
                </p>
              </div>

              <Card className="p-4 glass-card border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Order Number</p>
                <p className="text-2xl font-bold gradient-text">#{Math.floor(Math.random() * 1000000)}</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
