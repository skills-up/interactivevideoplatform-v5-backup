import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || ""

/**
 * Generate a unique filename for uploaded videos
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString("hex")
  const extension = originalFilename.split(".").pop()

  return `${timestamp}-${randomString}.${extension}`
}

/**
 * Generate a presigned URL for uploading a video directly to S3
 */
export async function generateUploadUrl(filename: string, contentType: string, expiresIn = 3600): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET environment variable is not set")
  }

  const key = `uploads/videos/${filename}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn })

  return uploadUrl
}

/**
 * Generate a presigned URL for downloading a video from S3
 */
export async function generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET environment variable is not set")
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn })

  return downloadUrl
}

/**
 * Generate a secure token for video access
 */
export function generateSecureToken(videoId: string, userId: string, expiresAt: Date): string {
  const payload = {
    videoId,
    userId,
    expiresAt: expiresAt.toISOString(),
  }

  const token = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET || "video-token-secret")
    .update(JSON.stringify(payload))
    .digest("hex")

  return `${Buffer.from(JSON.stringify(payload)).toString("base64")}.${token}`
}

/**
 * Verify a secure token for video access
 */
export function verifySecureToken(token: string): {
  videoId: string
  userId: string
  expiresAt: Date
  isValid: boolean
} {
  try {
    const [payloadBase64, signature] = token.split(".")
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString())

    const expectedSignature = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "video-token-secret")
      .update(JSON.stringify(payload))
      .digest("hex")

    const isSignatureValid = signature === expectedSignature
    const expiresAt = new Date(payload.expiresAt)
    const isExpired = expiresAt < new Date()

    return {
      videoId: payload.videoId,
      userId: payload.userId,
      expiresAt,
      isValid: isSignatureValid && !isExpired,
    }
  } catch (error) {
    return {
      videoId: "",
      userId: "",
      expiresAt: new Date(),
      isValid: false,
    }
  }
}

