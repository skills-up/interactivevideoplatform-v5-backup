import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Video from "@/models/Video"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")
    const creator = searchParams.get("creator")

    const skip = (page - 1) * limit

    await dbConnect()

    // Build query
    const query: any = { visibility: "public" }

    if (category) {
      query.category = category
    }

    if (tag) {
      query.tags = tag
    }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (creator) {
      query.creator = creator
    }

    // Execute query
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "name image")
      .lean()

    const total = await Video.countDocuments(query)

    return NextResponse.json({
      videos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
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
    if (!data.title || !data.url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 })
    }

    await dbConnect()

    // Create new video
    const video = await Video.create({
      ...data,
      creator: session.user.id,
      visibility: data.visibility || "private",
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}

