import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"

export async function POST(req: NextRequest, props: { params: Promise<{ jobId: string }> }) {
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

    // Cancel the job
    await db.collection("transcodingJobs").updateOne(
      { id: jobId },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        },
      },
    )

    // Update video status if all jobs are cancelled or completed
    const allJobs = await db
      .collection("transcodingJobs")
      .find({
        id: { $in: video.transcodingJobs },
      })
      .toArray()

    const allJobsFinished = allJobs.every(
      (j) => j.status === "completed" || j.status === "cancelled" || j.status === "failed",
    )

    if (allJobsFinished) {
      await db.collection("videos").updateOne(
        { _id: video._id },
        {
          $set: {
            processingStatus: "completed",
            updatedAt: new Date().toISOString(),
          },
        },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Job cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling job:", error)
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 })
  }
}

