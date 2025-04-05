"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { QuizInteraction } from "./interactions/quiz-interaction"
import { PollInteraction } from "./interactions/poll-interaction"
import { HotspotInteraction } from "./interactions/hotspot-interaction"
import { BranchingInteraction } from "./interactions/branching-interaction"
import { ImageHotspotInteraction } from "./interactions/image-hotspot-interaction"

interface EmbeddedVideoPlayerProps {
  videoId: string
  sourceUrl: string
  sourceType: string
  title: string
  autoPlay?: boolean
  startTime?: number
  endTime?: number
  showControls?: boolean
  showInteractions?: boolean
  interactiveElements?: any[]
  className?: string
}

export function EmbeddedVideoPlayer({
  videoId,
  sourceUrl,
  sourceType,
  title,
  autoPlay = false,
  startTime,
  endTime,
  showControls = true,
  showInteractions = true,
  interactiveElements = [],
  className = "",
}: EmbeddedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeInteractions, setActiveInteractions] = useState<any[]>([])
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set())
  const [videoPausedByInteraction, setVideoPausedByInteraction] = useState(false)
  const [videoSettings, setVideoSettings] = useState<any>({
    behavior: {
      pauseOnInteraction: true,
      resumeAfterInteraction: true,
      skipAfterSeconds: 5,
      allowSkipping: true,
      showProgressBar: true,
      showCompletionStatus: true,
    },
  })

  // Load video settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/interaction-settings`)
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setVideoSettings(data.settings)
          }
        }
      } catch (error) {
        console.error("Error loading video settings:", error)
      }
    }

    if (videoId) {
      loadSettings()
    }
  }, [videoId])

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration)
      setIsLoading(false)

      // Set start time if provided
      if (startTime && startTime > 0 && startTime < videoElement.duration) {
        videoElement.currentTime = startTime
      }
    }

    const handleEnded = () => {
      // Notify parent window that video has ended
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "videoEnded", videoId }, "*")
      }
    }

    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
    videoElement.addEventListener("ended", handleEnded)

    // Set up message listener for parent window communication
    const handleMessage = (event: MessageEvent) => {
      if (!videoElement) return

      const { type, action } = event.data

      if (type !== "videoControl") return

      switch (action) {
        case "play":
          videoElement.play()
          break
        case "pause":
          videoElement.pause()
          break
        case "seekTo":
          if (typeof event.data.time === "number") {
            videoElement.currentTime = event.data.time
          }
          break
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
      videoElement.removeEventListener("ended", handleEnded)
      window.removeEventListener("message", handleMessage)
    }
  }, [startTime, videoId])

  // Check for active interactions based on current time
  useEffect(() => {
    if (!showInteractions) {
      setActiveInteractions([])
      return
    }

    const currentActiveInteractions = interactiveElements.filter((element) => {
      // Check if the interaction should be active at the current time
      const isTimeMatch = currentTime >= element.startTime && (!element.endTime || currentTime <= element.endTime)

      // Check if the interaction has already been completed
      const isCompleted = completedInteractions.has(element.id)

      // If the interaction is set to show only once and has been completed, don't show it
      if (element.showOnce && isCompleted) {
        return false
      }

      return isTimeMatch
    })

    setActiveInteractions(currentActiveInteractions)

    // Pause video if there are active interactions and pauseOnInteraction is enabled
    if (
      currentActiveInteractions.length > 0 &&
      videoSettings.behavior.pauseOnInteraction &&
      videoRef.current &&
      !videoRef.current.paused
    ) {
      videoRef.current.pause()
      setVideoPausedByInteraction(true)

      // Notify parent window that video was paused for interaction
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "interactionStarted",
            videoId,
            interactionId: currentActiveInteractions[0].id,
          },
          "*",
        )
      }
    }
  }, [
    currentTime,
    interactiveElements,
    completedInteractions,
    showInteractions,
    videoSettings.behavior.pauseOnInteraction,
    videoId,
  ])

  // Handle interaction completion
  const handleInteractionComplete = (interactionId: string, result: any) => {
    // Mark the interaction as completed
    setCompletedInteractions((prev) => new Set(prev).add(interactionId))

    // Notify parent window of interaction completion
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "interactionCompleted",
          videoId,
          interactionId,
          result,
        },
        "*",
      )
    }

    // Resume video playback if it was paused by an interaction
    if (videoPausedByInteraction && videoSettings.behavior.resumeAfterInteraction && videoRef.current) {
      videoRef.current.play()
      setVideoPausedByInteraction(false)
    }
  }

  // Handle interaction skip
  const handleInteractionSkip = (interactionId: string) => {
    // Mark the interaction as completed
    setCompletedInteractions((prev) => new Set(prev).add(interactionId))

    // Notify parent window of interaction skip
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "interactionSkipped",
          videoId,
          interactionId,
        },
        "*",
      )
    }

    // Resume video playback if it was paused by an interaction
    if (videoPausedByInteraction && videoSettings.behavior.resumeAfterInteraction && videoRef.current) {
      videoRef.current.play()
      setVideoPausedByInteraction(false)
    }
  }

  // Render the appropriate interaction component based on type
  const renderInteraction = (interaction: any) => {
    const commonProps = {
      key: interaction.id,
      interaction,
      onComplete: (result: any) => handleInteractionComplete(interaction.id, result),
      onSkip: () => handleInteractionSkip(interaction.id),
      allowSkipping: videoSettings.behavior.allowSkipping,
      skipAfterSeconds: videoSettings.behavior.skipAfterSeconds,
      allowSubmissions: true,
    }

    switch (interaction.type) {
      case "quiz":
        return <QuizInteraction {...commonProps} />
      case "poll":
        return <PollInteraction {...commonProps} />
      case "hotspot":
        return <HotspotInteraction {...commonProps} />
      case "branching":
        return (
          <BranchingInteraction
            {...commonProps}
            onBranch={(timeCode) => {
              if (videoRef.current && timeCode) {
                videoRef.current.currentTime = timeCode
              }
            }}
          />
        )
      case "imageHotspot":
        return <ImageHotspotInteraction {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <video
        ref={videoRef}
        src={sourceUrl}
        className="w-full h-full"
        controls={showControls}
        autoPlay={autoPlay}
        playsInline
        title={title}
      >
        Your browser does not support the video tag.
      </video>

      {/* Interactive elements overlay */}
      {activeInteractions.length > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="w-full max-w-lg p-4">{activeInteractions.map(renderInteraction)}</div>
        </div>
      )}

      {/* Progress bar for interactions */}
      {videoSettings.behavior.showProgressBar && interactiveElements.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-10">
          {interactiveElements.map((element) => (
            <div
              key={element.id}
              className={`absolute h-full ${completedInteractions.has(element.id) ? "bg-green-500" : "bg-primary"}`}
              style={{
                left: `${(element.startTime / duration) * 100}%`,
                width: `${(((element.endTime || element.startTime + 0.5) - element.startTime) / duration) * 100}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

