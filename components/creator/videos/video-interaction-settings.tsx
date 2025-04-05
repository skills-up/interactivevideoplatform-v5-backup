"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

interface VideoInteractionSettingsProps {
  videoId: string
}

export function VideoInteractionSettings({ videoId }: VideoInteractionSettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    behavior: {
      pauseOnInteraction: true,
      resumeAfterInteraction: true,
      skipAfterSeconds: 5,
      allowSkipping: true,
      showProgressBar: true,
      showCompletionStatus: true,
    },
    appearance: {
      defaultPosition: "center",
      animationIn: "fade",
      animationOut: "fade",
      backdropOpacity: 50,
      maxWidth: "500px",
      zIndex: 10,
    },
    analytics: {
      trackInteractions: true,
      trackCompletions: true,
      trackSkips: true,
      requireAuthentication: false,
    },
    accessibility: {
      keyboardNavigation: true,
      screenReaderSupport: true,
      highContrastMode: false,
      textToSpeech: false,
    },
  })

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/videos/${videoId}/interaction-settings`)

        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings(data.settings)
          }
        } else {
          toast({
            title: "Error loading settings",
            description: "Failed to load interaction settings",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      loadSettings()
    }
  }, [videoId])

  // Save settings
  const saveSettings = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/videos/${videoId}/interaction-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Interaction settings have been updated",
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error saving settings",
          description: data.error || "Failed to save interaction settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle behavior changes
  const handleBehaviorChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      behavior: {
        ...prev.behavior,
        [key]: value,
      },
    }))
  }

  // Handle appearance changes
  const handleAppearanceChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }))
  }

  // Handle analytics changes
  const handleAnalyticsChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [key]: value,
      },
    }))
  }

  // Handle accessibility changes
  const handleAccessibilityChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaction Settings</CardTitle>
        <CardDescription>Configure how interactions behave in your video</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="behavior">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pauseOnInteraction" className="font-medium">
                    Pause on Interaction
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically pause the video when an interaction appears
                  </p>
                </div>
                <Switch
                  id="pauseOnInteraction"
                  checked={settings.behavior.pauseOnInteraction}
                  onCheckedChange={(checked) => handleBehaviorChange("pauseOnInteraction", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="resumeAfterInteraction" className="font-medium">
                    Resume After Interaction
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically resume playback after an interaction is completed
                  </p>
                </div>
                <Switch
                  id="resumeAfterInteraction"
                  checked={settings.behavior.resumeAfterInteraction}
                  onCheckedChange={(checked) => handleBehaviorChange("resumeAfterInteraction", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowSkipping" className="font-medium">
                    Allow Skipping
                  </Label>
                  <p className="text-sm text-muted-foreground">Allow viewers to skip interactions</p>
                </div>
                <Switch
                  id="allowSkipping"
                  checked={settings.behavior.allowSkipping}
                  onCheckedChange={(checked) => handleBehaviorChange("allowSkipping", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skipAfterSeconds" className="font-medium">
                  Skip After (seconds)
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="skipAfterSeconds"
                    value={[settings.behavior.skipAfterSeconds]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => handleBehaviorChange("skipAfterSeconds", value[0])}
                    disabled={!settings.behavior.allowSkipping}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{settings.behavior.skipAfterSeconds}s</span>
                </div>
                <p className="text-sm text-muted-foreground">Time before the skip option appears</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showProgressBar" className="font-medium">
                    Show Progress Bar
                  </Label>
                  <p className="text-sm text-muted-foreground">Show interaction markers on the video progress bar</p>
                </div>
                <Switch
                  id="showProgressBar"
                  checked={settings.behavior.showProgressBar}
                  onCheckedChange={(checked) => handleBehaviorChange("showProgressBar", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showCompletionStatus" className="font-medium">
                    Show Completion Status
                  </Label>
                  <p className="text-sm text-muted-foreground">Show visual indicators for completed interactions</p>
                </div>
                <Switch
                  id="showCompletionStatus"
                  checked={settings.behavior.showCompletionStatus}
                  onCheckedChange={(checked) => handleBehaviorChange("showCompletionStatus", checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPosition" className="font-medium">
                  Default Position
                </Label>
                <Select
                  value={settings.appearance.defaultPosition}
                  onValueChange={(value) => handleAppearanceChange("defaultPosition", value)}
                >
                  <SelectTrigger id="defaultPosition">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Default position for interactions on the video</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animationIn" className="font-medium">
                  Animation In
                </Label>
                <Select
                  value={settings.appearance.animationIn}
                  onValueChange={(value) => handleAppearanceChange("animationIn", value)}
                >
                  <SelectTrigger id="animationIn">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide-up">Slide Up</SelectItem>
                    <SelectItem value="slide-down">Slide Down</SelectItem>
                    <SelectItem value="slide-left">Slide Left</SelectItem>
                    <SelectItem value="slide-right">Slide Right</SelectItem>
                    <SelectItem value="zoom-in">Zoom In</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Animation when interactions appear</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animationOut" className="font-medium">
                  Animation Out
                </Label>
                <Select
                  value={settings.appearance.animationOut}
                  onValueChange={(value) => handleAppearanceChange("animationOut", value)}
                >
                  <SelectTrigger id="animationOut">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide-up">Slide Up</SelectItem>
                    <SelectItem value="slide-down">Slide Down</SelectItem>
                    <SelectItem value="slide-left">Slide Left</SelectItem>
                    <SelectItem value="slide-right">Slide Right</SelectItem>
                    <SelectItem value="zoom-out">Zoom Out</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Animation when interactions disappear</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backdropOpacity" className="font-medium">
                  Backdrop Opacity
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="backdropOpacity"
                    value={[settings.appearance.backdropOpacity]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleAppearanceChange("backdropOpacity", value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{settings.appearance.backdropOpacity}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Opacity of the background behind interactions</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWidth" className="font-medium">
                  Max Width
                </Label>
                <Input
                  id="maxWidth"
                  value={settings.appearance.maxWidth}
                  onChange={(e) => handleAppearanceChange("maxWidth", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum width of interaction containers (e.g., 500px, 80%)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zIndex" className="font-medium">
                  Z-Index
                </Label>
                <Input
                  id="zIndex"
                  type="number"
                  value={settings.appearance.zIndex}
                  onChange={(e) => handleAppearanceChange("zIndex", Number.parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Stack order of interactions (higher numbers appear on top)
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trackInteractions" className="font-medium">
                    Track Interactions
                  </Label>
                  <p className="text-sm text-muted-foreground">Record when viewers encounter interactions</p>
                </div>
                <Switch
                  id="trackInteractions"
                  checked={settings.analytics.trackInteractions}
                  onCheckedChange={(checked) => handleAnalyticsChange("trackInteractions", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trackCompletions" className="font-medium">
                    Track Completions
                  </Label>
                  <p className="text-sm text-muted-foreground">Record when viewers complete interactions</p>
                </div>
                <Switch
                  id="trackCompletions"
                  checked={settings.analytics.trackCompletions}
                  onCheckedChange={(checked) => handleAnalyticsChange("trackCompletions", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="trackSkips" className="font-medium">
                    Track Skips
                  </Label>
                  <p className="text-sm text-muted-foreground">Record when viewers skip interactions</p>
                </div>
                <Switch
                  id="trackSkips"
                  checked={settings.analytics.trackSkips}
                  onCheckedChange={(checked) => handleAnalyticsChange("trackSkips", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireAuthentication" className="font-medium">
                    Require Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">Require viewers to be logged in to interact</p>
                </div>
                <Switch
                  id="requireAuthentication"
                  checked={settings.analytics.requireAuthentication}
                  onCheckedChange={(checked) => handleAnalyticsChange("requireAuthentication", checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="keyboardNavigation" className="font-medium">
                    Keyboard Navigation
                  </Label>
                  <p className="text-sm text-muted-foreground">Allow navigation through interactions using keyboard</p>
                </div>
                <Switch
                  id="keyboardNavigation"
                  checked={settings.accessibility.keyboardNavigation}
                  onCheckedChange={(checked) => handleAccessibilityChange("keyboardNavigation", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="screenReaderSupport" className="font-medium">
                    Screen Reader Support
                  </Label>
                  <p className="text-sm text-muted-foreground">Enhance compatibility with screen readers</p>
                </div>
                <Switch
                  id="screenReaderSupport"
                  checked={settings.accessibility.screenReaderSupport}
                  onCheckedChange={(checked) => handleAccessibilityChange("screenReaderSupport", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="highContrastMode" className="font-medium">
                    High Contrast Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="highContrastMode"
                  checked={settings.accessibility.highContrastMode}
                  onCheckedChange={(checked) => handleAccessibilityChange("highContrastMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="textToSpeech" className="font-medium">
                    Text to Speech
                  </Label>
                  <p className="text-sm text-muted-foreground">Read interaction content aloud</p>
                </div>
                <Switch
                  id="textToSpeech"
                  checked={settings.accessibility.textToSpeech}
                  onCheckedChange={(checked) => handleAccessibilityChange("textToSpeech", checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

