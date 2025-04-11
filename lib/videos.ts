import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function getVideoById(id: string) {
  try {
    await dbConnect()

    if (! mongoose.isValidObjectId(id)) {
      return null
    }

    const video = await Video.findById(id).populate("creator", "name email").lean()

    if (!video) {
      return null
    }

    return {
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      likes: video.likes,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      creator: {
        id: video.creator._id.toString(),
        name: video.creator.name,
        email: video.creator.email,
      },
      tags: video.tags,
      category: video.category,
      visibility: video.visibility,
      interactions: video.interactions,
      type: video.type,
    }
  } catch (error) {
    console.error("Error fetching video:", error)
    return null
  }
}

export async function getUserVideos(limit = 10, page = 1) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { videos: [], totalCount: 0 }
    }

    await dbConnect()

    const skip = (page - 1) * limit

    const [videos, totalCount] = await Promise.all([
      Video.find({ creator: session.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Video.countDocuments({ creator: session.user.id }),
    ])

    return {
      videos: videos.map((video) => ({
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        visibility: video.visibility,
        interactions: video.interactions?.length || 0,
      })),
      totalCount,
    }
  } catch (error) {
    console.error("Error fetching user videos:", error)
    return { videos: [], totalCount: 0 }
  }
}

export async function getPublicVideos(limit = 10, page = 1, category?: string, search?: string) {
  try {
    await dbConnect()

    const skip = (page - 1) * limit

    // Build query
    const query: any = { visibility: "public" }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const [videos, totalCount] = await Promise.all([
      Video.find(query).populate("creator", "name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Video.countDocuments(query),
    ])

    return {
      videos: videos.map((video) => ({
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        createdAt: video.createdAt,
        creator: {
          id: video.creator._id.toString(),
          name: video.creator.name,
        },
        category: video.category,
        tags: video.tags,
      })),
      totalCount,
    }
  } catch (error) {
    console.error("Error fetching public videos:", error)
    return { videos: [], totalCount: 0 }
  }
}

export async function incrementVideoViews(id: string) {
  try {
    await dbConnect()

    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } })

    return true
  } catch (error) {
    console.error("Error incrementing video views:", error)
    return false
  }
}

