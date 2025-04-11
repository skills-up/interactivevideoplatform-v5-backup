import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { db } = await dbConnect()

    // Get user's devices
    const devices = await db.collection("devices").find({ userId: session.user.id }).sort({ lastActive: -1 }).toArray()

    // Get current device ID from session
    const currentDeviceId = session.deviceId

    return NextResponse.json({
      devices: devices.map((device) => ({
        id: device._id.toString(),
        name: device.name,
        type: device.type,
        browser: device.browser,
        os: device.os,
        ip: device.ip,
        lastActive: device.lastActive,
        current: device._id.toString() === currentDeviceId,
      })),
    })
  } catch (error) {
    console.error("Error fetching devices:", error)
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
  }
}

