export interface AffiliateProgram {
  id: string
  name: string
  description: string
  commissionRate: number
  cookieDuration: number // in days
  minPayout: number
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface AffiliateUser {
  id: string
  userId: string
  referralCode: string
  totalReferrals: number
  totalCommission: number
  unpaidCommission: number
  paidCommission: number
  status: "active" | "inactive" | "banned"
  payoutMethod?: string
  payoutEmail?: string
  createdAt: Date
  updatedAt: Date
}

export interface AffiliateReferral {
  id: string
  affiliateUserId: string
  referredUserId: string
  status: "pending" | "confirmed" | "rejected"
  createdAt: Date
  confirmedAt?: Date
}

export interface AffiliateCommission {
  id: string
  affiliateUserId: string
  referralId: string
  amount: number
  type: "signup" | "subscription" | "purchase" | "view"
  status: "pending" | "approved" | "paid" | "rejected"
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
  transactionId?: string
}

export interface AffiliatePayoutRequest {
  id: string
  affiliateUserId: string
  amount: number
  status: "pending" | "processing" | "completed" | "rejected"
  payoutMethod: string
  payoutDetails: string
  createdAt: Date
  processedAt?: Date
  rejectionReason?: string
}

