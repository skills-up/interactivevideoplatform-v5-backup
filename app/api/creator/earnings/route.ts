import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import EarningsPeriod from "@/models/EarningsPeriod"
import { calculateCurrentEarnings } from "@/lib/earnings-calculator"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get earnings periods with pagination
    const periods = await EarningsPeriod.find({ userId: session.user.id })
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit)

    const total = await EarningsPeriod.countDocuments({ userId: session.user.id })

    // Calculate current earnings (not yet finalized)
    const currentEarnings = await calculateCurrentEarnings(session.user.id)

    return NextResponse.json({
      periods,
      currentEarnings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 })
  }
}

