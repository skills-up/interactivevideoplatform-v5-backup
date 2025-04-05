"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Laptop, Smartphone, Tablet, Monitor, Trash2, Shield } from "lucide-react"
import { useSession } from "next-auth/react"

interface DeviceManagerProps {
  className?: string
}

export function DeviceManager({ className }: DeviceManagerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [devices, setDevices] = useState<any[]>([])
  const [settings, setSettings] = useState({
    maxDevices: 3,
    enforceLimit: true,
    notifyOnNewLogin: true,
    requireVerification: false,
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()

  // Fetch devices and settings
  useEffect(() => {
    const fetchDevicesAndSettings = async () => {
      if (!session?.user) return

      setIsLoading(true)

      try {
        const [devicesResponse, settingsResponse] = await Promise.all([
          fetch("/api/auth/devices"),
          fetch("/api/auth/device-settings"),
        ])

        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json()
          setDevices(devicesData.devices || [])
        }

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setSettings(settingsData)
        }
      } catch (error) {
        console.error("Error fetching devices and settings:", error)
        toast({
          title: "Error",
          description: "Failed to load devices and settings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevicesAndSettings()
  }, [session, toast])

  // Update device settings
  const updateSettings = async (newSettings: any) => {
    try {
      const response = await fetch("/api/auth/device-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      setSettings(newSettings)

      toast({
        title: "Settings Updated",
        description: "Your device settings have been saved",
      })
    } catch (error) {
      console.error("Error updating device settings:", error)
      toast({
        title: "Error",
        description: "Failed to update device settings",
        variant: "destructive",
      })
    }
  }

  // Remove device
  const removeDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/devices/${deviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove device")

      setDevices(devices.filter((device) => device.id !== deviceId))

      toast({
        title: "Device Removed",
        description: "The device has been removed from your account",
      })
    } catch (error) {
      console.error("Error removing device:", error)
      toast({
        title: "Error",
        description: "Failed to remove device",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setDeviceToDelete(null)
    }
  }

  // Handle device deletion
  const handleDeleteDevice = (deviceId: string) => {
    setDeviceToDelete(deviceId)
    setShowDeleteDialog(true)
  }

  // Get device icon based on type
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-5 w-5" />
      case "laptop":
        return <Laptop className="h-5 w-5" />
      case "tablet":
        return <Tablet className="h-5 w-5" />
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  // Format last active time
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    }
  }

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Device Security Settings
          </CardTitle>
          <CardDescription>Manage how many devices can access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-devices">Maximum Devices</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="max-devices"
                type="number"
                min={1}
                max={10}
                value={settings.maxDevices}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (value >= 1 && value <= 10) {
                    updateSettings({
                      ...settings,
                      maxDevices: value,
                    })
                  }
                }}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">devices can be logged in simultaneously</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enforce-limit" className="flex-1">
              Enforce device limit
              <p className="text-sm font-normal text-muted-foreground">
                Automatically log out oldest device when limit is reached
              </p>
            </Label>
            <Switch
              id="enforce-limit"
              checked={settings.enforceLimit}
              onCheckedChange={(checked) => {
                updateSettings({
                  ...settings,
                  enforceLimit: checked,
                })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-login" className="flex-1">
              Notify on new login
              <p className="text-sm font-normal text-muted-foreground">
                Send email notification when a new device logs in
              </p>
            </Label>
            <Switch
              id="notify-login"
              checked={settings.notifyOnNewLogin}
              onCheckedChange={(checked) => {
                updateSettings({
                  ...settings,
                  notifyOnNewLogin: checked,
                })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="require-verification" className="flex-1">
              Require verification for new devices
              <p className="text-sm font-normal text-muted-foreground">
                Send a verification code to email when logging in from a new device
              </p>
            </Label>
            <Switch
              id="require-verification"
              checked={settings.requireVerification}
              onCheckedChange={(checked) => {
                updateSettings({
                  ...settings,
                  requireVerification: checked,
                })
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Devices</CardTitle>
          <CardDescription>Devices currently logged into your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No active devices found</div>
          ) : (
            devices.map((device) => (
              <div key={device.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getDeviceIcon(device.type)}
                  </div>

                  <div>
                    <h4 className="font-medium">
                      {device.name}
                      {device.current && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {device.browser} on {device.os}
                    </p>

                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>IP: {device.ip}</span>
                      <span className="mx-1">•</span>
                      <span>Last active: {formatLastActive(device.lastActive)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDevice(device.id)}
                  disabled={device.current}
                  title={device.current ? "Cannot remove current device" : "Remove device"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Device</AlertDialogTitle>
            <AlertDialogDescription>
              This will log out this device from your account. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deviceToDelete && removeDevice(deviceToDelete)}>
              Remove Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

