import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import PayoutAccount from "@/models/PayoutAccount"
import { z } from "zod"

interface Params {
  id: string
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const account = await PayoutAccount.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error fetching payout account:", error)
    return NextResponse.json({ error: "Failed to fetch payout account" }, { status: 500 })
  }
}

const updateAccountSchema = z.object({
  isDefault: z.boolean().optional(),
  email: z.string().email().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountType: z.enum(["checking", "savings"]).optional(),
  walletAddress: z.string().optional(),
  cryptoCurrency: z.string().optional(),
  network: z.string().optional(),
})

export async function PATCH(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateAccountSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    await dbConnect()

    const account = await PayoutAccount.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const data = validation.data

    // Update account fields
    Object.keys(data).forEach((key) => {
      if (data[key as keyof typeof data] !== undefined) {
        account[key as keyof typeof account] = data[key as keyof typeof data]
      }
    })

    await account.save()

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error updating payout account:", error)
    return NextResponse.json({ error: "Failed to update payout account" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const account = await PayoutAccount.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Check if this is the default account
    if (account.isDefault) {
      // Find another account to make default
      const otherAccount = await PayoutAccount.findOne({
        userId: session.user.id,
        _id: { $ne: params.id },
      })

      if (otherAccount) {
        otherAccount.isDefault = true
        await otherAccount.save()
      }
    }

    await account.deleteOne()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting payout account:", error)
    return NextResponse.json({ error: "Failed to delete payout account" }, { status: 500 })
  }
}

