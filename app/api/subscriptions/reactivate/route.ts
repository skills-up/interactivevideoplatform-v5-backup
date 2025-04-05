import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { reactivateSubscription } from "@/lib/subscription-utils"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await reactivateSubscription(session.user.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    return NextResponse.json({ error: "Failed to reactivate subscription" }, { status: 500 })
  }
}

