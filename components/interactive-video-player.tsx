"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"

interface InteractiveElement {
  id: string
  type: "quiz" | "decision" | "hotspot" | "poll"
  title?: string
  question?: string
  options?: Array<{
    id?: string
    text: string
    isCorrect?: boolean
    action?: string
    timeCode?: number
  }>
  startTime: number
  endTime?: number
}

interface VideoPlayerProps {
  videoUrl: string
  title: string
  interactions?: InteractiveElement[]
  onInteractionResponse?: (interactionId: string, response: string) => void
  autoPlay?: boolean
  controls?: boolean
  width?: string | number
  height?: string | number
  className?: string
}

export default function InteractiveVideoPlayer({
  videoUrl,
  title,
  interactions = [],
  onInteractionResponse,
  autoPlay = false,
  controls = true,
  width = "100%",
  height = "auto",
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [activeInteraction, setActiveInteraction] = useState<InteractiveElement | null>(null)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Check for interactions that should be shown
      if (!activeInteraction) {
        const interaction = interactions.find(
          (i) => video.currentTime >= i.startTime && (!i.endTime || video.currentTime <= i.endTime),
        )

        if (interaction) {
          setActiveInteraction(interaction)
          if (video.paused === false) {
            video.pause()
            setIsPlaying(false)
          }
        }
      }
    }

    const onLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const onPlay = () => {
      setIsPlaying(true)
    }

    const onPause = () => {
      setIsPlaying(false)
    }

    const onVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("volumechange", onVolumeChange)

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("volumechange", onVolumeChange)
    }
  }, [interactions, activeInteraction])

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

    const container = document.querySelector(".video-container")
    container?.addEventListener("mousemove", handleMouseMove)

    return () => {
      container?.removeEventListener("mousemove", handleMouseMove)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

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

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
  }

  const handleInteractionResponse = (response: string) => {
    if (!activeInteraction || !onInteractionResponse) return

    onInteractionResponse(activeInteraction.id, response)
    setActiveInteraction(null)

    // Resume playback after interaction
    const video = videoRef.current
    if (video) {
      video.play()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.min(video.currentTime + 10, video.duration)
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(video.currentTime - 10, 0)
  }

  const toggleFullscreen = () => {
    const container = document.querySelector(".video-container")
    if (!container) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  return (
    <div className={`video-container relative overflow-hidden rounded-lg ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={autoPlay}
        controls={false}
        className="w-full h-full object-contain"
        style={{ width, height }}
        playsInline
      />

      {/* Interactive element overlay */}
      {activeInteraction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">{activeInteraction.title || activeInteraction.question}</h3>

              <div className="space-y-2">
                {activeInteraction.options?.map((option) => (
                  <Button
                    key={option.id || option.text}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleInteractionResponse(option.text)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Video controls */}
      {controls && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2">
            {/* Progress bar */}
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <SkipBack size={18} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <SkipForward size={18} />
                </Button>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-24">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </Button>

                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Maximize size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

