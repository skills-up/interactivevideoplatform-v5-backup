import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
import AffiliateProgram from "@/models/AffiliateProgram"
import { z } from "zod"

const joinSchema = z.object({
  payoutMethod: z.string().optional(),
  payoutEmail: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = joinSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Check if affiliate program is active
    const program = await AffiliateProgram.findOne({ status: "active" })
    if (!program) {
      return NextResponse.json({ error: "Affiliate program is not active" }, { status: 400 })
    }

    // Check if user is already an affiliate
    const existingUser = await AffiliateUser.findOne({ userId: session.user.id })
    if (existingUser) {
      return NextResponse.json({ error: "You are already an affiliate", user: existingUser }, { status: 400 })
    }

    // Create new affiliate user
    const data = validation.data
    const affiliateUser = new AffiliateUser({
      userId: session.user.id,
      payoutMethod: data.payoutMethod,
      payoutEmail: data.payoutEmail,
    })

    await affiliateUser.save()

    return NextResponse.json({ user: affiliateUser }, { status: 201 })
  } catch (error) {
    console.error("Error joining affiliate program:", error)
    return NextResponse.json({ error: "Failed to join affiliate program" }, { status: 500 })
  }
}

