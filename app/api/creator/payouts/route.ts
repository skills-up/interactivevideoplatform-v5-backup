import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import PayoutTransaction from "@/models/PayoutTransaction"
import PayoutAccount from "@/models/PayoutAccount"
import { getAvailableBalance } from "@/lib/earnings-calculator"
import { processPayoutRequest } from "@/lib/payout-processor"
import { z } from "zod"
import { nanoid } from "nanoid"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get payout transactions with pagination
    const transactions = await PayoutTransaction.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await PayoutTransaction.countDocuments({ userId: session.user.id })

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  }
}

const createPayoutSchema = z.object({
  payoutAccountId: z.string().min(1, "Payout account is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = createPayoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    const data = validation.data

    // Check if payout account exists and belongs to user
    const account = await PayoutAccount.findOne({
      _id: data.payoutAccountId,
      userId: session.user.id,
    })

    if (!account) {
      return NextResponse.json({ error: "Payout account not found" }, { status: 404 })
    }

    // Check if account is verified
    if (account.status !== "verified") {
      return NextResponse.json({ error: "Payout account is not verified" }, { status: 400 })
    }

    // Check if user has enough balance
    const availableBalance = await getAvailableBalance(session.user.id)

    if (data.amount > availableBalance) {
      return NextResponse.json({ error: "Insufficient balance", availableBalance }, { status: 400 })
    }

    // Create payout transaction
    const transaction = new PayoutTransaction({
      userId: session.user.id,
      payoutAccountId: data.payoutAccountId,
      amount: data.amount,
      currency: "USD", // Default currency
      status: "pending",
      reference: `MANUAL-${nanoid(10)}`,
      description: data.description || "Manual payout request",
    })

    await transaction.save()

    // Process the payout (this could be done asynchronously in a real implementation)
    try {
      await processPayoutRequest(transaction)
    } catch (error) {
      console.error("Error processing payout:", error)
      // Don't fail the request, the status will be updated in the transaction
    }

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error("Error creating payout:", error)
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 })
  }
}

