import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import InteractionTemplate from "@/models/InteractionTemplate"
import { z } from "zod"

interface Params {
  id: string
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const template = await InteractionTemplate.findOne({
      _id: params.id,
      $or: [{ userId: session.user.id }, { isPublic: true }],
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error fetching interaction template:", error)
    return NextResponse.json({ error: "Failed to fetch interaction template" }, { status: 500 })
  }
}

// Schema for updating an interaction template
const updateTemplateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),

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
  .partial()

export async function PATCH(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    // Check if template exists and user has access
    const template = await InteractionTemplate.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found or access denied" }, { status: 404 })
    }

    const data = validation.data

    // Update template with new data
    Object.assign(template, data)

    await template.save()

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Error updating interaction template:", error)
    return NextResponse.json({ error: "Failed to update interaction template" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Check if template exists and user has access
    const template = await InteractionTemplate.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found or access denied" }, { status: 404 })
    }

    // Don't allow deletion of default templates
    if (template.isDefault) {
      return NextResponse.json({ error: "Cannot delete default template" }, { status: 400 })
    }

    await template.deleteOne()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting interaction template:", error)
    return NextResponse.json({ error: "Failed to delete interaction template" }, { status: 500 })
  }
}

