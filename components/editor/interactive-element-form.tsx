"use client"

import type React from "react"

import { useState } from "react"
import { Trash } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { InteractionTemplate } from "./interaction-templates"

interface InteractiveElementOption {
  text: string
  action?: string
  isCorrect?: boolean
}

interface InteractiveElement {
  id: string
  type: "quiz" | "decision" | "hotspot" | "poll"
  title: string
  description?: string
  timestamp: number
  duration: number
  options?: InteractiveElementOption[]
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

interface InteractiveElementFormProps {
  element: InteractiveElement
  onUpdate: (element: InteractiveElement) => void
  onDelete: (elementId: string) => void
  onApplyTemplate?: (template: InteractionTemplate) => void
}

export function InteractiveElementForm({ element, onUpdate, onDelete, onApplyTemplate }: InteractiveElementFormProps) {
  const [formData, setFormData] = useState<InteractiveElement>({ ...element })
  const [activeTab, setActiveTab] = useState("basic")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof InteractiveElement],
          [child]: value
        }
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as "quiz" | "decision" | "hotspot" | "poll",
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof InteractiveElement],
            [child]: value
          }
        }))
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
    }
  }

  const handleOptionChange = (index: number, field: string, value: string) => {
    const updatedOptions = [...(formData.options || [])]
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "isCorrect" ? value === "true" : value,
    }

    setFormData((prev) => ({ ...prev, options: updatedOptions }))
  }

  const handleAddOption = () => {
    const newOption: InteractiveElementOption = {
      text: `Option ${(formData.options?.length || 0) + 1}`,
    }

    if (formData.type === "quiz") {
      newOption.isCorrect = false
    } else if (formData.type === "decision") {
      newOption.action = ""
    }

    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }))
  }

  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...(formData.options || [])]
    updatedOptions.splice(index, 1)
    setFormData((prev) => ({ ...prev, options: updatedOptions }))
  }

  const handlePositionChange = (axis: "x" | "y", value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    const position = { ...(formData.position || { x: 50, y: 50 }) }
    position[axis] = Math.max(0, Math.min(100, numValue))

    setFormData((prev) => ({ ...prev, position }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const handleApplyTemplate = (template: InteractionTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template)
    } else {
      // Apply template directly to the current element
      setFormData((prev) => ({
        ...prev,
        style: template.style,
        optionStyle: template.optionStyle,
        position: template.position,
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Interactive Element</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" type="button">
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete this interactive element.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(element.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Element Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="decision">Decision Point</SelectItem>
                <SelectItem value="hotspot">Hotspot</SelectItem>
                <SelectItem value="poll">Poll</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timestamp">Timestamp (seconds)</Label>
              <Input
                id="timestamp"
                type="number"
                min="0"
                step="0.1"
                value={formData.timestamp}
                onChange={(e) => handleNumberChange(e, "timestamp")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                step="0.1"
                value={formData.duration}
                onChange={(e) => handleNumberChange(e, "duration")}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position-x">Position X (%)</Label>
              <Input
                id="position-x"
                type="number"
                min="0"
                max="100"
                value={formData.position?.x || 50}
                onChange={(e) => handlePositionChange("x", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position-y">Position Y (%)</Label>
              <Input
                id="position-y"
                type="number"
                min="0"
                max="100"
                value={formData.position?.y || 50}
                onChange={(e) => handlePositionChange("y", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style.backgroundColor">Background Color</Label>
              <div className="flex">
                <Input 
                  id="style.backgroundColor" 
                  name="style.backgroundColor" 
                  value={formData.style?.backgroundColor || "rgba(0, 0, 0, 0.8)"} 
                  onChange={handleChange} 
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div 
                    className="w-6 h-6 rounded" 
                    style={{ backgroundColor: formData.style?.backgroundColor || "rgba(0, 0, 0, 0.8)" }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style.textColor">Text Color</Label>
              <div className="flex">
                <Input 
                  id="style.textColor" 
                  name="style.textColor" 
                  value={formData.style?.textColor || "#ffffff"} 
                  onChange={handleChange} 
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div 
                    className="w-6 h-6 rounded" 
                    style={{ backgroundColor: formData.style?.textColor || "#ffffff" }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style.borderColor">Border Color</Label>
              <div className="flex">
                <Input 
                  id="style.borderColor" 
                  name="style.borderColor" 
                  value={formData.style?.borderColor || "#3b82f6"} 
                  onChange={handleChange} 
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div 
                    className="w-6 h-6 rounded" 
                    style={{ backgroundColor: formData.style?.borderColor || "#3b82f6" }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style.borderRadius">Border Radius</Label>
              <Input 
                id="style.borderRadius" 
                name="style.borderRadius" 
                value={formData.style?.borderRadius || "0.5rem"} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style.fontSize">Font Size</Label>
              <Input 
                id="style.fontSize" 
                name="style.fontSize" 
                value={formData.style?.fontSize || "1rem"} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style.padding">Padding</Label>
              <Input 
                id="style.padding" 
                name="style.padding" 
                value={formData.style?.padding || "1.5rem"} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="style.opacity">Opacity</Label>
              <Input 
                id="style.opacity" 
                name="style.opacity" 
                value={formData.style?.opacity || "0.95"} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Option Styling</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionStyle.backgroundColor">Background Color</Label>
                <div className="flex">
                  <Input 
                    id="optionStyle.backgroundColor" 
                    name="optionStyle.backgroundColor" 
                    value={formData.optionStyle?.backgroundColor || "transparent"} 
                    onChange={handleChange} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: formData.optionStyle?.backgroundColor || "transparent" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="optionStyle.textColor">Text Color</Label>
                <div className="flex">
                  <Input 
                    id="optionStyle.textColor" 
                    name="optionStyle.textColor" 
                    value={formData.optionStyle?.textColor || "#ffffff"} 
                    onChange={handleChange} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: formData.optionStyle?.textColor || "#ffffff" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="optionStyle.borderColor">Border Color</Label>
                <div className="flex">
                  <Input 
                    id="optionStyle.borderColor" 
                    name="optionStyle.borderColor" 
                    value={formData.optionStyle?.borderColor || "#ffffff"} 
                    onChange={handleChange} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: formData.optionStyle?.borderColor || "#ffffff" }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="optionStyle.borderRadius">Border Radius</Label>
                <Input 
                  id="optionStyle.borderRadius" 
                  name="optionStyle.borderRadius" 
                  value={formData.optionStyle?.borderRadius || "0.25rem"} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="optionStyle.hoverColor">Hover Color</Label>
                <div className="flex">
                  <Input 
                    id="optionStyle.hoverColor" 
                    name="optionStyle.hoverColor" 
                    value={formData.optionStyle?.hoverColor || "rgba(255, 255, 255, 0.2)"} 
                    onChange={handleChange} 
                    className="rounded-r-none"
                  />
                  <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                    <div 
                      className="w-6 h-6 rounded" 
                      style={{ backgroundColor: formData.optionStyle?.hoverColor || "rgba(255, 255, 255, 0.2)" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-3 pt-4">
          <div className="flex justify-between items-center">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
              Add Option
            </Button>
          </div>

          <div className="space-y-3">
            {formData.options?.map((option, index) => (
              <div key={index} className="rounded-md border p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Option {index + 1}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOption(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`option-${index}-text`}>Text</Label>
                  <Input
                    id={`option-${index}-text`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                  />
                </div>

                {formData.type === "quiz" && (
                  <div className="space-y-2">
                    <Label htmlFor={`option-${index}-correct`}>Is Correct</Label>
                    <Select
                      value={option.isCorrect ? "true" : "false"}
                      onValueChange={(value) => handleOptionChange(index, "isCorrect", value)}
                    >
                      <SelectTrigger id={`option-${index}-correct`}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.type === "decision" && (
                  <div className="space-y-2">
                    <Label htmlFor={`option-${index}-action`}>Action (e.g., jump:120)</Label>
                    <Input
                      id={`option-${index}-action`}
                      value={option.action || ""}
                      onChange={(e) => handleOptionChange(index, "action", e.target.value)}
                      placeholder="jump:120"
                    />
                  </div>
                )}
              </div>
            ))}

            {(!formData.options || formData.options.length === 0) && (
              <div className="text-center py-4 border rounded-md">
                <p className="text-sm text-muted-foreground">No options added yet. Click "Add Option" to create one.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="feedback.correct">Correct Answer Feedback</Label>
            <Textarea
              id="feedback.correct"
              name="feedback.correct"
              value={formData.feedback?.correct || ""}
              onChange={handleChange}
              placeholder="Great job! That's correct."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback.incorrect">Incorrect Answer Feedback</Label>
            <Textarea
              id="feedback.incorrect"
              name="feedback.incorrect"
              value={formData.feedback?.incorrect || ""}
              onChange={handleChange}
              placeholder="Sorry, that's not right. Try again!"
              rows={2}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  )
}

