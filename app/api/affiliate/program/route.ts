import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import AffiliateProgram from "@/models/AffiliateProgram"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const program = await AffiliateProgram.findOne({ status: "active" })

    if (!program) {
      return NextResponse.json({ error: "Affiliate program not found or inactive" }, { status: 404 })
    }

    return NextResponse.json({ program })
  } catch (error) {
    console.error("Error fetching affiliate program:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate program" }, { status: 500 })
  }
}

