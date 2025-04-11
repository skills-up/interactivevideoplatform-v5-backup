import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { db } = await dbConnect()

    // Mark all notifications as read
    await db
      .collection("notifications")
      .updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true, updatedAt: new Date().toISOString() } },
      )

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}

