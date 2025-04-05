import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import ShareLink from "@/models/ShareLink"
import InteractionResult from "@/models/InteractionResult"

interface Params {
  token: string
  interactionId: string
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    await dbConnect()

    // Find the share link
    const shareLink = await ShareLink.findOne({ token: params.token })
    if (!shareLink) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 })
    }

    // Check if the link has expired
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 403 })
    }

    // Check if interaction submissions are allowed
    if (!shareLink.settings.allowInteractionSubmissions) {
      return NextResponse.json({ error: "Interaction submissions are not allowed" }, { status: 403 })
    }

    const body = await req.json()

    // Create interaction result
    const result = new InteractionResult({
      videoId: shareLink.videoId,
      interactionId: params.interactionId,
      shareToken: params.token,
      result: body.result,
      timestamp: body.timestamp || new Date(),
      userAgent: req.headers.get("user-agent") || "Unknown",
      ipAddress: req.headers.get("x-forwarded-for") || "Unknown",
    })

    await result.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording interaction result:", error)
    return NextResponse.json({ error: "Failed to record interaction result" }, { status: 500 })
  }
}

