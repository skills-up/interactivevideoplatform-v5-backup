import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import UITemplate from "@/models/UITemplate"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.currentTemplateId) {
      // Return default template if user has no template set
      return NextResponse.json({
        template: null,
      })
    }

    const template = await UITemplate.findById(user.currentTemplateId).populate("createdBy", "name").lean()

    if (!template) {
      // Template not found, clear user's template reference
      await User.findByIdAndUpdate(session.user.id, {
        $unset: { currentTemplateId: "" },
      })

      return NextResponse.json({
        template: null,
      })
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
    console.error("Error fetching current UI template:", error)
    return NextResponse.json({ error: "An error occurred while fetching current UI template" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { templateId } = await req.json()

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Verify template exists
    const template = await UITemplate.findById(templateId).populate("createdBy", "name").lean()

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Check if user can access this template
    if (!template.isPublic && template.createdBy._id.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to use this template" }, { status: 403 })
    }

    // Update user's current template
    await User.findByIdAndUpdate(session.user.id, {
      currentTemplateId: templateId,
    })

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
      message: "Current UI template updated successfully",
    })
  } catch (error) {
    console.error("Error updating current UI template:", error)
    return NextResponse.json({ error: "An error occurred while updating current UI template" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Clear user's current template
    await User.findByIdAndUpdate(session.user.id, {
      $unset: { currentTemplateId: "" },
    })

    return NextResponse.json({
      message: "Current UI template cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing current UI template:", error)
    return NextResponse.json({ error: "An error occurred while clearing current UI template" }, { status: 500 })
  }
}

