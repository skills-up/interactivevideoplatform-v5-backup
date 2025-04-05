import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import EarningsPeriod from "@/models/EarningsPeriod"
import { getEarningsBreakdown } from "@/lib/earnings-calculator"

interface Params {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get earnings period
    const period = await EarningsPeriod.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!period) {
      return NextResponse.json({ error: "Earnings period not found" }, { status: 404 })
    }

    // Get detailed breakdown
    const breakdown = await getEarningsBreakdown(period)

    return NextResponse.json({
      period,
      breakdown,
    })
  } catch (error) {
    console.error("Error fetching earnings breakdown:", error)
    return NextResponse.json({ error: "Failed to fetch earnings breakdown" }, { status: 500 })
  }
}

