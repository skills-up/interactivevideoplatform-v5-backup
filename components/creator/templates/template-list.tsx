"use client"

import type { InteractionTemplate } from "@/types/interaction-template"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Edit, Trash2, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TemplateListProps {
  templates: InteractionTemplate[]
  onSelect?: (template: InteractionTemplate) => void
  onDelete?: (id: string) => void
  readOnly?: boolean
}

export function TemplateList({ templates, onSelect, onDelete, readOnly = false }: TemplateListProps) {
  const handleCopyTemplate = async (template: InteractionTemplate) => {
    try {
      // Create a copy of the template
      const { id, userId, createdAt, updatedAt, isGlobal, ...templateData } = template

      const response = await fetch("/api/interaction-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...templateData,
          name: `Copy of ${template.name}`,
          isGlobal: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to copy template")
      }

      toast({
        title: "Template Copied",
        description: "A copy of the template has been created.",
      })

      // Refresh the page to show the new template
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No templates found</p>
        {!readOnly && (
          <Button
            onClick={() =>
              onSelect &&
              onSelect({
                id: "",
                name: "",
                description: "",
                type: "quiz",
                style: {
                  position: "center",
                  size: "medium",
                },
                isDefault: false,
                isGlobal: false,
                userId: "",
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            }
            variant="outline"
            className="mt-4"
          >
            Create your first template
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <Badge>{template.type}</Badge>
            </div>
            <CardDescription className="line-clamp-2">{template.description || "No description"}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-32 bg-muted rounded-md flex items-center justify-center p-4 overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: template.style.backgroundColor || "transparent",
                  color: template.style.textColor || "inherit",
                  borderRadius: template.style.borderRadius ? `${template.style.borderRadius}px` : undefined,
                  border: template.style.borderColor ? `1px solid ${template.style.borderColor}` : undefined,
                  opacity: template.style.opacity || 1,
                  fontFamily: template.style.fontFamily || "inherit",
                  fontSize: template.style.fontSize ? `${template.style.fontSize}px` : undefined,
                  padding: template.style.padding ? `${template.style.padding}px` : undefined,
                  boxShadow: template.style.shadow ? "0 4px 6px rgba(0, 0, 0, 0.1)" : undefined,
                }}
              >
                {template.type === "quiz" && "Quiz Question Preview"}
                {template.type === "poll" && "Poll Question Preview"}
                {template.type === "form" && "Form Input Preview"}
                {template.type === "link" && "Link Button Preview"}
                {template.type === "hotspot" && "Hotspot Preview"}
                {template.type === "note" && "Note Text Preview"}
                {template.type === "chapter" && "Chapter Marker Preview"}
                {template.type === "product" && "Product Card Preview"}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-3">
            <div className="text-xs text-muted-foreground">{formatDate(template.updatedAt)}</div>

            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => handleCopyTemplate(template)} title="Copy template">
                <Copy className="h-4 w-4" />
              </Button>

              {!readOnly && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect && onSelect(template)}
                    title="Edit template"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {onDelete && !template.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(template.id)} title="Delete template">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

