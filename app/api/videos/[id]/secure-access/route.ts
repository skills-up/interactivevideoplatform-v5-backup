import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"
import { generateSecureToken } from "@/lib/video-processor"
import { checkVideoPermission } from "@/lib/security-utils"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id: videoId } = params

    // Check if the user has permission to access the video
    const hasPermission = await checkVideoPermission(videoId, session.user.id)

    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Generate a secure token with a 24-hour expiration
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const token = generateSecureToken(videoId, session.user.id, expiresAt)

    // Log the access
    const { db } = await connectToDatabase()

    await db.collection("videoAccess").insertOne({
      videoId,
      userId: session.user.id,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
      ip: req.ip || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    })

    return NextResponse.json({
      token,
      expiresAt,
    })
  } catch (error) {
    console.error("Error generating secure access token:", error)
    return NextResponse.json({ error: "Failed to generate secure access token" }, { status: 500 })
  }
}

