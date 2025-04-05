import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { Season } from "@/lib/db/models/series"
import Video from "@/lib/db/models/video"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const season = await Season.findById(params.id).populate({
      path: "episodes",
      select: "title thumbnail duration views createdAt",
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    return NextResponse.json(season)
  } catch (error) {
    console.error("Error fetching season:", error)
    return NextResponse.json({ error: "Failed to fetch season" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const body = await request.json()

    // In a real app, you would validate the user is authenticated
    // and has permission to update this season

    const season = await Season.findByIdAndUpdate(params.id, { $set: body }, { new: true })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    return NextResponse.json(season)
  } catch (error) {
    console.error("Error updating season:", error)
    return NextResponse.json({ error: "Failed to update season" }, { status: 500 })
  }
}

// Add a video to a season
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const body = await request.json()
    const { videoId } = body

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // In a real app, you would validate the user is authenticated
    // and has permission to update this season

    // Add video to season
    const season = await Season.findByIdAndUpdate(params.id, { $addToSet: { episodes: videoId } }, { new: true })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Add season to video's seasons array
    await Video.findByIdAndUpdate(videoId, { $addToSet: { seasons: params.id } })

    return NextResponse.json(season)
  } catch (error) {
    console.error("Error adding video to season:", error)
    return NextResponse.json({ error: "Failed to add video to season" }, { status: 500 })
  }
}

