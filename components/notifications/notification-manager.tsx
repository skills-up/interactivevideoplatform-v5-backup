"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BellOff, BellRing, Settings, Smartphone, Monitor, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

interface NotificationManagerProps {
  className?: string
}

export function NotificationManager({ className }: NotificationManagerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState({
    browser: {
      enabled: false,
      newVideos: true,
      comments: true,
      subscriptions: true,
      mentions: true,
    },
    mobile: {
      enabled: false,
      newVideos: true,
      comments: true,
      subscriptions: true,
      mentions: true,
    },
    email: {
      enabled: true,
      newVideos: true,
      comments: false,
      subscriptions: true,
      mentions: false,
      digest: "weekly", // none, daily, weekly
    },
  })
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session } = useSession()
  const { toast } = useToast()

  // Request browser notification permission
  const requestBrowserPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser does not support desktop notifications",
        variant: "destructive",
      })
      return
    }

    if (Notification.permission === "granted") {
      setNotificationSettings((prev) => ({
        ...prev,
        browser: {
          ...prev.browser,
          enabled: true,
        },
      }))
      return
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        setNotificationSettings((prev) => ({
          ...prev,
          browser: {
            ...prev.browser,
            enabled: true,
          },
        }))

        // Show a test notification
        new Notification("Notifications Enabled", {
          body: "You will now receive desktop notifications",
          icon: "/favicon.ico",
        })
      }
    }
  }

  // Fetch notification settings and notifications
  useEffect(() => {
    const fetchNotificationData = async () => {
      if (!session?.user) return

      setIsLoading(true)

      try {
        const [settingsResponse, notificationsResponse] = await Promise.all([
          fetch("/api/users/notification-settings"),
          fetch("/api/notifications"),
        ])

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setNotificationSettings(settingsData)
        }

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData.notifications || [])
          setUnreadCount(notificationsData.unreadCount || 0)
        }
      } catch (error) {
        console.error("Error fetching notification data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotificationData()

    // Check browser notification permission
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationSettings((prev) => ({
        ...prev,
        browser: {
          ...prev.browser,
          enabled: true,
        },
      }))
    }
  }, [session])

  // Update notification settings
  const updateSettings = async (newSettings: any) => {
    setNotificationSettings(newSettings)

    try {
      await fetch("/api/users/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      })

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error) {
      console.error("Error updating notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
      })

      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      )

      setUnreadCount(0)

      toast({
        title: "Notifications Marked as Read",
        description: "All notifications have been marked as read",
      })
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      })
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await fetch("/api/notifications/clear-all", {
        method: "DELETE",
      })

      setNotifications([])
      setUnreadCount(0)

      toast({
        title: "Notifications Cleared",
        description: "All notifications have been cleared",
      })
    } catch (error) {
      console.error("Error clearing notifications:", error)
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive",
      })
    }
  }

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className={className}>
      <Tabs defaultValue="notifications">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Notifications</CardTitle>
              <CardDescription>Stay updated with the latest activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BellOff className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${!notification.read ? "bg-muted/50" : ""}`}
                  >
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        {notification.icon || <BellRing className="h-5 w-5 text-primary" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                        {notification.actionUrl && (
                          <Button variant="link" className="p-0 h-auto text-xs mt-1" asChild>
                            <a href={notification.actionUrl}>{notification.actionText || "View"}</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            {notifications.length > 0 && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          {/* Browser Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Browser Notifications
                </CardTitle>
                <Switch
                  checked={notificationSettings.browser.enabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      requestBrowserPermission()
                    } else {
                      updateSettings({
                        ...notificationSettings,
                        browser: {
                          ...notificationSettings.browser,
                          enabled: false,
                        },
                      })
                    }
                  }}
                />
              </div>
              <CardDescription>Receive notifications in this browser when you're online</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-new-videos" className="flex-1">
                    New videos from subscriptions
                  </Label>
                  <Switch
                    id="browser-new-videos"
                    checked={notificationSettings.browser.newVideos}
                    disabled={!notificationSettings.browser.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        browser: {
                          ...notificationSettings.browser,
                          newVideos: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-comments" className="flex-1">
                    Comments on your videos
                  </Label>
                  <Switch
                    id="browser-comments"
                    checked={notificationSettings.browser.comments}
                    disabled={!notificationSettings.browser.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        browser: {
                          ...notificationSettings.browser,
                          comments: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-subscriptions" className="flex-1">
                    New subscribers
                  </Label>
                  <Switch
                    id="browser-subscriptions"
                    checked={notificationSettings.browser.subscriptions}
                    disabled={!notificationSettings.browser.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        browser: {
                          ...notificationSettings.browser,
                          subscriptions: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-mentions" className="flex-1">
                    Mentions and replies
                  </Label>
                  <Switch
                    id="browser-mentions"
                    checked={notificationSettings.browser.mentions}
                    disabled={!notificationSettings.browser.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        browser: {
                          ...notificationSettings.browser,
                          mentions: checked,
                        },
                      })
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Mobile Notifications
                </CardTitle>
                <Switch
                  checked={notificationSettings.mobile.enabled}
                  onCheckedChange={(checked) => {
                    updateSettings({
                      ...notificationSettings,
                      mobile: {
                        ...notificationSettings.mobile,
                        enabled: checked,
                      },
                    })
                  }}
                />
              </div>
              <CardDescription>Receive push notifications on your mobile devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-new-videos" className="flex-1">
                    New videos from subscriptions
                  </Label>
                  <Switch
                    id="mobile-new-videos"
                    checked={notificationSettings.mobile.newVideos}
                    disabled={!notificationSettings.mobile.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        mobile: {
                          ...notificationSettings.mobile,
                          newVideos: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-comments" className="flex-1">
                    Comments on your videos
                  </Label>
                  <Switch
                    id="mobile-comments"
                    checked={notificationSettings.mobile.comments}
                    disabled={!notificationSettings.mobile.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        mobile: {
                          ...notificationSettings.mobile,
                          comments: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-subscriptions" className="flex-1">
                    New subscribers
                  </Label>
                  <Switch
                    id="mobile-subscriptions"
                    checked={notificationSettings.mobile.subscriptions}
                    disabled={!notificationSettings.mobile.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        mobile: {
                          ...notificationSettings.mobile,
                          subscriptions: checked,
                        },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-mentions" className="flex-1">
                    Mentions and replies
                  </Label>
                  <Switch
                    id="mobile-mentions"
                    checked={notificationSettings.mobile.mentions}
                    disabled={!notificationSettings.mobile.enabled}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        ...notificationSettings,
                        mobile: {
                          ...notificationSettings.mobile,
                          mentions: checked,
                        },
                      })
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

