"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ExternalLink } from "lucide-react"

interface HotspotInteractionProps {
  interaction: {
    id: string
    title?: string
    options: {
      id: string
      text: string
      action?: string
      url?: string
    }[]
    style?: any
  }
  onComplete: (result: any) => void
  onSkip: () => void
  allowSkipping?: boolean
  skipAfterSeconds?: number
}

export function HotspotInteraction({
  interaction,
  onComplete,
  onSkip,
  allowSkipping = true,
  skipAfterSeconds = 5,
}: HotspotInteractionProps) {
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

  const buttonStyle = {
    backgroundColor: interaction.style?.optionStyle?.backgroundColor,
    color: interaction.style?.optionStyle?.textColor,
    borderColor: interaction.style?.optionStyle?.borderColor,
    borderRadius: interaction.style?.optionStyle?.borderRadius,
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

  const handleOptionClick = (option: any) => {
    // Handle different actions
    if (option.url) {
      window.open(option.url, "_blank")
    }

    // Prepare result data
    const result = {
      interactionId: interaction.id,
      selectedOptionId: option.id,
      action: option.action || "click",
      timestamp: new Date().toISOString(),
    }

    onComplete(result)
  }

  return (
    <Card className="w-full" style={cardStyle}>
      <CardHeader>
        <CardTitle className="text-xl">{interaction.title || "Interactive Hotspot"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {interaction.options.map((option) => (
            <Button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="flex items-center justify-center h-auto py-3"
              style={buttonStyle as any}
            >
              {option.text}
              {option.url && <ExternalLink className="ml-2 h-4 w-4" />}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {showSkipTimer && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Continue in {timeLeft}s
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

