import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user's watch history
    const watchHistory = await db
      .collection("watchHistory")
      .find({ userId: session.user.id })
      .sort({ watchedAt: -1 })
      .limit(50)
      .toArray()

    if (watchHistory.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    // Get video IDs from watch history
    const videoIds = watchHistory.map((entry) => new ObjectId(entry.videoId))

    // Get videos from watch history
    const historyVideos = await db
      .collection("videos")
      .find({ _id: { $in: videoIds } })
      .toArray()

    // Map videos to maintain watch history order
    const videoMap = Object.fromEntries(historyVideos.map((video) => [video._id.toString(), video]))

    const orderedVideos = watchHistory.map((entry) => videoMap[entry.videoId]).filter(Boolean)

    // Fetch creator information for each video
    const creatorIds = [...new Set(orderedVideos.map((video) => video.creatorId).filter(Boolean))]

    const creators =
      creatorIds.length > 0
        ? await db
            .collection("users")
            .find({ _id: { $in: creatorIds.map((id) => new ObjectId(id)) } })
            .toArray()
            .then((results) => Object.fromEntries(results.map((creator) => [creator._id.toString(), creator])))
        : {}

    // Format response
    const formattedVideos = orderedVideos.map((video) => ({
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      views: video.views,
      createdAt: video.createdAt,
      tags: video.tags || [],
      creator: video.creatorId
        ? {
            id: video.creatorId,
            name: creators[video.creatorId]?.name || "Unknown Creator",
            avatarUrl: creators[video.creatorId]?.avatarUrl,
          }
        : null,
    }))

    return NextResponse.json({ videos: formattedVideos })
  } catch (error) {
    console.error("Error fetching watch history:", error)
    return NextResponse.json({ error: "Failed to fetch watch history" }, { status: 500 })
  }
}

