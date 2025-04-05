"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoData {
  _id: string
  title: string
  thumbnail: string
  views: number
  duration: number
  creator: {
    name: string
  }
  createdAt: string
}

interface VideoRecommendationsProps {
  excludeIds?: string[]
  limit?: number
  subscribedOnly?: boolean
  title?: string
}

export function VideoRecommendations({
  excludeIds = [],
  limit = 5,
  subscribedOnly = false,
  title = "Recommended Videos",
}: VideoRecommendationsProps) {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const excludeParam = excludeIds.length > 0 ? `&exclude=${excludeIds.join(",")}` : ""
        const subscribedParam = subscribedOnly ? "&subscribedOnly=true" : ""

        const response = await fetch(`/api/recommendations/videos?limit=${limit}${excludeParam}${subscribedParam}`)

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await response.json()
        setVideos(data)
      } catch (error) {
        console.error("Error fetching video recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [excludeIds, limit, subscribedOnly])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold">{title}</h2>
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-24 w-40 flex-shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold">{title}</h2>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">No recommendations available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="space-y-4">
        {videos.map((video) => {
          const minutes = Math.floor(video.duration / 60)
          const seconds = video.duration % 60
          const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`

          return (
            <Link key={video._id} href={`/watch/${video._id}`} className="group flex gap-2">
              <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={video.thumbnail || `/placeholder.svg?height=96&width=160`}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
                  {duration}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">{video.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{video.creator.name}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{video.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

