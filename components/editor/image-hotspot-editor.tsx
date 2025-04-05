"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash, Move, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface HotspotOption {
  id: string
  text: string
  imageUrl?: string
  position: {
    x: number
    y: number
  }
  action?: string
}

interface ImageHotspotEditorProps {
  backgroundImage: string
  options: HotspotOption[]
  onChange: (options: HotspotOption[]) => void
}

export function ImageHotspotEditor({ backgroundImage, options, onChange }: ImageHotspotEditorProps) {
  const [selectedOption, setSelectedOption] = useState<HotspotOption | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Handle adding a new hotspot
  const handleAddHotspot = () => {
    const newOption: HotspotOption = {
      id: `hotspot-${Date.now()}`,
      text: "New Hotspot",
      position: {
        x: 50,
        y: 50,
      },
    }

    onChange([...options, newOption])
    setSelectedOption(newOption)
  }

  // Handle updating a hotspot
  const handleUpdateHotspot = (updatedOption: HotspotOption) => {
    const updatedOptions = options.map((option) => (option.id === updatedOption.id ? updatedOption : option))

    onChange(updatedOptions)
    setSelectedOption(updatedOption)
  }

  // Handle deleting a hotspot
  const handleDeleteHotspot = (optionId: string) => {
    const updatedOptions = options.filter((option) => option.id !== optionId)
    onChange(updatedOptions)

    if (selectedOption?.id === optionId) {
      setSelectedOption(null)
    }
  }

  // Handle mouse down on hotspot
  const handleMouseDown = (e: React.MouseEvent, option: HotspotOption) => {
    e.preventDefault()

    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const hotspotX = (option.position.x * rect.width) / 100
    const hotspotY = (option.position.y * rect.height) / 100

    setDragOffset({
      x: e.clientX - hotspotX,
      y: e.clientY - hotspotY,
    })

    setSelectedOption(option)
    setIsDragging(true)
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!isDragging || !selectedOption || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()

    // Calculate new position in percentage
    const newX = Math.max(0, Math.min(100, ((e.clientX - dragOffset.x) / rect.width) * 100))
    const newY = Math.max(0, Math.min(100, ((e.clientY - dragOffset.y) / rect.height) * 100))

    // Update option position
    const updatedOption = {
      ...selectedOption,
      position: {
        x: newX,
        y: newY,
      },
    }

    handleUpdateHotspot(updatedOption)
  }

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging && selectedOption) {
      toast({
        title: "Hotspot moved",
        description: "The hotspot position has been updated",
      })
    }

    setIsDragging(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Image Hotspots</h3>
        <Button onClick={handleAddHotspot} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Hotspot
        </Button>
      </div>

      <div className="relative border rounded-md overflow-hidden">
        <div
          ref={containerRef}
          className="relative"
          style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", height: "400px" }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {options.map((option) => (
            <div
              key={option.id}
              className={cn(
                "absolute w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-move transform -translate-x-1/2 -translate-y-1/2",
                selectedOption?.id === option.id ? "ring-2 ring-white" : "",
                isDragging && selectedOption?.id === option.id ? "opacity-70" : "",
              )}
              style={{
                left: `${option.position.x}%`,
                top: `${option.position.y}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, option)}
              onClick={() => setSelectedOption(option)}
            >
              <Move className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>

      {selectedOption && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Edit Hotspot</h4>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteHotspot(selectedOption.id)}>
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotspot-text">Text</Label>
            <Input
              id="hotspot-text"
              value={selectedOption.text}
              onChange={(e) => handleUpdateHotspot({ ...selectedOption, text: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotspot-action">Action (URL or timestamp)</Label>
            <Input
              id="hotspot-action"
              value={selectedOption.action || ""}
              onChange={(e) => handleUpdateHotspot({ ...selectedOption, action: e.target.value })}
              placeholder="https://... or jump:120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotspot-image">Image URL (optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="hotspot-image"
                value={selectedOption.imageUrl || ""}
                onChange={(e) => handleUpdateHotspot({ ...selectedOption, imageUrl: e.target.value })}
                placeholder="https://..."
              />
              <Button variant="outline" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotspot-x">X Position (%)</Label>
              <Input
                id="hotspot-x"
                type="number"
                min="0"
                max="100"
                value={selectedOption.position.x.toFixed(2)}
                onChange={(e) =>
                  handleUpdateHotspot({
                    ...selectedOption,
                    position: {
                      ...selectedOption.position,
                      x: Number.parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotspot-y">Y Position (%)</Label>
              <Input
                id="hotspot-y"
                type="number"
                min="0"
                max="100"
                value={selectedOption.position.y.toFixed(2)}
                onChange={(e) =>
                  handleUpdateHotspot({
                    ...selectedOption,
                    position: {
                      ...selectedOption.position,
                      y: Number.parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

