import { type NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import Subscription from "@/models/Subscription"
import { Series } from "@/models/Series"
import User from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const seriesId = searchParams.get("seriesId")
    const status = searchParams.get("status")

    await dbConnect()

    // Build query
    const query: any = {}

    if (userId) {
      query.user = userId
    }

    if (seriesId) {
      query.series = seriesId
    }

    if (status) {
      query.status = status
    }

    // Execute query
    const subscriptions = await Subscription.find(query)
      .populate("user", "name email image")
      .populate("series", "title thumbnail price")
      .lean()

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.series) {
      return NextResponse.json({ error: "Series ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Verify series exists
    const series = await Series.findById(data.series)

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: session.user.id,
      series: data.series,
      status: "active",
    })

    if (existingSubscription) {
      return NextResponse.json({ error: "User already has an active subscription to this series" }, { status: 400 })
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: session.user.id,
      series: data.series,
      startDate: new Date(),
      status: "active",
      paymentId: data.paymentId,
    })

    // Update user's subscribed series
    await User.findByIdAndUpdate(session.user.id, { $addToSet: { subscribedSeries: data.series } })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}

