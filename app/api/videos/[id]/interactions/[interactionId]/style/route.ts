import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string; interactionId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: videoId, interactionId } = params

    await dbConnect()

    const video = await Video.findById(videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Find the interaction
    const interaction = video.interactions?.find((i: any) => i.id === interactionId)

    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      style: interaction.style || {},
    })
  } catch (error) {
    console.error("Error fetching interaction style:", error)
    return NextResponse.json({ error: "An error occurred while fetching interaction style" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string; interactionId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: videoId, interactionId } = params
    const { style } = await req.json()

    await dbConnect()

    const video = await Video.findById(videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Find and update the interaction
    const interactionIndex = video.interactions?.findIndex((i: any) => i.id === interactionId)

    if (interactionIndex === -1 || interactionIndex === undefined) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 })
    }

    // Update the style
    video.interactions[interactionIndex].style = style
    await video.save()

    return NextResponse.json({
      message: "Interaction style updated successfully",
      style: video.interactions[interactionIndex].style,
    })
  } catch (error) {
    console.error("Error updating interaction style:", error)
    return NextResponse.json({ error: "An error occurred while updating interaction style" }, { status: 500 })
  }
}

