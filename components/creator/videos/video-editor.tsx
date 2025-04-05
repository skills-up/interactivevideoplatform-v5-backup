"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatTime } from "@/lib/formatTime"
import { cn } from "@/lib/utils"
import { InteractiveVideoPlayer } from "../video/interactive-video-player"
import { InteractionForm } from "./interaction-form"
import { InteractionTemplateSelector } from "./interaction-template-selector"
import { ImportExportDialog } from "./import-export-dialog"
import { VideoEditorHeader } from "./video-editor-header"
import { AIInteractionGenerator } from "./ai-interaction-generator"
import {
  Plus,
  Trash2,
  Copy,
  Clock,
  Move,
  Palette,
  Save,
  Undo,
  Redo,
  FileQuestion,
  BarChart2,
  Image,
  GitBranch,
  Target,
} from "lucide-react"

interface VideoEditorProps {
  videoId: string
  videoData: any
}

export function VideoEditor({ videoId, videoData }: VideoEditorProps) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(videoData.duration || 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [interactiveElements, setInteractiveElements] = useState<any[]>(videoData.interactiveElements || [])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [editingElement, setEditingElement] = useState<any | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElement, setDraggedElement] = useState<any | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [undoStack, setUndoStack] = useState<any[][]>([])
  const [redoStack, setRedoStack] = useState<any[][]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  // Load interactive elements on mount
  useEffect(() => {
    if (videoData.interactiveElements) {
      setInteractiveElements(videoData.interactiveElements)
      // Save initial state for undo
      setUndoStack([[...videoData.interactiveElements]])
    }
  }, [videoData.interactiveElements])

  // Auto-save changes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (interactiveElements.length > 0) {
        saveChanges()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(saveTimer)
  }, [interactiveElements])

  // Handle timeline click to set current time
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const percentage = offsetX / rect.width
    const newTime = percentage * duration

    setCurrentTime(newTime)
  }

  // Add a new interactive element
  const addInteractiveElement = (type: string) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      startTime: currentTime,
      endTime: currentTime + 10, // Default 10 seconds duration
      position: { x: 0.5, y: 0.5 }, // Center of the screen
      style: {
        width: "60%",
        maxWidth: "500px",
      },
    }

    // Add type-specific properties
    switch (type) {
      case "quiz":
        newElement.question = "Enter your question here"
        newElement.options = [
          { id: `option-${Date.now()}-1`, text: "Option 1", isCorrect: true },
          { id: `option-${Date.now()}-2`, text: "Option 2", isCorrect: false },
        ]
        newElement.showFeedback = true
        newElement.correctFeedback = "Correct!"
        newElement.incorrectFeedback = "Incorrect!"
        break
      case "poll":
        newElement.question = "Enter your poll question here"
        newElement.options = [
          { id: `option-${Date.now()}-1`, text: "Option 1" },
          { id: `option-${Date.now()}-2`, text: "Option 2" },
        ]
        newElement.showResults = true
        break
      case "hotspot":
        newElement.hotspots = [
          {
            id: `hotspot-${Date.now()}-1`,
            position: { x: 0.3, y: 0.5 },
            size: 10,
            isCorrect: true,
            feedback: "Correct hotspot!",
          },
          {
            id: `hotspot-${Date.now()}-2`,
            position: { x: 0.7, y: 0.5 },
            size: 10,
            isCorrect: false,
            feedback: "Incorrect hotspot!",
          },
        ]
        break
      case "branching":
        newElement.question = "What would you like to do next?"
        newElement.options = [
          {
            id: `option-${Date.now()}-1`,
            text: "Continue watching",
            nextAction: { type: "seek", timestamp: currentTime + 30 },
          },
          {
            id: `option-${Date.now()}-2`,
            text: "Skip to next section",
            nextAction: { type: "seek", timestamp: currentTime + 60 },
          },
          {
            id: `option-${Date.now()}-3`,
            text: "Learn more",
            nextAction: { type: "redirect", url: "https://example.com" },
          },
        ]
        break
      case "imageHotspot":
        newElement.imageUrl = "/placeholder.svg?height=400&width=600"
        newElement.hotspots = [
          {
            id: `hotspot-${Date.now()}-1`,
            position: { x: 0.3, y: 0.5 },
            title: "Hotspot 1",
            content: "This is the first hotspot content.",
          },
          {
            id: `hotspot-${Date.now()}-2`,
            position: { x: 0.7, y: 0.5 },
            title: "Hotspot 2",
            content: "This is the second hotspot content.",
          },
        ]
        newElement.requireAllHotspots = true
        break
    }

    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    // Add the new element
    const updatedElements = [...interactiveElements, newElement]
    setInteractiveElements(updatedElements)
    setSelectedElement(newElement.id)
    setEditingElement(newElement)
  }

  // Delete an interactive element
  const deleteInteractiveElement = (id: string) => {
    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    const updatedElements = interactiveElements.filter((element) => element.id !== id)
    setInteractiveElements(updatedElements)

    if (selectedElement === id) {
      setSelectedElement(null)
      setEditingElement(null)
    }
  }

  // Duplicate an interactive element
  const duplicateInteractiveElement = (id: string) => {
    const elementToDuplicate = interactiveElements.find((element) => element.id === id)
    if (!elementToDuplicate) return

    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    const duplicatedElement = {
      ...JSON.parse(JSON.stringify(elementToDuplicate)),
      id: `element-${Date.now()}`,
      title: `${elementToDuplicate.title} (Copy)`,
    }

    const updatedElements = [...interactiveElements, duplicatedElement]
    setInteractiveElements(updatedElements)
    setSelectedElement(duplicatedElement.id)
    setEditingElement(duplicatedElement)
  }

  // Update an interactive element
  const updateInteractiveElement = (updatedElement: any) => {
    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    const updatedElements = interactiveElements.map((element) =>
      element.id === updatedElement.id ? updatedElement : element,
    )

    setInteractiveElements(updatedElements)
    setEditingElement(updatedElement)
  }

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event
    const elementId = active.id
    const element = interactiveElements.find((el) => el.id === elementId)

    if (element) {
      setIsDragging(true)
      setDraggedElement(element)
    }
  }

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, delta } = event
    const elementId = active.id

    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    // Update element position
    const updatedElements = interactiveElements.map((element) => {
      if (element.id === elementId && videoContainerRef.current) {
        const containerRect = videoContainerRef.current.getBoundingClientRect()

        // Calculate new position as percentage of container
        const deltaXPercent = delta.x / containerRect.width
        const deltaYPercent = delta.y / containerRect.height

        const newX = Math.max(0, Math.min(1, (element.position?.x || 0.5) + deltaXPercent))
        const newY = Math.max(0, Math.min(1, (element.position?.y || 0.5) + deltaYPercent))

        return {
          ...element,
          position: { x: newX, y: newY },
        }
      }
      return element
    })

    setInteractiveElements(updatedElements)
    setIsDragging(false)
    setDraggedElement(null)
  }

  // Apply a template to an element
  const applyTemplate = (templateId: string) => {
    if (!selectedElement) return

    // Fetch template and apply it
    fetch(`/api/interaction-templates/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        const template = data.template
        if (!template) return

        // Save current state for undo
        setUndoStack([...undoStack, [...interactiveElements]])
        setRedoStack([])

        // Apply template to selected element
        const updatedElements = interactiveElements.map((element) => {
          if (element.id === selectedElement) {
            return {
              ...element,
              style: { ...template.style },
              // Apply other template properties as needed
            }
          }
          return element
        })

        setInteractiveElements(updatedElements)
        setShowTemplateSelector(false)
      })
      .catch((error) => {
        console.error("Error applying template:", error)
      })
  }

  // Import interactions
  const handleImport = (importedData: any) => {
    if (!importedData.interactiveElements) return

    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    if (importedData.replaceExisting) {
      setInteractiveElements(importedData.interactiveElements)
    } else {
      // Merge with existing elements
      const existingIds = new Set(interactiveElements.map((el) => el.id))
      const newElements = importedData.interactiveElements.filter((el: any) => !existingIds.has(el.id))

      setInteractiveElements([...interactiveElements, ...newElements])
    }

    setShowImportExport(false)
  }

  // Generate interactions with AI
  const handleAIGenerate = (generatedInteractions: any[]) => {
    if (!generatedInteractions.length) return

    // Save current state for undo
    setUndoStack([...undoStack, [...interactiveElements]])
    setRedoStack([])

    // Add generated interactions
    setInteractiveElements([...interactiveElements, ...generatedInteractions])
    setShowAIGenerator(false)
  }

  // Undo last change
  const handleUndo = () => {
    if (undoStack.length <= 1) return

    const newUndoStack = [...undoStack]
    const previousState = newUndoStack.pop()

    if (previousState) {
      setRedoStack([...redoStack, [...interactiveElements]])
      setInteractiveElements(previousState)
      setUndoStack(newUndoStack)
    }
  }

  // Redo last undone change
  const handleRedo = () => {
    if (redoStack.length === 0) return

    const newRedoStack = [...redoStack]
    const nextState = newRedoStack.pop()

    if (nextState) {
      setUndoStack([...undoStack, [...interactiveElements]])
      setInteractiveElements(nextState)
      setRedoStack(newRedoStack)
    }
  }

  // Save changes to the server
  const saveChanges = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interactiveElements,
        }),
      })

      if (response.ok) {
        setLastSaved(new Date())
      } else {
        console.error("Error saving changes:", await response.text())
      }
    } catch (error) {
      console.error("Error saving changes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Get active elements at current time
  const getActiveElements = () => {
    return interactiveElements.filter(
      (element) => currentTime >= element.startTime && (!element.endTime || currentTime <= element.endTime),
    )
  }

  // Render timeline markers for interactive elements
  const renderTimelineMarkers = () => {
    return interactiveElements.map((element) => {
      const startPercent = (element.startTime / duration) * 100
      const endPercent = element.endTime ? (element.endTime / duration) * 100 : startPercent + 1
      const width = Math.max(0.5, endPercent - startPercent)

      const isSelected = selectedElement === element.id

      return (
        <div
          key={element.id}
          className={cn(
            "absolute h-6 rounded-sm cursor-pointer transition-all",
            isSelected ? "bg-blue-500" : getElementColor(element.type),
            isSelected ? "z-10" : "z-0",
          )}
          style={{
            left: `${startPercent}%`,
            width: `${width}%`,
            top: "0",
          }}
          onClick={() => {
            setSelectedElement(element.id)
            setEditingElement(element)
            setCurrentTime(element.startTime)
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <span className="text-xs text-white truncate px-1">{element.title}</span>
          </div>
        </div>
      )
    })
  }

  // Get color for element type
  const getElementColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "bg-green-500"
      case "poll":
        return "bg-purple-500"
      case "hotspot":
        return "bg-yellow-500"
      case "branching":
        return "bg-red-500"
      case "imageHotspot":
        return "bg-indigo-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get icon for element type
  const getElementIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <FileQuestion size={16} />
      case "poll":
        return <BarChart2 size={16} />
      case "hotspot":
        return <Target size={16} />
      case "branching":
        return <GitBranch size={16} />
      case "imageHotspot":
        return <Image size={16} />
      default:
        return <Plus size={16} />
    }
  }

  return (
    <div className="flex flex-col h-full">
      <VideoEditorHeader
        videoData={videoData}
        onSave={saveChanges}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onShowImportExport={() => setShowImportExport(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Video preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToParentElement]}
              >
                <div ref={videoContainerRef} className="relative">
                  <InteractiveVideoPlayer
                    videoId={videoId}
                    sourceUrl={videoData.sourceUrl}
                    sourceType={videoData.sourceType}
                    title={videoData.title}
                    isOwner={true}
                    showControls={true}
                    showInteractions={false}
                    onInteractionComplete={() => {}}
                  />

                  {/* Overlay active elements for editing */}
                  {getActiveElements().map((element) => (
                    <div
                      key={element.id}
                      className={cn(
                        "absolute border-2 rounded transition-all",
                        selectedElement === element.id ? "border-blue-500" : "border-transparent hover:border-gray-300",
                      )}
                      style={{
                        left: `${(element.position?.x || 0.5) * 100}%`,
                        top: `${(element.position?.y || 0.5) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        width: element.style?.width || "60%",
                        maxWidth: element.style?.maxWidth || "500px",
                        height: "auto",
                        minHeight: "100px",
                      }}
                      onClick={() => {
                        setSelectedElement(element.id)
                        setEditingElement(element)
                      }}
                      id={element.id}
                    >
                      <div className="absolute -top-8 left-0 right-0 flex justify-center">
                        <div className="bg-white border rounded-md shadow-sm flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsDragging(true)
                              setDraggedElement(element)
                            }}
                          >
                            <Move size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateInteractiveElement(element.id)
                            }}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteInteractiveElement(element.id)
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="p-2 text-center text-sm text-gray-500">{element.title}</div>
                    </div>
                  ))}

                  <DragOverlay>
                    {isDragging && draggedElement && (
                      <div
                        className="border-2 border-blue-500 rounded bg-white/50 p-4"
                        style={{
                          width: draggedElement.style?.width || "60%",
                          maxWidth: draggedElement.style?.maxWidth || "500px",
                          height: "auto",
                          minHeight: "100px",
                        }}
                      >
                        <div className="text-center">{draggedElement.title}</div>
                      </div>
                    )}
                  </DragOverlay>
                </div>
              </DndContext>

              {/* Timeline */}
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <div className="ml-4 flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <div
                  ref={timelineRef}
                  className="relative h-8 bg-gray-200 rounded cursor-pointer"
                  onClick={handleTimelineClick}
                >
                  {/* Timeline markers */}
                  {renderTimelineMarkers()}

                  {/* Current time indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Timeline controls */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus size={16} className="mr-2" />
                      Add Interaction
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid gap-2">
                      <Button variant="ghost" className="justify-start" onClick={() => addInteractiveElement("quiz")}>
                        <FileQuestion size={16} className="mr-2" />
                        Quiz
                      </Button>
                      <Button variant="ghost" className="justify-start" onClick={() => addInteractiveElement("poll")}>
                        <BarChart2 size={16} className="mr-2" />
                        Poll
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => addInteractiveElement("hotspot")}
                      >
                        <Target size={16} className="mr-2" />
                        Hotspot
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => addInteractiveElement("branching")}
                      >
                        <GitBranch size={16} className="mr-2" />
                        Branching
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => addInteractiveElement("imageHotspot")}
                      >
                        <Image size={16} className="mr-2" />
                        Image Hotspot
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateSelector(true)}
                  disabled={!selectedElement}
                >
                  <Palette size={16} className="mr-2" />
                  Apply Template
                </Button>

                <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)}>
                  <span className="mr-2">🤖</span>
                  Generate with AI
                </Button>

                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length <= 1}>
                    <Undo size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
                    <Redo size={16} />
                  </Button>
                  <Button variant="default" size="sm" onClick={saveChanges} disabled={isSaving}>
                    <Save size={16} className="mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="properties">
                <TabsList className="w-full">
                  <TabsTrigger value="properties" className="flex-1">
                    Properties
                  </TabsTrigger>
                  <TabsTrigger value="timing" className="flex-1">
                    Timing
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex-1">
                    Style
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties">
                  {editingElement ? (
                    <InteractionForm interaction={editingElement} onChange={updateInteractiveElement} />
                  ) : (
                    <div className="p-8 text-center text-gray-500">Select an interaction to edit its properties</div>
                  )}
                </TabsContent>

                <TabsContent value="timing">
                  {editingElement ? (
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Start Time</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[editingElement.startTime]}
                            min={0}
                            max={duration}
                            step={0.1}
                            onValueChange={(value) => {
                              const newStartTime = value[0]
                              updateInteractiveElement({
                                ...editingElement,
                                startTime: newStartTime,
                                endTime: Math.max(newStartTime + 1, editingElement.endTime || newStartTime + 10),
                              })
                            }}
                          />
                          <span className="w-20 text-right">{formatTime(editingElement.startTime)}</span>
                        </div>
                      </div>

                      <div>
                        <Label>End Time</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[editingElement.endTime || editingElement.startTime + 10]}
                            min={editingElement.startTime + 1}
                            max={duration}
                            step={0.1}
                            onValueChange={(value) => {
                              updateInteractiveElement({
                                ...editingElement,
                                endTime: value[0],
                              })
                            }}
                          />
                          <span className="w-20 text-right">
                            {formatTime(editingElement.endTime || editingElement.startTime + 10)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label>Duration</Label>
                        <div className="text-2xl font-bold mt-1">
                          {formatTime(
                            (editingElement.endTime || editingElement.startTime + 10) - editingElement.startTime,
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label>Behavior</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="pauseVideo"
                              checked={editingElement.pauseVideo !== false}
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  pauseVideo: e.target.checked,
                                })
                              }}
                            />
                            <Label htmlFor="pauseVideo">Pause Video</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="allowSkipping"
                              checked={editingElement.allowSkipping !== false}
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  allowSkipping: e.target.checked,
                                })
                              }}
                            />
                            <Label htmlFor="allowSkipping">Allow Skipping</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="resumeAfterCompletion"
                              checked={editingElement.resumeAfterCompletion !== false}
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  resumeAfterCompletion: e.target.checked,
                                })
                              }}
                            />
                            <Label htmlFor="resumeAfterCompletion">Resume After</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="allowResubmission"
                              checked={editingElement.allowResubmission === true}
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  allowResubmission: e.target.checked,
                                })
                              }}
                            />
                            <Label htmlFor="allowResubmission">Allow Retry</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">Select an interaction to edit its timing</div>
                  )}
                </TabsContent>

                <TabsContent value="style">
                  {editingElement ? (
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Position</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <div>
                            <Label className="text-xs">X (0-1)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={editingElement.position?.x || 0.5}
                              onChange={(e) => {
                                const x = Number.parseFloat(e.target.value)
                                updateInteractiveElement({
                                  ...editingElement,
                                  position: {
                                    ...editingElement.position,
                                    x: Math.max(0, Math.min(1, x)),
                                  },
                                })
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Y (0-1)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={editingElement.position?.y || 0.5}
                              onChange={(e) => {
                                const y = Number.parseFloat(e.target.value)
                                updateInteractiveElement({
                                  ...editingElement,
                                  position: {
                                    ...editingElement.position,
                                    y: Math.max(0, Math.min(1, y)),
                                  },
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Size</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <div>
                            <Label className="text-xs">Width</Label>
                            <Select
                              value={editingElement.style?.width || "60%"}
                              onValueChange={(value) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  style: {
                                    ...editingElement.style,
                                    width: value,
                                  },
                                })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Width" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30%">Small (30%)</SelectItem>
                                <SelectItem value="60%">Medium (60%)</SelectItem>
                                <SelectItem value="90%">Large (90%)</SelectItem>
                                <SelectItem value="100%">Full Width</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Max Width</Label>
                            <Input
                              type="text"
                              value={editingElement.style?.maxWidth || "500px"}
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  style: {
                                    ...editingElement.style,
                                    maxWidth: e.target.value,
                                  },
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Colors</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <div>
                            <Label className="text-xs">Background</Label>
                            <Input
                              type="text"
                              value={editingElement.style?.backgroundColor || ""}
                              placeholder="#ffffff"
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  style: {
                                    ...editingElement.style,
                                    backgroundColor: e.target.value,
                                  },
                                })
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Text Color</Label>
                            <Input
                              type="text"
                              value={editingElement.style?.textColor || ""}
                              placeholder="#000000"
                              onChange={(e) => {
                                updateInteractiveElement({
                                  ...editingElement,
                                  style: {
                                    ...editingElement.style,
                                    textColor: e.target.value,
                                  },
                                })
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Custom CSS</Label>
                        <Textarea
                          value={editingElement.style?.customCSS || ""}
                          placeholder="Enter custom CSS properties"
                          className="font-mono text-sm"
                          onChange={(e) => {
                            updateInteractiveElement({
                              ...editingElement,
                              style: {
                                ...editingElement.style,
                                customCSS: e.target.value,
                              },
                            })
                          }}
                        />
                      </div>

                      <Button variant="outline" onClick={() => setShowTemplateSelector(true)}>
                        <Palette size={16} className="mr-2" />
                        Apply Template
                      </Button>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">Select an interaction to edit its style</div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template selector dialog */}
      {showTemplateSelector && (
        <InteractionTemplateSelector onSelect={applyTemplate} onClose={() => setShowTemplateSelector(false)} />
      )}

      {/* Import/Export dialog */}
      {showImportExport && (
        <ImportExportDialog
          videoId={videoId}
          interactiveElements={interactiveElements}
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {/* AI Generator dialog */}
      {showAIGenerator && (
        <AIInteractionGenerator
          videoId={videoId}
          onGenerate={handleAIGenerate}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  )
}

