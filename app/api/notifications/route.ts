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

    // Get user's notifications
    const notifications = await db
      .collection("notifications")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    // Count unread notifications
    const unreadCount = await db.collection("notifications").countDocuments({
      userId: session.user.id,
      read: false,
    })

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        createdAt: notification.createdAt,
      })),
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

