"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CookieSettings {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("simple")
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if consent has been given
    const consent = localStorage.getItem("cookie-consent")

    if (!consent) {
      // Show the consent dialog after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      // Parse stored settings
      try {
        const storedSettings = JSON.parse(consent)
        setSettings(storedSettings)
      } catch (error) {
        console.error("Error parsing stored cookie settings:", error)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const newSettings = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }

    setSettings(newSettings)
    saveSettings(newSettings)
    setIsOpen(false)
  }

  const handleAcceptNecessary = () => {
    const newSettings = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }

    setSettings(newSettings)
    saveSettings(newSettings)
    setIsOpen(false)
  }

  const handleSaveSettings = () => {
    saveSettings(settings)
    setIsOpen(false)
  }

  const saveSettings = (settings: CookieSettings) => {
    // Save settings to localStorage
    localStorage.setItem("cookie-consent", JSON.stringify(settings))

    // Apply settings
    applySettings(settings)
  }

  const applySettings = (settings: CookieSettings) => {
    // This is where you would apply the settings
    // For example, enable/disable tracking scripts

    if (settings.analytics) {
      // Enable analytics
      console.log("Analytics enabled")
    }

    if (settings.marketing) {
      // Enable marketing
      console.log("Marketing enabled")
    }
  }

  const handleSettingChange = (key: keyof CookieSettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/20">
      <Card className="w-full max-w-lg mx-4 sm:mx-0">
        <CardHeader>
          <CardTitle>Cookie Preferences</CardTitle>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
              traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </TabsContent>

          <TabsContent value="advanced" className="p-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox id="necessary" checked={settings.necessary} disabled />
                <div>
                  <Label htmlFor="necessary" className="font-medium">
                    Necessary Cookies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    These cookies are essential for the website to function properly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="functional"
                  checked={settings.functional}
                  onCheckedChange={(checked) => handleSettingChange("functional", checked as boolean)}
                />
                <div>
                  <Label htmlFor="functional" className="font-medium">
                    Functional Cookies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    These cookies enable personalized features and functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked) => handleSettingChange("analytics", checked as boolean)}
                />
                <div>
                  <Label htmlFor="analytics" className="font-medium">
                    Analytics Cookies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    These cookies help us understand how visitors interact with the website.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing"
                  checked={settings.marketing}
                  onCheckedChange={(checked) => handleSettingChange("marketing", checked as boolean)}
                />
                <div>
                  <Label htmlFor="marketing" className="font-medium">
                    Marketing Cookies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    These cookies are used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {activeTab === "simple" ? (
            <>
              <Button variant="outline" onClick={handleAcceptNecessary} className="w-full sm:w-auto">
                Necessary Only
              </Button>
              <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
                Accept All
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setActiveTab("simple")} className="w-full sm:w-auto">
                Back
              </Button>
              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                Save Settings
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

