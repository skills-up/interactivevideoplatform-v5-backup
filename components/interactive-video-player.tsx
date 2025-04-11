"use client"

import { FastForward, Maximize, Minimize, Pause, Play, SkipBack, Volume, Volume2, VolumeX } from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface InteractiveElementOption {
  text: string
  action?: string
  isCorrect?: boolean
}

export interface InteractiveElement {
  _id: string
  type: "quiz" | "decision" | "hotspot" | "poll"
  title: string
  description?: string
  timestamp: number
  duration: number
  options?: InteractiveElementOption[]
  position?: {
    x: number
    y: number
  }
  style?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  optionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
  feedback?: {
    correct?: string
    incorrect?: string
  }
}

interface VideoSettings {
  pauseOnInteraction: boolean
  showFeedback: boolean
  autoAdvance: boolean
  defaultStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    fontSize: string
    padding: string
    opacity: string
  }
  defaultOptionStyle?: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: string
    hoverColor: string
  }
}

interface InteractiveVideoPlayerProps {
  videoId: string
  source: "youtube" | "dailymotion" | "vimeo" | "local"
  url: string
  title: string
  interactiveElements?: InteractiveElement[]
  videoSettings?: VideoSettings
  className?: string
  onTimeUpdate?: (time: number) => void
  onDurationChange?: (duration: number) => void
  onPlayStateChange?: (isPlaying: boolean) => void
  initialTime?: number
}

