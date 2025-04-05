import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import UITemplate from "@/models/UITemplate"

interface Params {
  id: string
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id

    await dbConnect()

    const template = await UITemplate.findById(templateId).populate("createdBy", "name").lean()

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user can access this template
    if (!template.isPublic && template.createdBy._id.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      template: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        createdBy: {
          id: template.createdBy._id.toString(),
          name: template.createdBy.name,
        },
        isPublic: template.isPublic,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        theme: template.theme,
        components: template.components,
        layout: template.layout,
      },
    })
  } catch (error) {
    console.error("Error fetching UI template:", error)
    return NextResponse.json({ error: "An error occurred while fetching UI template" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id
    const { name, description, isPublic, theme, components, layout } = await req.json()

    await dbConnect()

    const template = await UITemplate.findById(templateId)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user can update this template
    if (template.createdBy.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update template
    if (name) template.name = name
    if (description !== undefined) template.description = description
    if (isPublic !== undefined) template.isPublic = isPublic
    if (theme) template.theme = { ...template.theme, ...theme }
    if (components) template.components = { ...template.components, ...components }
    if (layout) template.layout = { ...template.layout, ...layout }

    await template.save()

    return NextResponse.json({
      template: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        createdBy: template.createdBy.toString(),
        isPublic: template.isPublic,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        theme: template.theme,
        components: template.components,
        layout: template.layout,
      },
      message: "UI template updated successfully",
    })
  } catch (error) {
    console.error("Error updating UI template:", error)
    return NextResponse.json({ error: "An error occurred while updating UI template" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templateId = params.id

    await dbConnect()

    const template = await UITemplate.findById(templateId)

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user can delete this template
    if (template.createdBy.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await template.deleteOne()

    return NextResponse.json({
      message: "UI template deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting UI template:", error)
    return NextResponse.json({ error: "An error occurred while deleting UI template" }, { status: 500 })
  }
}

