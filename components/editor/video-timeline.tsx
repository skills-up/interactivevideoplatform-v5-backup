"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface InteractiveElement {
  id: string
  type: "quiz" | "decision" | "hotspot" | "poll"
  title: string
  timestamp: number
  duration: number
}

interface VideoTimelineProps {
  duration: number
  currentTime: number
  interactiveElements: InteractiveElement[]
  onTimeChange: (time: number) => void
  onElementSelect: (element: InteractiveElement) => void
}

export function VideoTimeline({
  duration,
  currentTime,
  interactiveElements,
  onTimeChange,
  onElementSelect,
}: VideoTimelineProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [scrollPosition, setScrollPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle time change
  const handleTimeChange = (value: number[]) => {
    onTimeChange(value[0])
  }

  // Handle element click
  const handleElementClick = (element: InteractiveElement) => {
    onElementSelect(element)
    onTimeChange(element.timestamp)
  }

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])

    // Adjust scroll position to keep current time in view
    if (timelineRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const timelineWidth = timelineRef.current.scrollWidth
      const timePosition = (currentTime / duration) * timelineWidth

      // Center the current time in the viewport
      const newScrollPosition = Math.max(0, timePosition - containerWidth / 2)
      setScrollPosition(Math.min(newScrollPosition, timelineWidth - containerWidth))
    }
  }

  // Update scroll position when current time changes
  useEffect(() => {
    if (!isDragging && timelineRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const timelineWidth = timelineRef.current.scrollWidth
      const timePosition = (currentTime / duration) * timelineWidth

      // Check if current time is outside the visible area
      if (timePosition < scrollPosition || timePosition > scrollPosition + containerWidth) {
        // Center the current time in the viewport
        const newScrollPosition = Math.max(0, timePosition - containerWidth / 2)
        setScrollPosition(Math.min(newScrollPosition, timelineWidth - containerWidth))
      }
    }
  }, [currentTime, duration, isDragging, scrollPosition])

  // Apply scroll position
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollPosition
    }
  }, [scrollPosition])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Zoom:</span>
          <Slider value={[zoom]} min={1} max={5} step={0.1} onValueChange={handleZoomChange} className="w-32" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-x-auto pb-4 hide-scrollbar"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        <div
          ref={timelineRef}
          className="relative h-20 bg-muted rounded-md"
          style={{ width: `${100 * zoom}%`, minWidth: "100%" }}
        >
          {/* Time markers */}
          {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, index) => {
            const time = index * 10
            const position = (time / duration) * 100

            return (
              <div
                key={index}
                className="absolute top-0 h-full border-l border-border flex flex-col items-center"
                style={{ left: `${position}%` }}
              >
                <span className="text-xs text-muted-foreground mt-1">{formatTime(time)}</span>
              </div>
            )
          })}

          {/* Current time indicator */}
          <div
            className="absolute top-0 h-full border-l-2 border-primary z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="w-3 h-3 rounded-full bg-primary -ml-1.5 -mt-1.5"></div>
          </div>

          {/* Interactive elements */}
          {interactiveElements.map((element) => {
            const startPosition = (element.timestamp / duration) * 100
            const elementWidth = Math.max(2, (element.duration / duration) * 100)

            return (
              <Button
                key={element.id}
                variant="outline"
                className={cn(
                  "absolute h-10 px-2 py-1 text-xs rounded-md border flex flex-col items-start justify-center overflow-hidden",
                  {
                    "bg-blue-500/20 border-blue-500": element.type === "quiz",
                    "bg-green-500/20 border-green-500": element.type === "decision",
                    "bg-yellow-500/20 border-yellow-500": element.type === "hotspot",
                    "bg-purple-500/20 border-purple-500": element.type === "poll",
                  },
                )}
                style={{
                  left: `${startPosition}%`,
                  width: `${elementWidth}%`,
                  top: "40%",
                  minWidth: "60px",
                }}
                onClick={() => handleElementClick(element)}
              >
                <span className="font-medium truncate w-full">{element.title}</span>
                <span className="text-[10px] opacity-80">{formatTime(element.timestamp)}</span>
              </Button>
            )
          })}

          {/* Time slider */}
          <div className="absolute bottom-0 left-0 right-0 px-0">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={handleTimeChange}
              onValueCommit={() => setIsDragging(false)}
              onPointerDown={() => setIsDragging(true)}
              className="[&>span:first-child]:h-2 [&>span:first-child]:bg-muted-foreground/30 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-background [&>span:first-child_span]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

