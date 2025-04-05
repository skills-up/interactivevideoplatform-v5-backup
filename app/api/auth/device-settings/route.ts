import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"
import { z } from "zod"

// Schema for device settings
const deviceSettingsSchema = z.object({
  maxDevices: z.number().int().min(1).max(10),
  enforceLimit: z.boolean(),
  notifyOnNewLogin: z.boolean(),
  requireVerification: z.boolean(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user's device settings
    const settings = await db.collection("userSettings").findOne({ userId: session.user.id })

    // Return default settings if none found
    if (!settings?.deviceSettings) {
      return NextResponse.json({
        maxDevices: 3,
        enforceLimit: true,
        notifyOnNewLogin: true,
        requireVerification: false,
      })
    }

    return NextResponse.json(settings.deviceSettings)
  } catch (error) {
    console.error("Error fetching device settings:", error)
    return NextResponse.json({ error: "Failed to fetch device settings" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()

    // Validate settings
    const validationResult = deviceSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid settings", details: validationResult.error.errors }, { status: 400 })
    }

    const settings = validationResult.data

    const { db } = await connectToDatabase()

    // Update user's device settings
    await db.collection("userSettings").updateOne(
      { userId: session.user.id },
      {
        $set: { deviceSettings: settings, updatedAt: new Date().toISOString() },
        $setOnInsert: { userId: session.user.id, createdAt: new Date().toISOString() },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Device settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating device settings:", error)
    return NextResponse.json({ error: "Failed to update device settings" }, { status: 500 })
  }
}

