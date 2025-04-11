import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  try {
    const { db } = await dbConnect()

    // Get popular tags based on usage count
    const tags = await db.collection("tags").find({}).sort({ count: -1 }).limit(30).toArray()

    return NextResponse.json({
      tags: tags.map((tag) => ({
        name: tag.name,
        count: tag.count,
      })),
    })
  } catch (error) {
    console.error("Error fetching popular tags:", error)
    return NextResponse.json({ error: "Failed to fetch popular tags" }, { status: 500 })
  }
}

