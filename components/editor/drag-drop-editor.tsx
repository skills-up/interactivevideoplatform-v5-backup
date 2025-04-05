"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { InteractiveElementForm } from "@/components/editor/interactive-element-form"
import type { InteractiveElement } from "@/lib/api"
import { Pencil, Move, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragDropEditorProps {
  videoId: string
  interactiveElements: InteractiveElement[]
  currentTime: number
  onUpdateElement: (element: InteractiveElement) => void
  onDeleteElement: (elementId: string) => void
  onSelectElement: (element: InteractiveElement | null) => void
  selectedElement: InteractiveElement | null
  videoWidth: number
  videoHeight: number
}

export function DragDropEditor({
  videoId,
  interactiveElements,
  currentTime,
  onUpdateElement,
  onDeleteElement,
  onSelectElement,
  selectedElement,
  videoWidth,
  videoHeight,
}: DragDropEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElement, setDraggedElement] = useState<InteractiveElement | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showForm, setShowForm] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Get visible elements at current time
  const visibleElements = interactiveElements.filter(
    (element) => currentTime >= element.timestamp && currentTime < element.timestamp + element.duration,
  )

  // Handle mouse down on element
  const handleMouseDown = (e: React.MouseEvent, element: InteractiveElement) => {
    e.stopPropagation()

    if (!editorRef.current) return

    const rect = editorRef.current.getBoundingClientRect()
    const elementX = ((element.position?.x || 50) * rect.width) / 100
    const elementY = ((element.position?.y || 50) * rect.height) / 100

    setDragOffset({
      x: e.clientX - elementX,
      y: e.clientY - elementY,
    })

    setDraggedElement(element)
    setIsDragging(true)
    onSelectElement(element)
  }

  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !draggedElement || !editorRef.current) return

    const rect = editorRef.current.getBoundingClientRect()

    // Calculate new position in percentage
    const newX = Math.max(0, Math.min(100, ((e.clientX - dragOffset.x) / rect.width) * 100))
    const newY = Math.max(0, Math.min(100, ((e.clientY - dragOffset.y) / rect.height) * 100))

    // Update element position
    const updatedElement = {
      ...draggedElement,
      position: {
        x: newX,
        y: newY,
      },
    }

    setDraggedElement(updatedElement)
  }

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging && draggedElement) {
      onUpdateElement(draggedElement)
      toast({
        title: "Position updated",
        description: "The interaction position has been updated",
      })
    }

    setIsDragging(false)
    setDraggedElement(null)
  }

  // Handle click on editor background
  const handleEditorClick = () => {
    onSelectElement(null)
    setShowForm(false)
  }

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, element: InteractiveElement) => {
    e.stopPropagation()
    onSelectElement(element)
    setShowForm(true)
  }

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, draggedElement])

  return (
    <div className="relative">
      <div
        ref={editorRef}
        className="relative bg-black/10 rounded-lg overflow-hidden"
        style={{ width: "100%", height: `${videoHeight}px` }}
        onClick={handleEditorClick}
      >
        {visibleElements.map((element) => {
          const isBeingDragged = isDragging && draggedElement?.id === element.id
          const displayElement = isBeingDragged ? draggedElement : element

          return (
            <div
              key={element.id}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move",
                isBeingDragged ? "z-50 opacity-70" : "z-10",
                selectedElement?.id === element.id ? "ring-2 ring-primary ring-offset-2" : "",
              )}
              style={{
                left: `${displayElement.position?.x || 50}%`,
                top: `${displayElement.position?.y || 50}%`,
                backgroundColor: displayElement.style?.backgroundColor || "rgba(0, 0, 0, 0.8)",
                color: displayElement.style?.textColor || "#ffffff",
                borderRadius: displayElement.style?.borderRadius || "0.5rem",
                padding: displayElement.style?.padding || "1rem",
                border: `1px solid ${displayElement.style?.borderColor || "#3b82f6"}`,
                fontSize: displayElement.style?.fontSize || "1rem",
                opacity: displayElement.style?.opacity || "0.95",
                maxWidth: "80%",
              }}
              onMouseDown={(e) => handleMouseDown(e, element)}
            >
              <div className="absolute top-1 right-1 flex space-x-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 bg-black/20 hover:bg-black/40"
                  onClick={(e) => handleEditClick(e, element)}
                >
                  <Pencil className="h-3 w-3 text-white" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 bg-black/20 hover:bg-black/40"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Move className="h-3 w-3 text-white" />
                </Button>
              </div>

              <h3 className="font-medium">{element.title}</h3>
              {element.description && <p className="text-sm mt-1">{element.description}</p>}

              {element.options && element.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {element.options.map((option, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 text-sm rounded"
                      style={{
                        backgroundColor: element.optionStyle?.backgroundColor || "transparent",
                        color: element.optionStyle?.textColor || "#ffffff",
                        borderRadius: element.optionStyle?.borderRadius || "0.25rem",
                        border: `1px solid ${element.optionStyle?.borderColor || "#ffffff"}`,
                      }}
                    >
                      {option.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedElement && showForm && (
        <Card className="absolute top-0 right-0 w-80 max-h-[calc(100%-2rem)] overflow-y-auto shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Interaction</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <InteractiveElementForm element={selectedElement} onUpdate={onUpdateElement} onDelete={onDeleteElement} />
          </div>
        </Card>
      )}
    </div>
  )
}

