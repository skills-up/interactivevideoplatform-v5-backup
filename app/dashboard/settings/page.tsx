"use client"

import type React from "react"

import { RequireAuth } from "@/components/auth/require-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Permission } from "@/lib/auth/permissions"
import { Loader2, Save } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    channelName: "My Channel",
    channelDescription: "This is my interactive video channel where I share educational content.",
    customDomain: "",
    defaultVisibility: "public",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    commentNotifications: true,
    subscriptionNotifications: true,
    marketingEmails: false,
  })

  const [monetizationSettings, setMonetizationSettings] = useState({
    stripeConnected: false,
    paypalConnected: false,
    defaultPrice: "9.99",
    autoRenewals: true,
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleMonetizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setMonetizationSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setMonetizationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      })
    }, 1000)
  }

  const connectStripe = () => {
    // In a real app, this would redirect to Stripe Connect
    window.open("https://dashboard.stripe.com/connect/accounts", "_blank")
  }

  const connectPaypal = () => {
    // In a real app, this would redirect to PayPal
    window.open("https://www.paypal.com/businessmanage/account/profile", "_blank")
  }

  return (
    <RequireAuth permission={Permission.CREATE_VIDEO}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 px-4 py-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <DashboardSidebar />
            <main className="flex-1">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Settings</h1>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="monetization">Monetization</TabsTrigger>
                  <TabsTrigger value="api">API & Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>Channel Settings</CardTitle>
                      <CardDescription>Manage your channel information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="channelName">Channel Name</Label>
                        <Input
                          id="channelName"
                          name="channelName"
                          value={generalSettings.channelName}
                          onChange={handleGeneralChange}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="channelDescription">Channel Description</Label>
                        <Textarea
                          id="channelDescription"
                          name="channelDescription"
                          value={generalSettings.channelDescription}
                          onChange={handleGeneralChange}
                          rows={4}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                        <Input
                          id="customDomain"
                          name="customDomain"
                          value={generalSettings.customDomain}
                          onChange={handleGeneralChange}
                          placeholder="videos.yourdomain.com"
                          disabled={isSaving}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use your own domain for your channel (requires DNS setup)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultVisibility">Default Video Visibility</Label>
                        <select
                          id="defaultVisibility"
                          name="defaultVisibility"
                          value={generalSettings.defaultVisibility}
                          onChange={handleGeneralChange}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={isSaving}
                        >
                          <option value="public">Public</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="private">Private</option>
                        </select>
                        <p className="text-xs text-muted-foreground">Default visibility setting for new videos</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Manage how and when you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Comment Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified when someone comments on your videos
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.commentNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("commentNotifications", checked)}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Subscription Notifications</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified when someone subscribes to your channel or series
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.subscriptionNotifications}
                          onCheckedChange={(checked) => handleNotificationChange("subscriptionNotifications", checked)}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Marketing Emails</h3>
                          <p className="text-sm text-muted-foreground">
                            Receive tips, product updates, and promotional content
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                          disabled={isSaving}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="monetization">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monetization Settings</CardTitle>
                      <CardDescription>Configure how you earn money from your content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Payment Processors</h3>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Stripe</h4>
                            <p className="text-sm text-muted-foreground">
                              {monetizationSettings.stripeConnected
                                ? "Connected to Stripe"
                                : "Connect your Stripe account to receive payments"}
                            </p>
                          </div>
                          <Button
                            variant={monetizationSettings.stripeConnected ? "outline" : "default"}
                            onClick={connectStripe}
                            disabled={isSaving}
                          >
                            {monetizationSettings.stripeConnected ? "Manage" : "Connect"}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">PayPal</h4>
                            <p className="text-sm text-muted-foreground">
                              {monetizationSettings.paypalConnected
                                ? "Connected to PayPal"
                                : "Connect your PayPal account as an alternative payment method"}
                            </p>
                          </div>
                          <Button
                            variant={monetizationSettings.paypalConnected ? "outline" : "default"}
                            onClick={connectPaypal}
                            disabled={isSaving}
                          >
                            {monetizationSettings.paypalConnected ? "Manage" : "Connect"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultPrice">Default Subscription Price ($)</Label>
                        <Input
                          id="defaultPrice"
                          name="defaultPrice"
                          type="number"
                          min="0.99"
                          step="0.01"
                          value={monetizationSettings.defaultPrice}
                          onChange={handleMonetizationChange}
                          placeholder="9.99"
                          disabled={isSaving}
                        />
                        <p className="text-xs text-muted-foreground">
                          Default monthly subscription price for new series
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Auto-Renewals</h3>
                          <p className="text-sm text-muted-foreground">Allow subscriptions to automatically renew</p>
                        </div>
                        <Switch
                          checked={monetizationSettings.autoRenewals}
                          onCheckedChange={(checked) => handleSwitchChange("autoRenewals", checked)}
                          disabled={isSaving}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="api">
                  <Card>
                    <CardHeader>
                      <CardTitle>API & Integrations</CardTitle>
                      <CardDescription>Manage API keys and third-party integrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">API Keys</h3>
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Public API Key</h4>
                              <p className="text-sm text-muted-foreground">Use this key for client-side applications</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Generate Key
                            </Button>
                          </div>
                          <div className="mt-2">
                            <Input value="pk_test_51Hb6uULMm5H89JkP..." readOnly className="font-mono text-sm" />
                          </div>
                        </div>

                        <div className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Secret API Key</h4>
                              <p className="text-sm text-muted-foreground">
                                Keep this key secure and only use it server-side
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Generate Key
                            </Button>
                          </div>
                          <div className="mt-2">
                            <Input
                              value="sk_test_51Hb6uULMm5H89JkP..."
                              type="password"
                              readOnly
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Integrations</h3>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Google Analytics</h4>
                            <p className="text-sm text-muted-foreground">Track user behavior with Google Analytics</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Connect
                          </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Zapier</h4>
                            <p className="text-sm text-muted-foreground">Automate workflows with Zapier</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Connect
                          </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Mailchimp</h4>
                            <p className="text-sm text-muted-foreground">Sync subscribers with your Mailchimp lists</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Connect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}

