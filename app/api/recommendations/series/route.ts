import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { getRecommendedSeries } from "@/lib/recommendation/recommendation-engine"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "3")

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    const recommendations = await getRecommendedSeries(userId, limit)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error fetching series recommendations:", error)
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 })
  }
}

