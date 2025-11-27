"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, Calendar, MessageSquare, Users, Award, MapPin, Trash2 } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "booking",
    title: "Booking Confirmed",
    message: "Your session with Coach Marcus is confirmed for tomorrow at 3 PM",
    time: "5 min ago",
    read: false,
    icon: Calendar,
    color: "blue",
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "Sarah Chen sent you a message about the pickup game",
    time: "1 hour ago",
    read: false,
    icon: MessageSquare,
    color: "green",
  },
  {
    id: 3,
    type: "game",
    title: "Game Starting Soon",
    message: "Your pickup game at Rucker Park starts in 30 minutes",
    time: "2 hours ago",
    read: true,
    icon: Users,
    color: "purple",
  },
  {
    id: 4,
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "You've earned the 'Week Warrior' badge for a 7-day streak",
    time: "1 day ago",
    read: true,
    icon: Award,
    color: "yellow",
  },
  {
    id: 5,
    type: "court",
    title: "Court Update",
    message: "West 4th Street Courts is now open after maintenance",
    time: "2 days ago",
    read: true,
    icon: MapPin,
    color: "orange",
  },
]

export function NotificationsScreen() {
  const router = useRouter()
  const [notificationList, setNotificationList] = useState(notifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = notificationList.filter((n) => !n.read).length

  const filteredNotifications = filter === "unread" ? notificationList.filter((n) => !n.read) : notificationList

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="glass-card border-b border-border/50 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-lg flex-1">Notifications</h1>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-primary">
                Mark all read
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
              className={filter === "unread" ? "bg-gradient-to-r from-primary to-accent" : "glass-card"}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="glass-card border-primary/30 p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread" ? "You're all caught up!" : "You don't have any notifications yet"}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon
            return (
              <Card
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`glass-card border-primary/30 p-4 cursor-pointer hover:border-primary/50 transition-all ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 bg-${notification.color}-500/20 rounded-lg h-fit`}>
                    <Icon className={`h-5 w-5 text-${notification.color}-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      {!notification.read && <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="h-auto p-1 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
