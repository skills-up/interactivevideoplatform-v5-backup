"use client"

import { useEffect, useState } from "react"
import { InteractiveVideoPlayer } from "@/components/video/interactive-video-player"
import { getVideoInteractiveElements, getVideoSettings } from "@/lib/api"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

interface InteractiveVideoPlayerWrapperProps {
  videoId: string
  sourceUrl: string
  sourceType: "youtube" | "vimeo" | "dailymotion" | "local"
  title: string
  initialTime?: number
  preventDownload?: boolean
  trackProgress?: boolean
  className?: string
}

export function InteractiveVideoPlayerWrapper({
  videoId,
  sourceUrl,
  sourceType,
  title,
  initialTime = 0,
  preventDownload = true,
  trackProgress = true,
  className,
}: InteractiveVideoPlayerWrapperProps) {
  const [interactiveElements, setInteractiveElements] = useState([])
  const [videoSettings, setVideoSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [attemptedInteractions, setAttemptedInteractions] = useState<Set<string>>(new Set())
  const [currentScore, setCurrentScore] = useState(0)
  const [progressData, setProgressData] = useState<{
    lastPosition: number
    completedInteractions: string[]
  } | null>(null)

  const { data: session } = useSession()
  const { toast } = useToast()

  // Fetch interactive elements and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch interactive elements
        const elements = await getVideoInteractiveElements(videoId)
        setInteractiveElements(elements)

        // Fetch video settings
        try {
          const settings = await getVideoSettings(videoId)
          setVideoSettings(settings)
        } catch (error) {
          console.log("Using default video settings")
        }

        // Fetch user progress if tracking is enabled and user is logged in
        if (trackProgress && session?.user) {
          try {
            const response = await fetch(`/api/progress/${videoId}`)
            if (response.ok) {
              const data = await response.json()
              setProgressData(data)

              // Set attempted interactions from progress data
              if (data.completedInteractions) {
                setAttemptedInteractions(new Set(data.completedInteractions))
              }

              // Set initial time to last position if available
              if (data.lastPosition && data.lastPosition > 0) {
                // Only set if initialTime wasn't explicitly provided
                if (initialTime === 0) {
                  // if (videoRef.current) {
                  //   videoRef.current.currentTime = data.lastPosition;
                  // }
                }
              }
            }
          } catch (error) {
            console.error("Error fetching progress:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching video data:", error)
        toast({
          title: "Error",
          description: "Failed to load interactive elements",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [videoId, session, trackProgress, initialTime])

  // Handle interaction attempts
  const handleInteractionAttempt = async (interactionId: string, optionId: string, isCorrect?: boolean) => {
    // Skip if this interaction was already attempted and we're preventing reattempts
    if (trackProgress && attemptedInteractions.has(interactionId) && videoSettings?.preventReattempt) {
      toast({
        title: "Already Attempted",
        description: "You've already answered this question",
      })
      return
    }

    // Record the attempt in the database
    if (session?.user) {
      try {
        // const result = await recordInteractionAttempt({
        //   videoId,
        //   interactionId,
        //   userId: session.user.id,
        //   optionId,
        //   isCorrect: isCorrect ?? null,
        //   timestamp: new Date().toISOString(),
        // });

        // Update score if correct
        if (isCorrect) {
          setCurrentScore((prev) => prev + 10) // 10 points per correct answer
        }

        // Mark as attempted
        if (trackProgress) {
          setAttemptedInteractions((prev) => new Set([...prev, interactionId]))

          // Update progress in database
          // await fetch(`/api/progress/${videoId}`, {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({
          //     lastPosition: videoRef.current?.currentTime || 0,
          //     completedInteractions: [...attemptedInteractions, interactionId],
          //   }),
          // });
        }

        // Send webhook if configured
        // if (videoSettings?.webhookUrl) {
        //   fetch(videoSettings.webhookUrl, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       event: "interaction_attempt",
        //       videoId,
        //       interactionId,
        //       userId: session.user.id,
        //       optionId,
        //       isCorrect,
        //       timestamp: new Date().toISOString(),
        //     }),
        //   }).catch((err) => console.error("Webhook error:", err));
        // }
      } catch (error) {
        console.error("Error recording attempt:", error)
      }
    }
  }

  // Track video progress
  const handleTimeUpdate = (time: number) => {
    if (trackProgress && session?.user) {
      // Throttle updates to once every 5 seconds
      const shouldUpdate = !progressData?.lastPosition || Math.abs(time - (progressData.lastPosition || 0)) > 5

      if (shouldUpdate) {
        // fetch(`/api/progress/${videoId}`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     lastPosition: time,
        //     completedInteractions: progressData?.completedInteractions || [],
        //   }),
        // }).catch((err) => console.error("Error updating progress:", err));

        setProgressData((prev) => ({
          ...prev,
          lastPosition: time,
        }))
      }
    }
  }

  // Filter out already attempted interactions if prevent reattempt is enabled
  const filteredElements = videoSettings?.preventReattempt
    ? interactiveElements.filter((el) => !attemptedInteractions.has(el.id))
    : interactiveElements

  return (
    <div className={className}>
      {isLoading ? (
        <div className="aspect-video bg-muted animate-pulse rounded-lg"></div>
      ) : (
        <>
          <InteractiveVideoPlayer
            videoId={videoId}
            source={sourceType}
            url={sourceUrl}
            title={title}
            interactiveElements={filteredElements}
            videoSettings={videoSettings}
            onTimeUpdate={handleTimeUpdate}
            onInteractionAttempt={handleInteractionAttempt}
            preventDownload={preventDownload}
          />

          {trackProgress && session?.user && (
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Current Score: {currentScore}</span>
                <span>
                  Progress: {attemptedInteractions.size}/{interactiveElements.length} interactions
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

