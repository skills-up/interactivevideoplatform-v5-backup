"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Save } from 'lucide-react'

interface VideoSettings {
  pauseOnInteraction: boolean
  showFeedback: boolean
  autoAdvance: boolean
  defaultStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  defaultOptionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
}

interface VideoSettingsProps {
  videoId: string
  initialSettings?: VideoSettings
  onSave: (settings: VideoSettings) => void
}

export function VideoSettings({ videoId, initialSettings, onSave }: VideoSettingsProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<VideoSettings>(
    initialSettings || {
      pauseOnInteraction: true,
      showFeedback: true,
      autoAdvance: false,
      defaultStyle: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        borderColor: "#3b82f6",
        borderRadius: "0.5rem",
        fontSize: "1rem",
        padding: "1.5rem",
        opacity: "0.95",
      },
      defaultOptionStyle: {
        backgroundColor: "transparent",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        borderRadius: "0.25rem",
        hoverColor: "rgba(255, 255, 255, 0.2)",
      },
    }
  )

  const handleToggle = (field: keyof VideoSettings) => {
    setSettings({
      ...settings,
      [field]: !settings[field as keyof VideoSettings],
    })
  }

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, styleType: "defaultStyle" | "defaultOptionStyle") => {
    const { value } = e.target
    
    setSettings({
      ...settings,
      [styleType]: {
        ...settings[styleType],
        [field]: value,
      },
    })
  }

  const handleSave = () => {
    onSave(settings)
    toast({
      title: "Settings Saved",
      description: "Video interaction settings have been updated.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Interaction Settings</CardTitle>
        <CardDescription>
          Configure global settings for all interactions in this video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pauseOnInteraction">Pause on Interaction</Label>
              <p className="text-sm text-muted-foreground">
                Automatically pause the video when an interaction appears
              </p>
            </div>
            <Switch
              id="pauseOnInteraction"
              checked={settings.pauseOnInteraction}
              onCheckedChange={() => handleToggle("pauseOnInteraction")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showFeedback">Show Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Show feedback after answering quiz questions
              </p>
            </div>
            <Switch
              id="showFeedback"
              checked={settings.showFeedback}
              onCheckedChange={() => handleToggle("showFeedback")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoAdvance">Auto Advance</Label>
              <p className="text-sm text-muted-foreground">
                Automatically continue video after interaction
              </p>
            </div>
            <Switch
              id="autoAdvance"
              checked={settings.autoAdvance}
              onCheckedChange={() => handleToggle("autoAdvance")}
            />
          </div>
        </div>
        
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="style">Default Style</TabsTrigger>
            <TabsTrigger value="options">Option Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.backgroundColor">Background Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultStyle.backgroundColor" 
                    value={settings.defaultStyle?.backgroundColor || "rgba(0, 0, 0, 0.8)"} 
                    onChange={(e) => handleStyleChange(e, "backgroundColor", "defaultStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultStyle?.backgroundColor || "rgba(0, 0, 0, 0.8)" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.textColor">Text Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultStyle.textColor" 
                    value={settings.defaultStyle?.textColor || "#ffffff"} 
                    onChange={(e) => handleStyleChange(e, "textColor", "defaultStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultStyle?.textColor || "#ffffff" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.borderColor">Border Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultStyle.borderColor" 
                    value={settings.defaultStyle?.borderColor || "#3b82f6"} 
                    onChange={(e) => handleStyleChange(e, "borderColor", "defaultStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultStyle?.borderColor || "#3b82f6" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.borderRadius">Border Radius</Label>
                <Input 
                  id="defaultStyle.borderRadius" 
                  value={settings.defaultStyle?.borderRadius || "0.5rem"} 
                  onChange={(e) => handleStyleChange(e, "borderRadius", "defaultStyle")} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.fontSize">Font Size</Label>
                <Input 
                  id="defaultStyle.fontSize" 
                  value={settings.defaultStyle?.fontSize || "1rem"} 
                  onChange={(e) => handleStyleChange(e, "fontSize", "defaultStyle")} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.padding">Padding</Label>
                <Input 
                  id="defaultStyle.padding" 
                  value={settings.defaultStyle?.padding || "1.5rem"} 
                  onChange={(e) => handleStyleChange(e, "padding", "defaultStyle")} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultStyle.opacity">Opacity</Label>
                <Input 
                  id="defaultStyle.opacity" 
                  value={settings.defaultStyle?.opacity || "0.95"} 
                  onChange={(e) => handleStyleChange(e, "opacity", "defaultStyle")} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultOptionStyle.backgroundColor">Background Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultOptionStyle.backgroundColor" 
                    value={settings.defaultOptionStyle?.backgroundColor || "transparent"} 
                    onChange={(e) => handleStyleChange(e, "backgroundColor", "defaultOptionStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultOptionStyle?.backgroundColor || "transparent" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultOptionStyle.textColor">Text Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultOptionStyle.textColor" 
                    value={settings.defaultOptionStyle?.textColor || "#ffffff"} 
                    onChange={(e) => handleStyleChange(e, "textColor", "defaultOptionStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultOptionStyle?.textColor || "#ffffff" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultOptionStyle.borderColor">Border Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultOptionStyle.borderColor" 
                    value={settings.defaultOptionStyle?.borderColor || "#ffffff"} 
                    onChange={(e) => handleStyleChange(e, "borderColor", "defaultOptionStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultOptionStyle?.borderColor || "#ffffff" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultOptionStyle.borderRadius">Border Radius</Label>
                <Input 
                  id="defaultOptionStyle.borderRadius" 
                  value={settings.defaultOptionStyle?.borderRadius || "0.25rem"} 
                  onChange={(e) => handleStyleChange(e, "borderRadius", "defaultOptionStyle")} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultOptionStyle.hoverColor">Hover Color</Label>
                <div className="flex">
                  <Input 
                    id="defaultOptionStyle.hoverColor" 
                    value={settings.defaultOptionStyle?.hoverColor || "rgba(255, 255, 255, 0.2)"} 
                    onChange={(e) => handleStyleChange(e, "hoverColor", "defaultOptionStyle")} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: settings.defaultOptionStyle?.hoverColor || "rgba(255, 255, 255, 0.2)" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

