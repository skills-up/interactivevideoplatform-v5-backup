import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import { z } from "zod"
import { fetchVideoMetadata } from "@/lib/videoProviders"

// Schema for video import
const importSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = importSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    const { url, title, description, isPublic, tags, categoryId } = validation.data

    // Fetch video metadata from the provider
    const metadata = await fetchVideoMetadata(url)

    if (!metadata) {
      return NextResponse.json(
        { error: "Could not fetch video metadata. Unsupported provider or invalid URL." },
        { status: 400 },
      )
    }

    // Create video record in database
    await dbConnect()
    const video = new Video({
      userId: session.user.id,
      title: title || metadata.title,
      description: description || metadata.description,
      isPublic: isPublic || false,
      tags: tags || metadata.tags || [],
      categoryId: categoryId,
      sourceType: metadata.provider,
      sourceUrl: metadata.embedUrl,
      originalUrl: url,
      duration: metadata.duration,
      thumbnailUrl: metadata.thumbnailUrl,
      status: "ready", // External videos are ready immediately
      providerVideoId: metadata.providerVideoId,
    })

    await video.save()

    return NextResponse.json({
      videoId: video._id.toString(),
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      provider: metadata.provider,
    })
  } catch (error) {
    console.error("Error importing video:", error)
    return NextResponse.json({ error: "Failed to import video" }, { status: 500 })
  }
}

