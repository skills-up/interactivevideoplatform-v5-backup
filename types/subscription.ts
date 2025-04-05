export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  features: string[]
  price: number
  interval: "month" | "year"
  stripePriceId: string
  isPopular?: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

export interface SubscriptionInvoice {
  id: string
  userId: string
  subscriptionId: string
  amount: number
  currency: string
  status: "paid" | "open" | "void" | "uncollectible"
  invoiceUrl?: string
  pdfUrl?: string
  createdAt: Date
}

