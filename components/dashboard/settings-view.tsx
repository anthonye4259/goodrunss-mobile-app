
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, CreditCard, Shield, Sparkles, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsView() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [aiInsights, setAiInsights] = useState(true)
  const [autoScheduling, setAutoScheduling] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="glass-card border-border/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6 glass-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-bold text-primary">
                    CM
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2 bg-transparent">
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Coach" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Mike" className="bg-background/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="coach.mike@goodrunss.com" className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="(555) 123-4567" className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  defaultValue="Professional basketball trainer with 10+ years of experience. Specialized in shooting mechanics and defensive positioning."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 glass-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates about your sessions</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get push notifications on your device</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Reminders</Label>
                  <p className="text-sm text-muted-foreground">Reminders 1 hour before sessions</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Client Messages</Label>
                  <p className="text-sm text-muted-foreground">Notifications for new client messages</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="p-6 glass-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
            <div className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Current Plan</p>
                  <Button variant="outline" size="sm">
                    Upgrade
                  </Button>
                </div>
                <p className="text-2xl font-bold gradient-text">Pro Plan</p>
                <p className="text-sm text-muted-foreground mt-1">$49/month • Unlimited clients & sessions</p>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing History</Label>
                <div className="space-y-2">
                  {[
                    { date: "Oct 1, 2025", amount: "$49.00", status: "Paid" },
                    { date: "Sep 1, 2025", amount: "$49.00", status: "Paid" },
                    { date: "Aug 1, 2025", amount: "$49.00", status: "Paid" },
                  ].map((invoice, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">{invoice.status}</p>
                      </div>
                      <p className="font-semibold">{invoice.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 glass-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" className="bg-background/50" />
              </div>

              <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>

              <div className="pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="p-6 glass-card border-border/50 gradient-border glow-primary">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold gradient-text">GIA Assistant Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">Customize your AI assistant experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Insights</Label>
                  <p className="text-sm text-muted-foreground">Receive AI-powered business insights</p>
                </div>
                <Switch checked={aiInsights} onCheckedChange={setAiInsights} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Scheduling Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Let GIA suggest optimal session times</p>
                </div>
                <Switch checked={autoScheduling} onCheckedChange={setAutoScheduling} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Client Progress Analysis</Label>
                  <p className="text-sm text-muted-foreground">Automatic progress tracking and insights</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Revenue Optimization</Label>
                  <p className="text-sm text-muted-foreground">Get pricing and scheduling recommendations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="glow-primary bg-gradient-to-r from-primary to-accent">
                <Save className="h-4 w-4 mr-2" />
                Save AI Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
