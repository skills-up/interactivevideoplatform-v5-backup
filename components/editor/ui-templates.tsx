"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Check, Layout, Palette } from 'lucide-react'
import Image from "next/image"

interface UITemplate {
  id: string
  name: string
  description: string
  preview: string
  theme: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  layout: "default" | "minimal" | "centered" | "sidebar" | "fullscreen"
}

interface UITemplatesProps {
  onSelectTemplate: (template: UITemplate) => void
}

export function UITemplates({ onSelectTemplate }: UITemplatesProps) {
  const { toast } = useToast()
  const [templates] = useState<UITemplate[]>([
    {
      id: "default",
      name: "Default",
      description: "Standard layout with sidebar navigation",
      preview: "/placeholder.svg?height=200&width=300",
      theme: {
        primary: "#3b82f6",
        secondary: "#10b981",
        background: "#ffffff",
        text: "#1e293b",
        accent: "#f43f5e",
      },
      layout: "default",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean, minimalist interface with reduced UI elements",
      preview: "/placeholder.svg?height=200&width=300",
      theme: {
        primary: "#0f172a",
        secondary: "#64748b",
        background: "#f8fafc",
        text: "#334155",
        accent: "#0ea5e9",
      },
      layout: "minimal",
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Dark theme with vibrant accent colors",
      preview: "/placeholder.svg?height=200&width=300",
      theme: {
        primary: "#8b5cf6",
        secondary: "#6366f1",
        background: "#1e1e2e",
        text: "#e2e8f0",
        accent: "#f43f5e",
      },
      layout: "default",
    },
    {
      id: "centered",
      name: "Centered",
      description: "Content-focused layout with centered elements",
      preview: "/placeholder.svg?height=200&width=300",
      theme: {
        primary: "#06b6d4",
        secondary: "#0ea5e9",
        background: "#ffffff",
        text: "#0f172a",
        accent: "#8b5cf6",
      },
      layout: "centered",
    },
    {
      id: "fullscreen",
      name: "Fullscreen",
      description: "Immersive fullscreen layout for video content",
      preview: "/placeholder.svg?height=200&width=300",
      theme: {
        primary: "#1e293b",
        secondary: "#475569",
        background: "#0f172a",
        text: "#f8fafc",
        accent: "#f59e0b",
      },
      layout: "fullscreen",
    },
    {
      id: "sidebar",
      name: "Sidebar",
      description: "Prominent sidebar with main content area",
      preview: "/placeholder.svg?height=200&width=300",
      theme: {
        primary: "#10b981",
        secondary: "#14b8a6",
        background: "#f8fafc",
        text: "#334155",
        accent: "#f97316",
      },
      layout: "sidebar",
    },
  ])

  const handleSelectTemplate = (template: UITemplate) => {
    onSelectTemplate(template)
    toast({
      title: "Template Applied",
      description: `Applied the "${template.name}" UI template`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">UI Templates</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4 mr-1" /> Preview All
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>UI Templates</DialogTitle>
              <DialogDescription>
                Choose a template to change the overall look and feel of your interactive video player.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4 max-h-[60vh] overflow-y-auto">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <span className="text-xs uppercase px-2 py-1 rounded-full bg-muted">
                        {template.layout}
                      </span>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative h-40 w-full">
                      <Image
                        src={template.preview || "/placeholder.svg"}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      {Object.values(template.theme).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: color }}
                          title={Object.keys(template.theme)[index]}
                        />
                      ))}
                    </div>
                    <Button onClick={() => handleSelectTemplate(template)}>
                      <Check className="h-4 w-4 mr-1" /> Use
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {templates.slice(0, 3).map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-24 w-full">
                <Image
                  src={template.preview || "/placeholder.svg"}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
            <CardFooter className="p-3 flex justify-between items-center">
              <div className="flex space-x-1">
                {Object.values(template.theme).slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => handleSelectTemplate(template)}>
                <Layout className="h-3 w-3 mr-1" /> Apply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

