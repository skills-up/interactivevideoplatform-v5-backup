import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Category from "@/models/Category"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const categories = await Category.find({}).sort({ order: 1 }).lean()

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        order: category.order,
        videoCount: category.videoCount || 0,
      })),
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

