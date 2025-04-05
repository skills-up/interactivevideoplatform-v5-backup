"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Palette } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface InteractionStyleEditorProps {
  videoId: string
  interactionId: string
  initialStyle?: any
  onSave?: (style: any) => void
}

export function InteractionStyleEditor({ videoId, interactionId, initialStyle, onSave }: InteractionStyleEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [style, setStyle] = useState({
    position: "center",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#e2e8f0",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "0.5rem",
    padding: "1rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    fontFamily: "inherit",
    fontSize: "1rem",
    width: "100%",
    maxWidth: "500px",
    opacity: 1,
    optionStyle: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      borderColor: "#e2e8f0",
      borderRadius: "0.375rem",
      correctBackgroundColor: "#d1fae5",
      incorrectBackgroundColor: "#fee2e2",
    },
    poll: {
      barColor: "#3b82f6",
    },
  })

  // Load initial style if provided
  useEffect(() => {
    if (initialStyle) {
      setStyle((prev) => ({
        ...prev,
        ...initialStyle,
        optionStyle: {
          ...prev.optionStyle,
          ...initialStyle.optionStyle,
        },
        poll: {
          ...prev.poll,
          ...initialStyle.poll,
        },
      }))
    } else if (videoId && interactionId) {
      loadStyle()
    }
  }, [initialStyle, videoId, interactionId])

  // Load style from API
  const loadStyle = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/videos/${videoId}/interactions/${interactionId}/style`)

      if (response.ok) {
        const data = await response.json()
        if (data.style) {
          setStyle((prev) => ({
            ...prev,
            ...data.style,
            optionStyle: {
              ...prev.optionStyle,
              ...data.style.optionStyle,
            },
            poll: {
              ...prev.poll,
              ...data.style.poll,
            },
          }))
        }
      } else {
        toast({
          title: "Error loading style",
          description: "Failed to load interaction style",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading style:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save style
  const saveStyle = async () => {
    try {
      setIsSaving(true)

      if (onSave) {
        onSave(style)
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/videos/${videoId}/interactions/${interactionId}/style`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ style }),
      })

      if (response.ok) {
        toast({
          title: "Style saved",
          description: "Interaction style has been updated",
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error saving style",
          description: data.error || "Failed to save interaction style",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving style:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle style changes
  const handleStyleChange = (key: string, value: any) => {
    setStyle((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle option style changes
  const handleOptionStyleChange = (key: string, value: any) => {
    setStyle((prev) => ({
      ...prev,
      optionStyle: {
        ...prev.optionStyle,
        [key]: value,
      },
    }))
  }

  // Handle poll style changes
  const handlePollStyleChange = (key: string, value: any) => {
    setStyle((prev) => ({
      ...prev,
      poll: {
        ...prev.poll,
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
        <CardTitle>Interaction Style</CardTitle>
        <CardDescription>Customize the appearance of this interaction</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="position" className="font-medium">
                  Position
                </Label>
                <Select value={style.position} onValueChange={(value) => handleStyleChange("position", value)}>
                  <SelectTrigger id="position">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor" className="font-medium">
                  Background Color
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.backgroundColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#ffffff",
                            "#f8fafc",
                            "#f1f5f9",
                            "#e2e8f0",
                            "#cbd5e1",
                            "#94a3b8",
                            "#64748b",
                            "#475569",
                            "#334155",
                            "#1e293b",
                            "#0f172a",
                            "#020617",
                            "#ef4444",
                            "#f97316",
                            "#f59e0b",
                            "#eab308",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                            "#06b6d4",
                            "#0ea5e9",
                            "#3b82f6",
                            "#6366f1",
                            "#8b5cf6",
                            "#a855f7",
                            "#d946ef",
                            "#ec4899",
                            "#f43f5e",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleStyleChange("backgroundColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="backgroundColor"
                          value={style.backgroundColor}
                          onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="backgroundColor"
                    value={style.backgroundColor}
                    onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor" className="font-medium">
                  Text Color
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-10 h-10 p-0" style={{ backgroundColor: style.textColor }}>
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#000000",
                            "#ffffff",
                            "#f8fafc",
                            "#f1f5f9",
                            "#e2e8f0",
                            "#cbd5e1",
                            "#94a3b8",
                            "#64748b",
                            "#475569",
                            "#334155",
                            "#1e293b",
                            "#0f172a",
                            "#020617",
                            "#ef4444",
                            "#f97316",
                            "#f59e0b",
                            "#eab308",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                            "#06b6d4",
                            "#0ea5e9",
                            "#3b82f6",
                            "#6366f1",
                            "#8b5cf6",
                            "#a855f7",
                            "#d946ef",
                            "#ec4899",
                            "#f43f5e",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleStyleChange("textColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="textColor"
                          value={style.textColor}
                          onChange={(e) => handleStyleChange("textColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="textColor"
                    value={style.textColor}
                    onChange={(e) => handleStyleChange("textColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borderColor" className="font-medium">
                    Border Color
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-10 h-10 p-0"
                          style={{ backgroundColor: style.borderColor }}
                        >
                          <span className="sr-only">Pick a color</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-5 gap-1">
                            {[
                              "#ffffff",
                              "#f8fafc",
                              "#f1f5f9",
                              "#e2e8f0",
                              "#cbd5e1",
                              "#94a3b8",
                              "#64748b",
                              "#475569",
                              "#334155",
                              "#1e293b",
                              "#0f172a",
                              "#020617",
                              "#ef4444",
                              "#f97316",
                              "#f59e0b",
                              "#eab308",
                              "#84cc16",
                              "#22c55e",
                              "#10b981",
                              "#14b8a6",
                              "#06b6d4",
                              "#0ea5e9",
                              "#3b82f6",
                              "#6366f1",
                              "#8b5cf6",
                              "#a855f7",
                              "#d946ef",
                              "#ec4899",
                              "#f43f5e",
                            ].map((color) => (
                              <Button
                                key={color}
                                variant="outline"
                                className="w-8 h-8 p-0"
                                style={{ backgroundColor: color }}
                                onClick={() => handleStyleChange("borderColor", color)}
                              />
                            ))}
                          </div>
                          <Input
                            id="borderColor"
                            value={style.borderColor}
                            onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      id="borderColor"
                      value={style.borderColor}
                      onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderWidth" className="font-medium">
                    Border Width
                  </Label>
                  <Input
                    id="borderWidth"
                    value={style.borderWidth}
                    onChange={(e) => handleStyleChange("borderWidth", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borderStyle" className="font-medium">
                    Border Style
                  </Label>
                  <Select value={style.borderStyle} onValueChange={(value) => handleStyleChange("borderStyle", value)}>
                    <SelectTrigger id="borderStyle">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius" className="font-medium">
                    Border Radius
                  </Label>
                  <Input
                    id="borderRadius"
                    value={style.borderRadius}
                    onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="padding" className="font-medium">
                  Padding
                </Label>
                <Input
                  id="padding"
                  value={style.padding}
                  onChange={(e) => handleStyleChange("padding", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boxShadow" className="font-medium">
                  Box Shadow
                </Label>
                <Input
                  id="boxShadow"
                  value={style.boxShadow}
                  onChange={(e) => handleStyleChange("boxShadow", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opacity" className="font-medium">
                  Opacity
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="opacity"
                    value={[style.opacity * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleStyleChange("opacity", value[0] / 100)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{Math.round(style.opacity * 100)}%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily" className="font-medium">
                  Font Family
                </Label>
                <Select value={style.fontFamily} onValueChange={(value) => handleStyleChange("fontFamily", value)}>
                  <SelectTrigger id="fontFamily">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Default</SelectItem>
                    <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                    <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                    <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                    <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                    <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    <SelectItem value="'Source Sans Pro', sans-serif">Source Sans Pro</SelectItem>
                    <SelectItem value="'Roboto Mono', monospace">Roboto Mono</SelectItem>
                    <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize" className="font-medium">
                  Font Size
                </Label>
                <Input
                  id="fontSize"
                  value={style.fontSize}
                  onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width" className="font-medium">
                  Width
                </Label>
                <Input id="width" value={style.width} onChange={(e) => handleStyleChange("width", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWidth" className="font-medium">
                  Max Width
                </Label>
                <Input
                  id="maxWidth"
                  value={style.maxWidth}
                  onChange={(e) => handleStyleChange("maxWidth", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionBackgroundColor" className="font-medium">
                  Option Background Color
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.optionStyle.backgroundColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#ffffff",
                            "#f8fafc",
                            "#f1f5f9",
                            "#e2e8f0",
                            "#cbd5e1",
                            "#94a3b8",
                            "#64748b",
                            "#475569",
                            "#334155",
                            "#1e293b",
                            "#0f172a",
                            "#020617",
                            "#ef4444",
                            "#f97316",
                            "#f59e0b",
                            "#eab308",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                            "#06b6d4",
                            "#0ea5e9",
                            "#3b82f6",
                            "#6366f1",
                            "#8b5cf6",
                            "#a855f7",
                            "#d946ef",
                            "#ec4899",
                            "#f43f5e",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleOptionStyleChange("backgroundColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="optionBackgroundColor"
                          value={style.optionStyle.backgroundColor}
                          onChange={(e) => handleOptionStyleChange("backgroundColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="optionBackgroundColor"
                    value={style.optionStyle.backgroundColor}
                    onChange={(e) => handleOptionStyleChange("backgroundColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionTextColor" className="font-medium">
                  Option Text Color
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.optionStyle.textColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#000000",
                            "#ffffff",
                            "#f8fafc",
                            "#f1f5f9",
                            "#e2e8f0",
                            "#cbd5e1",
                            "#94a3b8",
                            "#64748b",
                            "#475569",
                            "#334155",
                            "#1e293b",
                            "#0f172a",
                            "#020617",
                            "#ef4444",
                            "#f97316",
                            "#f59e0b",
                            "#eab308",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                            "#06b6d4",
                            "#0ea5e9",
                            "#3b82f6",
                            "#6366f1",
                            "#8b5cf6",
                            "#a855f7",
                            "#d946ef",
                            "#ec4899",
                            "#f43f5e",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleOptionStyleChange("textColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="optionTextColor"
                          value={style.optionStyle.textColor}
                          onChange={(e) => handleOptionStyleChange("textColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="optionTextColor"
                    value={style.optionStyle.textColor}
                    onChange={(e) => handleOptionStyleChange("textColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionBorderColor" className="font-medium">
                  Option Border Color
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.optionStyle.borderColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#ffffff",
                            "#f8fafc",
                            "#f1f5f9",
                            "#e2e8f0",
                            "#cbd5e1",
                            "#94a3b8",
                            "#64748b",
                            "#475569",
                            "#334155",
                            "#1e293b",
                            "#0f172a",
                            "#020617",
                            "#ef4444",
                            "#f97316",
                            "#f59e0b",
                            "#eab308",
                            "#84cc16",
                            "#22c55e",
                            "#10b981",
                            "#14b8a6",
                            "#06b6d4",
                            "#0ea5e9",
                            "#3b82f6",
                            "#6366f1",
                            "#8b5cf6",
                            "#a855f7",
                            "#d946ef",
                            "#ec4899",
                            "#f43f5e",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleOptionStyleChange("borderColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="optionBorderColor"
                          value={style.optionStyle.borderColor}
                          onChange={(e) => handleOptionStyleChange("borderColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="optionBorderColor"
                    value={style.optionStyle.borderColor}
                    onChange={(e) => handleOptionStyleChange("borderColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionBorderRadius" className="font-medium">
                  Option Border Radius
                </Label>
                <Input
                  id="optionBorderRadius"
                  value={style.optionStyle.borderRadius}
                  onChange={(e) => handleOptionStyleChange("borderRadius", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correctBackgroundColor" className="font-medium">
                  Correct Answer Background
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.optionStyle.correctBackgroundColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#d1fae5",
                            "#a7f3d0",
                            "#6ee7b7",
                            "#34d399",
                            "#10b981",
                            "#059669",
                            "#047857",
                            "#065f46",
                            "#064e3b",
                            "#022c22",
                            "#ecfdf5",
                            "#d1fae5",
                            "#a7f3d0",
                            "#6ee7b7",
                            "#34d399",
                            "#10b981",
                            "#059669",
                            "#047857",
                            "#065f46",
                            "#064e3b",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleOptionStyleChange("correctBackgroundColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="correctBackgroundColor"
                          value={style.optionStyle.correctBackgroundColor}
                          onChange={(e) => handleOptionStyleChange("correctBackgroundColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="correctBackgroundColor"
                    value={style.optionStyle.correctBackgroundColor}
                    onChange={(e) => handleOptionStyleChange("correctBackgroundColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incorrectBackgroundColor" className="font-medium">
                  Incorrect Answer Background
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.optionStyle.incorrectBackgroundColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#fee2e2",
                            "#fecaca",
                            "#fca5a5",
                            "#f87171",
                            "#ef4444",
                            "#dc2626",
                            "#b91c1c",
                            "#991b1b",
                            "#7f1d1d",
                            "#450a0a",
                            "#fef2f2",
                            "#fee2e2",
                            "#fecaca",
                            "#fca5a5",
                            "#f87171",
                            "#ef4444",
                            "#dc2626",
                            "#b91c1c",
                            "#991b1b",
                            "#7f1d1d",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handleOptionStyleChange("incorrectBackgroundColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="incorrectBackgroundColor"
                          value={style.optionStyle.incorrectBackgroundColor}
                          onChange={(e) => handleOptionStyleChange("incorrectBackgroundColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="incorrectBackgroundColor"
                    value={style.optionStyle.incorrectBackgroundColor}
                    onChange={(e) => handleOptionStyleChange("incorrectBackgroundColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pollBarColor" className="font-medium">
                  Poll Bar Color
                </Label>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-0"
                        style={{ backgroundColor: style.poll.barColor }}
                      >
                        <span className="sr-only">Pick a color</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-5 gap-1">
                          {[
                            "#3b82f6",
                            "#2563eb",
                            "#1d4ed8",
                            "#1e40af",
                            "#1e3a8a",
                            "#dbeafe",
                            "#bfdbfe",
                            "#93c5fd",
                            "#60a5fa",
                            "#3b82f6",
                            "#2563eb",
                            "#1d4ed8",
                            "#1e40af",
                            "#1e3a8a",
                            "#172554",
                            "#0ea5e9",
                            "#0284c7",
                            "#0369a1",
                            "#075985",
                            "#0c4a6e",
                          ].map((color) => (
                            <Button
                              key={color}
                              variant="outline"
                              className="w-8 h-8 p-0"
                              style={{ backgroundColor: color }}
                              onClick={() => handlePollStyleChange("barColor", color)}
                            />
                          ))}
                        </div>
                        <Input
                          id="pollBarColor"
                          value={style.poll.barColor}
                          onChange={(e) => handlePollStyleChange("barColor", e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="pollBarColor"
                    value={style.poll.barColor}
                    onChange={(e) => handlePollStyleChange("barColor", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={saveStyle} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Palette className="mr-2 h-4 w-4" />
              Save Style
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

