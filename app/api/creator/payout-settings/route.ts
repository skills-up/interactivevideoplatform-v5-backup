import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import PayoutSettings from "@/models/PayoutSettings"
import { z } from "zod"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get or create payout settings
    let settings = await PayoutSettings.findOne({ userId: session.user.id })

    if (!settings) {
      settings = new PayoutSettings({
        userId: session.user.id,
        minimumPayout: 50,
        payoutFrequency: "monthly",
        automaticPayouts: true,
        payoutDay: 1,
      })

      await settings.save()
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching payout settings:", error)
    return NextResponse.json({ error: "Failed to fetch payout settings" }, { status: 500 })
  }
}

const updateSettingsSchema = z.object({
  minimumPayout: z.number().positive("Minimum payout must be positive").optional(),
  payoutFrequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  automaticPayouts: z.boolean().optional(),
  payoutDay: z.number().min(1).max(31).optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    const data = validation.data

    // Get or create payout settings
    let settings = await PayoutSettings.findOne({ userId: session.user.id })

    if (!settings) {
      settings = new PayoutSettings({
        userId: session.user.id,
        ...data,
      })
    } else {
      // Update settings fields
      Object.keys(data).forEach((key) => {
        if (data[key as keyof typeof data] !== undefined) {
          settings[key as keyof typeof settings] = data[key as keyof typeof data]
        }
      })
    }

    await settings.save()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error updating payout settings:", error)
    return NextResponse.json({ error: "Failed to update payout settings" }, { status: 500 })
  }
}

