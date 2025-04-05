import { cache } from "react"

export interface VideoData {
  _id: string
  title: string
  description: string
  creator: {
    _id: string
    name: string
    avatar?: string
  }
  source: "youtube" | "dailymotion" | "vimeo" | "local"
  sourceUrl: string
  thumbnail: string
  duration: number
  interactiveElements: Array<{
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
  }>
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CommentData {
  _id: string
  content: string
  user: {
    _id: string
    name: string
    avatar?: string
  }
  likes: number
  createdAt: string
  replies?: CommentData[]
}

export const getFeaturedVideos = cache(async (limit = 4) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos?limit=${limit}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch featured videos")
    }

    const data = await res.json()
    return data.videos as VideoData[]
  } catch (error) {
    console.error("Error fetching featured videos:", error)
    return []
  }
})

export const getVideoById = cache(async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${id}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch video")
    }

    const data = await res.json()
    return data as VideoData
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error)
    return null
  }
})

export const getRecommendedVideos = cache(async (videoId: string, limit = 5) => {
  try {
    // In a real app, you would have a more sophisticated recommendation algorithm
    // For now, we'll just get the latest videos excluding the current one
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos?limit=${limit}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch recommended videos")
    }

    const data = await res.json()
    return data.videos.filter((video: VideoData) => video._id !== videoId) as VideoData[]
  } catch (error) {
    console.error("Error fetching recommended videos:", error)
    return []
  }
})

export const getVideoComments = cache(async (videoId: string, limit = 20) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/video/${videoId}?limit=${limit}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch video comments")
    }

    const data = await res.json()
    return data.comments as CommentData[]
  } catch (error) {
    console.error(`Error fetching comments for video ${videoId}:`, error)
    return []
  }
})

