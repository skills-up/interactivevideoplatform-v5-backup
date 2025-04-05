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
  createdAt: string
}

export function RecentVideos() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentVideos() {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/videos/recent');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setVideos([
            {
              _id: "1",
              title: "Introduction to Interactive Videos",
              thumbnail: "/placeholder.svg?height=48&width=80",
              views: 1240,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              _id: "2",
              title: "Advanced Interaction Techniques",
              thumbnail: "/placeholder.svg?height=48&width=80",
              views: 980,
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              _id: "3",
              title: "Creating Engaging Content",
              thumbnail: "/placeholder.svg?height=48&width=80",
              views: 750,
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching recent videos:", error)
        setLoading(false)
      }
    }

    fetchRecentVideos()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-20 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">No recent videos found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div key={video._id} className="flex items-center gap-3">
          <div className="h-12 w-20 overflow-hidden rounded-md">
            <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">
              <Link href={`/dashboard/videos/${video._id}`} className="hover:text-primary">
                {video.title}
              </Link>
            </h4>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })} • {video.views.toLocaleString()}{" "}
              views
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

