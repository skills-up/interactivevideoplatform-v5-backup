import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"
import { z } from "zod"

// Schema for branding settings
const brandingSettingsSchema = z.object({
  enabled: z.boolean(),
  siteName: z.string().min(1).max(100),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
  secondaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
  accentColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
  customCss: z.string().max(10000).optional().or(z.literal("")),
  customJs: z.string().max(10000).optional().or(z.literal("")),
  customDomain: z.string().max(100).optional().or(z.literal("")),
  hideFooter: z.boolean(),
  hidePoweredBy: z.boolean(),
  customEmailHeader: z.string().max(5000).optional().or(z.literal("")),
  customEmailFooter: z.string().max(5000).optional().or(z.literal("")),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { db } = await dbConnect()

    // Get organization ID from user
    const user = await db.collection("users").findOne({ _id: session.user.id })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // Get organization's branding settings
    const organization = await db.collection("organizations").findOne({ _id: user.organizationId })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Return default settings if none found
    if (!organization.brandingSettings) {
      return NextResponse.json({
        enabled: false,
        siteName: "Interactive Video Platform",
        logoUrl: "",
        faviconUrl: "",
        primaryColor: "#3b82f6",
        secondaryColor: "#10b981",
        accentColor: "#8b5cf6",
        customCss: "",
        customJs: "",
        customDomain: "",
        hideFooter: false,
        hidePoweredBy: false,
        customEmailHeader: "",
        customEmailFooter: "",
      })
    }

    return NextResponse.json(organization.brandingSettings)
  } catch (error) {
    console.error("Error fetching branding settings:", error)
    return NextResponse.json({ error: "Failed to fetch branding settings" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()

    // Validate settings
    const validationResult = brandingSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid settings", details: validationResult.error.errors }, { status: 400 })
    }

    const settings = validationResult.data

    const { db } = await dbConnect()

    // Get organization ID from user
    const user = await db.collection("users").findOne({ _id: session.user.id })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // Update organization's branding settings
    await db.collection("organizations").updateOne(
      { _id: user.organizationId },
      {
        $set: {
          brandingSettings: settings,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Branding settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating branding settings:", error)
    return NextResponse.json({ error: "Failed to update branding settings" }, { status: 500 })
  }
}

