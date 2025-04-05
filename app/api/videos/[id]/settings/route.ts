import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import { z } from "zod"

interface Params {
  id: string
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
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

    // Return video settings or default settings if not set
    const settings = video.settings || {
      autoPlayInteractions: true,
      pauseOnInteraction: true,
      showFeedbackImmediately: true,
      allowSkipping: true,
      requireInteractionCompletion: false,
      defaultInteractionDuration: 10,
      interactionDisplayMode: "overlay",
      interactionPosition: "center",
      interactionSize: "medium",
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching video settings:", error)
    return NextResponse.json({ error: "Failed to fetch video settings" }, { status: 500 })
  }
}

const videoSettingsSchema = z.object({
  autoPlayInteractions: z.boolean().optional(),
  pauseOnInteraction: z.boolean().optional(),
  showFeedbackImmediately: z.boolean().optional(),
  allowSkipping: z.boolean().optional(),
  requireInteractionCompletion: z.boolean().optional(),
  defaultInteractionDuration: z.number().min(1).max(60).optional(),
  interactionDisplayMode: z.enum(["overlay", "sidebar", "pause"]).optional(),
  interactionPosition: z.string().optional(),
  interactionSize: z.string().optional(),
})

export async function PATCH(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = videoSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
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

    const data = validation.data

    // Update settings
    video.settings = {
      ...(video.settings || {}),
      ...data,
    }

    await video.save()

    return NextResponse.json({ settings: video.settings })
  } catch (error) {
    console.error("Error updating video settings:", error)
    return NextResponse.json({ error: "Failed to update video settings" }, { status: 500 })
  }
}

