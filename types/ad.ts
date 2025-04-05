export interface Ad {
  id: string
  name: string
  type: "video" | "image" | "gif"
  format: "banner" | "sidebar" | "preroll" | "midroll" | "postroll" | "overlay"
  url: string
  targetUrl: string
  startDate: Date
  endDate: Date
  status: "active" | "paused" | "completed" | "scheduled"
  impressions: number
  clicks: number
  advertiserId: string
  createdAt: Date
  updatedAt: Date

  // Targeting options
  targetAudience?: {
    countries?: string[]
    languages?: string[]
    ageGroups?: string[]
    interests?: string[]
    devices?: string[]
  }

  // For video ads
  duration?: number
  skipAfter?: number

  // For image/gif ads
  width?: number
  height?: number

  // For overlay ads
  position?: "top" | "bottom" | "left" | "right" | "center"

  // For all ads
  metadata?: Record<string, any>
}

export interface AdImpression {
  id: string
  adId: string
  userId?: string
  videoId?: string
  timestamp: Date
  ip: string
  userAgent: string
  country?: string
  device?: string
  referrer?: string
}

export interface AdClick {
  id: string
  adId: string
  impressionId: string
  userId?: string
  videoId?: string
  timestamp: Date
  ip: string
  userAgent: string
  country?: string
  device?: string
  referrer?: string
}

export interface AdCampaign {
  id: string
  name: string
  advertiserId: string
  budget: number
  spent: number
  startDate: Date
  endDate: Date
  status: "active" | "paused" | "completed" | "scheduled"
  adIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AdPerformance {
  impressions: number
  clicks: number
  ctr: number
  spend: number
  cpm: number
  cpc: number
}

