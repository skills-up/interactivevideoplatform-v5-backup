import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
import AffiliateCommission from "@/models/AffiliateCommission"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get affiliate user
    const affiliateUser = await AffiliateUser.findOne({ userId: session.user.id })
    if (!affiliateUser) {
      return NextResponse.json({ error: "You are not an affiliate" }, { status: 404 })
    }

    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const status = searchParams.get("status")

    // Build query
    const query: any = { affiliateUserId: affiliateUser.id }
    if (status && ["pending", "approved", "paid", "rejected"].includes(status)) {
      query.status = status
    }

    // Get commissions with pagination
    const commissions = await AffiliateCommission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await AffiliateCommission.countDocuments(query)

    return NextResponse.json({
      commissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching affiliate commissions:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate commissions" }, { status: 500 })
  }
}