export const InteractiveVideoPlayer = forwardRef<HTMLVideoElement, InteractiveVideoPlayerProps>(
  (
    {
      videoId,
      source,
      url,
      title,
      interactiveElements = [],
      videoSettings,
      className,
      onTimeUpdate,
      onDurationChange,
      onPlayStateChange,
      initialTime = 0,
    },
    ref,
  ) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(50)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [activeInteraction, setActiveInteraction] = useState<InteractiveElement | null>(null)
    const [selectedOption, setSelectedOption] = useState<InteractiveElementOption | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { toast } = useToast()

    // Default settings if not provided
    const settings: VideoSettings = videoSettings || {
      pauseOnInteraction: true,
      showFeedback: true,
      autoAdvance: false,
      defaultStyle: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        borderColor: "#3b82f6",
        borderRadius: "0.5rem",
        fontSize: "1rem",
        padding: "1.5rem",
        opacity: "0.95",
      },
      defaultOptionStyle: {
        backgroundColor: "transparent",
        textColor: "#ffffff",
        borderColor: "#ffffff",
        borderRadius: "0.25rem",
        hoverColor: "rgba(255, 255, 255, 0.2)",
      },
    }

    // Handle video playback
    const togglePlay = () => {
      if (!videoRef.current) return

      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }

      const newPlayState = !isPlaying
      setIsPlaying(newPlayState)

      // Call onPlayStateChange prop if provided
      if (onPlayStateChange) {
        onPlayStateChange(newPlayState)
      }
    }

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
      if (!videoRef.current) return

      const newVolume = value[0]
      videoRef.current.volume = newVolume / 100
      setVolume(newVolume)
    }

    // Handle seeking
    const handleSeek = (value: number[]) => {
      if (!videoRef.current) return

      const seekTime = (value[0] / 100) * duration
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
      if (!containerRef.current) return

      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }

    // Format time in MM:SS format
    const formatTime = (timeInSeconds: number) => {
      const minutes = Math.floor(timeInSeconds / 60)
      const seconds = Math.floor(timeInSeconds % 60)
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }

    // Show/hide controls on mouse movement
    const handleMouseMove = () => {
      setShowControls(true)

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !activeInteraction) {
          setShowControls(false)
        }
      }, 3000)
    }

    // Handle interaction response
    const handleInteractionResponse = (option: InteractiveElementOption) => {
      // In a real app, you would send this interaction to the server
      console.log("User selected:", option)
      setSelectedOption(option)

      // Show feedback if enabled and it's a quiz
      if (settings.showFeedback && activeInteraction?.type === "quiz" && option.isCorrect !== undefined) {
        setShowFeedback(true)

        // Auto-advance after feedback if enabled
        if (settings.autoAdvance) {
          setTimeout(() => {
            setActiveInteraction(null)
            setSelectedOption(null)
            setShowFeedback(false)
            if (videoRef.current && !isPlaying) {
              videoRef.current.play()
              setIsPlaying(true)
            }
          }, 3000)
        }
      } else {
        // Handle action if present (e.g., jump to a specific time)
        if (option.action && option.action.startsWith("jump:") && videoRef.current) {
          const jumpTime = Number.parseInt(option.action.split(":")[1])
          if (!isNaN(jumpTime)) {
            videoRef.current.currentTime = jumpTime
            setCurrentTime(jumpTime)
          }
        }

        // Close the interaction if not showing feedback
        setActiveInteraction(null)
        setSelectedOption(null)
      }

      // Show toast for quiz answers
      if (option.isCorrect === true) {
        toast({
          title: "Correct!",
          description: activeInteraction?.feedback?.correct || "You answered correctly.",
        })
      } else if (option.isCorrect === false) {
        toast({
          title: "Incorrect",
          description: activeInteraction?.feedback?.incorrect || "Try again!",
        })
      }
    }

    // Close feedback and continue
    const handleCloseFeedback = () => {
      setShowFeedback(false)
      setActiveInteraction(null)
      setSelectedOption(null)

      if (videoRef.current && !isPlaying) {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }

    // Update time as video plays and check for interactive elements
    const handleTimeUpdate = () => {
      if (!videoRef.current) return

      const currentVideoTime = videoRef.current.currentTime
      setCurrentTime(currentVideoTime)

      // Call onTimeUpdate prop if provided
      if (onTimeUpdate) {
        onTimeUpdate(currentVideoTime)
      }

      // Check if any interactive elements should be shown
      if (interactiveElements && interactiveElements.length > 0) {
        const activeElement = interactiveElements.find(
          (element) => currentVideoTime >= element.timestamp && currentVideoTime < element.timestamp + element.duration,
        )

        if (activeElement && !activeInteraction) {
          setActiveInteraction(activeElement)
          // Pause video when showing interaction if setting is enabled
          if (settings.pauseOnInteraction && isPlaying && videoRef.current) {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        } else if (!activeElement && activeInteraction && !showFeedback) {
          setActiveInteraction(null)
        }
      }
    }

    // Set up event listeners
    useEffect(() => {
      const video = videoRef.current

      if (!video) return

      // Set initial time if provided
      if (initialTime > 0 && video) {
        video.currentTime = initialTime
      }

      const handleDurationChange = () => {
        const videoDuration = video.duration
        setDuration(videoDuration)

        // Call onDurationChange prop if provided
        if (onDurationChange) {
          onDurationChange(videoDuration)
        }
      }

      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement)
      }

      video.addEventListener("durationchange", handleDurationChange)
      video.addEventListener("timeupdate", handleTimeUpdate)
      document.addEventListener("fullscreenchange", handleFullscreenChange)

      return () => {
        video.removeEventListener("durationchange", handleDurationChange)
        video.removeEventListener("timeupdate", handleTimeUpdate)
        document.removeEventListener("fullscreenchange", handleFullscreenChange)

        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      }
    }, [
      activeInteraction,
      isPlaying,
      settings.pauseOnInteraction,
      showFeedback,
      initialTime,
      onDurationChange,
      onTimeUpdate,
    ])

    // Get element style with fallbacks to default settings
    const getElementStyle = (element: InteractiveElement) => {
      return {
        backgroundColor:
          element.style?.backgroundColor || settings.defaultStyle?.backgroundColor || "rgba(0, 0, 0, 0.8)",
        color: element.style?.textColor || settings.defaultStyle?.textColor || "#ffffff",
        borderColor: element.style?.borderColor || settings.defaultStyle?.borderColor || "#3b82f6",
        borderRadius: element.style?.borderRadius || settings.defaultStyle?.borderRadius || "0.5rem",
        fontSize: element.style?.fontSize || settings.defaultStyle?.fontSize || "1rem",
        padding: element.style?.padding || settings.defaultStyle?.padding || "1.5rem",
        opacity: element.style?.opacity || settings.defaultStyle?.opacity || "0.95",
        border: `1px solid ${element.style?.borderColor || settings.defaultStyle?.borderColor || "#3b82f6"}`,
      }
    }

    // Get option style with fallbacks to default settings
    const getOptionStyle = (element: InteractiveElement) => {
      return {
        backgroundColor:
          element.optionStyle?.backgroundColor || settings.defaultOptionStyle?.backgroundColor || "transparent",
        color: element.optionStyle?.textColor || settings.defaultOptionStyle?.textColor || "#ffffff",
        borderColor: element.optionStyle?.borderColor || settings.defaultOptionStyle?.borderColor || "#ffffff",
        borderRadius: element.optionStyle?.borderRadius || settings.defaultOptionStyle?.borderRadius || "0.25rem",
        border: `1px solid ${element.optionStyle?.borderColor || settings.defaultOptionStyle?.borderColor || "#ffffff"}`,
      }
    }

    // Get option hover style
    const getOptionHoverStyle = (element: InteractiveElement) => {
      return {
        backgroundColor:
          element.optionStyle?.hoverColor || settings.defaultOptionStyle?.hoverColor || "rgba(255, 255, 255, 0.2)",
      }
    }

    // Render different video sources
    const renderVideoSource = () => {
      switch (source) {
        case "youtube":
          return (
            <iframe
              src={`${url}?enablejsapi=1`}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        case "dailymotion":
          return (
            <iframe
              src={url}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        case "vimeo":
          return (
            <iframe
              src={url}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        case "local":
        default:
          return (
            <video ref={videoRef} className="h-full w-full" onClick={togglePlay} onTimeUpdate={handleTimeUpdate}>
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
      }
    }

    // Expose the video element ref
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement)

    return (
      <div
        ref={containerRef}
        className={cn("relative aspect-video overflow-hidden rounded-lg bg-black", className)}
        onMouseMove={handleMouseMove}
      >
        {renderVideoSource()}

        {/* Interactive overlay */}
        {activeInteraction && (
          <div
            className="absolute"
            style={{
              left: activeInteraction.position ? `${activeInteraction.position.x}%` : "50%",
              top: activeInteraction.position ? `${activeInteraction.position.y}%` : "50%",
              transform: activeInteraction.position ? "translate(-50%, -50%)" : "translate(-50%, -50%)",
              ...getElementStyle(activeInteraction),
            }}
          >
            <h3 className="mb-2 text-lg font-bold">{activeInteraction.title}</h3>
            {activeInteraction.description && <p className="mb-4">{activeInteraction.description}</p>}

            {showFeedback && selectedOption ? (
              <div className="space-y-4">
                <div className={`p-3 rounded ${selectedOption.isCorrect ? "bg-green-500/20" : "bg-red-500/20"}`}>
                  <p className="font-medium">
                    {selectedOption.isCorrect
                      ? activeInteraction.feedback?.correct || "Correct answer!"
                      : activeInteraction.feedback?.incorrect || "Incorrect answer."}
                  </p>
                  {!selectedOption.isCorrect && activeInteraction.type === "quiz" && (
                    <p className="mt-2">
                      The correct answer is: {activeInteraction.options?.find((o) => o.isCorrect)?.text}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleCloseFeedback}
                  className="w-full"
                  style={{
                    backgroundColor:
                      activeInteraction.style?.borderColor || settings.defaultStyle?.borderColor || "#3b82f6",
                    color: "#ffffff",
                  }}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeInteraction.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="hover:bg-white/20 hover:text-white transition-colors"
                    style={getOptionStyle(activeInteraction)}
                    onClick={() => handleInteractionResponse(option)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video controls */}
        {source === "local" && showControls && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex flex-col gap-2">
              <Slider
                value={[(currentTime / duration) * 100 || 0]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary [&>span:first-child_span]:bg-primary"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                    <FastForward className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => handleVolumeChange([volume === 0 ? 50 : 0])}
                    >
                      {volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : volume < 50 ? (
                        <Volume className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20 cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary [&>span:first-child_span]:bg-primary"
                    />
                  </div>
                  <span className="text-xs text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  },
)
