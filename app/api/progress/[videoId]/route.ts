import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"

// Schema for progress update
const progressUpdateSchema = z.object({
  lastPosition: z.number().min(0),
  completedInteractions: z.array(z.string()),
})

export async function GET(req: NextRequest, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.videoId

    const { db } = await dbConnect()
    const progress = await db.collection("videoProgress").findOne({
      userId: session.user.id,
      videoId,
    })

    if (!progress) {
      return NextResponse.json({
        lastPosition: 0,
        completedInteractions: [],
      })
    }

    return NextResponse.json({
      lastPosition: progress.lastPosition,
      completedInteractions: progress.completedInteractions || [],
    })
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ message: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.videoId
    const body = await req.json()
    const validatedData = progressUpdateSchema.parse(body)

    const { db } = await dbConnect()

    // Update or create progress record
    await db.collection("videoProgress").updateOne(
      {
        userId: session.user.id,
        videoId,
      },
      {
        $set: {
          lastPosition: validatedData.lastPosition,
          completedInteractions: validatedData.completedInteractions,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          userId: session.user.id,
          videoId,
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 400 })
    }

    console.error("Error updating progress:", error)
    return NextResponse.json({ message: "Failed to update progress" }, { status: 500 })
  }
}

