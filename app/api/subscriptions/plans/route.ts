import { type NextRequest, NextResponse } from "next/server"
import { getSubscriptionPlans } from "@/lib/subscription-utils"

export async function GET(req: NextRequest) {
  try {
    const plans = await getSubscriptionPlans()

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
  }
}

