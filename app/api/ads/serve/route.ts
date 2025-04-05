import { type NextRequest, NextResponse } from "next/server"
import { getAdsForPlacement } from "@/lib/ad-engine"
import { z } from "zod"

const adRequestSchema = z.object({
  format: z.enum(["banner", "sidebar", "preroll", "midroll", "postroll", "overlay"]),
  videoId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const format = searchParams.get("format")
    const videoId = searchParams.get("videoId") || undefined

    const validation = adRequestSchema.safeParse({ format, videoId })

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    const ads = await getAdsForPlacement(format!, req, videoId)

    return NextResponse.json({ ads })
  } catch (error) {
    console.error("Error serving ads:", error)
    return NextResponse.json({ error: "Failed to serve ads" }, { status: 500 })
  }
}

