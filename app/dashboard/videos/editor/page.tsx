"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoTimeline } from "@/components/editor/video-timeline"
import { InteractiveElementForm } from "@/components/editor/interactive-element-form"
import { VideoPreview } from "@/components/editor/video-preview"
import { RequireAuth } from "@/components/auth/require-auth"
import { Permission } from "@/lib/auth/permissions"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { VideoSettings } from "@/components/editor/video-settings"
import { ImportExport } from "@/components/editor/import-export"
import { InteractionTemplates, InteractionTemplate } from "@/components/editor/interaction-templates"
import { UITemplates } from "@/components/editor/ui-templates"
import { useToast } from "@/components/ui/use-toast"
import { ShareEmbedDialog } from "@/components/video/share-embed-dialog"

interface InteractiveElement {
  id: string
  type: "quiz" | "decision" | "hotspot" | "poll"
  title: string
  description?: string
  timestamp: number
  duration: number
  options?: Array<{
    text: string
    action?: string
    isCorrect?: boolean
  }>
  position?: {
    x: number
    y: number
  }
  style?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  feedback?: {
    correct?: string
    incorrect?: string
  }
}

interface VideoSettingsType {
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

export default function VideoEditorPage() {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ")
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(240) // 4 minutes in seconds
  const [selectedElement, setSelectedElement] = useState<InteractiveElement | null>(null)
  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([
    {
      id: "1",
      type: "quiz",
      title: "Knowledge Check",
      description: "Test your understanding of the concepts",
      timestamp: 30,
      duration: 20,
      options: [
        { text: "Option A", isCorrect: true },
        { text: "Option B", isCorrect: false },
        { text: "Option C", isCorrect: false },
      ],
      feedback: {
        correct: "Great job! You got it right.",
        incorrect: "Not quite. The correct answer is Option A."
      }
    },
    {
      id: "2",
      type: "decision",
      title: "Choose Your Path",
      description: "Select which topic to explore next",
      timestamp: 90,
      duration: 15,
      options: [
        { text: "Learn about A", action: "jump:120" },
        { text: "Learn about B", action: "jump:180" },
      ],
    },
  ])
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
  const [videoId, setVideoId] = useState("sample-video-123")
  const [videoTitle, setVideoTitle] = useState("Interactive Video Demo")
  const [isSaving, setIsSaving] = useState(false)

  // Fetch video data on component mount
  useEffect(() => {
    // In a real app, you would fetch the video data from your API
    // Example:
    // const fetchVideoData = async () => {
    //   try {
    //     const response = await fetch(`/api/videos/${videoId}`);
    //     const data = await response.json();
    //     setVideoUrl(data.sourceUrl);
    //     setVideoTitle(data.title);
    //     setInteractiveElements(data.interactiveElements);
    //     setVideoSettings(data.settings);
    //   } catch (error) {
    //     console.error("Error fetching video data:", error);
    //   }
    // };
    // fetchVideoData();
  }, [])

  const handleAddElement = () => {
    const newElement: InteractiveElement = {
      id: Date.now().toString(),
      type: "quiz",
      title: "New Interactive Element",
      description: "",
      timestamp: currentTime,
      duration: 15,
      options: [
        { text: "Option 1", isCorrect: true },
        { text: "Option 2", isCorrect: false },
      ],
    }

    setInteractiveElements([...interactiveElements, newElement])
    setSelectedElement(newElement)
  }

  const handleUpdateElement = (updatedElement: InteractiveElement) => {
    setInteractiveElements(
      interactiveElements.map((element) => (element.id === updatedElement.id ? updatedElement : element)),
    )
    setSelectedElement(updatedElement)
    
    toast({
      title: "Element Updated",
      description: "Interactive element has been updated successfully.",
    })
  }

  const handleDeleteElement = (elementId: string) => {
    setInteractiveElements(interactiveElements.filter((element) => element.id !== elementId))
    if (selectedElement?.id === elementId) {
      setSelectedElement(null)
    }
    
    toast({
      title: "Element Deleted",
      description: "Interactive element has been deleted.",
    })
  }

  const handleApplyTemplate = (template: InteractionTemplate) => {
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
        description: `Applied the "${template.name}" template to the selected element.`,
      })
    }
  }

  const handleImportElements = (importedElements: InteractiveElement[]) => {
    // Generate new IDs for imported elements to avoid conflicts
    const elementsWithNewIds = importedElements.map(el => ({
      ...el,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    
    setInteractiveElements([...interactiveElements, ...elementsWithNewIds])
    
    toast({
      title: "Import Successful",
      description: `Imported ${importedElements.length} interactive elements.`,
    })
  }

  const handleSaveSettings = (settings: VideoSettingsType) => {
    setVideoSettings(settings)
  }

  const handleApplyUITemplate = (template: any) => {
    // In a real app, you would apply the UI template to your application
    // This might involve updating theme variables, layout settings, etc.
    toast({
      title: "UI Template Applied",
      description: `Applied the "${template.name}" UI template.`,
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // In a real app, you would save the interactive elements to your backend
      // Example:
      // await fetch(`/api/videos/${videoId}/interactive-elements`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ 
      //     interactiveElements,
      //     settings: videoSettings
      //   }),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Changes Saved",
        description: "Your interactive video has been updated successfully.",
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

  return (
    <RequireAuth permission={Permission.CREATE_VIDEO}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
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
              <h1 className="text-2xl font-bold">{videoTitle}</h1>
            </div>
            <div className="flex gap-2">
              <ShareEmbedDialog videoId={videoId} videoTitle={videoTitle} />
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="export">Import/Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-lg border">
                    <VideoPreview
                      videoUrl={videoUrl}
                      currentTime={currentTime}
                      interactiveElements={interactiveElements.map(el => ({ ...el, _id: el.id }))}
                      videoSettings={videoSettings}
                      onTimeUpdate={setCurrentTime}
                      onDurationChange={setVideoDuration}
                    />
                  </div>

                  <div className="rounded-lg border p-4">
                    <VideoTimeline
                      duration={videoDuration}
                      currentTime={currentTime}
                      interactiveElements={interactiveElements}
                      onTimeChange={setCurrentTime}
                      onElementSelect={setSelectedElement}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={handleAddElement}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Interactive Element
                    </Button>
                  </div>
                </div>

                <div>
                  <Tabs defaultValue="properties" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="properties">Properties</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
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
                        <div>
                          <Label htmlFor="video-url">Video URL</Label>
                          <Input
                            id="video-url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="Enter YouTube, Vimeo, or other video URL"
                          />
                        </div>
                        <div>
                          <Label>Current Time</Label>
                          <div className="text-lg font-mono">
                            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, "0")}
                          </div>
                        </div>
                        <div>
                          <Label>Interactive Elements</Label>
                          <div className="text-sm text-muted-foreground">{interactiveElements.length} elements added</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-8">
              <InteractionTemplates onSelectTemplate={handleApplyTemplate} />
              <UITemplates onSelectTemplate={handleApplyUITemplate} />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <VideoSettings 
                videoId={videoId}
                initialSettings={videoSettings}
                onSave={handleSaveSettings}
              />
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4">
              <ImportExport 
                videoId={videoId}
                interactiveElements={interactiveElements.map(el => ({ ...el, _id: el.id }))}
                onImport={handleImportElements}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireAuth>
  )
}

