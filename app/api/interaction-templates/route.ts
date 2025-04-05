import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import InteractionTemplate from "@/models/InteractionTemplate"
import { z } from "zod"

// Schema for creating/updating an interaction template
const interactionTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  type: z.enum(["quiz", "poll", "hotspot", "branching", "imageHotspot"]),

  style: z
    .object({
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      titleColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderRadius: z.string().optional(),
      width: z.string().optional(),
      maxWidth: z.string().optional(),
      padding: z.string().optional(),
      boxShadow: z.string().optional(),
      fontFamily: z.string().optional(),
      fontSize: z.string().optional(),
      customCSS: z.string().optional(),
    })
    .optional(),

  settings: z
    .object({
      quiz: z
        .object({
          showFeedback: z.boolean().optional(),
          defaultCorrectFeedback: z.string().optional(),
          defaultIncorrectFeedback: z.string().optional(),
          optionStyle: z
            .object({
              backgroundColor: z.string().optional(),
              textColor: z.string().optional(),
              borderColor: z.string().optional(),
              borderRadius: z.string().optional(),
              selectedBackgroundColor: z.string().optional(),
              correctBackgroundColor: z.string().optional(),
              incorrectBackgroundColor: z.string().optional(),
            })
            .optional(),
        })
        .optional(),

      poll: z
        .object({
          showResults: z.boolean().optional(),
          barColor: z.string().optional(),
          barBackgroundColor: z.string().optional(),
        })
        .optional(),

      hotspot: z
        .object({
          defaultHotspotSize: z.number().optional(),
          hotspotStyle: z
            .object({
              borderColor: z.string().optional(),
              backgroundColor: z.string().optional(),
              borderWidth: z.string().optional(),
              borderStyle: z.string().optional(),
            })
            .optional(),
        })
        .optional(),

      branching: z
        .object({
          optionStyle: z
            .object({
              backgroundColor: z.string().optional(),
              textColor: z.string().optional(),
              borderColor: z.string().optional(),
              borderRadius: z.string().optional(),
              hoverBackgroundColor: z.string().optional(),
            })
            .optional(),
        })
        .optional(),

      imageHotspot: z
        .object({
          hotspotStyle: z
            .object({
              size: z.string().optional(),
              backgroundColor: z.string().optional(),
              textColor: z.string().optional(),
              borderColor: z.string().optional(),
              activeBackgroundColor: z.string().optional(),
            })
            .optional(),
          contentStyle: z
            .object({
              backgroundColor: z.string().optional(),
              textColor: z.string().optional(),
              borderColor: z.string().optional(),
              borderRadius: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),

  behavior: z
    .object({
      pauseVideo: z.boolean().optional(),
      allowSkipping: z.boolean().optional(),
      resumeAfterCompletion: z.boolean().optional(),
      allowResubmission: z.boolean().optional(),
    })
    .optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const isPublic = url.searchParams.get("public") === "true"
    const type = url.searchParams.get("type")

    await dbConnect()

    const query: any = {}

    // Filter by type if provided
    if (type) {
      query.type = type
    }

    if (isPublic) {
      // Public templates and user's own templates
      query.$or = [{ isPublic: true }, { userId: session.user.id }]
    } else {
      // Only user's own templates
      query.userId = session.user.id
    }

    const templates = await InteractionTemplate.find(query).sort({ updatedAt: -1 })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Error fetching interaction templates:", error)
    return NextResponse.json({ error: "Failed to fetch interaction templates" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = interactionTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    const data = validation.data

    const template = new InteractionTemplate({
      ...data,
      userId: session.user.id,
    })

    await template.save()

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error("Error creating interaction template:", error)
    return NextResponse.json({ error: "Failed to create interaction template" }, { status: 500 })
  }
}

