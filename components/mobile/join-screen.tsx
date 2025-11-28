
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Gift, ArrowRight } from "lucide-react"
import Image from "next/image"

export function JoinScreen({ referralCode }: { referralCode?: string }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-2xl blur-xl glow-primary" />
            <div className="relative glass-card rounded-2xl p-4 border border-primary/30">
              <Image
                src="/goodrunss-logo.png"
                alt="GoodRunss"
                width={120}
                height={40}
                className="brightness-200 mix-blend-screen"
              />
            </div>
          </div>
        </div>

        {/* Referral Banner */}
        {referralCode && (
          <Card className="p-6 glass-card gradient-border glow-primary">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl glow-primary">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold gradient-text">Special Offer!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your friend <span className="text-primary font-semibold">@{referralCode}</span> invited you!
                </p>
                <p className="text-sm text-primary font-semibold mt-2">Get 10% off your first session</p>
              </div>
            </div>
          </Card>
        )}

        {/* Welcome Card */}
        <Card className="p-8 glass-card border-border/50">
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl inline-block glow-primary">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Join GoodRunss</h1>
              <p className="text-muted-foreground">Find courts, book trainers, and connect with players near you</p>
            </div>
          </div>
        </Card>

        {/* Sign Up Form */}
        <Card className="p-6 glass-card border-border/50">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="Enter your name" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="your@email.com" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="Create a password" className="bg-background/50" />
            </div>
            {referralCode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Code</label>
                <Input value={referralCode} readOnly className="bg-primary/10 border-primary/30" />
              </div>
            )}
          </div>
        </Card>

        {/* CTA */}
        <Button className="w-full h-14 text-lg gap-2 glow-primary-strong">
          Create Account
          <ArrowRight className="h-5 w-5" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  )
}
