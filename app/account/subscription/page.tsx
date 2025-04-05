import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SubscriptionDetails } from "@/components/account/subscription-details"
import { getUserSubscription, getSubscriptionInvoices, getSubscriptionPlans } from "@/lib/subscription-utils"

export const metadata: Metadata = {
  title: "Subscription | Interactive Video Platform",
  description: "Manage your subscription and billing details.",
}

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/subscription")
  }

  // Get user's subscription
  const subscription = await getUserSubscription(session.user.id)

  // Get invoices
  const invoices = await getSubscriptionInvoices(session.user.id)

  // Get all plans for upgrade options
  const plans = await getSubscriptionPlans()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>

      <SubscriptionDetails
        subscription={subscription ? JSON.parse(JSON.stringify(subscription)) : null}
        invoices={JSON.parse(JSON.stringify(invoices))}
        plans={JSON.parse(JSON.stringify(plans))}
      />
    </div>
  )
}

