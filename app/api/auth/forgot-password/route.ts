import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { z } from "zod"
import { sendEmail } from "@/lib/email"

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const { email } = validation.data

    await dbConnect()

    // Find user by email
    const user = await User.findOne({ email })

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json(
        { success: true, message: "If an account with that email exists, we've sent password reset instructions" },
        { status: 200 },
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpiry
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    // Send email
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
      html: `
       <div>
         <p>You requested a password reset.</p>
         <p>Please click the link below to reset your password:</p>
         <a href="${resetUrl}">Reset Password</a>
         <p>This link will expire in 1 hour.</p>
         <p>If you didn't request this, please ignore this email.</p>
       </div>
     `,
    })

    return NextResponse.json(
      { success: true, message: "If an account with that email exists, we've sent password reset instructions" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

