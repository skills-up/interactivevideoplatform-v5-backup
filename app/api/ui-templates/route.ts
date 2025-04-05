import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import UITemplate from "@/models/UITemplate"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get query parameters
    const url = new URL(req.url)
    const isPublic = url.searchParams.get("isPublic")

    // Build query
    const query: any = {}

    if (isPublic === "true") {
      query.isPublic = true
    } else if (isPublic === "false") {
      query.isPublic = false
      query.createdBy = session.user.id
    } else {
      // If no filter, show public templates and user's private templates
      query.$or = [{ isPublic: true }, { createdBy: session.user.id }]
    }

    const templates = await UITemplate.find(query).populate("createdBy", "name").sort({ updatedAt: -1 }).lean()

    return NextResponse.json({
      templates: templates.map((template) => ({
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        createdBy:
          typeof template.createdBy === "object"
            ? {
                id: template.createdBy._id.toString(),
                name: template.createdBy.name,
              }
            : template.createdBy,
        isPublic: template.isPublic,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        theme: template.theme,
        components: template.components,
        layout: template.layout,
      })),
    })
  } catch (error) {
    console.error("Error fetching UI templates:", error)
    return NextResponse.json({ error: "An error occurred while fetching UI templates" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, isPublic, theme, components, layout } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 })
    }

    await dbConnect()

    const template = new UITemplate({
      name,
      description,
      createdBy: session.user.id,
      isPublic: isPublic || false,
      theme,
      components,
      layout,
    })

    await template.save()

    return NextResponse.json(
      {
        template: {
          id: template._id.toString(),
          name: template.name,
          description: template.description,
          createdBy: session.user.id,
          isPublic: template.isPublic,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          theme: template.theme,
          components: template.components,
          layout: template.layout,
        },
        message: "UI template created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating UI template:", error)
    return NextResponse.json({ error: "An error occurred while creating UI template" }, { status: 500 })
  }
}

