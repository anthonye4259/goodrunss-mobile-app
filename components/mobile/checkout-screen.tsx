
import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Lock, Calendar, User } from "lucide-react"

export function CheckoutScreen({
  itemName = "Training Session",
  itemPrice = 80,
  itemDescription = "1-hour session with Coach Marcus",
}) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"card" | "saved">("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Processing payment:", formData)
    router.push("/mobile/payment-confirmation")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-lg flex-1">Checkout</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-6">
        <Card className="glass-card border-primary/30 p-6">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{itemName}</h4>
                <p className="text-sm text-muted-foreground">{itemDescription}</p>
              </div>
              <p className="font-bold">${itemPrice}</p>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Service Fee</span>
              <span className="text-sm">$5</span>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="gradient-text">${itemPrice + 5}</span>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-primary/30 p-6 space-y-4">
          <h3 className="font-bold text-lg">Payment Method</h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              New Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("saved")}
              className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                paymentMethod === "saved"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              Saved Cards
            </button>
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="glass-card border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Cardholder Name
                </Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  className="glass-card border-border/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Expiry
                  </Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="glass-card border-border/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    className="glass-card border-border/50"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "saved" && (
            <div className="space-y-2 pt-4">
              <button type="button" className="w-full p-4 rounded-lg border-2 border-primary bg-primary/10 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">•••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <div className="h-2 w-2 bg-primary rounded-full" />
                </div>
              </button>
            </div>
          )}
        </Card>

        <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Pay ${itemPrice + 5}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  )
}
