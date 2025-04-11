"use client"

import { useEffect, useRef, useState } from "react"
import InteractiveVideoPlayer from "@/components/interactive-video-player"

interface InteractiveElement {
  _id: string
  type: "quiz" | "decision" | "hotspot" | "poll"
  title: string
  description?: string
  timestamp: number
  duration: number
  options?: Array<{
    text: string
    action?: string
    isCorrect?: boolean
  }>
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

interface VideoPreviewProps {
  videoUrl: string
  currentTime: number
  interactiveElements: InteractiveElement[]
  videoSettings?: VideoSettings
  onTimeUpdate: (time: number) => void
  onDurationChange: (duration: number) => void
}

export function VideoPreview({
  videoUrl,
  currentTime,
  interactiveElements,
  videoSettings,
  onTimeUpdate,
  onDurationChange,
}: VideoPreviewProps) {
  const [source, setSource] = useState<"youtube" | "vimeo" | "dailymotion" | "local">("youtube")
  const [url, setUrl] = useState(videoUrl)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isManuallyControlling, setIsManuallyControlling] = useState(false)

  // Determine video source from URL
  useEffect(() => {
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      setSource("youtube")
      // Convert to embed URL if needed
      if (videoUrl.includes("watch?v=")) {
        const videoId = new URL(videoUrl).searchParams.get("v")
        setUrl(`https://www.youtube.com/embed/${videoId}`)
      } else if (videoUrl.includes("youtu.be/")) {
        const videoId = videoUrl.split("youtu.be/")[1].split("?")[0]
        setUrl(`https://www.youtube.com/embed/${videoId}`)
      } else {
        setUrl(videoUrl)
      }
    } else if (videoUrl.includes("vimeo.com")) {
      setSource("vimeo")
      // Convert to embed URL if needed
      if (!videoUrl.includes("player.vimeo.com")) {
        const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0]
        setUrl(`https://player.vimeo.com/video/${videoId}`)
      } else {
        setUrl(videoUrl)
      }
    } else if (videoUrl.includes("dailymotion.com")) {
      setSource("dailymotion")
      // Convert to embed URL if needed
      if (!videoUrl.includes("dailymotion.com/embed")) {
        const videoId = videoUrl.split("dailymotion.com/video/")[1]?.split("?")[0]
        setUrl(`https://www.dailymotion.com/embed/video/${videoId}`)
      } else {
        setUrl(videoUrl)
      }
    } else {
      setSource("local")
      setUrl(videoUrl)
    }
  }, [videoUrl])

  // Sync video time with editor time
  useEffect(() => {
    if (videoRef.current && !isManuallyControlling && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime, isManuallyControlling])

  // Handle video time update
  const handleTimeUpdate = (time: number) => {
    if (isManuallyControlling) {
      onTimeUpdate(time)
    }
  }

  // Handle video duration change
  const handleDurationChange = (duration: number) => {
    onDurationChange(duration)
  }

  // Handle manual control toggle
  const handleManualControlToggle = (isPlaying: boolean) => {
    setIsManuallyControlling(isPlaying)
  }

  return (
    <div className="relative">
      <InteractiveVideoPlayer
        videoId="preview"
        source={source}
        url={url}
        title="Video Preview"
        interactiveElements={interactiveElements}
        videoSettings={videoSettings}
        className="w-full"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onPlayStateChange={handleManualControlToggle}
        initialTime={currentTime}
        ref={videoRef}
      />

      {isManuallyControlling && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Manual Control</div>
      )}
    </div>
  )
}

