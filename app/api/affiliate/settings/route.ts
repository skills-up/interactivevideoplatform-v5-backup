import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
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

    return NextResponse.json({
      settings: {
        payoutMethod: affiliateUser.payoutMethod,
        payoutEmail: affiliateUser.payoutEmail,
        status: affiliateUser.status,
        referralCode: affiliateUser.referralCode,
      },
    })
  } catch (error) {
    console.error("Error fetching affiliate settings:", error)
    return NextResponse.json({ error: "Failed to fetch affiliate settings" }, { status: 500 })
  }
}

const settingsSchema = z.object({
  payoutMethod: z.string().optional(),
  payoutEmail: z.string().email().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = settingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Get affiliate user
    const affiliateUser = await AffiliateUser.findOne({ userId: session.user.id })
    if (!affiliateUser) {
      return NextResponse.json({ error: "You are not an affiliate" }, { status: 404 })
    }

    const data = validation.data

    // Update settings
    if (data.payoutMethod !== undefined) {
      affiliateUser.payoutMethod = data.payoutMethod
    }

    if (data.payoutEmail !== undefined) {
      affiliateUser.payoutEmail = data.payoutEmail
    }

    await affiliateUser.save()

    return NextResponse.json({
      success: true,
      settings: {
        payoutMethod: affiliateUser.payoutMethod,
        payoutEmail: affiliateUser.payoutEmail,
        status: affiliateUser.status,
        referralCode: affiliateUser.referralCode,
      },
    })
  } catch (error) {
    console.error("Error updating affiliate settings:", error)
    return NextResponse.json({ error: "Failed to update affiliate settings" }, { status: 500 })
  }
}

