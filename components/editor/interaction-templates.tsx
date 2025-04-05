"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Check, Edit, Plus, Save, Trash } from "lucide-react"
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

export interface InteractionTemplate {
  id: string
  name: string
  description: string
  style: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  position?: {
    x: number
    y: number
  }
}

interface InteractionTemplatesProps {
  onSelectTemplate: (template: InteractionTemplate) => void
}

export function InteractionTemplates({ onSelectTemplate }: InteractionTemplatesProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<InteractionTemplate[]>([
    {
      id: "default",
      name: "Default",
      description: "Standard dark overlay with blue accent",
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        borderColor: "#3b82f6",
        borderRadius: "0.5rem",
        fontSize: "1rem",
        padding: "1.5rem",
        opacity: "0.95",
      },
      optionStyle: {
        backgroundColor: "transparent",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        borderRadius: "0.25rem",
        hoverColor: "rgba(255, 255, 255, 0.2)",
      },
      position: {
        x: 50,
        y: 50,
      },
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean, minimalist style with subtle borders",
      style: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        textColor: "#1e293b",
        borderColor: "#e2e8f0",
        borderRadius: "0.25rem",
        fontSize: "0.875rem",
        padding: "1rem",
        opacity: "0.98",
      },
      optionStyle: {
        backgroundColor: "#f8fafc",
        textColor: "#1e293b",
        borderColor: "#e2e8f0",
        borderRadius: "0.125rem",
        hoverColor: "#f1f5f9",
      },
      position: {
        x: 50,
        y: 50,
      },
    },
    {
      id: "vibrant",
      name: "Vibrant",
      description: "Bold colors with high contrast",
      style: {
        backgroundColor: "#6366f1",
        textColor: "#ffffff",
        borderColor: "#8b5cf6",
        borderRadius: "1rem",
        fontSize: "1.125rem",
        padding: "1.5rem",
        opacity: "0.95",
      },
      optionStyle: {
        backgroundColor: "#4f46e5",
        textColor: "#ffffff",
        borderColor: "#818cf8",
        borderRadius: "0.5rem",
        hoverColor: "#4338ca",
      },
      position: {
        x: 50,
        y: 50,
      },
    },
    {
      id: "corner-top-right",
      name: "Top Right Corner",
      description: "Positioned in the top right corner",
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        borderColor: "#3b82f6",
        borderRadius: "0.5rem",
        fontSize: "1rem",
        padding: "1.5rem",
        opacity: "0.95",
      },
      optionStyle: {
        backgroundColor: "transparent",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        borderRadius: "0.25rem",
        hoverColor: "rgba(255, 255, 255, 0.2)",
      },
      position: {
        x: 85,
        y: 15,
      },
    },
    {
      id: "bottom-banner",
      name: "Bottom Banner",
      description: "Full-width banner at the bottom",
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        textColor: "#ffffff",
        borderColor: "#f43f5e",
        borderRadius: "0.5rem 0.5rem 0 0",
        fontSize: "1rem",
        padding: "1rem",
        opacity: "0.98",
      },
      optionStyle: {
        backgroundColor: "#f43f5e",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        borderRadius: "0.25rem",
        hoverColor: "#e11d48",
      },
      position: {
        x: 50,
        y: 90,
      },
    },
  ])
  const [editingTemplate, setEditingTemplate] = useState<InteractionTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectTemplate = (template: InteractionTemplate) => {
    onSelectTemplate(template)
  }

  const handleSaveTemplate = (template: InteractionTemplate) => {
    if (isCreating) {
      // Add new template
      const newTemplate = {
        ...template,
        id: `template-${Date.now()}`,
      }
      setTemplates([...templates, newTemplate])
      toast({
        title: "Template Created",
        description: `Created new template "${template.name}"`,
      })
    } else {
      // Update existing template
      setTemplates(templates.map((t) => (t.id === template.id ? template : t)))
      toast({
        title: "Template Updated",
        description: `Updated template "${template.name}"`,
      })
    }
    setEditingTemplate(null)
    setIsCreating(false)
  }

  const handleDeleteTemplate = (templateId: string) => {
    // Don't allow deleting built-in templates
    if (["default", "minimal", "vibrant", "corner-top-right", "bottom-banner"].includes(templateId)) {
      toast({
        title: "Cannot Delete",
        description: "Built-in templates cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setTemplates(templates.filter((t) => t.id !== templateId))
    toast({
      title: "Template Deleted",
      description: "The template has been deleted.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Interaction Templates</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCreating(true)
            setEditingTemplate({
              id: "",
              name: "New Template",
              description: "Custom template",
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                textColor: "#ffffff",
                borderColor: "#3b82f6",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                padding: "1.5rem",
                opacity: "0.95",
              },
              optionStyle: {
                backgroundColor: "transparent",
                textColor: "#ffffff",
                borderColor: "#ffffff",
                borderRadius: "0.25rem",
                hoverColor: "rgba(255, 255, 255, 0.2)",
              },
              position: {
                x: 50,
                y: 50,
              },
            })
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Create Template
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-24 w-full bg-gray-100 flex items-center justify-center">
                <div
                  className="absolute rounded shadow-md"
                  style={{
                    left: `${template.position?.x || 50}%`,
                    top: `${template.position?.y || 50}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: template.style.backgroundColor,
                    color: template.style.textColor,
                    borderRadius: template.style.borderRadius,
                    padding: "0.5rem",
                    border: `1px solid ${template.style.borderColor}`,
                    fontSize: "0.75rem",
                    maxWidth: "80%",
                  }}
                >
                  <div className="font-medium">Sample Interaction</div>
                  <div className="flex gap-1 mt-1">
                    <div
                      className="px-2 py-0.5 text-xs rounded"
                      style={{
                        backgroundColor: template.optionStyle.backgroundColor,
                        color: template.optionStyle.textColor,
                        borderRadius: template.optionStyle.borderRadius,
                        border: `1px solid ${template.optionStyle.borderColor}`,
                      }}
                    >
                      Option
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-3 flex justify-between items-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false)
                  setEditingTemplate(template)
                }}
              >
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                <Check className="h-3 w-3 mr-1" /> Use
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Template Editor Dialog */}
      {editingTemplate && (
        <Dialog
          open={!!editingTemplate}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTemplate(null)
              setIsCreating(false)
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isCreating ? "Create Template" : "Edit Template"}</DialogTitle>
              <DialogDescription>Customize the appearance and behavior of this interaction template.</DialogDescription>
            </DialogHeader>

            <TemplateForm
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onDelete={handleDeleteTemplate}
              isBuiltIn={["default", "minimal", "vibrant", "corner-top-right", "bottom-banner"].includes(
                editingTemplate.id,
              )}
              isNew={isCreating}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface TemplateFormProps {
  template: InteractionTemplate
  onSave: (template: InteractionTemplate) => void
  onDelete: (templateId: string) => void
  isBuiltIn: boolean
  isNew: boolean
}

function TemplateForm({ template, onSave, onDelete, isBuiltIn, isNew }: TemplateFormProps) {
  const [formData, setFormData] = useState<InteractionTemplate>({ ...template })
  const [activeTab, setActiveTab] = useState("basic")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof InteractionTemplate],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
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
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} readOnly={isBuiltIn} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              readOnly={isBuiltIn}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position-x">Default Position X (%)</Label>
              <Input
                id="position-x"
                type="number"
                min="0"
                max="100"
                value={formData.position?.x || 50}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                readOnly={isBuiltIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position-y">Default Position Y (%)</Label>
              <Input
                id="position-y"
                type="number"
                min="0"
                max="100"
                value={formData.position?.y || 50}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                readOnly={isBuiltIn}
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
                  value={formData.style.backgroundColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.style.backgroundColor }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style.textColor">Text Color</Label>
              <div className="flex">
                <Input
                  id="style.textColor"
                  name="style.textColor"
                  value={formData.style.textColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.style.textColor }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style.borderColor">Border Color</Label>
              <div className="flex">
                <Input
                  id="style.borderColor"
                  name="style.borderColor"
                  value={formData.style.borderColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.style.borderColor }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style.borderRadius">Border Radius</Label>
              <Input
                id="style.borderRadius"
                name="style.borderRadius"
                value={formData.style.borderRadius}
                onChange={handleChange}
                readOnly={isBuiltIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style.fontSize">Font Size</Label>
              <Input
                id="style.fontSize"
                name="style.fontSize"
                value={formData.style.fontSize}
                onChange={handleChange}
                readOnly={isBuiltIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style.padding">Padding</Label>
              <Input
                id="style.padding"
                name="style.padding"
                value={formData.style.padding}
                onChange={handleChange}
                readOnly={isBuiltIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style.opacity">Opacity</Label>
              <Input
                id="style.opacity"
                name="style.opacity"
                value={formData.style.opacity}
                onChange={handleChange}
                readOnly={isBuiltIn}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="optionStyle.backgroundColor">Background Color</Label>
              <div className="flex">
                <Input
                  id="optionStyle.backgroundColor"
                  name="optionStyle.backgroundColor"
                  value={formData.optionStyle.backgroundColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: formData.optionStyle.backgroundColor }}
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
                  value={formData.optionStyle.textColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.optionStyle.textColor }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionStyle.borderColor">Border Color</Label>
              <div className="flex">
                <Input
                  id="optionStyle.borderColor"
                  name="optionStyle.borderColor"
                  value={formData.optionStyle.borderColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.optionStyle.borderColor }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionStyle.borderRadius">Border Radius</Label>
              <Input
                id="optionStyle.borderRadius"
                name="optionStyle.borderRadius"
                value={formData.optionStyle.borderRadius}
                onChange={handleChange}
                readOnly={isBuiltIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionStyle.hoverColor">Hover Color</Label>
              <div className="flex">
                <Input
                  id="optionStyle.hoverColor"
                  name="optionStyle.hoverColor"
                  value={formData.optionStyle.hoverColor}
                  onChange={handleChange}
                  readOnly={isBuiltIn}
                  className="rounded-r-none"
                />
                <div className="w-10 h-10 rounded-r-md border border-l-0 border-input flex items-center justify-center">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.optionStyle.hoverColor }}></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6 flex items-center justify-between">
        {!isNew && !isBuiltIn && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this template. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(template.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isBuiltIn ? (
          <div className="text-sm text-muted-foreground">Built-in templates cannot be modified</div>
        ) : (
          <Button type="submit">
            <Save className="h-4 w-4 mr-1" />
            {isNew ? "Create Template" : "Save Changes"}
          </Button>
        )}
      </DialogFooter>
    </form>
  )
}

