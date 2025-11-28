
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, ExternalLink } from "lucide-react"
import { SocialShareButtons } from "../social-share-buttons"

export function ShareProfileLinkCard() {
  const [copied, setCopied] = useState(false)
  const [showShare, setShowShare] = useState(false)

  // In production, this would be the actual trainer's username
  const username = "coach-mike"
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/t/${username}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <>
      <Card className="glass-card border-primary/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Your Profile Link</h3>
            <p className="text-xs text-muted-foreground">Share with potential clients</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={profileUrl} readOnly className="glass-card border-border/50 text-sm" />
            <Button onClick={copyToClipboard} variant="outline" className="glass-card bg-transparent flex-shrink-0">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowShare(true)} variant="outline" className="flex-1 glass-card bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => window.open(profileUrl, "_blank")}
              variant="outline"
              className="flex-1 glass-card bg-transparent"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="p-3 glass-card rounded-lg border border-primary/30 bg-primary/5">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Pro Tip:</strong> Add this link to your Instagram bio, Twitter
              profile, and business cards to get more bookings!
            </p>
          </div>
        </div>
      </Card>

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setShowShare(false)} />
          <Card className="relative glass-card border-2 border-primary/30 p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Share Your Profile</h3>
            <SocialShareButtons text="Book a training session with me on GoodRunss! 🏀" url={profileUrl} size="md" />
            <Button variant="outline" onClick={() => setShowShare(false)} className="w-full mt-4">
              Close
            </Button>
          </Card>
        </div>
      )}
    </>
  )
}
