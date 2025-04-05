import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"

interface Params {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if video exists and user has access
    const video = await Video.findOne({
      _id: params.id,
      $or: [{ userId: session.user.id }, { collaborators: { $in: [session.user.id] } }],
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Prepare export data
    const exportData = {
      videoId: video._id,
      title: video.title,
      interactiveElements: video.interactiveElements || [],
      settings: video.settings || {},
      exportedAt: new Date(),
      exportedBy: session.user.id,
    }

    // Set headers for file download
    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="video-${video._id}-interactions.json"`)
    headers.set("Content-Type", "application/json")

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers,
    })
  } catch (error) {
    console.error("Error exporting video interactions:", error)
    return NextResponse.json({ error: "Failed to export video interactions" }, { status: 500 })
  }
}

