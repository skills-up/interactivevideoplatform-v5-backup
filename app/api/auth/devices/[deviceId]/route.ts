import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest, props: { params: Promise<{ deviceId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { deviceId } = params

    // Prevent removing current device
    if (session.deviceId === deviceId) {
      return NextResponse.json({ error: "Cannot remove current device" }, { status: 400 })
    }

    const { db } = await dbConnect()

    // Verify device belongs to user
    const device = await db.collection("devices").findOne({
      _id: new ObjectId(deviceId),
      userId: session.user.id,
    })

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    // Remove device
    await db.collection("devices").deleteOne({ _id: new ObjectId(deviceId) })

    // Invalidate sessions for this device
    await db.collection("sessions").deleteMany({ deviceId })

    return NextResponse.json({
      success: true,
      message: "Device removed successfully",
    })
  } catch (error) {
    console.error("Error removing device:", error)
    return NextResponse.json({ error: "Failed to remove device" }, { status: 500 })
  }
}

