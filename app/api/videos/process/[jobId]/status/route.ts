import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"

export async function GET(req: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { jobId } = params

    const { db } = await connectToDatabase()

    // Get the transcoding job
    const job = await db.collection("transcodingJobs").findOne({
      id: jobId,
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get the video
    const video = await db.collection("videos").findOne({
      transcodingJobs: jobId,
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if the user is the creator
    if (video.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      id: job.id,
      videoId: job.videoId,
      status: job.status,
      progress: job.progress,
      resolution: job.options.resolution.label,
      format: job.options.format,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      error: job.error,
    })
  } catch (error) {
    console.error("Error getting job status:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}

