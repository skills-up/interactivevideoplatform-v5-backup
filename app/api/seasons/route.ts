import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { Season, Series } from "@/models/Series"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const seriesId = searchParams.get("seriesId")

    if (!seriesId) {
      return NextResponse.json({ error: "Series ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Verify series exists
    const series = await Series.findById(seriesId)

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    // Get seasons for series
    const seasons = await Season.find({ series: seriesId })
      .sort({ order: 1 })
      .populate("episodes", "title thumbnail duration views")
      .lean()

    return NextResponse.json(seasons)
  } catch (error) {
    console.error("Error fetching seasons:", error)
    return NextResponse.json({ error: "Failed to fetch seasons" }, { status: 500 })
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
    if (!data.title || !data.series) {
      return NextResponse.json({ error: "Title and series ID are required" }, { status: 400 })
    }

    await dbConnect()

    // Verify series exists and user is the creator
    const series = await Series.findById(data.series)

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    if (series.creator.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Only the creator can add seasons to this series" }, { status: 403 })
    }

    // Get highest order number
    const highestOrder = await Season.findOne({ series: data.series }).sort({ order: -1 }).select("order").lean()

    const order = highestOrder ? highestOrder.order + 1 : 1

    // Create season
    const season = await Season.create({
      ...data,
      order,
    })

    return NextResponse.json(season, { status: 201 })
  } catch (error) {
    console.error("Error creating season:", error)
    return NextResponse.json({ error: "Failed to create season" }, { status: 500 })
  }
}

