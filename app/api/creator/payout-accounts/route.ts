import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import PayoutAccount from "@/models/PayoutAccount"
import { z } from "zod"
import { verifyPayoutAccount } from "@/lib/payout-processor"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const accounts = await PayoutAccount.find({ userId: session.user.id })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching payout accounts:", error)
    return NextResponse.json({ error: "Failed to fetch payout accounts" }, { status: 500 })
  }
}

// Base schema for all account types
const baseAccountSchema = z.object({
  type: z.enum(["stripe", "paypal", "bank_transfer", "crypto"]),
  isDefault: z.boolean().default(false),
})

// Stripe account schema
const stripeAccountSchema = baseAccountSchema.extend({
  type: z.literal("stripe"),
  stripeConnectId: z.string().optional(),
})

// PayPal account schema
const paypalAccountSchema = baseAccountSchema.extend({
  type: z.literal("paypal"),
  email: z.string().email("Invalid email address"),
})

// Bank transfer account schema
const bankTransferAccountSchema = baseAccountSchema.extend({
  type: z.literal("bank_transfer"),
  accountNumber: z.string().min(1, "Account number is required"),
  routingNumber: z.string().min(1, "Routing number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  accountType: z.enum(["checking", "savings"]),
})

// Crypto account schema
const cryptoAccountSchema = baseAccountSchema.extend({
  type: z.literal("crypto"),
  walletAddress: z.string().min(1, "Wallet address is required"),
  cryptoCurrency: z.string().min(1, "Cryptocurrency is required"),
  network: z.string().min(1, "Network is required"),
})

// Combined schema with discriminated union
const payoutAccountSchema = z.discriminatedUnion("type", [
  stripeAccountSchema,
  paypalAccountSchema,
  bankTransferAccountSchema,
  cryptoAccountSchema,
])

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = payoutAccountSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    const data = validation.data

    // Create new payout account
    const account = new PayoutAccount({
      userId: session.user.id,
      ...data,
    })

    // If this is the first account, make it default
    const existingAccounts = await PayoutAccount.countDocuments({
      userId: session.user.id,
    })

    if (existingAccounts === 0) {
      account.isDefault = true
    }

    await account.save()

    // Verify account (in real implementation, this might be asynchronous)
    try {
      await verifyPayoutAccount(account)
    } catch (error) {
      console.error("Error verifying payout account:", error)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error("Error creating payout account:", error)
    return NextResponse.json({ error: "Failed to create payout account" }, { status: 500 })
  }
}

