import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { videoId } = params

    const { db } = await connectToDatabase()

    // Get the video
    const video = await db.collection("videos").findOne({
      _id: new ObjectId(videoId),
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if the user is the creator
    if (video.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get analytics data
    const views = await db.collection("videoViews").find({ videoId }).toArray()

    // Get interactions
    const interactions = await db.collection("interactions").find({ videoId }).toArray()

    // Calculate metrics
    const totalViews = views.length
    const uniqueViewers = new Set(views.map((view) => view.userId)).size
    const averageWatchTime = views.reduce((sum, view) => sum + (view.watchTime || 0), 0) / totalViews || 0
    const completionRate = views.filter((view) => view.completed).length / totalViews || 0

    // Calculate interaction metrics
    const interactionCount = interactions.length
    const interactionsByType = interactions.reduce((acc: Record<string, number>, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1
      return acc
    }, {})

    // Calculate engagement rate
    const engagementRate = interactionCount / totalViews || 0

    // Get view trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const viewsByDay = await db
      .collection("videoViews")
      .aggregate([
        {
          $match: {
            videoId,
            timestamp: { $gte: thirtyDaysAgo.toISOString() },
          },
        },
        {
          $group: {
            _id: { $substr: ["$timestamp", 0, 10] }, // Group by date (YYYY-MM-DD)
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray()

    return NextResponse.json({
      totalViews,
      uniqueViewers,
      averageWatchTime,
      completionRate,
      interactionCount,
      interactionsByType,
      engagementRate,
      viewsByDay: viewsByDay.map((day) => ({
        date: day._id,
        views: day.count,
      })),
    })
  } catch (error) {
    console.error("Error fetching video analytics:", error)
    return NextResponse.json({ error: "Failed to fetch video analytics" }, { status: 500 })
  }
}

