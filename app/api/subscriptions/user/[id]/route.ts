import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Subscription from "@/models/Subscription"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"

    const subscriptions = await Subscription.find({
      user: params.id,
      status,
    })
      .populate({
        path: "series",
        select: "title thumbnail price",
        populate: {
          path: "creator",
          select: "name avatar",
        },
      })
      .sort({ startDate: -1 })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

