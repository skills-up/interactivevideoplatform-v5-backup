import dbConnect from "@/lib/dbConnect"
import UserSubscription from "@/models/UserSubscription"
import SubscriptionPlan from "@/models/SubscriptionPlan"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function getUserSubscription(userId: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing"] },
  }).populate("planId")

  return subscription
}

export async function isUserPremium(userId?: string): Promise<boolean> {
  if (!userId) {
    return false
  }

  const subscription = await getUserSubscription(userId)

  return !!subscription
}

export async function createCheckoutSession(userId: string, planId: string, successUrl: string, cancelUrl: string) {
  await dbConnect()

  // Get the plan
  const plan = await SubscriptionPlan.findById(planId)
  if (!plan) {
    throw new Error("Plan not found")
  }

  // Check if user already has a Stripe customer ID
  let customerId

  const existingSubscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing", "past_due"] },
  })

  if (existingSubscription?.stripeCustomerId) {
    customerId = existingSubscription.stripeCustomerId
  } else {
    // Create a new customer
    const customer = await stripe.customers.create({
      metadata: {
        userId,
      },
    })

    customerId = customer.id
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
  })

  return session
}

export async function cancelSubscription(userId: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: "active",
  })

  if (!subscription) {
    throw new Error("No active subscription found")
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error("No Stripe subscription ID found")
  }

  // Cancel at period end
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  // Update our database
  subscription.cancelAtPeriodEnd = true
  await subscription.save()

  return subscription
}

export async function reactivateSubscription(userId: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: "active",
    cancelAtPeriodEnd: true,
  })

  if (!subscription) {
    throw new Error("No canceled subscription found")
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error("No Stripe subscription ID found")
  }

  // Reactivate subscription
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  })

  // Update our database
  subscription.cancelAtPeriodEnd = false
  await subscription.save()

  return subscription
}

export async function updateSubscription(userId: string, newPlanId: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: "active",
  })

  if (!subscription) {
    throw new Error("No active subscription found")
  }

  if (!subscription.stripeSubscriptionId) {
    throw new Error("No Stripe subscription ID found")
  }

  // Get the new plan
  const newPlan = await SubscriptionPlan.findById(newPlanId)
  if (!newPlan) {
    throw new Error("New plan not found")
  }

  // Update subscription in Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [
      {
        id: (await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
        price: newPlan.stripePriceId,
      },
    ],
  })

  // Update our database
  subscription.planId = newPlanId
  await subscription.save()

  return subscription
}

export async function handleSubscriptionUpdated(event: any) {
  const subscription = event.data.object

  await dbConnect()

  // Find the subscription in our database
  const userSubscription = await UserSubscription.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (!userSubscription) {
    // This might be a new subscription
    if (subscription.metadata?.userId && subscription.metadata?.planId) {
      // Create a new subscription record
      const newSubscription = new UserSubscription({
        userId: subscription.metadata.userId,
        planId: subscription.metadata.planId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
      })

      await newSubscription.save()
    }
    return
  }

  // Update the subscription
  userSubscription.status = subscription.status
  userSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000)
  userSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000)
  userSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end

  await userSubscription.save()
}

export async function getSubscriptionPlans() {
  await dbConnect()

  const plans = await SubscriptionPlan.find().sort({ price: 1 })

  return plans
}

export async function createSubscriptionPortalSession(userId: string, returnUrl: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing", "past_due"] },
  })

  if (!subscription || !subscription.stripeCustomerId) {
    throw new Error("No active subscription found")
  }

  // Create a billing portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscriptionInvoices(userId: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing", "past_due", "canceled"] },
  })

  if (!subscription || !subscription.stripeCustomerId) {
    return []
  }

  // Get invoices from Stripe
  const invoices = await stripe.invoices.list({
    customer: subscription.stripeCustomerId,
    limit: 10,
  })

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    status: invoice.status,
    createdAt: new Date(invoice.created * 1000),
    invoiceUrl: invoice.hosted_invoice_url,
    pdfUrl: invoice.invoice_pdf,
  }))
}

export async function syncSubscriptionWithStripe(userId: string) {
  await dbConnect()

  const subscription = await UserSubscription.findOne({
    userId,
    status: { $in: ["active", "trialing", "past_due"] },
  })

  if (!subscription || !subscription.stripeSubscriptionId) {
    return null
  }

  // Get the subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

  // Update our database
  subscription.status = stripeSubscription.status
  subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000)
  subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000)
  subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end

  await subscription.save()

  return subscription
}

