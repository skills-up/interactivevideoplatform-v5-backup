import { type NextRequest, NextResponse } from "next/server"
import { verifySecureToken } from "@/lib/video-processor"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: videoId } = params
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify the token
    const result = verifySecureToken(token)

    if (!result.isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Check if the token is for the requested video
    if (result.videoId !== videoId) {
      return NextResponse.json({ error: "Token is not valid for this video" }, { status: 403 })
    }

    return NextResponse.json({
      valid: true,
      expiresAt: result.expiresAt,
    })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}

