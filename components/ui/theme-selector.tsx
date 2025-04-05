"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Check, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTemplates, type Template } from "@/lib/api"

interface ThemeSelectorProps {
  onSelectTheme: (theme: Template) => void
  currentThemeId?: string
}

export function ThemeSelector({ onSelectTheme, currentThemeId }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch available UI themes
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setIsLoading(true)
        const templates = await getTemplates("ui")
        setThemes(templates)
      } catch (error) {
        console.error("Error fetching UI themes:", error)
        toast({
          title: "Failed to load themes",
          description: "There was an error loading the UI themes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemes()
  }, [])

  // Handle theme selection
  const handleSelectTheme = (theme: Template) => {
    onSelectTheme(theme)
    toast({
      title: "Theme applied",
      description: `The "${theme.name}" theme has been applied`,
    })
  }

  // Default themes if API fails
  const defaultThemes: Template[] = [
    {
      id: "default",
      name: "Default",
      description: "Standard layout with sidebar navigation",
      type: "ui",
      layout: "default",
      theme: {
        primary: "#3b82f6",
        secondary: "#10b981",
        background: "#ffffff",
        text: "#1e293b",
        accent: "#f43f5e",
      },
      isBuiltIn: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Dark theme with vibrant accent colors",
      type: "ui",
      layout: "default",
      theme: {
        primary: "#8b5cf6",
        secondary: "#6366f1",
        background: "#1e1e2e",
        text: "#e2e8f0",
        accent: "#f43f5e",
      },
      isBuiltIn: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean, minimalist interface with reduced UI elements",
      type: "ui",
      layout: "minimal",
      theme: {
        primary: "#0f172a",
        secondary: "#64748b",
        background: "#f8fafc",
        text: "#334155",
        accent: "#0ea5e9",
      },
      isBuiltIn: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Use default themes if API fails
  const displayThemes = themes.length > 0 ? themes : defaultThemes

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">UI Themes</h3>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Palette className="h-4 w-4 mr-1" />
          {isLoading ? "Loading..." : "Customize"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayThemes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              currentThemeId === theme.id ? "ring-2 ring-primary" : "",
            )}
            onClick={() => handleSelectTheme(theme)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <span>{theme.name}</span>
                {currentThemeId === theme.id && <Check className="h-4 w-4 text-primary" />}
              </CardTitle>
              <CardDescription className="text-xs">{theme.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex space-x-2">
                {theme.theme &&
                  Object.values(theme.theme).map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                      title={Object.keys(theme.theme)[index]}
                    />
                  ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectTheme(theme)
                }}
              >
                Apply Theme
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

