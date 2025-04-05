"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/ui/color-picker"
import { useToast } from "@/components/ui/use-toast"
import { Paintbrush, Upload, Globe, Code, Palette, ImageIcon, Save } from "lucide-react"
import { useSession } from "next-auth/react"

interface WhiteLabelSettingsProps {
  className?: string
}

export function WhiteLabelSettings({ className }: WhiteLabelSettingsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [brandingSettings, setBrandingSettings] = useState({
    enabled: false,
    siteName: "Interactive Video Platform",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#10b981",
    accentColor: "#8b5cf6",
    customCss: "",
    customJs: "",
    customDomain: "",
    hideFooter: false,
    hidePoweredBy: false,
    customEmailHeader: "",
    customEmailFooter: "",
  })
  const { data: session } = useSession()
  const { toast } = useToast()

  // Fetch branding settings
  useEffect(() => {
    const fetchBrandingSettings = async () => {
      if (!session?.user) return

      setIsLoading(true)

      try {
        const response = await fetch("/api/branding/settings")

        if (response.ok) {
          const data = await response.json()
          setBrandingSettings(data)
        }
      } catch (error) {
        console.error("Error fetching branding settings:", error)
        toast({
          title: "Error",
          description: "Failed to load branding settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrandingSettings()
  }, [session, toast])

  // Save branding settings
  const saveSettings = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/branding/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(brandingSettings),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      toast({
        title: "Settings Saved",
        description: "Your branding settings have been updated",
      })

      // Apply changes immediately if enabled
      if (brandingSettings.enabled) {
        applyBrandingChanges()
      }
    } catch (error) {
      console.error("Error saving branding settings:", error)
      toast({
        title: "Error",
        description: "Failed to save branding settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Apply branding changes to the current page
  const applyBrandingChanges = () => {
    // Update document title
    document.title = brandingSettings.siteName

    // Update favicon if provided
    if (brandingSettings.faviconUrl) {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (favicon) {
        favicon.href = brandingSettings.faviconUrl
      } else {
        const newFavicon = document.createElement("link")
        newFavicon.rel = "icon"
        newFavicon.href = brandingSettings.faviconUrl
        document.head.appendChild(newFavicon)
      }
    }

    // Apply custom CSS
    let styleElement = document.getElementById("custom-branding-css")
    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = "custom-branding-css"
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = `
      :root {
        --primary: ${brandingSettings.primaryColor};
        --primary-foreground: white;
        --secondary: ${brandingSettings.secondaryColor};
        --secondary-foreground: white;
        --accent: ${brandingSettings.accentColor};
        --accent-foreground: white;
      }
      ${brandingSettings.customCss}
    `

    // Apply custom JS
    if (brandingSettings.customJs) {
      try {
        // eslint-disable-next-line no-new-func
        const customJsFunction = new Function(brandingSettings.customJs)
        customJsFunction()
      } catch (error) {
        console.error("Error executing custom JS:", error)
      }
    }
  }

  // Handle file upload for logo and favicon
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      const response = await fetch("/api/branding/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error(`Failed to upload ${type}`)

      const data = await response.json()

      if (type === "logo") {
        setBrandingSettings({
          ...brandingSettings,
          logoUrl: data.url,
        })
      } else {
        setBrandingSettings({
          ...brandingSettings,
          faviconUrl: data.url,
        })
      }

      toast({
        title: "Upload Successful",
        description: `Your ${type} has been uploaded`,
      })
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast({
        title: "Upload Error",
        description: `Failed to upload ${type}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Paintbrush className="h-5 w-5 mr-2" />
              White Label & Branding
            </CardTitle>
            <Switch
              checked={brandingSettings.enabled}
              onCheckedChange={(checked) => {
                setBrandingSettings({
                  ...brandingSettings,
                  enabled: checked,
                })
              }}
            />
          </div>
          <CardDescription>Customize the look and feel of your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="domain">
                <Globe className="h-4 w-4 mr-2" />
                Domain
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Code className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={brandingSettings.siteName}
                    onChange={(e) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        siteName: e.target.value,
                      })
                    }}
                    placeholder="Interactive Video Platform"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-32 border rounded flex items-center justify-center bg-muted">
                        {brandingSettings.logoUrl ? (
                          <img
                            src={brandingSettings.logoUrl || "/placeholder.svg"}
                            alt="Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          id="logo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "logo")}
                        />
                        <Label htmlFor="logo-upload" asChild>
                          <Button variant="outline" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 border rounded flex items-center justify-center bg-muted">
                        {brandingSettings.faviconUrl ? (
                          <img
                            src={brandingSettings.faviconUrl || "/placeholder.svg"}
                            alt="Favicon"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          id="favicon-upload"
                          className="hidden"
                          accept="image/x-icon,image/png,image/svg+xml"
                          onChange={(e) => handleFileUpload(e, "favicon")}
                        />
                        <Label htmlFor="favicon-upload" asChild>
                          <Button variant="outline" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Favicon
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <ColorPicker
                      color={brandingSettings.primaryColor}
                      onChange={(color) => {
                        setBrandingSettings({
                          ...brandingSettings,
                          primaryColor: color,
                        })
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <ColorPicker
                      color={brandingSettings.secondaryColor}
                      onChange={(color) => {
                        setBrandingSettings({
                          ...brandingSettings,
                          secondaryColor: color,
                        })
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <ColorPicker
                      color={brandingSettings.accentColor}
                      onChange={(color) => {
                        setBrandingSettings({
                          ...brandingSettings,
                          accentColor: color,
                        })
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="hide-footer" className="flex-1">
                    Hide Footer
                  </Label>
                  <Switch
                    id="hide-footer"
                    checked={brandingSettings.hideFooter}
                    onCheckedChange={(checked) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        hideFooter: checked,
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="hide-powered-by" className="flex-1">
                    Hide "Powered by" Text
                  </Label>
                  <Switch
                    id="hide-powered-by"
                    checked={brandingSettings.hidePoweredBy}
                    onCheckedChange={(checked) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        hidePoweredBy: checked,
                      })
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="domain" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <Input
                    id="custom-domain"
                    value={brandingSettings.customDomain}
                    onChange={(e) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        customDomain: e.target.value,
                      })
                    }}
                    placeholder="videos.yourdomain.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your custom domain to use instead of our default domain. You'll need to set up DNS records to
                    point to our servers.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">DNS Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    To use your custom domain, add these DNS records to your domain provider:
                  </p>

                  <div className="space-y-2 font-mono text-sm">
                    <div className="p-2 bg-muted rounded">
                      <span className="text-primary">CNAME</span> videos.yourdomain.com →
                      cdn.interactivevideoplatform.com
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <span className="text-primary">TXT</span> _ivp-verification.yourdomain.com → ivp-verify=123456789
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={brandingSettings.customCss}
                    onChange={(e) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        customCss: e.target.value,
                      })
                    }}
                    placeholder=".my-custom-class { color: red; }"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add custom CSS to further customize the appearance of your platform.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-js">Custom JavaScript</Label>
                  <Textarea
                    id="custom-js"
                    value={brandingSettings.customJs}
                    onChange={(e) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        customJs: e.target.value,
                      })
                    }}
                    placeholder="// Your custom JavaScript code"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add custom JavaScript to enhance functionality. Use with caution.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-email-header">Custom Email Header</Label>
                  <Textarea
                    id="custom-email-header"
                    value={brandingSettings.customEmailHeader}
                    onChange={(e) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        customEmailHeader: e.target.value,
                      })
                    }}
                    placeholder="<div style='text-align: center;'><img src='your-logo-url' alt='Your Logo' /></div>"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-email-footer">Custom Email Footer</Label>
                  <Textarea
                    id="custom-email-footer"
                    value={brandingSettings.customEmailFooter}
                    onChange={(e) => {
                      setBrandingSettings({
                        ...brandingSettings,
                        customEmailFooter: e.target.value,
                      })
                    }}
                    placeholder="<p>© 2023 Your Company. All rights reserved.</p>"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (brandingSettings.enabled) {
                applyBrandingChanges()
              }
            }}
          >
            Preview Changes
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
            {!isSaving && <Save className="h-4 w-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

