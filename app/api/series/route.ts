import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { Series } from "@/models/Series"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const creator = searchParams.get("creator")

    const skip = (page - 1) * limit

    await dbConnect()

    // Build query
    const query: any = { isActive: true }

    if (creator) {
      query.creator = creator
    }

    // Execute query
    const series = await Series.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "name image")
      .lean()

    const total = await Series.countDocuments(query)

    return NextResponse.json({
      series,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a creator or admin
    if (session.user.role !== "creator" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Only creators can create series" }, { status: 403 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.title || !data.description || !data.thumbnail || !data.price) {
      return NextResponse.json({ error: "Title, description, thumbnail, and price are required" }, { status: 400 })
    }

    await dbConnect()

    // Create series
    const series = await Series.create({
      ...data,
      creator: session.user.id,
      isActive: true,
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.error("Error creating series:", error)
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 })
  }
}

