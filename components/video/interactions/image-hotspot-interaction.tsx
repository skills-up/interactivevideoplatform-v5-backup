"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Image from "next/image"

interface ImageHotspotInteractionProps {
  interaction: {
    id: string
    title?: string
    imageUrl: string
    hotspots: {
      id: string
      x: number
      y: number
      text: string
      description?: string
    }[]
    style?: any
  }
  onComplete: (result: any) => void
  onSkip: () => void
  allowSkipping?: boolean
  skipAfterSeconds?: number
}

export function ImageHotspotInteraction({
  interaction,
  onComplete,
  onSkip,
  allowSkipping = true,
  skipAfterSeconds = 5,
}: ImageHotspotInteractionProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(skipAfterSeconds)
  const [showSkipTimer, setShowSkipTimer] = useState(allowSkipping)

  // Apply custom styles if provided
  const cardStyle = {
    backgroundColor: interaction.style?.backgroundColor || "white",
    color: interaction.style?.textColor || "inherit",
    borderColor: interaction.style?.borderColor,
    borderWidth: interaction.style?.borderWidth,
    borderStyle: interaction.style?.borderStyle,
    borderRadius: interaction.style?.borderRadius,
    padding: interaction.style?.padding,
    boxShadow: interaction.style?.boxShadow,
    fontFamily: interaction.style?.fontFamily,
    fontSize: interaction.style?.fontSize,
    width: interaction.style?.width || "100%",
    maxWidth: interaction.style?.maxWidth || "500px",
    opacity: interaction.style?.opacity !== undefined ? interaction.style.opacity : 1,
  }

  // Skip timer
  useEffect(() => {
    if (!allowSkipping) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowSkipTimer(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [allowSkipping])

  const handleHotspotClick = (hotspot: any) => {
    setActiveHotspot(hotspot.id)

    // Prepare result data
    const result = {
      interactionId: interaction.id,
      selectedHotspotId: hotspot.id,
      timestamp: new Date().toISOString(),
    }

    // Delay completion to allow user to see the hotspot info
    setTimeout(() => {
      onComplete(result)
    }, 2000)
  }

  return (
    <Card className="w-full" style={cardStyle}>
      <CardHeader>
        <CardTitle className="text-xl">{interaction.title || "Interactive Image"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={interaction.imageUrl || "/placeholder.svg"}
            alt={interaction.title || "Interactive Image"}
            fill
            className="object-contain"
          />

          {interaction.hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center transition-all transform -translate-x-1/2 -translate-y-1/2 ${
                activeHotspot === hotspot.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/80 text-primary-foreground"
              }`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              onClick={() => handleHotspotClick(hotspot)}
            >
              {activeHotspot === hotspot.id ? "✓" : "+"}
            </button>
          ))}
        </div>

        {activeHotspot && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium">{interaction.hotspots.find((h) => h.id === activeHotspot)?.text}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {interaction.hotspots.find((h) => h.id === activeHotspot)?.description}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {showSkipTimer && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Skip in {timeLeft}s
          </div>
        )}
        {!showSkipTimer && allowSkipping && (
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

