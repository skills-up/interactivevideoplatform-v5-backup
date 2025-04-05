import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ShareLink from "@/models/ShareLink"
import Video from "@/models/Video"
import User from "@/models/User"
import type { InteractiveElement } from "@/types/video"

interface Params {
  key: string
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    await dbConnect()

    // Find share link by access key
    const shareLink = await ShareLink.findOne({
      accessKey: params.key,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    })

    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found or expired" }, { status: 404 })
    }

    // Increment view count
    shareLink.views += 1
    await shareLink.save()

    // Get video details
    const video = await Video.findById(shareLink.videoId)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Get creator details
    const creator = await User.findOne({ id: video.userId })

    // Filter interactive elements if needed
    let interactiveElements: InteractiveElement[] = []
    if (shareLink.settings.showInteractions) {
      interactiveElements = video.interactiveElements || []
    }

    // Prepare response
    const response = {
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        videoUrl: video.videoUrl,
        duration: video.duration,
        interactiveElements,
      },
      creator: creator
        ? {
            id: creator.id,
            name: creator.name,
            image: creator.image,
          }
        : null,
      settings: shareLink.settings,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching shared video:", error)
    return NextResponse.json({ error: "Failed to fetch shared video" }, { status: 500 })
  }
}

