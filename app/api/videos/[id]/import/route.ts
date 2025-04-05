import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import { z } from "zod"

interface Params {
  id: string
}

// Schema for import validation
const importSchema = z.object({
  interactiveElements: z.array(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  replaceExisting: z.boolean().default(false),
})

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = importSchema.safeParse(body)

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

    // Update video with imported data
    if (data.interactiveElements) {
      if (data.replaceExisting) {
        video.interactiveElements = data.interactiveElements
      } else {
        // Merge with existing elements
        const existingIds = new Set((video.interactiveElements || []).map((el) => el.id))
        const newElements = data.interactiveElements.filter((el) => !existingIds.has(el.id))
        video.interactiveElements = [...(video.interactiveElements || []), ...newElements]
      }
    }

    if (data.settings) {
      if (data.replaceExisting) {
        video.settings = data.settings
      } else {
        // Merge with existing settings
        video.settings = {
          ...(video.settings || {}),
          ...data.settings,
        }
      }
    }

    await video.save()

    return NextResponse.json({
      success: true,
      elementsCount: video.interactiveElements?.length || 0,
    })
  } catch (error) {
    console.error("Error importing video interactions:", error)
    return NextResponse.json({ error: "Failed to import video interactions" }, { status: 500 })
  }
}

