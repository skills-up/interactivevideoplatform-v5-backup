"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useUITemplate } from "@/components/ui-template-provider"
import type { UITemplate } from "@/types/ui-template"
import { Loader2, Plus, Trash2, Copy, Check, Save, Edit } from "lucide-react"
import { AuthRequiredError } from "@/lib/exceptions"

export default function AppearanceSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTemplate, setTemplate } = useUITemplate()
  const [templates, setTemplates] = useState<UITemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<UITemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      throw new AuthRequiredError()
    }
  }, [status])

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/ui-templates")
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates)
        }
      } catch (error) {
        console.error("Error loading templates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      loadTemplates()
    }
  }, [session])

  // Set selected template when currentTemplate changes
  useEffect(() => {
    if (currentTemplate) {
      setSelectedTemplate(currentTemplate)
    }
  }, [currentTemplate])

  // Create a new template
  const createNewTemplate = () => {
    // Start with current template as base
    const newTemplate = {
      ...currentTemplate,
      id: "",
      name: "New Template",
      description: "My custom template",
      isPublic: false,
    }

    setSelectedTemplate(newTemplate as UITemplate)
    setIsEditing(true)
  }

  // Duplicate selected template
  const duplicateTemplate = async () => {
    if (!selectedTemplate) return

    try {
      setIsSaving(true)

      const templateData = {
        ...selectedTemplate,
        name: `${selectedTemplate.name} (Copy)`,
        isPublic: false,
      }

      // Remove id to create a new template
      delete (templateData as any).id
      delete (templateData as any)._id

      const response = await fetch("/api/ui-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        const data = await response.json()

        // Add to templates list
        setTemplates([data.template, ...templates])

        // Select the new template
        setSelectedTemplate(data.template)

        // Apply the template
        setTemplate(data.template)
      }
    } catch (error) {
      console.error("Error duplicating template:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Delete selected template
  const deleteTemplate = async () => {
    if (!selectedTemplate || !selectedTemplate.id) return

    if (!confirm("Are you sure you want to delete this template?")) {
      return
    }

    try {
      setIsSaving(true)

      const response = await fetch(`/api/ui-templates/${selectedTemplate.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove from templates list
        setTemplates(templates.filter((t) => t.id !== selectedTemplate.id))

        // Select the first available template
        if (templates.length > 0) {
          const firstTemplate = templates.find((t) => t.id !== selectedTemplate.id)
          if (firstTemplate) {
            setSelectedTemplate(firstTemplate)
            setTemplate(firstTemplate)
          }
        }
      }
    } catch (error) {
      console.error("Error deleting template:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Save template changes
  const saveTemplate = async () => {
    if (!selectedTemplate) return

    try {
      setIsSaving(true)

      if (selectedTemplate.id) {
        // Update existing template
        const response = await fetch(`/api/ui-templates/${selectedTemplate.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedTemplate),
        })

        if (response.ok) {
          const data = await response.json()

          // Update in templates list
          setTemplates(templates.map((t) => (t.id === selectedTemplate.id ? data.template : t)))

          // Apply the updated template
          setTemplate(data.template)
          setIsEditing(false)
        }
      } else {
        // Create new template
        const response = await fetch("/api/ui-templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedTemplate),
        })

        if (response.ok) {
          const data = await response.json()

          // Add to templates list
          setTemplates([data.template, ...templates])

          // Select the new template
          setSelectedTemplate(data.template)

          // Apply the template
          setTemplate(data.template)
          setIsEditing(false)
        }
      }
    } catch (error) {
      console.error("Error saving template:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Apply selected template
  const applyTemplate = () => {
    if (!selectedTemplate) return

    setTemplate(selectedTemplate)
  }

  // Handle template selection
  const handleTemplateSelect = (template: UITemplate) => {
    setSelectedTemplate(template)
    setIsEditing(false)
  }

  // Handle field change in the form
  const handleFieldChange = (field: string, value: any) => {
    if (!selectedTemplate) return

    // Handle nested fields
    const fields = field.split(".")

    if (fields.length === 1) {
      setSelectedTemplate({
        ...selectedTemplate,
        [field]: value,
      })
    } else {
      // Deep clone the template
      const newTemplate = JSON.parse(JSON.stringify(selectedTemplate))

      // Navigate to the nested field
      let current = newTemplate
      for (let i = 0; i < fields.length - 1; i++) {
        current = current[fields[i]]
      }

      // Set the value
      current[fields[fields.length - 1]] = value

      setSelectedTemplate(newTemplate)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Appearance Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>UI Templates</CardTitle>
              <CardDescription>Select a template to customize the appearance of the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                      selectedTemplate?.id === template.id ? "bg-primary/10 border border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div>
                      <div className="font-medium">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      )}
                    </div>
                    {currentTemplate?.id === template.id && <Check className="h-5 w-5 text-primary" />}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={createNewTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={duplicateTemplate} disabled={!selectedTemplate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteTemplate}
                  disabled={!selectedTemplate || selectedTemplate.isDefault}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Template editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit Template" : "Template Preview"}</CardTitle>
                <CardDescription>
                  {isEditing ? "Customize the appearance of the platform" : "Preview and apply the selected template"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Tabs defaultValue="basic">
                    <TabsList className="mb-4">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="typography">Typography</TabsTrigger>
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="components">Components</TabsTrigger>
                      <TabsTrigger value="custom">Custom CSS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Template Name</Label>
                          <Input
                            id="name"
                            value={selectedTemplate.name}
                            onChange={(e) => handleFieldChange("name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={selectedTemplate.description || ""}
                            onChange={(e) => handleFieldChange("description", e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isPublic"
                            checked={selectedTemplate.isPublic || false}
                            onCheckedChange={(checked) => handleFieldChange("isPublic", checked)}
                          />
                          <Label htmlFor="isPublic">Make this template public</Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="colors">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primary">Primary Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="primary"
                              type="color"
                              className="w-12 h-10 p-1"
                              value={selectedTemplate.theme.colors.primary}
                              onChange={(e) => handleFieldChange("theme.colors.primary", e.target.value)}
                            />
                            <Input
                              value={selectedTemplate.theme.colors.primary}
                              onChange={(e) => handleFieldChange("theme.colors.primary", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary">Secondary Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="secondary"
                              type="color"
                              className="w-12 h-10 p-1"
                              value={selectedTemplate.theme.colors.secondary}
                              onChange={(e) => handleFieldChange("theme.colors.secondary", e.target.value)}
                            />
                            <Input
                              value={selectedTemplate.theme.colors.secondary}
                              onChange={(e) => handleFieldChange("theme.colors.secondary", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="accent">Accent Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="accent"
                              type="color"
                              className="w-12 h-10 p-1"
                              value={selectedTemplate.theme.colors.accent}
                              onChange={(e) => handleFieldChange("theme.colors.accent", e.target.value)}
                            />
                            <Input
                              value={selectedTemplate.theme.colors.accent}
                              onChange={(e) => handleFieldChange("theme.colors.accent", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="background">Background Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="background"
                              type="color"
                              className="w-12 h-10 p-1"
                              value={selectedTemplate.theme.colors.background}
                              onChange={(e) => handleFieldChange("theme.colors.background", e.target.value)}
                            />
                            <Input
                              value={selectedTemplate.theme.colors.background}
                              onChange={(e) => handleFieldChange("theme.colors.background", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="text">Text Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="text"
                              type="color"
                              className="w-12 h-10 p-1"
                              value={selectedTemplate.theme.colors.text}
                              onChange={(e) => handleFieldChange("theme.colors.text", e.target.value)}
                            />
                            <Input
                              value={selectedTemplate.theme.colors.text}
                              onChange={(e) => handleFieldChange("theme.colors.text", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="heading">Heading Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="heading"
                              type="color"
                              className="w-12 h-10 p-1"
                              value={selectedTemplate.theme.colors.heading}
                              onChange={(e) => handleFieldChange("theme.colors.heading", e.target.value)}
                            />
                            <Input
                              value={selectedTemplate.theme.colors.heading}
                              onChange={(e) => handleFieldChange("theme.colors.heading", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="typography">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bodyFont">Body Font</Label>
                          <Input
                            id="bodyFont"
                            value={selectedTemplate.theme.fonts.body}
                            onChange={(e) => handleFieldChange("theme.fonts.body", e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">Example: Inter, sans-serif</p>
                        </div>
                        <div>
                          <Label htmlFor="headingFont">Heading Font</Label>
                          <Input
                            id="headingFont"
                            value={selectedTemplate.theme.fonts.heading}
                            onChange={(e) => handleFieldChange("theme.fonts.heading", e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">Example: Inter, sans-serif</p>
                        </div>
                        <div>
                          <Label htmlFor="borderRadius">Border Radius</Label>
                          <Input
                            id="borderRadius"
                            value={selectedTemplate.theme.borderRadius}
                            onChange={(e) => handleFieldChange("theme.borderRadius", e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">Example: 0.375rem</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="layout">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="headerHeight">Header Height</Label>
                            <Input
                              id="headerHeight"
                              value={selectedTemplate.layout.header.height}
                              onChange={(e) => handleFieldChange("layout.header.height", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="headerPosition">Header Position</Label>
                            <select
                              id="headerPosition"
                              className="w-full p-2 border rounded-md"
                              value={selectedTemplate.layout.header.position}
                              onChange={(e) => handleFieldChange("layout.header.position", e.target.value)}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="sticky">Sticky</option>
                              <option value="relative">Relative</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sidebarWidth">Sidebar Width</Label>
                            <Input
                              id="sidebarWidth"
                              value={selectedTemplate.layout.sidebar.width}
                              onChange={(e) => handleFieldChange("layout.sidebar.width", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="sidebarPosition">Sidebar Position</Label>
                            <select
                              id="sidebarPosition"
                              className="w-full p-2 border rounded-md"
                              value={selectedTemplate.layout.sidebar.position}
                              onChange={(e) => handleFieldChange("layout.sidebar.position", e.target.value)}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="sticky">Sticky</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="contentMaxWidth">Content Max Width</Label>
                          <Input
                            id="contentMaxWidth"
                            value={selectedTemplate.layout.content.maxWidth}
                            onChange={(e) => handleFieldChange("layout.content.maxWidth", e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Buttons</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="primaryBtnBg">Primary Button Background</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="primaryBtnBg"
                                  type="color"
                                  className="w-12 h-10 p-1"
                                  value={selectedTemplate.components.buttons.primary.backgroundColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.buttons.primary.backgroundColor", e.target.value)
                                  }
                                />
                                <Input
                                  value={selectedTemplate.components.buttons.primary.backgroundColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.buttons.primary.backgroundColor", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="primaryBtnText">Primary Button Text</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="primaryBtnText"
                                  type="color"
                                  className="w-12 h-10 p-1"
                                  value={selectedTemplate.components.buttons.primary.textColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.buttons.primary.textColor", e.target.value)
                                  }
                                />
                                <Input
                                  value={selectedTemplate.components.buttons.primary.textColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.buttons.primary.textColor", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Cards</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cardBg">Card Background</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="cardBg"
                                  type="color"
                                  className="w-12 h-10 p-1"
                                  value={selectedTemplate.components.cards.backgroundColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.cards.backgroundColor", e.target.value)
                                  }
                                />
                                <Input
                                  value={selectedTemplate.components.cards.backgroundColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.cards.backgroundColor", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="cardRadius">Card Border Radius</Label>
                              <Input
                                id="cardRadius"
                                value={selectedTemplate.components.cards.borderRadius}
                                onChange={(e) => handleFieldChange("components.cards.borderRadius", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Inputs</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="inputBg">Input Background</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="inputBg"
                                  type="color"
                                  className="w-12 h-10 p-1"
                                  value={selectedTemplate.components.inputs.backgroundColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.inputs.backgroundColor", e.target.value)
                                  }
                                />
                                <Input
                                  value={selectedTemplate.components.inputs.backgroundColor}
                                  onChange={(e) =>
                                    handleFieldChange("components.inputs.backgroundColor", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="inputBorder">Input Border Color</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="inputBorder"
                                  type="color"
                                  className="w-12 h-10 p-1"
                                  value={selectedTemplate.components.inputs.borderColor}
                                  onChange={(e) => handleFieldChange("components.inputs.borderColor", e.target.value)}
                                />
                                <Input
                                  value={selectedTemplate.components.inputs.borderColor}
                                  onChange={(e) => handleFieldChange("components.inputs.borderColor", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="custom">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="customCSS">Custom CSS</Label>
                          <Textarea
                            id="customCSS"
                            className="font-mono h-64"
                            value={selectedTemplate.customCSS || ""}
                            onChange={(e) => handleFieldChange("customCSS", e.target.value)}
                            placeholder=":root {
  /* Custom CSS variables */
}

/* Custom styles */
.header {
  /* Custom header styles */
}
"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Add custom CSS to override default styles
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Template Info</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Name:</span> {selectedTemplate.name}
                          </div>
                          {selectedTemplate.description && (
                            <div>
                              <span className="font-medium">Description:</span> {selectedTemplate.description}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Visibility:</span>{" "}
                            {selectedTemplate.isPublic ? "Public" : "Private"}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Color Palette</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(selectedTemplate.theme.colors).map(([name, color]) => (
                            <div key={name} className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} />
                              <span className="text-xs mt-1 capitalize">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Preview</h3>
                      <div className="border rounded-md p-4 space-y-4">
                        <div>
                          <h4 className="text-xl font-bold mb-2">Heading Example</h4>
                          <p>
                            This is a paragraph of text that demonstrates the typography settings of this template. The
                            font family, size, and colors are all customizable.
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button>Primary Button</Button>
                          <Button variant="outline">Secondary Button</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="preview-input">Input Example</Label>
                            <Input id="preview-input" placeholder="Input text" />
                          </div>
                          <div>
                            <Label htmlFor="preview-select">Select Example</Label>
                            <select id="preview-select" className="w-full p-2 border rounded-md">
                              <option>Option 1</option>
                              <option>Option 2</option>
                              <option>Option 3</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset to original template
                        const original = templates.find((t) => t.id === selectedTemplate.id)
                        if (original) {
                          setSelectedTemplate(original)
                        }
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveTemplate} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Template
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      disabled={!selectedTemplate || selectedTemplate.isDefault}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                    <Button
                      onClick={applyTemplate}
                      disabled={!selectedTemplate || currentTemplate?.id === selectedTemplate.id}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply Template
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Select a template from the list or create a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

