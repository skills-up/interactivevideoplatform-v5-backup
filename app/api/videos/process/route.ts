import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"
import { ObjectId } from "mongodb"
import { generateDefaultTranscodingOptions, createTranscodingJob } from "@/lib/video-transcoder"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { videoId } = await req.json()

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    const { db } = await dbConnect()

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

    // Generate transcoding options
    const transcodingOptions = generateDefaultTranscodingOptions()

    // Create transcoding jobs
    const jobs = await Promise.all(
      transcodingOptions.map((options) => createTranscodingJob(videoId, video.url, options)),
    )

    // Update video status
    await db.collection("videos").updateOne(
      { _id: new ObjectId(videoId) },
      {
        $set: {
          processingStatus: "processing",
          transcodingJobs: jobs.map((job) => job.id),
          updatedAt: new Date().toISOString(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Video processing started",
      jobs: jobs.map((job) => ({
        id: job.id,
        resolution: job.options.resolution.label,
        format: job.options.format,
        status: job.status,
      })),
    })
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 })
  }
}

