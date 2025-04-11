"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoTimeline } from "@/components/editor/video-timeline"
import { InteractiveElementForm } from "@/components/editor/interactive-element-form"
import { VideoPreview } from "@/components/editor/video-preview"
import { RequireAuth } from "@/components/auth/require-auth"
import { Permission } from "@/lib/auth/permissions"
import { VideoSettings } from "@/components/editor/video-settings"
import { ImportExport } from "@/components/editor/import-export"
import { InteractionTemplates } from "@/components/editor/interaction-templates"
import { useToast } from "@/components/ui/use-toast"
import { ShareEmbedDialog } from "@/components/video/share-embed-dialog"
import { DragDropEditor } from "@/components/editor/drag-drop-editor"
import { ThemeSelector } from "@/components/ui/theme-selector"
import {
  getVideo,
  getVideoInteractiveElements,
  getVideoSettings,
  updateVideo,
  createInteractiveElement,
  updateInteractiveElement,
  deleteInteractiveElement,
  updateVideoSettings,
  type InteractiveElement,
  type VideoSettings as VideoSettingsType,
  getTemplates,
  type Template,
} from "@/lib/api"

export default function VideoEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const videoId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [videoData, setVideoData] = useState<{
    title: string
    description: string
    sourceUrl: string
    sourceType: "youtube" | "vimeo" | "dailymotion" | "local"
  }>({
    title: "",
    description: "",
    sourceUrl: "",
    sourceType: "youtube",
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(240) // 4 minutes in seconds
  const [selectedElement, setSelectedElement] = useState<InteractiveElement | null>(null)
  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([])
  const [videoSettings, setVideoSettings] = useState<VideoSettingsType>({
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
  })
  const [activeTab, setActiveTab] = useState("editor")
  const [editorMode, setEditorMode] = useState<"timeline" | "drag-drop">("timeline")
  const [templates, setTemplates] = useState<Template[]>([])
  const [currentTheme, setCurrentTheme] = useState<Template | null>(null)
  const [videoWidth, setVideoWidth] = useState(640)
  const [videoHeight, setVideoHeight] = useState(360)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Fetch video data on component mount
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true)

        // Fetch video details
        const video = await getVideo(videoId)
        setVideoData({
          title: video.title,
          description: video.description || "",
          sourceUrl: video.sourceUrl,
          sourceType: video.sourceType,
        })

        // Fetch interactive elements
        const elements = await getVideoInteractiveElements(videoId)
        setInteractiveElements(elements)

        // Fetch video settings
        try {
          const settings = await getVideoSettings(videoId)
          setVideoSettings(settings)
        } catch (error) {
          // If settings don't exist yet, use defaults
          console.log("Using default video settings")
        }

        // Fetch templates
        const templateData = await getTemplates()
        setTemplates(templateData)

        // Set default theme
        const defaultTheme = templateData.find((t) => t.id === "default" && t.type === "ui")
        if (defaultTheme) {
          setCurrentTheme(defaultTheme)
        }
      } catch (error) {
        console.error("Error fetching video data:", error)
        toast({
          title: "Error",
          description: "Failed to load video data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoData()
  }, [videoId])

  // Update video dimensions when preview container resizes
  useEffect(() => {
    if (!previewContainerRef.current) return

    const updateDimensions = () => {
      if (previewContainerRef.current) {
        const width = previewContainerRef.current.clientWidth
        setVideoWidth(width)
        setVideoHeight((width * 9) / 16) // 16:9 aspect ratio
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(previewContainerRef.current)

    return () => {
      if (previewContainerRef.current) {
        resizeObserver.unobserve(previewContainerRef.current)
      }
    }
  }, [])

  // Handle adding a new interactive element
  const handleAddElement = (type: "quiz" | "poll" | "hotspot" | "decision" | "image-hotspot") => {
    const newElement: Omit<InteractiveElement, "id" | "createdAt" | "updatedAt"> = {
      videoId,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: "",
      timestamp: currentTime,
      duration: 15,
      position: {
        x: 50,
        y: 50,
      },
      options: [],
    }

    // Add default options based on type
    switch (type) {
      case "quiz":
        newElement.options = [
          { id: `option-${Date.now()}-1`, text: "Option 1", isCorrect: true },
          { id: `option-${Date.now()}-2`, text: "Option 2", isCorrect: false },
        ]
        break
      case "poll":
        newElement.options = [
          { id: `option-${Date.now()}-1`, text: "Option 1" },
          { id: `option-${Date.now()}-2`, text: "Option 2" },
        ]
        break
      case "decision":
        newElement.options = [
          { id: `option-${Date.now()}-1`, text: "Option 1", action: "jump:30" },
          { id: `option-${Date.now()}-2`, text: "Option 2", action: "jump:60" },
        ]
        break
      case "hotspot":
        newElement.options = [{ id: `option-${Date.now()}-1`, text: "Click me", action: "jump:30" }]
        break
      case "image-hotspot":
        newElement.options = [
          {
            id: `option-${Date.now()}-1`,
            text: "Hotspot 1",
            position: { x: 30, y: 30 },
          },
          {
            id: `option-${Date.now()}-2`,
            text: "Hotspot 2",
            position: { x: 70, y: 70 },
          },
        ]
        break
    }

    // Create the element in the database
    createInteractiveElement(newElement)
      .then((createdElement) => {
        setInteractiveElements([...interactiveElements, createdElement])
        setSelectedElement(createdElement)

        toast({
          title: "Element Added",
          description: `New ${type} interaction added at ${Math.floor(currentTime)}s`,
        })
      })
      .catch((error) => {
        console.error("Error creating interactive element:", error)
        toast({
          title: "Error",
          description: "Failed to create interactive element",
          variant: "destructive",
        })
      })
  }

  // Handle updating an interactive element
  const handleUpdateElement = (updatedElement: InteractiveElement) => {
    updateInteractiveElement(updatedElement.id, updatedElement)
      .then(() => {
        setInteractiveElements(
          interactiveElements.map((element) => (element.id === updatedElement.id ? updatedElement : element)),
        )
        setSelectedElement(updatedElement)

        toast({
          title: "Element Updated",
          description: "Interactive element has been updated successfully",
        })
      })
      .catch((error) => {
        console.error("Error updating interactive element:", error)
        toast({
          title: "Error",
          description: "Failed to update interactive element",
          variant: "destructive",
        })
      })
  }

  // Handle deleting an interactive element
  const handleDeleteElement = (elementId: string) => {
    deleteInteractiveElement(elementId)
      .then(() => {
        setInteractiveElements(interactiveElements.filter((element) => element.id !== elementId))
        if (selectedElement?.id === elementId) {
          setSelectedElement(null)
        }

        toast({
          title: "Element Deleted",
          description: "Interactive element has been deleted",
        })
      })
      .catch((error) => {
        console.error("Error deleting interactive element:", error)
        toast({
          title: "Error",
          description: "Failed to delete interactive element",
          variant: "destructive",
        })
      })
  }

  // Handle applying a template to an element
  const handleApplyTemplate = (template: Template) => {
    if (selectedElement) {
      const updatedElement = {
        ...selectedElement,
        style: { ...template.style },
        optionStyle: { ...template.optionStyle },
      }

      if (template.position) {
        updatedElement.position = { ...template.position }
      }

      handleUpdateElement(updatedElement)

      toast({
        title: "Template Applied",
        description: `Applied the "${template.name}" template to the selected element`,
      })
    } else {
      toast({
        title: "No Element Selected",
        description: "Please select an interactive element first",
        variant: "destructive",
      })
    }
  }

  // Handle importing elements
  const handleImportElements = (importedElements: InteractiveElement[]) => {
    // Generate new IDs for imported elements to avoid conflicts
    const elementsWithNewIds = importedElements.map((el) => ({
      ...el,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      videoId,
    }))

    // Create each imported element in the database
    Promise.all(elementsWithNewIds.map((element) => createInteractiveElement(element)))
      .then((createdElements) => {
        setInteractiveElements([...interactiveElements, ...createdElements])

        toast({
          title: "Import Successful",
          description: `Imported ${createdElements.length} interactive elements`,
        })
      })
      .catch((error) => {
        console.error("Error importing elements:", error)
        toast({
          title: "Import Failed",
          description: "Failed to import interactive elements",
          variant: "destructive",
        })
      })
  }

  // Handle saving video settings
  const handleSaveSettings = (settings: VideoSettingsType) => {
    updateVideoSettings(videoId, settings)
      .then(() => {
        setVideoSettings(settings)

        toast({
          title: "Settings Saved",
          description: "Video interaction settings have been updated",
        })
      })
      .catch((error) => {
        console.error("Error saving video settings:", error)
        toast({
          title: "Error",
          description: "Failed to save video settings",
          variant: "destructive",
        })
      })
  }

  // Handle applying a UI theme
  const handleApplyUITheme = (theme: Template) => {
    setCurrentTheme(theme)

    toast({
      title: "Theme Applied",
      description: `Applied the "${theme.name}" UI theme`,
    })

    // In a real app, you would apply the theme to your application
    // This might involve updating theme variables, layout settings, etc.
    if (theme.theme) {
      // Apply theme colors to CSS variables
      const root = document.documentElement
      root.style.setProperty("--primary", theme.theme.primary)
      root.style.setProperty("--secondary", theme.theme.secondary)
      root.style.setProperty("--background", theme.theme.background)
      root.style.setProperty("--foreground", theme.theme.text)
      root.style.setProperty("--accent", theme.theme.accent)
    }
  }

  // Handle saving all changes
  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Update video details
      await updateVideo(videoId, {
        title: videoData.title,
        description: videoData.description,
      })

      // Update video settings
      await updateVideoSettings(videoId, videoSettings)

      toast({
        title: "Changes Saved",
        description: "Your interactive video has been updated successfully",
      })
    } catch (error) {
      console.error("Error saving changes:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center flex-1">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading video editor...</p>
        </div>
      </div>
    )
  }

  return (
    <RequireAuth permission={Permission.CREATE_VIDEO}>
      <div className="container px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/videos"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to videos
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{videoData.title}</h1>
              {videoData.description && <p className="text-sm text-muted-foreground">{videoData.description}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <ShareEmbedDialog videoId={videoId} videoTitle={videoData.title} />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="theme">UI Theme</TabsTrigger>
            <TabsTrigger value="export">Import/Export</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-lg border" ref={previewContainerRef}>
                  <VideoPreview
                    videoUrl={videoData.sourceUrl}
                    currentTime={currentTime}
                    interactiveElements={interactiveElements}
                    videoSettings={videoSettings}
                    onTimeUpdate={setCurrentTime}
                    onDurationChange={setVideoDuration}
                  />
                </div>

                <div className="rounded-lg border p-4">
                  <Tabs
                    defaultValue={editorMode}
                    onValueChange={(value) => setEditorMode(value as "timeline" | "drag-drop")}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <TabsList>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="drag-drop">Visual Editor</TabsTrigger>
                      </TabsList>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddElement("quiz")}>
                          <Plus className="h-4 w-4 mr-1" /> Quiz
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddElement("poll")}>
                          <Plus className="h-4 w-4 mr-1" /> Poll
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddElement("decision")}>
                          <Plus className="h-4 w-4 mr-1" /> Decision
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddElement("hotspot")}>
                          <Plus className="h-4 w-4 mr-1" /> Hotspot
                        </Button>
                      </div>
                    </div>

                    <TabsContent value="timeline">
                      <VideoTimeline
                        duration={videoDuration}
                        currentTime={currentTime}
                        interactiveElements={interactiveElements}
                        onTimeChange={setCurrentTime}
                        onElementSelect={setSelectedElement}
                      />
                    </TabsContent>

                    <TabsContent value="drag-drop">
                      <DragDropEditor
                        videoId={videoId}
                        interactiveElements={interactiveElements}
                        currentTime={currentTime}
                        onUpdateElement={handleUpdateElement}
                        onDeleteElement={handleDeleteElement}
                        onSelectElement={setSelectedElement}
                        selectedElement={selectedElement}
                        videoWidth={videoWidth}
                        videoHeight={videoHeight}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div>
                <Tabs defaultValue="properties" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="preview">Video Info</TabsTrigger>
                  </TabsList>
                  <TabsContent value="properties" className="rounded-lg border p-4 mt-4">
                    {selectedElement ? (
                      <InteractiveElementForm
                        element={selectedElement}
                        onUpdate={handleUpdateElement}
                        onDelete={handleDeleteElement}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Select an interactive element on the timeline or add a new one
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="preview" className="rounded-lg border p-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="video-title">Title</Label>
                        <Input
                          id="video-title"
                          value={videoData.title}
                          onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="video-description">Description</Label>
                        <Input
                          id="video-description"
                          value={videoData.description}
                          onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Current Time</Label>
                        <div className="text-lg font-mono">
                          {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, "0")}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Interactive Elements</Label>
                        <div className="text-sm text-muted-foreground">
                          {interactiveElements.length} elements added
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-8">
            <InteractionTemplates onSelectTemplate={handleApplyTemplate} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <VideoSettings videoId={videoId} initialSettings={videoSettings} onSave={handleSaveSettings} />
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <ThemeSelector onSelectTheme={handleApplyUITheme} currentThemeId={currentTheme?.id} />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <ImportExport
              videoId={videoId}
              interactiveElements={interactiveElements}
              onImport={handleImportElements}
            />
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  )
}

