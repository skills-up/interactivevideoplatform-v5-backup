import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        videos: [],
        creators: [],
        tags: [],
      })
    }

    const { db } = await dbConnect()

    // Create text search index
    const searchRegex = new RegExp(query, "i")

    // Search videos
    const videos = await db
      .collection("videos")
      .find({
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
        ],
      })
      .project({
        _id: 1,
        title: 1,
        description: 1,
        thumbnailUrl: 1,
        duration: 1,
        views: 1,
        creatorId: 1,
        createdAt: 1,
      })
      .limit(10)
      .toArray()

    // Search creators
    const creators = await db
      .collection("users")
      .find({
        $or: [
          { name: { $regex: searchRegex } },
          { username: { $regex: searchRegex } },
          { bio: { $regex: searchRegex } },
        ],
      })
      .project({
        _id: 1,
        name: 1,
        username: 1,
        avatarUrl: 1,
        subscriberCount: 1,
      })
      .limit(5)
      .toArray()

    // Search tags
    const tags = await db
      .collection("tags")
      .find({
        name: { $regex: searchRegex },
      })
      .project({
        _id: 1,
        name: 1,
        count: 1,
      })
      .limit(10)
      .toArray()
      .then((results) => results.map((tag) => tag.name))

    return NextResponse.json({
      videos: videos.map((video) => ({
        id: video._id.toString(),
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        createdAt: video.createdAt,
      })),
      creators: creators.map((creator) => ({
        id: creator._id.toString(),
        name: creator.name,
        username: creator.username,
        avatarUrl: creator.avatarUrl,
        subscriberCount: creator.subscriberCount || 0,
      })),
      tags,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}

