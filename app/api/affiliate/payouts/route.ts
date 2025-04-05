import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
import AffiliatePayoutRequest from "@/models/AffiliatePayoutRequest"
import AffiliateProgram from "@/models/AffiliateProgram"
import { z } from "zod"

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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get payout requests with pagination
    const payouts = await AffiliatePayoutRequest.find({
      affiliateUserId: affiliateUser.id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await AffiliatePayoutRequest.countDocuments({
      affiliateUserId: affiliateUser.id,
    })

    return NextResponse.json({
      payouts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate payouts" }, { status: 500 })
  }
}

const payoutRequestSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  payoutMethod: z.string().min(1, "Payout method is required"),
  payoutDetails: z.string().min(1, "Payout details are required"),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = payoutRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Get affiliate user
    const affiliateUser = await AffiliateUser.findOne({ userId: session.user.id })
    if (!affiliateUser) {
      return NextResponse.json({ error: "You are not an affiliate" }, { status: 404 })
    }

    // Get program details for minimum payout
    const program = await AffiliateProgram.findOne({ status: "active" })
    if (!program) {
      return NextResponse.json({ error: "Affiliate program is not active" }, { status: 400 })
    }

    const data = validation.data

    // Check if amount is valid
    if (data.amount > affiliateUser.unpaidCommission) {
      return NextResponse.json({ error: "Requested amount exceeds available balance" }, { status: 400 })
    }

    if (data.amount < program.minPayout) {
      return NextResponse.json({ error: `Minimum payout amount is $${program.minPayout}` }, { status: 400 })
    }

    // Create payout request
    const payoutRequest = new AffiliatePayoutRequest({
      affiliateUserId: affiliateUser.id,
      amount: data.amount,
      payoutMethod: data.payoutMethod,
      payoutDetails: data.payoutDetails,
    })

    await payoutRequest.save()

    return NextResponse.json({ payout: payoutRequest }, { status: 201 })
  } catch (error) {
    console.error("Error creating payout request:", error)
    return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
  }
}

