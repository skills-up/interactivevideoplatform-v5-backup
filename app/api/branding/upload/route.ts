import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { connectToDatabase } from "@/lib/db"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      logo: ["image/jpeg", "image/png", "image/svg+xml"],
      favicon: ["image/x-icon", "image/png", "image/svg+xml"],
    }

    if (!Object.keys(allowedTypes).includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (!allowedTypes[type as keyof typeof allowedTypes].includes(file.type)) {
      return NextResponse.json(
        { error: `File must be one of: ${allowedTypes[type as keyof typeof allowedTypes].join(", ")}` },
        { status: 400 },
      )
    }

    // Get organization ID from user
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: session.user.id })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${type}-${user.organizationId}-${uuidv4()}.${fileExtension}`

    // Upload to S3
    const fileBuffer = await file.arrayBuffer()

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET || "interactive-video-platform",
      Key: `branding/${fileName}`,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      ACL: "public-read",
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    // Generate URL
    const fileUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${uploadParams.Key}`

    // Update organization's branding settings
    const organization = await db.collection("organizations").findOne({ _id: user.organizationId })

    const brandingSettings = organization?.brandingSettings || {
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
    }

    // Update the appropriate URL
    if (type === "logo") {
      brandingSettings.logoUrl = fileUrl
    } else if (type === "favicon") {
      brandingSettings.faviconUrl = fileUrl
    }

    await db.collection("organizations").updateOne(
      { _id: user.organizationId },
      {
        $set: {
          brandingSettings,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: `${type} uploaded successfully`,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

