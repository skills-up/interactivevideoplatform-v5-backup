"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { InteractiveVideoPlayer, InteractiveElement as InteractiveElementType} from "@/components/interactive-video-player"
import { useToast } from "@/components/ui/use-toast"
import {
  getVideo,
  getVideoInteractiveElements,
  getVideoSettings,
  type Video,
  type InteractiveElement,
  type VideoSettings,
} from "@/lib/api"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ShareEmbedDialog } from "@/components/video/share-embed-dialog"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const videoId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [video, setVideo] = useState<Video | null>(null)
  const [interactiveElements, setInteractiveElements] = useState<any[]>([])
  const [videoSettings, setVideoSettings] = useState<VideoSettings | null>(null)

  // Fetch video data on component mount
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true)

        // Fetch video details
        const videoData = await getVideo(videoId)
        setVideo(videoData)

        // Fetch interactive elements
        const elements = await getVideoInteractiveElements(videoId)
        setInteractiveElements(elements)

        // Fetch video settings
        try {
          const settings = await getVideoSettings(videoId)
          setVideoSettings(settings)
        } catch (error) {
          // If settings don't exist yet, use defaults
          console.log("Using default video settings")
        }
      } catch (error) {
        console.error("Error fetching video data:", error)
        toast({
          title: "Error",
          description: "Failed to load video. Please try again.",
          variant: "destructive",
        })
        setVideo({
          id: videoId,
          title: "Introduction to Interactive Videos",
          description:
            "This video demonstrates how interactive elements can be added to videos to create engaging content. You'll learn about the different types of interactions that can be added and how they can be used to enhance the viewer experience.",
          // creator: {
          //   _id: "creator1",
          //   name: "Tech Tutorials",
          //   avatar: "/placeholder.svg?height=40&width=40",
          // },
          sourceType: "youtube" as const,
          sourceUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          thumbnailUrl: "/placeholder.svg?height=400&width=800",
          duration: 600,
          views: 1240,
          // tags: ["interactive", "tutorial", "education"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "creator1",
          isPublic: true,
        })
        setInteractiveElements([
          {
            id: "element1",
            type: "quiz" as const,
            title: "Quiz",
            description: "Test your knowledge",
            timestamp: 135, // 2:15
            duration: 30,
            options: [
              { id: 'option1', text: "Option A", isCorrect: true },
              { id: 'option2', text: "Option B", isCorrect: false },
              { id: 'option3', text: "Option C", isCorrect: false },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            videoId: videoId,
          },
          {
            id: "element2",
            type: "decision" as const,
            title: "Decision Point",
            description: "Choose which topic to explore next",
            timestamp: 330, // 5:30
            duration: 20,
            options: [
              { id: 'option1', text: "Frontend Development", action: "jump:400" },
              { id: 'option2', text: "Backend Development", action: "jump:500" },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            videoId: videoId,
          },
        ])
        // router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideoData()
  }, [videoId])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container px-4 py-6">
        <div className="mb-4">
        <Link
          href="/videos"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to videos
        </Link>
      </div>

      {video ? <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InteractiveVideoPlayer
            videoId={videoId}
            source={video.sourceType}
            url={video.sourceUrl}
            title={video.title}
            // poster={video.thumbnailUrl}
            interactiveElements={interactiveElements}
            videoSettings={videoSettings || undefined}
            className="w-full rounded-lg overflow-hidden shadow-lg"
          />

          <div className="mt-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                {formatDate(video.createdAt)} • {video.views} views
              </p>
              <ShareEmbedDialog videoId={videoId} videoTitle={video.title} />
            </div>
            {video.description && <p className="mt-4 text-muted-foreground">{video.description}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-2">About this video</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Published</dt>
                <dd>{formatDate(video.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Views</dt>
                <dd>{video.views}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Interactions</dt>
                <dd>{interactiveElements.length}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Source</dt>
                <dd className="capitalize">{video.sourceType}</dd>
              </div>
            </dl>
          </div>

          {interactiveElements.length > 0 && (
            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-2">Interactive Elements</h2>
              <ul className="space-y-2">
                {interactiveElements.map((element) => (
                  <li key={element.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{element.title}</span>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(element.timestamp / 60)}:{(element.timestamp % 60).toString().padStart(2, "0")}
                      </p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                      {element.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div> : <div className="flex min-h-screen items-center justify-center">
        <p>Video not found</p>
      </div>}
    </div>
  )
}

