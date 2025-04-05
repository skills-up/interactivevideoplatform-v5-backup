export interface PayoutAccount {
  id: string
  userId: string
  type: "stripe" | "paypal" | "bank_transfer" | "crypto"
  status: "pending" | "verified" | "rejected"
  isDefault: boolean
  createdAt: Date
  updatedAt: Date

  // Stripe specific
  stripeConnectId?: string

  // PayPal specific
  email?: string

  // Bank transfer specific
  accountNumber?: string
  routingNumber?: string
  bankName?: string
  accountHolderName?: string
  accountType?: "checking" | "savings"

  // Crypto specific
  walletAddress?: string
  cryptoCurrency?: string
  network?: string
}

export interface PayoutTransaction {
  id: string
  userId: string
  payoutAccountId: string
  amount: number
  currency: string
  status: "pending" | "processing" | "completed" | "failed"
  reference: string
  description?: string
  failureReason?: string
  createdAt: Date
  processedAt?: Date
}

export interface EarningsPeriod {
  id: string
  userId: string
  startDate: Date
  endDate: Date
  status: "pending" | "finalized"
  totalAmount: number
  viewsAmount: number
  subscriptionsAmount: number
  tipsAmount: number
  salesAmount: number
  otherAmount: number
  createdAt: Date
  finalizedAt?: Date
}

export interface EarningsBreakdown {
  videoId: string
  videoTitle: string
  views: number
  viewEarnings: number
  engagements: number
  engagementEarnings: number
  subscriptions: number
  subscriptionEarnings: number
  adImpressions: number
  adClicks: number
  adEarnings: number
  totalEarnings: number
}

export interface PayoutSettings {
  id: string
  userId: string
  minimumPayout: number
  payoutFrequency: "weekly" | "biweekly" | "monthly"
  automaticPayouts: boolean
  payoutDay: number // 1-31 for monthly, 1-7 for weekly
  createdAt: Date
  updatedAt: Date
}

export interface PayoutRate {
  id: string
  type: "view" | "engagement" | "subscription" | "ad_impression" | "ad_click"
  rate: number
  currency: string
  effectiveDate: Date
  expirationDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

