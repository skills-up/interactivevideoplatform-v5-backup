import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const creatorId = searchParams.get("creatorId")
    const tagsParam = searchParams.get("tags")

    const tags = tagsParam ? tagsParam.split(",") : []

    const { db } = await connectToDatabase()
    const session = await getServerSession(authOptions)

    let videos = []

    // If videoId is provided, get related videos
    if (videoId) {
      // Get videos with similar tags
      if (tags.length > 0) {
        videos = await db
          .collection("videos")
          .find({
            _id: { $ne: new ObjectId(videoId) },
            tags: { $in: tags },
          })
          .limit(10)
          .toArray()
      }

      // If not enough videos found, get videos from the same creator
      if (videos.length < 5 && creatorId) {
        const creatorVideos = await db
          .collection("videos")
          .find({
            _id: { $ne: new ObjectId(videoId) },
            creatorId,
          })
          .limit(10 - videos.length)
          .toArray()

        // Merge and deduplicate
        const existingIds = new Set(videos.map((v) => v._id.toString()))
        videos = [...videos, ...creatorVideos.filter((v) => !existingIds.has(v._id.toString()))]
      }

      // If still not enough videos, get popular videos
      if (videos.length < 10) {
        const popularVideos = await db
          .collection("videos")
          .find({
            _id: { $ne: new ObjectId(videoId) },
          })
          .sort({ views: -1 })
          .limit(10 - videos.length)
          .toArray()

        // Merge and deduplicate
        const existingIds = new Set(videos.map((v) => v._id.toString()))
        videos = [...videos, ...popularVideos.filter((v) => !existingIds.has(v._id.toString()))]
      }
    } else {
      // Get trending videos
      videos = await db.collection("videos").find({}).sort({ views: -1 }).limit(10).toArray()
    }

    // Fetch creator information for each video
    const videoIds = videos.map((video) => video._id)
    const creatorIds = [...new Set(videos.map((video) => video.creatorId).filter(Boolean))]

    const creators =
      creatorIds.length > 0
        ? await db
            .collection("users")
            .find({ _id: { $in: creatorIds.map((id) => new ObjectId(id)) } })
            .toArray()
            .then((results) => Object.fromEntries(results.map((creator) => [creator._id.toString(), creator])))
        : {}

    // Format response
    const formattedVideos = videos.map((video) => ({
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
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ error: "Failed to fetch video recommendations" }, { status: 500 })
  }
}

