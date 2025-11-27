"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Calendar,
  Mail,
  Phone,
  Instagram,
  Map,
  Video,
  Bell,
  Globe,
  Share2,
  Check,
  X,
  ExternalLink,
  SettingsIcon,
  Zap,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  icon: any
  description: string
  connected: boolean
  lastSync?: string
}

export function SettingsScreen() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "calendar",
      name: "Google Calendar",
      icon: Calendar,
      description: "Auto-sync bookings to your calendar",
      connected: true,
      lastSync: "5 min ago",
    },
    {
      id: "email",
      name: "Email Notifications",
      icon: Mail,
      description: "Get booking confirmations & reminders",
      connected: true,
    },
    {
      id: "sms",
      name: "SMS Reminders",
      icon: Phone,
      description: "Never miss a session with text alerts",
      connected: false,
    },
    {
      id: "instagram",
      name: "Instagram Sharing",
      icon: Instagram,
      description: "Auto-share achievements",
      connected: false,
    },
    { id: "maps", name: "Google Maps", icon: Map, description: "Directions & Navigation", connected: true },
    { id: "zoom", name: "Zoom", icon: Video, description: "Virtual Training", connected: false },
  ])

  const [emailSettings, setEmailSettings] = useState({
    email: "user@example.com",
    bookingConfirmations: true,
    reminders24h: true,
    reminders1h: true,
    achievements: false,
    weeklyDigest: true,
  })

  const [smsSettings, setSmsSettings] = useState({
    phone: "",
    verified: false,
    bookingConfirmations: true,
    sessionReminders: true,
    courtAlerts: false,
  })

  const [notificationPrefs, setNotificationPrefs] = useState({
    allNotifications: true,
    email: true,
    sms: false,
    push: true,
    quietHours: false,
    quietStart: "21:00",
    quietEnd: "08:00",
    frequency: "realtime",
  })

  const [virtualTraining, setVirtualTraining] = useState({
    enabled: false,
    hourlyRate: 50,
    requireVideo: true,
    screenSharing: true,
    recordSessions: false,
  })

  const [achievementSharing, setAchievementSharing] = useState({
    autoShare: false,
    tagLocation: true,
    includeStats: true,
  })

  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map((int) => (int.id === id ? { ...int, connected: !int.connected } : int)))
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-primary/20 px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Settings & Integrations</h1>
        </div>
        <p className="text-sm text-muted-foreground">Connect your favorite apps to enhance your GoodRunss experience</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Integration Hub */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Integration Hub
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Google Calendar */}
            <Card className="glass-card p-4 border-primary/30 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Google Calendar</h3>
                    {integrations.find((i) => i.id === "calendar")?.connected && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Auto-sync bookings to your calendar</p>

              {integrations.find((i) => i.id === "calendar")?.connected ? (
                <>
                  <p className="text-xs text-muted-foreground mb-3">Last sync: 5 min ago</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Auto-add bookings</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium">Upcoming Events:</p>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>• Training Session - Today 3PM</div>
                      <div>• Court Booking - Tomorrow 10AM</div>
                      <div>• Team Practice - Friday 6PM</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Manage
                  </Button>
                </>
              ) : (
                <Button className="w-full" onClick={() => toggleIntegration("calendar")}>
                  Connect
                </Button>
              )}
            </Card>

            {/* Email Notifications */}
            <Card className="glass-card p-4 border-primary/30 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Notifications</h3>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Get booking confirmations & reminders</p>

              <Input
                type="email"
                value={emailSettings.email}
                onChange={(e) => setEmailSettings({ ...emailSettings, email: e.target.value })}
                className="mb-3"
              />

              <div className="space-y-2 mb-3">
                <label className="flex items-center justify-between text-sm">
                  <span>Booking confirmations</span>
                  <Switch
                    checked={emailSettings.bookingConfirmations}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, bookingConfirmations: checked })}
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>24-hour reminders</span>
                  <Switch
                    checked={emailSettings.reminders24h}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, reminders24h: checked })}
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>1-hour reminders</span>
                  <Switch
                    checked={emailSettings.reminders1h}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, reminders1h: checked })}
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Achievement notifications</span>
                  <Switch
                    checked={emailSettings.achievements}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, achievements: checked })}
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Weekly digest</span>
                  <Switch
                    checked={emailSettings.weeklyDigest}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, weeklyDigest: checked })}
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Test Email
                </Button>
                <Button size="sm" className="flex-1">
                  Save
                </Button>
              </div>
            </Card>

            {/* SMS Notifications */}
            <Card className="glass-card p-4 border-primary/30 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">SMS Reminders</h3>
                    {!smsSettings.verified && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <X className="w-3 h-3" /> Not Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Never miss a session with text alerts</p>

              <div className="flex gap-2 mb-3">
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={smsSettings.phone}
                  onChange={(e) => setSmsSettings({ ...smsSettings, phone: e.target.value })}
                  className="flex-1"
                />
                <Button size="sm" onClick={() => setShowVerifyModal(true)} disabled={!smsSettings.phone}>
                  Verify
                </Button>
              </div>

              {smsSettings.verified && (
                <div className="space-y-2 mb-3">
                  <label className="flex items-center justify-between text-sm">
                    <span>Booking confirmations</span>
                    <Switch
                      checked={smsSettings.bookingConfirmations}
                      onCheckedChange={(checked) => setSmsSettings({ ...smsSettings, bookingConfirmations: checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span>Session reminders</span>
                    <Switch
                      checked={smsSettings.sessionReminders}
                      onCheckedChange={(checked) => setSmsSettings({ ...smsSettings, sessionReminders: checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span>Court alerts</span>
                    <Switch
                      checked={smsSettings.courtAlerts}
                      onCheckedChange={(checked) => setSmsSettings({ ...smsSettings, courtAlerts: checked })}
                    />
                  </label>
                </div>
              )}

              <Button className="w-full" disabled={!smsSettings.verified}>
                Save
              </Button>
            </Card>

            {/* Instagram */}
            <Card className="glass-card p-4 border-primary/30 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instagram Sharing</h3>
                    {!integrations.find((i) => i.id === "instagram")?.connected && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <X className="w-3 h-3" /> Not Connected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Auto-share achievements</p>

              {!integrations.find((i) => i.id === "instagram")?.connected ? (
                <>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Auto-share achievements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Earn +10 bonus points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Build your fitness brand</span>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => toggleIntegration("instagram")}>
                    Connect Instagram
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="text-sm font-medium">@username</p>
                    <p className="text-xs text-muted-foreground">12 posts shared</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm">Auto-share</span>
                    <Switch defaultChecked />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => toggleIntegration("instagram")}
                  >
                    Disconnect
                  </Button>
                </>
              )}
            </Card>

            {/* Google Maps */}
            <Card className="glass-card p-4 border-primary/30 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Map className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Google Maps</h3>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Always Available
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Directions & Navigation</p>

              <div className="space-y-3 mb-3">
                <div>
                  <p className="text-sm font-medium mb-2">Transport preference:</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Driving
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      Walking
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      Biking
                    </Button>
                  </div>
                </div>
                <label className="flex items-center justify-between text-sm">
                  <span>Show traffic</span>
                  <Switch defaultChecked />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Avoid tolls</span>
                  <Switch />
                </label>
              </div>
            </Card>

            {/* Zoom */}
            <Card className="glass-card p-4 border-primary/30 hover:border-primary/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Zoom</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">NEW - Go Global!</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Virtual Training</p>

              {!integrations.find((i) => i.id === "zoom")?.connected ? (
                <>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Train worldwide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>Auto-recorded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>HD quality</span>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => toggleIntegration("zoom")}>
                    Enable Zoom
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">8 virtual sessions completed</p>
                  </div>
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center justify-between text-sm">
                      <span>Recording</span>
                      <Switch defaultChecked />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      <span>Waiting room</span>
                      <Switch />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Test Meeting
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleIntegration("zoom")}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </section>

        {/* Notification Preferences */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </h2>

          <Card className="glass-card p-4 border-primary/30">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="font-medium">All Notifications</span>
                <Switch
                  checked={notificationPrefs.allNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs({ ...notificationPrefs, allNotifications: checked })
                  }
                />
              </label>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <Switch
                    checked={notificationPrefs.email}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email: checked })}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">SMS</span>
                  <Switch
                    checked={notificationPrefs.sms}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, sms: checked })}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Push</span>
                  <Switch
                    checked={notificationPrefs.push}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, push: checked })}
                  />
                </label>
              </div>

              <div className="border-t border-primary/20 pt-4">
                <label className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">Quiet Hours</p>
                    <p className="text-xs text-muted-foreground">Pause notifications during sleep</p>
                  </div>
                  <Switch
                    checked={notificationPrefs.quietHours}
                    onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, quietHours: checked })}
                  />
                </label>

                {notificationPrefs.quietHours && (
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">From</label>
                      <Input
                        type="time"
                        value={notificationPrefs.quietStart}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, quietStart: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">To</label>
                      <Input
                        type="time"
                        value={notificationPrefs.quietEnd}
                        onChange={(e) => setNotificationPrefs({ ...notificationPrefs, quietEnd: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-primary/20 pt-4">
                <p className="font-medium mb-3">Frequency</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="realtime"
                      checked={notificationPrefs.frequency === "realtime"}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, frequency: e.target.value })}
                      className="text-primary"
                    />
                    <span className="text-sm">Real-time</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={notificationPrefs.frequency === "daily"}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, frequency: e.target.value })}
                      className="text-primary"
                    />
                    <span className="text-sm">Daily digest</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="frequency"
                      value="important"
                      checked={notificationPrefs.frequency === "important"}
                      onChange={(e) => setNotificationPrefs({ ...notificationPrefs, frequency: e.target.value })}
                      className="text-primary"
                    />
                    <span className="text-sm">Important only</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Virtual Training Setup */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Virtual Training Settings
          </h2>

          <Card className="glass-card p-4 border-primary/30">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Available for virtual training</p>
                  <p className="text-xs text-muted-foreground">Train clients worldwide via Zoom</p>
                </div>
                <Switch
                  checked={virtualTraining.enabled}
                  onCheckedChange={(checked) => setVirtualTraining({ ...virtualTraining, enabled: checked })}
                />
              </label>

              {virtualTraining.enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hourly Rate</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">$</span>
                      <Input
                        type="number"
                        value={virtualTraining.hourlyRate}
                        onChange={(e) =>
                          setVirtualTraining({ ...virtualTraining, hourlyRate: Number.parseInt(e.target.value) })
                        }
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">/hour</span>
                    </div>
                  </div>

                  <div className="border-t border-primary/20 pt-4">
                    <p className="font-medium mb-3">Meeting Preferences</p>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-sm">
                        <span>Require video</span>
                        <Switch
                          checked={virtualTraining.requireVideo}
                          onCheckedChange={(checked) =>
                            setVirtualTraining({ ...virtualTraining, requireVideo: checked })
                          }
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm">
                        <span>Screen sharing</span>
                        <Switch
                          checked={virtualTraining.screenSharing}
                          onCheckedChange={(checked) =>
                            setVirtualTraining({ ...virtualTraining, screenSharing: checked })
                          }
                        />
                      </label>
                      <label className="flex items-center justify-between text-sm">
                        <span>Record sessions</span>
                        <Switch
                          checked={virtualTraining.recordSessions}
                          onCheckedChange={(checked) =>
                            setVirtualTraining({ ...virtualTraining, recordSessions: checked })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-primary/20 pt-4">
                    <p className="font-medium mb-3">Weekly Availability</p>
                    <div className="grid grid-cols-7 gap-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <Button key={i} variant={i < 5 ? "default" : "outline"} size="sm" className="aspect-square p-0">
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </section>

        {/* Achievement Sharing */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Wins
          </h2>

          <Card className="glass-card p-4 border-primary/30">
            <div className="space-y-4">
              {/* Sample Achievement Preview */}
              <div className="glass-card p-4 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <h3 className="font-semibold">First Win!</h3>
                    <p className="text-xs text-muted-foreground">+50 points • @username</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Just earned my first achievement on GoodRunss! 🎉</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <img src="/goodrunss-logo.png" alt="GoodRunss" className="w-4 h-4 invert mix-blend-screen" />
                  <span>via GoodRunss</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Instagram className="w-4 h-4" />
                  Instagram Feed
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Instagram className="w-4 h-4" />
                  Stories
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ExternalLink className="w-4 h-4" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Share2 className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>

              {/* Settings */}
              <div className="border-t border-primary/20 pt-4 space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span>Auto-share achievements</span>
                  <Switch
                    checked={achievementSharing.autoShare}
                    onCheckedChange={(checked) => setAchievementSharing({ ...achievementSharing, autoShare: checked })}
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Tag location</span>
                  <Switch
                    checked={achievementSharing.tagLocation}
                    onCheckedChange={(checked) =>
                      setAchievementSharing({ ...achievementSharing, tagLocation: checked })
                    }
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Include stats</span>
                  <Switch
                    checked={achievementSharing.includeStats}
                    onCheckedChange={(checked) =>
                      setAchievementSharing({ ...achievementSharing, includeStats: checked })
                    }
                  />
                </label>
              </div>

              {/* Caption Template */}
              <div className="border-t border-primary/20 pt-4">
                <label className="text-sm font-medium mb-2 block">Caption Template</label>
                <textarea
                  className="w-full bg-background/50 border border-primary/30 rounded-lg p-3 text-sm"
                  rows={3}
                  placeholder="Just earned {achievement} on GoodRunss! 🎉 #{sport} #fitness"
                />
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 glass-card border-t border-primary/20">
        <Button className="w-full glow-primary">Save All Changes</Button>
      </div>

      {/* SMS Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="glass-card p-6 border-primary/30 max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-2">Verify Phone Number</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code sent to {smsSettings.phone}</p>

            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-center text-2xl tracking-widest mb-4"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setShowVerifyModal(false)
                  setVerificationCode("")
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setSmsSettings({ ...smsSettings, verified: true })
                  setShowVerifyModal(false)
                  setVerificationCode("")
                }}
                disabled={verificationCode.length !== 6}
              >
                Verify
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
