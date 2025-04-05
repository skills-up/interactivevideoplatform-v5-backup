import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import { z } from "zod"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || ""

// Schema for direct upload
const directUploadSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
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
    const validation = directUploadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    const { fileName, fileType, fileSize, title, description, isPublic, tags, categoryId } = validation.data
    const fileExtension = fileName.split(".").pop()
    const key = `videos/${session.user.id}/${uuidv4()}.${fileExtension}`

    // Generate presigned URL for direct upload
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: fileType,
    })

    // Generate presigned URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Create video record in database
    await dbConnect()
    const video = new Video({
      userId: session.user.id,
      title: title || fileName,
      description: description || "",
      isPublic: isPublic || false,
      tags: tags || [],
      categoryId: categoryId,
      sourceType: "local",
      sourceUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      status: "processing",
      uploadKey: key,
      fileSize: fileSize,
      fileType: fileType,
    })

    await video.save()

    // Trigger transcoding job (implementation depends on your infrastructure)
    await triggerTranscoding(video._id.toString(), key)

    return NextResponse.json({
      uploadUrl: url,
      videoId: video._id.toString(),
      key,
    })
  } catch (error) {
    console.error("Error creating upload URL:", error)
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 })
  }
}

// Function to trigger video transcoding
async function triggerTranscoding(videoId: string, key: string) {
  // This would typically call a serverless function or queue a job
  // For example, using AWS Lambda or a message queue

  // For now, we'll simulate this with a simple fetch to another API route
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/transcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify({
        videoId,
        sourceKey: key,
      }),
    })
  } catch (error) {
    console.error("Failed to trigger transcoding:", error)
    // We don't want to fail the upload if transcoding trigger fails
    // The transcoding can be retried later
  }
}

