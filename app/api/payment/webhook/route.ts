import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import stripe from "@/lib/payment/stripe"
import dbConnect from "@/lib/db/connect"
import Subscription from "@/lib/db/models/subscription"
import User from "@/lib/db/models/user"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      // Extract metadata
      const { userId, seriesId } = session.metadata

      await dbConnect()

      // Create subscription record
      await Subscription.create({
        user: userId,
        series: seriesId,
        startDate: new Date(),
        status: "active",
        paymentId: session.subscription,
      })

      // Add series to user's subscribed series
      await User.findByIdAndUpdate(userId, { $addToSet: { subscribedSeries: seriesId } })
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object

      await dbConnect()

      // Update subscription status
      await Subscription.findOneAndUpdate(
        { paymentId: subscription.id },
        {
          status: "cancelled",
          endDate: new Date(),
        },
      )

      // Find the subscription to get user and series IDs
      const subRecord = await Subscription.findOne({ paymentId: subscription.id })

      if (subRecord) {
        // Remove series from user's subscribed series
        await User.findByIdAndUpdate(subRecord.user, { $pull: { subscribedSeries: subRecord.series } })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }
}

