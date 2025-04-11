import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Series, Season } from "@/models/Series"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const series = await Series.findById(params.id).populate("creator", "name avatar")

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    // Get all seasons for this series
    const seasons = await Season.find({ series: params.id })
      .populate({
        path: "episodes",
        select: "title thumbnail duration views createdAt",
      })
      .sort({ order: 1 })

    return NextResponse.json({
      ...series.toObject(),
      seasons,
    })
  } catch (error) {
    console.error("Error fetching series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const body = await request.json()

    // In a real app, you would validate the user is authenticated
    // and has permission to update this series

    const series = await Series.findByIdAndUpdate(params.id, { $set: body }, { new: true })

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    return NextResponse.json(series)
  } catch (error) {
    console.error("Error updating series:", error)
    return NextResponse.json({ error: "Failed to update series" }, { status: 500 })
  }
}

