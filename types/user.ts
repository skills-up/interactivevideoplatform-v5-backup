export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: "user" | "creator" | "admin"
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date

  // Subscription
  subscriptionTier?: "free" | "basic" | "pro" | "enterprise"
  subscriptionStatus?: "active" | "inactive" | "trialing" | "past_due" | "canceled"
  subscriptionExpiresAt?: Date
  stripeCustomerId?: string

  // UI preferences
  currentTemplateId?: string

  // Analytics
  lastLoginAt?: Date
  loginCount?: number

  // Social auth
  accounts?: {
    provider: string
    providerAccountId: string
    refreshToken?: string
    accessToken?: string
    expiresAt?: number
  }[]
}

