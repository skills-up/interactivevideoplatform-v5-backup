import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.id

    await dbConnect()

    const video = await Video.findById(videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      settings: video.interactionSettings || {
        behavior: {
          pauseOnInteraction: true,
          resumeAfterInteraction: true,
          skipAfterSeconds: 5,
          allowSkipping: true,
          showProgressBar: true,
          showCompletionStatus: true,
        },
        appearance: {
          defaultPosition: "center",
          animationIn: "fade",
          animationOut: "fade",
          backdropOpacity: 50,
          maxWidth: "500px",
          zIndex: 10,
        },
        analytics: {
          trackInteractions: true,
          trackCompletions: true,
          trackSkips: true,
          requireAuthentication: false,
        },
        accessibility: {
          keyboardNavigation: true,
          screenReaderSupport: true,
          highContrastMode: false,
          textToSpeech: false,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching interaction settings:", error)
    return NextResponse.json({ error: "An error occurred while fetching interaction settings" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.id
    const { settings } = await req.json()

    await dbConnect()

    const video = await Video.findById(videoId)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user is the creator of the video
    if (video.creator.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update interaction settings
    video.interactionSettings = settings
    await video.save()

    return NextResponse.json({
      message: "Interaction settings updated successfully",
      settings: video.interactionSettings,
    })
  } catch (error) {
    console.error("Error updating interaction settings:", error)
    return NextResponse.json({ error: "An error occurred while updating interaction settings" }, { status: 500 })
  }
}

