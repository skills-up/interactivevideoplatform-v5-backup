import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import stripe from "@/lib/payment/stripe"
import dbConnect from "@/lib/db/connect"
import { Series } from "@/lib/db/models/series"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { seriesId } = await request.json()

    if (!seriesId) {
      return NextResponse.json({ error: "Series ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Get series details
    const series = await Series.findById(seriesId).populate("creator", "name")

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: series.title,
              description: `Subscription to ${series.title} by ${series.creator.name}`,
            },
            unit_amount: Math.round(series.price * 100), // Convert to cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/series/${seriesId}`,
      metadata: {
        userId: session.user.id,
        seriesId: seriesId,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

