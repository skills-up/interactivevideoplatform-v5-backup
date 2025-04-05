import { type NextRequest, NextResponse } from "next/server"
import { recordAdClick } from "@/lib/ad-engine"
import { z } from "zod"

const clickSchema = z.object({
  adId: z.string().min(1, "Ad ID is required"),
  impressionId: z.string().min(1, "Impression ID is required"),
  videoId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = clickSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    const { adId, impressionId, videoId } = validation.data

    await recordAdClick(adId, impressionId, req, videoId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording ad click:", error)
    return NextResponse.json({ error: "Failed to record ad click" }, { status: 500 })
  }
}

