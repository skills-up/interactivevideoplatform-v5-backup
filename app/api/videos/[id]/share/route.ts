import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import ShareLink from "@/models/ShareLink"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

interface Params {
  id: string
}

// Schema for share settings
const shareSettingsSchema = z.object({
  allowSharing: z.boolean().default(true),
  allowEmbedding: z.boolean().default(true),
  embedWidth: z.number().default(640),
  embedHeight: z.number().default(360),
  autoplay: z.boolean().default(false),
  showControls: z.boolean().default(true),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  showInteractions: z.boolean().default(true),
  allowInteractionSubmissions: z.boolean().default(true),
  password: z.string().optional(),
  expiresAt: z.string().optional(), // ISO date string
  trackViews: z.boolean().default(true),
  allowDownload: z.boolean().default(false),
  customBranding: z
    .object({
      logo: z.string().optional(),
      logoLink: z.string().optional(),
      primaryColor: z.string().optional(),
    })
    .optional(),
})

export async function POST(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = shareSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Check if video exists and user has access
    const video = await Video.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 })
    }

    const settings = validation.data

    // Generate a unique share token
    const shareToken = uuidv4()

    // Create or update share link
    const shareLink = new ShareLink({
      videoId: params.id,
      userId: session.user.id,
      token: shareToken,
      settings,
      createdAt: new Date(),
      expiresAt: settings.expiresAt ? new Date(settings.expiresAt) : null,
    })

    await shareLink.save()

    // Generate share URL and embed code
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const shareUrl = `${baseUrl}/shared/${shareToken}`

    // Generate embed code
    const embedCode = {
      iframeCode: `<iframe 
  width="${settings.embedWidth}" 
  height="${settings.embedHeight}" 
  src="${baseUrl}/embed/${shareToken}" 
  frameborder="0" 
  allowfullscreen
  ${settings.autoplay ? 'allow="autoplay"' : ""}
></iframe>`,
      scriptCode: `<div id="interactive-video-${shareToken}"></div>
<script src="${baseUrl}/api/embed.js"></script>
<script>
  InteractiveVideo.render({
    container: "interactive-video-${shareToken}",
    token: "${shareToken}",
    width: ${settings.embedWidth},
    height: ${settings.embedHeight},
    autoplay: ${settings.autoplay},
    showControls: ${settings.showControls},
    showInteractions: ${settings.showInteractions}
  });
</script>`,
    }

    return NextResponse.json({
      shareUrl,
      embedCode,
      shareToken,
      settings,
    })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if video exists and user has access
    const video = await Video.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 })
    }

    // Get all share links for this video
    const shareLinks = await ShareLink.find({
      videoId: params.id,
      userId: session.user.id,
    }).sort({ createdAt: -1 })

    // Generate share URLs and embed codes
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

    const formattedLinks = shareLinks.map((link) => {
      const shareUrl = `${baseUrl}/shared/${link.token}`

      const embedCode = {
        iframeCode: `<iframe 
  width="${link.settings.embedWidth}" 
  height="${link.settings.embedHeight}" 
  src="${baseUrl}/embed/${link.token}" 
  frameborder="0" 
  allowfullscreen
  ${link.settings.autoplay ? 'allow="autoplay"' : ""}
></iframe>`,
        scriptCode: `<div id="interactive-video-${link.token}"></div>
<script src="${baseUrl}/api/embed.js"></script>
<script>
  InteractiveVideo.render({
    container: "interactive-video-${link.token}",
    token: "${link.token}",
    width: ${link.settings.embedWidth},
    height: ${link.settings.embedHeight},
    autoplay: ${link.settings.autoplay},
    showControls: ${link.settings.showControls},
    showInteractions: ${link.settings.showInteractions}
  });
</script>`,
      }

      return {
        id: link._id,
        token: link.token,
        shareUrl,
        embedCode,
        settings: link.settings,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        views: link.views || 0,
      }
    })

    return NextResponse.json({ shareLinks: formattedLinks })
  } catch (error) {
    console.error("Error fetching share links:", error)
    return NextResponse.json({ error: "Failed to fetch share links" }, { status: 500 })
  }
}

