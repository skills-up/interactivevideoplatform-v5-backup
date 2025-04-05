"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { ShareSettings } from "@/types/sharing"
import type { InteractiveElement } from "@/types/video"
import { InteractionOverlay } from "@/components/video/interaction-overlay"
import { formatTime } from "@/lib/utils"

interface VideoEmbedProps {
  video: {
    id: string
    title: string
    videoUrl: string
    thumbnailUrl: string
    duration: number
    interactiveElements: InteractiveElement[]
  }
  settings: ShareSettings
  accessKey: string
}

export function VideoEmbed({ video, settings, accessKey }: VideoEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeInteraction, setActiveInteraction] = useState<InteractiveElement | null>(null)
  const [interactionResponses, setInteractionResponses] = useState<Record<string, any>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize video with settings
  useEffect(() => {
    if (videoRef.current) {
      // Set start time if specified
      if (settings.startTime && settings.startTime > 0) {
        videoRef.current.currentTime = settings.startTime
      }

      // Autoplay if enabled
      if (settings.autoplay) {
        videoRef.current.play().catch((error) => {
          console.error("Autoplay failed:", error)
        })
      }
    }
  }, [settings])

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)

      // Check for end time
      if (settings.endTime && time >= settings.endTime) {
        videoRef.current.pause()
        setIsPlaying(false)
      }

      // Check for interactive elements
      if (settings.showInteractions) {
        const activeElement = video.interactiveElements.find(
          (element) => time >= element.timestamp && time < element.timestamp + (element.duration || 10),
        )

        if (activeElement && !activeInteraction) {
          setActiveInteraction(activeElement)
          if (activeElement.pauseVideo) {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        } else if (!activeElement && activeInteraction) {
          setActiveInteraction(null)
        }
      }
    }
  }

  // Play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true)
        })
        .catch((err) => {
          console.error("Failed to enter fullscreen:", err)
        })
    } else if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false)
        })
        .catch((err) => {
          console.error("Failed to exit fullscreen:", err)
        })
    }
  }

  // Handle interaction response
  const handleInteractionResponse = (elementId: string, response: any) => {
    setInteractionResponses((prev) => ({
      ...prev,
      [elementId]: response,
    }))

    // Submit response if allowed
    if (settings.allowInteractionSubmissions) {
      submitInteractionResponse(elementId, response)
    }

    // Resume video if it was paused
    if (activeInteraction?.pauseVideo && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }

    // Clear active interaction
    setActiveInteraction(null)
  }

  // Submit interaction response to API
  const submitInteractionResponse = async (elementId: string, response: any) => {
    try {
      await fetch(`/api/share/${accessKey}/interaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elementId,
          response,
          timestamp: currentTime,
        }),
      })
    } catch (error) {
      console.error("Failed to submit interaction response:", error)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={settings.showControls}
        muted={isMuted}
      />

      {/* Custom controls if showControls is false */}
      {!settings.showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity opacity-0 hover:opacity-100">
          <div className="flex items-center justify-between text-white">
            <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>

            <div className="flex-1 mx-4">
              <input
                type="range"
                min="0"
                max={video.duration}
                value={currentTime}
                onChange={(e) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Number.parseFloat(e.target.value)
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(video.duration)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20"
              />

              <button onClick={toggleFullscreen}>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive element overlay */}
      {activeInteraction && (
        <InteractionOverlay
          element={activeInteraction}
          onResponse={(response) => handleInteractionResponse(activeInteraction.id, response)}
          previousResponse={interactionResponses[activeInteraction.id]}
        />
      )}
    </div>
  )
}

