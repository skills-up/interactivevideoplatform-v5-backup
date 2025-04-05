"use client"

import { useState, useEffect, useRef } from "react"
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume,
  Volume2,
  VolumeX,
  Users,
  MessageSquare,
  Share2,
  ThumbsUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { LiveChat } from "@/components/chat/live-chat"
import { cn } from "@/lib/utils"

interface LiveStreamPlayerProps {
  streamId: string
  title: string
  creator: {
    name: string
    avatar?: string
  }
  thumbnail: string
  viewerCount?: number
  className?: string
}

export function LiveStreamPlayer({
  streamId,
  title,
  creator,
  thumbnail,
  viewerCount = 0,
  className,
}: LiveStreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentViewers, setCurrentViewers] = useState(viewerCount)
  const [likes, setLikes] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate live stream connection
  useEffect(() => {
    // In a real app, you would connect to a streaming service
    const interval = setInterval(() => {
      // Randomly fluctuate viewer count to simulate live activity
      setCurrentViewers((prev) => {
        const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
        return Math.max(1, prev + change)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Handle video playback
  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return

    const newVolume = value[0]
    videoRef.current.volume = newVolume / 100
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return

    if (isMuted) {
      videoRef.current.volume = volume / 100
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
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

  // Update fullscreen state when fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Show/hide controls on mouse movement
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Handle like button click
  const handleLike = () => {
    setLikes((prev) => prev + 1)
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="relative aspect-video overflow-hidden rounded-lg bg-black"
        onMouseMove={handleMouseMove}
      >
        {/* Video element */}
        <video ref={videoRef} poster={thumbnail} className="h-full w-full" onClick={togglePlay}>
          {/* In a real app, you would use a streaming source */}
          <source src="/placeholder-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Live indicator */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          LIVE
        </div>

        {/* Viewer count */}
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
          <Users className="h-3 w-3" />
          {currentViewers.toLocaleString()}
        </div>

        {/* Video controls */}
        {showControls && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex flex-col gap-2">
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : volume < 50 ? (
                        <Volume className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-20 cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary [&>span:first-child_span]:bg-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleLike}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {likes > 0 && <span className="ml-1 text-xs">{likes}</span>}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                    <Share2 className="h-4 w-4" />
                  </Button>
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
          </div>
        )}

        {/* Play button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-16 w-16 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary/90"
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        )}
      </div>

      {/* Stream info */}
      <div className="mt-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
            <img
              src={creator.avatar || "/placeholder.svg?height=32&width=32"}
              alt={creator.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{creator.name}</div>
            <div className="text-xs text-muted-foreground">Streaming now</div>
          </div>
        </div>
      </div>

      {/* Live chat */}
      {showChat && (
        <LiveChat
          roomId={streamId}
          isMinimized={isChatMinimized}
          onClose={() => setShowChat(false)}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </div>
  )
}

