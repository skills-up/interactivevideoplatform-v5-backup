import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ShareLink from "@/models/ShareLink"
import Video from "@/models/Video"

interface Params {
  token: string
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    await dbConnect()

    // Find the share link
    const shareLink = await ShareLink.findOne({ token: params.token })
    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 })
    }

    // Check if the link has expired
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 403 })
    }

    // Check if interactions are enabled
    if (!shareLink.settings.showInteractions) {
      return NextResponse.json({ interactiveElements: [] })
    }

    // Find the video
    const video = await Video.findById(shareLink.videoId)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Return the interactive elements
    return NextResponse.json({
      interactiveElements: video.interactiveElements || [],
    })
  } catch (error) {
    console.error("Error fetching shared interactions:", error)
    return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 })
  }
}

