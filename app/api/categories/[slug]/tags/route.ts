import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug } = params

    const { db } = await dbConnect()

    // Get category by slug
    const category = await db.collection("categories").findOne({ slug })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Get videos in this category
    const videos = await db.collection("videos").find({ categoryId: category._id.toString() }).toArray()

    // Extract and count tags
    const tagCounts: Record<string, number> = {}

    videos.forEach((video) => {
      if (Array.isArray(video.tags)) {
        video.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching category tags:", error)
    return NextResponse.json({ error: "Failed to fetch category tags" }, { status: 500 })
  }
}

