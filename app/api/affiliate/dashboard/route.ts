import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
import AffiliateReferral from "@/models/AffiliateReferral"
import AffiliateCommission from "@/models/AffiliateCommission"
import AffiliateProgram from "@/models/AffiliateProgram"

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

    // Get program details
    const program = await AffiliateProgram.findOne({ status: "active" })

    // Get recent referrals
    const referrals = await AffiliateReferral.find({
      affiliateUserId: affiliateUser.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)

    // Get recent commissions
    const commissions = await AffiliateCommission.find({
      affiliateUserId: affiliateUser.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)

    // Get commission stats
    const pendingCommissions = await AffiliateCommission.find({
      affiliateUserId: affiliateUser.id,
      status: "pending",
    })

    const approvedCommissions = await AffiliateCommission.find({
      affiliateUserId: affiliateUser.id,
      status: "approved",
    })

    const paidCommissions = await AffiliateCommission.find({
      affiliateUserId: affiliateUser.id,
      status: "paid",
    })

    const pendingAmount = pendingCommissions.reduce((sum, commission) => sum + commission.amount, 0)
    const approvedAmount = approvedCommissions.reduce((sum, commission) => sum + commission.amount, 0)
    const paidAmount = paidCommissions.reduce((sum, commission) => sum + commission.amount, 0)

    return NextResponse.json({
      user: affiliateUser,
      program,
      referrals,
      commissions,
      stats: {
        pendingAmount,
        approvedAmount,
        paidAmount,
        totalAmount: pendingAmount + approvedAmount + paidAmount,
      },
    })
  } catch (error) {
    console.error("Error fetching affiliate dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate dashboard" }, { status: 500 })
  }
}

