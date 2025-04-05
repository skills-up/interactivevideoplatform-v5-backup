"use client"

import { useState, useEffect } from "react"

interface SharedVideoPlayerProps {
  videoId: string
  shareToken: string
  sourceUrl: string
  sourceType: string
  title: string
  isOwner: boolean
  settings: {
    autoplay: boolean
    showControls: boolean
    startTime?: number
    endTime?: number
    showInteractions: boolean
    allowInteractionSubmissions: boolean
    customBranding?: {
      logo?: string
      logoLink?: string
      primaryColor?: string
    }
  }
  isEmbed?: boolean
}

export function SharedVideoPlayer({
  videoId,
  shareToken,
  sourceUrl,
  sourceType,
  title,
  isOwner,
  settings,
  isEmbed = false,
}: SharedVideoPlayerProps) {
  const [interactiveElements, setInteractiveElements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch interactive elements
  useEffect(() => {
    const fetchInteractiveElements = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/shared/${shareToken}/interactions`)
        if (response.ok) {
          const data = await response.json()
          setInteractiveElements(data.interactiveElements || [])
        }
      } catch (error) {
        console.error("Error fetching interactive elements:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInteractiveElements()
  }, [shareToken])

  // Handle interaction completion
  const handleInteractionComplete = async (interactionId: string, result: any) => {
    if (!settings.allowInteractionSubmissions) return

    try {
      await fetch(`/api/shared/${shareToken}/interactions/${interactionId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("Error recording interaction result:", error)
    }
  }

  // Apply custom branding if provided
  useEffect(() => {
    if (settings.customBranding?.primaryColor) {
      const root = document.documentElement
      root.style.setProperty("--color-primary", settings.customBranding.primaryColor)
    }

    return () => {
      // Reset custom branding when component unmounts
      if (settings.customBranding?.primaryColor) {
        const root = document.documentElement
        root.style.setProperty("--color-primary", "") // Reset to default
      }
    }
  }, [settings.customBranding])

  return (
    <div className={isEmbed ? "w-full h-full" : ""}>
      {/* Custom branding logo */}
      {settings.customBranding?.logo && (
        <div className="mb-4">
          {settings.customBranding.logoLink ? (
            <a href={settings.customBranding.logoLink} target="_blank" rel="noopener noreferrer">&nbsp;\

