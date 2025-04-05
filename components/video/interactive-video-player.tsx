"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { QuizInteraction } from "./interactions/quiz-interaction"
import { PollInteraction } from "./interactions/poll-interaction"
import { HotspotInteraction } from "./interactions/hotspot-interaction"
import { BranchingInteraction } from "./interactions/branching-interaction"
import { ImageHotspotInteraction } from "./interactions/image-hotspot-interaction"
import { cn } from "@/lib/utils"

interface InteractiveVideoPlayerProps {
  videoId: string
  sourceUrl: string
  sourceType?: string
  title: string
  poster?: string
  interactiveElements?: any[]
  onInteractionComplete?: (interactionId: string, result: any) => void
  className?: string
}

export function InteractiveVideoPlayer({
  videoId,
  sourceUrl,
  sourceType = "video/mp4",
  title,
  poster,
  interactiveElements = [],
  onInteractionComplete,
  className,
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
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

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeChange = () => {
      setVolume(videoElement.volume)
      setIsMuted(videoElement.muted)
    }

    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("volumechange", handleVolumeChange)

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("volumechange", handleVolumeChange)
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("mouseenter", handleMouseMove)
      container.addEventListener("mouseleave", () => {
        if (isPlaying) {
          setShowControls(false)
        }
      })
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("mouseenter", handleMouseMove)
        container.removeEventListener("mouseleave", () => {})
      }

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  // Check for active interactions based on current time
  useEffect(() => {
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
    }
  }, [currentTime, interactiveElements, completedInteractions, videoSettings.behavior.pauseOnInteraction])

  // Play/Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  // Seek to time
  const seekTo = (time: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = time
    setCurrentTime(time)
  }

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

  // Set volume
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume

    if (newVolume === 0) {
      video.muted = true
    } else if (video.muted) {
      video.muted = false
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Skip forward/backward
  const skipForward = () => {
    const video = videoRef.current
    if (!video) return

    const newTime = Math.min(video.currentTime + 10, video.duration)
    video.currentTime = newTime
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return

    const newTime = Math.max(video.currentTime - 10, 0)
    video.currentTime = newTime
  }

  // Handle interaction completion
  const handleInteractionComplete = (interactionId: string, result: any) => {
    // Mark the interaction as completed
    setCompletedInteractions((prev) => new Set(prev).add(interactionId))

    // Notify parent component
    if (onInteractionComplete) {
      onInteractionComplete(interactionId, result)
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
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black rounded-lg",
        isFullscreen ? "w-screen h-screen" : "w-full aspect-video",
        className,
      )}
      onMouseMove={() => setShowControls(true)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <video
        ref={videoRef}
        src={sourceUrl}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlayPause}
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

      {/* Video controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Progress bar */}
        <div
          className="relative w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pos = (e.clientX - rect.left) / rect.width
            seekTo(pos * duration)
          }}
        >
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Interaction markers */}
          {videoSettings.behavior.showProgressBar &&
            interactiveElements.map((element) => (
              <div
                key={element.id}
                className={`absolute h-3 w-1 -top-1 ${
                  completedInteractions.has(element.id) ? "bg-green-500" : "bg-primary"
                }`}
                style={{
                  left: `${(element.startTime / duration) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              />
            ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={skipBackward}>
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={skipForward}>
              <SkipForward className="h-5 w-5" />
            </Button>

            <span className="text-xs text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={toggleFullscreen}>
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

