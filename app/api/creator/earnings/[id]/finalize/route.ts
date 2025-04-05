import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import EarningsPeriod from "@/models/EarningsPeriod"
import { finalizeEarningsPeriod } from "@/lib/earnings-calculator"

interface Params {
  id: string
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
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

    // Finalize period
    const success = await finalizeEarningsPeriod(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to finalize earnings period" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error finalizing earnings period:", error)
    return NextResponse.json({ error: "Failed to finalize earnings period" }, { status: 500 })
  }
}

