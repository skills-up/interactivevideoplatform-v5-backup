"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { TrendingUp, ThumbsUp, History } from "lucide-react"
import Link from "next/link"

interface VideoRecommendationsProps {
  currentVideoId: string
  creatorId?: string
  tags?: string[]
  className?: string
}

export function VideoRecommendations({ currentVideoId, creatorId, tags = [], className }: VideoRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<"related" | "trending" | "history">("related")
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)

      try {
        let endpoint = "/api/videos/recommendations"

        switch (activeTab) {
          case "related":
            endpoint += `?videoId=${currentVideoId}&creatorId=${creatorId || ""}&tags=${tags.join(",")}`
            break
          case "trending":
            endpoint += "/trending"
            break
          case "history":
            endpoint += "/history"
            break
        }

        const response = await fetch(endpoint)
        if (!response.ok) throw new Error("Failed to fetch recommendations")

        const data = await response.json()
        setRecommendations(data.videos || [])
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load video recommendations",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentVideoId, creatorId, tags, activeTab, toast])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`
    } else {
      return `${views} views`
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months} ${months === 1 ? "month" : "months"} ago`
    } else {
      const years = Math.floor(diffInSeconds / 31536000)
      return `${years} ${years === 1 ? "year" : "years"} ago`
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="related">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Related
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex mb-4">
                  <Skeleton className="h-24 w-40 rounded-md flex-shrink-0" />
                  <div className="ml-3 flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No {activeTab} videos found</div>
            ) : (
              recommendations.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className={`flex mb-4 group ${video.id === currentVideoId ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div className="relative h-24 w-40 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground text-xs">No thumbnail</span>
                      </div>
                    )}

                    {video.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>

                    <p className="text-xs text-muted-foreground mt-1">{video.creator?.name || "Unknown creator"}</p>

                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>{formatViews(video.views)}</span>
                      <span className="mx-1">•</span>
                      <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>

                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {video.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs py-0">
                            {tag}
                          </Badge>
                        ))}
                        {video.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs py-0">
                            +{video.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}

