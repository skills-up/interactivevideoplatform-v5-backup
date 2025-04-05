"use client"

import type React from "react"

import { useState } from "react"
import type { InteractionTemplate } from "@/types/interaction-template"
import type { InteractiveElementType } from "@/types/video"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2 } from "lucide-react"

interface TemplateFormProps {
  template?: InteractionTemplate
  onSubmit: (template: any) => void
  onCancel: () => void
  onDelete?: () => void
  isAdmin: boolean
}

const elementTypes: { value: InteractiveElementType; label: string }[] = [
  { value: "quiz", label: "Quiz" },
  { value: "poll", label: "Poll" },
  { value: "form", label: "Form" },
  { value: "link", label: "Link" },
  { value: "hotspot", label: "Hotspot" },
  { value: "note", label: "Note" },
  { value: "chapter", label: "Chapter" },
  { value: "product", label: "Product" },
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

const fontFamilyOptions = [
  { value: "Inter, sans-serif", label: "Inter (Sans-serif)" },
  { value: "Georgia, serif", label: "Georgia (Serif)" },
  { value: "Courier New, monospace", label: "Courier New (Monospace)" },
  { value: "Arial, sans-serif", label: "Arial (Sans-serif)" },
  { value: "Verdana, sans-serif", label: "Verdana (Sans-serif)" },
]

const animationOptions = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom", label: "Zoom" },
  { value: "bounce", label: "Bounce" },
]

export function TemplateForm({ template, onSubmit, onCancel, onDelete, isAdmin }: TemplateFormProps) {
  const [formData, setFormData] = useState<any>({
    name: template?.name || "",
    description: template?.description || "",
    type: template?.type || "quiz",
    style: {
      position: template?.style?.position || "center",
      size: template?.style?.size || "medium",
      backgroundColor: template?.style?.backgroundColor || "#ffffff",
      textColor: template?.style?.textColor || "#000000",
      borderColor: template?.style?.borderColor || "#cccccc",
      borderRadius: template?.style?.borderRadius || 8,
      opacity: template?.style?.opacity || 1,
      fontFamily: template?.style?.fontFamily || "Inter, sans-serif",
      fontSize: template?.style?.fontSize || 16,
      padding: template?.style?.padding || 16,
      animation: template?.style?.animation || "none",
      shadow: template?.style?.shadow || false,
      customCss: template?.style?.customCss || "",
    },
    options: template?.options || {},
    feedback: template?.feedback || {},
    isGlobal: template?.isGlobal || false,
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStyleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{template ? "Edit Template" : "Create Template"}</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Element Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                  disabled={!!template}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {elementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onCheckedChange={(checked) => handleChange("isGlobal", checked)}
                />
                <Label htmlFor="isGlobal">Make this template available to all users</Label>
              </div>
            )}
          </div>

          <Tabs defaultValue="style">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.style.position}
                    onValueChange={(value) => handleStyleChange("position", value)}
                  >
                    <SelectTrigger id="position">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.style.size} onValueChange={(value) => handleStyleChange("size", value)}>
                    <SelectTrigger id="size">
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
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <ColorPicker
                    color={formData.style.backgroundColor}
                    onChange={(color) => handleStyleChange("backgroundColor", color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <ColorPicker
                    color={formData.style.textColor}
                    onChange={(color) => handleStyleChange("textColor", color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <ColorPicker
                    color={formData.style.borderColor}
                    onChange={(color) => handleStyleChange("borderColor", color)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Border Radius: {formData.style.borderRadius}px</Label>
                <Slider
                  value={[formData.style.borderRadius]}
                  min={0}
                  max={24}
                  step={1}
                  onValueChange={(value) => handleStyleChange("borderRadius", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Opacity: {formData.style.opacity}</Label>
                <Slider
                  value={[formData.style.opacity]}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onValueChange={(value) => handleStyleChange("opacity", value[0])}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select
                    value={formData.style.fontFamily}
                    onValueChange={(value) => handleStyleChange("fontFamily", value)}
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {formData.style.fontSize}px</Label>
                  <Slider
                    value={[formData.style.fontSize]}
                    min={12}
                    max={32}
                    step={1}
                    onValueChange={(value) => handleStyleChange("fontSize", value[0])}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Padding: {formData.style.padding}px</Label>
                  <Slider
                    value={[formData.style.padding]}
                    min={0}
                    max={32}
                    step={2}
                    onValueChange={(value) => handleStyleChange("padding", value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation">Animation</Label>
                  <Select
                    value={formData.style.animation}
                    onValueChange={(value) => handleStyleChange("animation", value)}
                  >
                    <SelectTrigger id="animation">
                      <SelectValue placeholder="Select animation" />
                    </SelectTrigger>
                    <SelectContent>
                      {animationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="shadow"
                  checked={formData.style.shadow}
                  onCheckedChange={(checked) => handleStyleChange("shadow", checked)}
                />
                <Label htmlFor="shadow">Add shadow effect</Label>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              <div className="bg-muted rounded-md p-8 flex items-center justify-center">
                <div
                  className="w-full max-w-md p-4 flex items-center justify-center"
                  style={{
                    backgroundColor: formData.style.backgroundColor,
                    color: formData.style.textColor,
                    borderRadius: `${formData.style.borderRadius}px`,
                    border: `1px solid ${formData.style.borderColor}`,
                    opacity: formData.style.opacity,
                    fontFamily: formData.style.fontFamily,
                    fontSize: `${formData.style.fontSize}px`,
                    padding: `${formData.style.padding}px`,
                    boxShadow: formData.style.shadow ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
                  }}
                >
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Preview: {formData.type}</h3>
                    <p>This is how your interaction will look</p>
                    {formData.type === "quiz" && (
                      <div className="mt-4">
                        <p className="font-bold mb-2">Sample Question</p>
                        <div className="flex flex-col space-y-2 mt-2">
                          <button className="px-4 py-2 border rounded hover:bg-opacity-10 hover:bg-black">
                            Option 1
                          </button>
                          <button className="px-4 py-2 border rounded hover:bg-opacity-10 hover:bg-black">
                            Option 2
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={formData.style.customCss}
                  onChange={(e) => handleStyleChange("customCss", e.target.value)}
                  rows={5}
                  placeholder=".element-container { /* your custom styles */ }"
                />
                <p className="text-xs text-muted-foreground">
                  Advanced: Add custom CSS to further customize the appearance.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            {template && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the template.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{template ? "Update Template" : "Create Template"}</Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}

