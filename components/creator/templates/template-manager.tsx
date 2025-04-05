"use client"

import { useState } from "react"
import type { InteractionTemplate } from "@/types/interaction-template"
import { TemplateList } from "./template-list"
import { TemplateForm } from "./template-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TemplateManagerProps {
  initialTemplates: InteractionTemplate[]
  isAdmin: boolean
}

export function TemplateManager({ initialTemplates, isAdmin }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<InteractionTemplate[]>(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<InteractionTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("my-templates")

  // Filter templates
  const myTemplates = templates.filter((t) => !t.isGlobal)
  const globalTemplates = templates.filter((t) => t.isGlobal)

  const handleCreateTemplate = async (
    template: Omit<InteractionTemplate, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const response = await fetch("/api/interaction-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create template")
      }

      const { template: newTemplate } = await response.json()

      setTemplates((prev) => [...prev, newTemplate])
      setIsCreating(false)

      toast({
        title: "Template Created",
        description: "Your interaction template has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateTemplate = async (id: string, updates: Partial<InteractionTemplate>) => {
    try {
      const response = await fetch(`/api/interaction-templates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update template")
      }

      const { template: updatedTemplate } = await response.json()

      setTemplates((prev) => prev.map((t) => (t.id === id ? updatedTemplate : t)))
      setSelectedTemplate(null)

      toast({
        title: "Template Updated",
        description: "Your interaction template has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/interaction-templates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete template")
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id))

      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null)
      }

      toast({
        title: "Template Deleted",
        description: "Your interaction template has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interaction Templates</h1>
          <p className="text-muted-foreground">Create and manage templates for your interactive elements</p>
        </div>

        <Button
          onClick={() => {
            setSelectedTemplate(null)
            setIsCreating(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="my-templates" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="global-templates">Global Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-templates" className="mt-6">
          {isCreating ? (
            <TemplateForm onSubmit={handleCreateTemplate} onCancel={() => setIsCreating(false)} isAdmin={isAdmin} />
          ) : selectedTemplate ? (
            <TemplateForm
              template={selectedTemplate}
              onSubmit={(updates) => handleUpdateTemplate(selectedTemplate.id, updates)}
              onCancel={() => setSelectedTemplate(null)}
              onDelete={() => handleDeleteTemplate(selectedTemplate.id)}
              isAdmin={isAdmin}
            />
          ) : (
            <TemplateList templates={myTemplates} onSelect={setSelectedTemplate} onDelete={handleDeleteTemplate} />
          )}
        </TabsContent>

        <TabsContent value="global-templates" className="mt-6">
          <TemplateList
            templates={globalTemplates}
            onSelect={isAdmin ? setSelectedTemplate : undefined}
            onDelete={isAdmin ? handleDeleteTemplate : undefined}
            readOnly={!isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

