"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { VideoSettings } from "@/types/video"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface VideoSettingsFormProps {
  videoId: string
  initialSettings: VideoSettings
  videoTitle: string
}

const displayModeOptions = [
  { value: "overlay", label: "Overlay on Video" },
  { value: "sidebar", label: "Sidebar Next to Video" },
  { value: "pause", label: "Pause and Show Full Screen" },
]

const positionOptions = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "center-left", label: "Center Left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
]

const sizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "full", label: "Full Width" },
]

export function VideoSettingsForm({ videoId, initialSettings, videoTitle }: VideoSettingsFormProps) {
  const [settings, setSettings] = useState<VideoSettings>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (field: keyof VideoSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/videos/${videoId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update video settings")
      }

      toast({
        title: "Settings Saved",
        description: "Your video settings have been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Video Settings</h1>
            <p className="text-muted-foreground">Configure interaction settings for "{videoTitle}"</p>
          </div>

          <Button type="button" variant="outline" onClick={() => router.push(`/creator/videos/${videoId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Video
          </Button>
        </div>

        <Tabs defaultValue="behavior">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Interaction Behavior</CardTitle>
                <CardDescription>Configure how interactions behave during video playback</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pauseOnInteraction" className="flex-1">
                      <div>Pause on Interaction</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically pause the video when an interaction appears
                      </div>
                    </Label>
                    <Switch
                      id="pauseOnInteraction"
                      checked={settings.pauseOnInteraction}
                      onCheckedChange={(checked) => handleChange("pauseOnInteraction", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoPlayInteractions" className="flex-1">
                      <div>Auto-Play Interactions</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically show interactions at their timestamp
                      </div>
                    </Label>
                    <Switch
                      id="autoPlayInteractions"
                      checked={settings.autoPlayInteractions}
                      onCheckedChange={(checked) => handleChange("autoPlayInteractions", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFeedbackImmediately" className="flex-1">
                      <div>Show Feedback Immediately</div>
                      <div className="text-sm text-muted-foreground">
                        Show feedback right after user responds to an interaction
                      </div>
                    </Label>
                    <Switch
                      id="showFeedbackImmediately"
                      checked={settings.showFeedbackImmediately}
                      onCheckedChange={(checked) => handleChange("showFeedbackImmediately", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowSkipping" className="flex-1">
                      <div>Allow Skipping Interactions</div>
                      <div className="text-sm text-muted-foreground">
                        Allow viewers to skip interactions without responding
                      </div>
                    </Label>
                    <Switch
                      id="allowSkipping"
                      checked={settings.allowSkipping}
                      onCheckedChange={(checked) => handleChange("allowSkipping", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireInteractionCompletion" className="flex-1">
                      <div>Require Interaction Completion</div>
                      <div className="text-sm text-muted-foreground">
                        Viewers must complete all interactions to finish the video
                      </div>
                    </Label>
                    <Switch
                      id="requireInteractionCompletion"
                      checked={settings.requireInteractionCompletion}
                      onCheckedChange={(checked) => handleChange("requireInteractionCompletion", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Interaction Duration: {settings.defaultInteractionDuration} seconds</Label>
                  <Slider
                    value={[settings.defaultInteractionDuration]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={(value) => handleChange("defaultInteractionDuration", value[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    How long interactions appear by default if no duration is specified
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Interaction Appearance</CardTitle>
                <CardDescription>Configure how interactions look and where they appear</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="interactionDisplayMode">Display Mode</Label>
                  <Select
                    value={settings.interactionDisplayMode}
                    onValueChange={(value: "overlay" | "sidebar" | "pause") =>
                      handleChange("interactionDisplayMode", value)
                    }
                  >
                    <SelectTrigger id="interactionDisplayMode">
                      <SelectValue placeholder="Select display mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayModeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How interactions are displayed relative to the video content
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interactionPosition">Default Position</Label>
                  <Select
                    value={settings.interactionPosition}
                    onValueChange={(value) => handleChange("interactionPosition", value)}
                  >
                    <SelectTrigger id="interactionPosition">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Default position for interactions that don't specify a position
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interactionSize">Default Size</Label>
                  <Select
                    value={settings.interactionSize}
                    onValueChange={(value) => handleChange("interactionSize", value)}
                  >
                    <SelectTrigger id="interactionSize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Default size for interactions that don't specify a size
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-1">⟳</span> Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" /> Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

