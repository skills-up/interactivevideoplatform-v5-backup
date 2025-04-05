import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Interaction from "@/models/Interaction"
import Video from "@/models/Video"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get("videoId")
    const userId = searchParams.get("userId")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    await dbConnect()

    const query: any = { video: videoId }

    if (userId) {
      query.user = userId
    }

    const interactions = await Interaction.find(query).sort({ timestamp: 1 }).populate("user", "name image").lean()

    return NextResponse.json(interactions)
  } catch (error) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.video || !data.elementId || !data.type || !data.response) {
      return NextResponse.json({ error: "Video ID, element ID, type, and response are required" }, { status: 400 })
    }

    await dbConnect()

    // Verify video exists
    const video = await Video.findById(data.video)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Create interaction
    const interaction = await Interaction.create({
      ...data,
      user: session.user.id,
      timestamp: data.timestamp || 0,
    })

    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    console.error("Error creating interaction:", error)
    return NextResponse.json({ error: "Failed to create interaction" }, { status: 500 })
  }
}

