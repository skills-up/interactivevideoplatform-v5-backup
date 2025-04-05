"use client"

import type React from "react"

import { RequireAuth } from "@/components/auth/require-auth"
import { MainNav } from "@/components/main-nav"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { UserNav } from "@/components/user-nav"
import { ArrowLeft, Bell, CreditCard, Globe, Loader2, Lock, Save, User } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [profileSettings, setProfileSettings] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    website: "",
    location: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    commentNotifications: true,
    subscriptionNotifications: true,
    marketingEmails: false,
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    reducedMotion: false,
    highContrast: false,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAppearanceChange = (name: string, value: string | boolean) => {
    setAppearanceSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = (tab: string) => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings Saved",
        description: `Your ${tab} settings have been updated successfully`,
      })
    }, 1000)
  }

  const handleAvatarUpload = (imageUrl: string) => {
    // In a real app, you would update the user's avatar in your database
    console.log("Avatar uploaded:", imageUrl)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      })
    }, 1000)
  }

  const userRole = (session?.user as any)?.role || "viewer"

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <MainNav />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="container px-4 py-6">
            <div className="mb-6">
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your profile information and how others see you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
                        <AvatarUpload
                          initialImage={session?.user?.image || undefined}
                          name={session?.user?.name || undefined}
                          onUpload={handleAvatarUpload}
                        />

                        <div className="mt-6 flex-1 space-y-4 sm:mt-0">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={profileSettings.name}
                              onChange={handleProfileChange}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={profileSettings.email}
                              onChange={handleProfileChange}
                              disabled={true}
                              readOnly
                            />
                            <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileSettings.bio}
                          onChange={handleProfileChange}
                          placeholder="Tell others about yourself"
                          rows={4}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={profileSettings.website}
                            onChange={handleProfileChange}
                            placeholder="https://example.com"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={profileSettings.location}
                            onChange={handleProfileChange}
                            placeholder="City, Country"
                            disabled={isSaving}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => handleSaveSettings("profile")} disabled={isSaving}>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Type</CardTitle>
                        <CardDescription>Manage your account type and subscription</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-md border p-4">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium capitalize">{userRole}</h3>
                              <p className="text-sm text-muted-foreground">
                                {userRole === "creator"
                                  ? "You can create and publish interactive videos and series"
                                  : "You can watch videos and subscribe to series"}
                              </p>

                              {userRole !== "creator" && (
                                <Button className="mt-4" size="sm">
                                  Upgrade to Creator
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border p-4">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">Payment Methods</h3>
                              <p className="text-sm text-muted-foreground">
                                Manage your payment methods and billing information
                              </p>

                              <Button className="mt-4" size="sm" variant="outline">
                                Manage Payment Methods
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" disabled={isSaving} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" disabled={isSaving} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" disabled={isSaving} />
                          </div>

                          <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                              {isSaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Change Password
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Permanently delete your account and all of your content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border border-destructive p-4">
                          <h3 className="font-medium text-destructive">Delete Account</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Once you delete your account, there is no going back. All of your content will be
                            permanently deleted.
                          </p>
                          <Button variant="destructive" size="sm" className="mt-4">
                            Delete Account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Manage how and when you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Email Notifications</h3>
                              <p className="text-sm text-muted-foreground">
                                Receive email notifications for important updates
                              </p>
                            </div>
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
                            onCheckedChange={(checked) =>
                              handleNotificationChange("subscriptionNotifications", checked)
                            }
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
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => handleSaveSettings("notification")} disabled={isSaving}>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance Settings</CardTitle>
                      <CardDescription>Customize how InteractiveVid looks for you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">Theme</h3>
                            <p className="text-sm text-muted-foreground">Choose your preferred theme</p>

                            <div className="mt-4 grid grid-cols-3 gap-4">
                              <div
                                className={`flex cursor-pointer flex-col items-center rounded-md border p-3 transition-colors hover:bg-accent ${
                                  appearanceSettings.theme === "light" ? "border-primary bg-primary/10" : ""
                                }`}
                                onClick={() => handleAppearanceChange("theme", "light")}
                              >
                                <div className="mb-2 h-10 w-10 rounded-full bg-white"></div>
                                <span className="text-sm">Light</span>
                              </div>

                              <div
                                className={`flex cursor-pointer flex-col items-center rounded-md border p-3 transition-colors hover:bg-accent ${
                                  appearanceSettings.theme === "dark" ? "border-primary bg-primary/10" : ""
                                }`}
                                onClick={() => handleAppearanceChange("theme", "dark")}
                              >
                                <div className="mb-2 h-10 w-10 rounded-full bg-gray-900"></div>
                                <span className="text-sm">Dark</span>
                              </div>

                              <div
                                className={`flex cursor-pointer flex-col items-center rounded-md border p-3 transition-colors hover:bg-accent ${
                                  appearanceSettings.theme === "system" ? "border-primary bg-primary/10" : ""
                                }`}
                                onClick={() => handleAppearanceChange("theme", "system")}
                              >
                                <div className="mb-2 h-10 w-10 rounded-full bg-gradient-to-r from-white to-gray-900"></div>
                                <span className="text-sm">System</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Reduced Motion</h3>
                            <p className="text-sm text-muted-foreground">
                              Reduce the amount of animations and transitions
                            </p>
                          </div>
                          <Switch
                            checked={appearanceSettings.reducedMotion}
                            onCheckedChange={(checked) => handleAppearanceChange("reducedMotion", checked)}
                            disabled={isSaving}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">High Contrast</h3>
                            <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                          </div>
                          <Switch
                            checked={appearanceSettings.highContrast}
                            onCheckedChange={(checked) => handleAppearanceChange("highContrast", checked)}
                            disabled={isSaving}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => handleSaveSettings("appearance")} disabled={isSaving}>
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
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}

