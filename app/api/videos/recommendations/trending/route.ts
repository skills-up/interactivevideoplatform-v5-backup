import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  try {
    const { db } = await dbConnect()

    // Get trending videos based on views and recency
    const videos = await db
      .collection("videos")
      .aggregate([
        {
          $addFields: {
            // Calculate a trending score based on views and recency
            trendingScore: {
              $add: [
                { $divide: ["$views", 100] }, // Views factor
                {
                  $multiply: [
                    10,
                    {
                      $divide: [
                        { $subtract: [new Date(), { $toDate: "$createdAt" }] },
                        86400000, // Milliseconds in a day
                      ],
                    },
                  ],
                }, // Recency factor
              ],
            },
          },
        },
        { $sort: { trendingScore: -1 } },
        { $limit: 20 },
      ])
      .toArray()

    // Fetch creator information for each video
    const creatorIds = [...new Set(videos.map((video) => video.creatorId).filter(Boolean))]

    const creators =
      creatorIds.length > 0
        ? await db
            .collection("users")
            .find({ _id: { $in: creatorIds } })
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
    console.error("Error fetching trending videos:", error)
    return NextResponse.json({ error: "Failed to fetch trending videos" }, { status: 500 })
  }
}

