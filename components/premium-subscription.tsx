"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Zap, TrendingUp, Users, Crown, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const playerFeatures = [
  "Unlimited court check-ins",
  "AI-powered recommendations",
  "Advanced performance stats",
  "Priority court booking",
  "Ad-free experience",
  "Achievement tracking",
]

const trainerFeatures = [
  "Everything in Player Premium",
  "Advanced client management",
  "Revenue analytics dashboard",
  "⚡ Instant payouts (30 min!)",
  "Featured trainer listing",
  "Custom pricing control",
  "Priority support",
  "Marketing tools",
]

const testimonials = [
  {
    name: "Coach Mike",
    role: "Basketball Trainer",
    avatar: "/placeholder.svg?height=48&width=48",
    quote: "Instant payouts changed my business. I get paid the same day I work!",
    earnings: "$12,500/mo",
  },
  {
    name: "Sarah J.",
    role: "Tennis Pro",
    avatar: "/placeholder.svg?height=48&width=48",
    quote: "The client management tools save me 10 hours a week. Worth every penny.",
    earnings: "$8,200/mo",
  },
  {
    name: "Alex Chen",
    role: "Player",
    avatar: "/placeholder.svg?height=48&width=48",
    quote: "AI recommendations helped me improve my game 40% faster!",
    earnings: null,
  },
]

const faqs = [
  {
    question: "How fast are instant payouts?",
    answer:
      "Most payouts arrive in 30 minutes or less. Unlike other platforms that make you wait days or weeks, we get you paid the same day you work.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! Cancel anytime with no penalties. We also offer a 7-day money-back guarantee if you're not satisfied.",
  },
  {
    question: "What's the difference between Player and Trainer Premium?",
    answer:
      "Player Premium is for athletes who want advanced stats and priority booking. Trainer Premium includes everything in Player plus business tools like client management, revenue analytics, and instant payouts.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! We charge a transparent 5% platform fee on trainer earnings. That's it. No setup fees, no monthly minimums, no surprises.",
  },
]

export function PremiumSubscription() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [trainerEarnings, setTrainerEarnings] = useState(5000)

  const calculateSavings = () => {
    const monthlyFee = 30
    const annualFee = 300 // $25/month when billed annually
    const savings = monthlyFee * 12 - annualFee
    return savings
  }

  const calculateNetEarnings = () => {
    const platformFee = trainerEarnings * 0.05
    const subscriptionFee = billingCycle === "monthly" ? 30 : 25
    return trainerEarnings - platformFee - subscriptionFee
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="relative px-6 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary border border-primary/20">
            <Crown className="h-4 w-4" />
            <span>7-Day Free Trial • No Credit Card Required</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 gradient-text">Unlock Your Full Potential</h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get instant payouts, advanced analytics, and AI-powered insights to grow your game or business
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-xl font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-6 py-2 rounded-xl font-medium transition-all relative",
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                Save ${calculateSavings()}
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Player Premium */}
            <Card className="p-8 glass-card border-border/50 hover:border-primary/50 transition-all">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Player Premium</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold gradient-text">${billingCycle === "monthly" ? "10" : "8"}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-sm text-muted-foreground mt-1">Billed annually at $96</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {playerFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full glow-primary" size="lg">
                  Start Free Trial
                </Button>
              </div>
            </Card>

            {/* Trainer Premium */}
            <Card className="p-8 glass-card border-2 border-primary/50 glow-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Most Popular
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg glow-primary">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Trainer Premium</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold gradient-text">
                      ${billingCycle === "monthly" ? "30" : "25"}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-sm text-muted-foreground mt-1">Billed annually at $300</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {trainerFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary-strong"
                  size="lg"
                >
                  Start Free Trial
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="px-6 py-16 max-w-4xl mx-auto">
        <Card className="p-8 glass-card border-primary/30 glow-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl glow-primary">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Earnings Calculator</h3>
              <p className="text-sm text-muted-foreground">See how much you'll take home</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Monthly Earnings</label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={trainerEarnings}
                onChange={(e) => setTrainerEarnings(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>$1,000</span>
                <span className="text-2xl font-bold text-foreground">${trainerEarnings.toLocaleString()}</span>
                <span>$20,000</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Gross Earnings</p>
                <p className="text-2xl font-bold text-primary">${trainerEarnings.toLocaleString()}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Platform Fee (5%)</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  -${(trainerEarnings * 0.05).toLocaleString()}
                </p>
              </div>
              <div className="glass-card p-4 rounded-xl border-2 border-primary/50 glow-primary">
                <p className="text-sm text-muted-foreground mb-1">You Take Home</p>
                <p className="text-2xl font-bold gradient-text">${calculateNetEarnings().toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Get paid in 30 minutes or less with instant payouts</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Testimonials */}
      <div className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
          <p className="text-xl text-muted-foreground">See what our premium members are saying</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-6 glass-card border-border/50 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
              {testimonial.earnings && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">{testimonial.earnings}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="glass-card p-6 rounded-xl">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-semibold mb-1">7-Day Guarantee</p>
            <p className="text-sm text-muted-foreground">Money back if not satisfied</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-semibold mb-1">Instant Payouts</p>
            <p className="text-sm text-muted-foreground">30 minutes average</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-semibold mb-1">10,000+ Members</p>
            <p className="text-sm text-muted-foreground">Join the community</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="glass-card border-border/50 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/20 transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                {expandedFaq === i ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {expandedFaq === i && <div className="px-6 pb-6 text-sm text-muted-foreground">{faq.answer}</div>}
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 py-16 max-w-4xl mx-auto text-center">
        <Card className="p-12 glass-card border-2 border-primary/50 glow-primary-strong">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Ready to Go Premium?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your 7-day free trial today. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 glow-primary-strong">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Compare Plans
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
