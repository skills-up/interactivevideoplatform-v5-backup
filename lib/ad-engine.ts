import type { NextRequest } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Ad from "@/models/Ad"
import AdImpression from "@/models/AdImpression"
import AdClick from "@/models/AdClick"
import { isUserPremium } from "@/lib/subscription-utils"
import { getUserFromRequest } from "@/lib/auth"
import { getClientInfo } from "@/lib/utils"

export async function shouldShowAds(req: NextRequest): Promise<boolean> {
  // Get user from request
  const user = await getUserFromRequest(req)

  // If user is not logged in, show ads
  if (!user) {
    return true
  }

  // Check if user has premium subscription
  const isPremium = await isUserPremium(user.id)

  // Show ads if user is not premium
  return !isPremium
}

export async function getAdsForPlacement(format: string, req: NextRequest, videoId?: string): Promise<any[]> {
  // Check if ads should be shown
  const showAds = await shouldShowAds(req)
  if (!showAds) {
    return []
  }

  await dbConnect()

  // Get client info for targeting
  const { ip, userAgent, country, device, referrer } = getClientInfo(req)

  // Get user from request (if logged in)
  const user = await getUserFromRequest(req)

  // Build query for ad targeting
  const now = new Date()
  const query: any = {
    format,
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }

  // Add targeting criteria if available
  if (country) {
    query.$or = [
      { "targetAudience.countries": { $exists: false } },
      { "targetAudience.countries": { $size: 0 } },
      { "targetAudience.countries": country },
    ]
  }

  if (device) {
    query.$or = [
      { "targetAudience.devices": { $exists: false } },
      { "targetAudience.devices": { $size: 0 } },
      { "targetAudience.devices": device },
    ]
  }

  // Get ads that match the criteria
  const ads = await Ad.find(query).limit(5)

  // If no ads found, return empty array
  if (ads.length === 0) {
    return []
  }

  // Select ads based on algorithm (simplified version)
  // In a real implementation, this would use more sophisticated selection
  // based on CTR, bid amount, relevance, etc.
  const selectedAds = selectAds(ads, format)

  // Record impressions asynchronously
  recordImpressions(selectedAds, {
    ip,
    userAgent,
    country,
    device,
    referrer,
    userId: user?.id,
    videoId,
  })

  return selectedAds.map((ad) => ({
    id: ad.id,
    type: ad.type,
    url: ad.url,
    targetUrl: ad.targetUrl,
    width: ad.width,
    height: ad.height,
    duration: ad.duration,
    skipAfter: ad.skipAfter,
    position: ad.position,
    impressionId: ad._impressionId, // Used for tracking clicks
  }))
}

function selectAds(ads: any[], format: string): any[] {
  // Different selection logic based on format
  switch (format) {
    case "preroll":
    case "postroll":
      // For pre/post-roll, select one video ad
      return selectRandomAds(
        ads.filter((ad) => ad.type === "video"),
        1,
      )

    case "midroll":
      // For mid-roll, select up to 2 video ads
      return selectRandomAds(
        ads.filter((ad) => ad.type === "video"),
        2,
      )

    case "banner":
      // For banners, select one image/gif ad
      return selectRandomAds(
        ads.filter((ad) => ad.type !== "video"),
        1,
      )

    case "sidebar":
      // For sidebar, select up to 3 image/gif ads
      return selectRandomAds(
        ads.filter((ad) => ad.type !== "video"),
        3,
      )

    case "overlay":
      // For overlay, select one image/gif ad
      return selectRandomAds(
        ads.filter((ad) => ad.type !== "video"),
        1,
      )

    default:
      return selectRandomAds(ads, 1)
  }
}

function selectRandomAds(ads: any[], count: number): any[] {
  // Shuffle the ads
  const shuffled = [...ads].sort(() => 0.5 - Math.random())

  // Return the requested number of ads
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

async function recordImpressions(
  ads: any[],
  {
    ip,
    userAgent,
    country,
    device,
    referrer,
    userId,
    videoId,
  }: {
    ip: string
    userAgent: string
    country?: string
    device?: string
    referrer?: string
    userId?: string
    videoId?: string
  },
): Promise<void> {
  try {
    // Create impression records
    const impressions = ads.map((ad) => ({
      adId: ad._id,
      userId,
      videoId,
      timestamp: new Date(),
      ip,
      userAgent,
      country,
      device,
      referrer,
    }))

    // Insert impressions
    const result = await AdImpression.insertMany(impressions)

    // Attach impression IDs to ads for click tracking
    ads.forEach((ad, index) => {
      ad._impressionId = result[index]._id
    })

    // Update impression counts
    const updatePromises = ads.map((ad) => Ad.updateOne({ _id: ad._id }, { $inc: { impressions: 1 } }))

    await Promise.all(updatePromises)
  } catch (error) {
    console.error("Error recording ad impressions:", error)
  }
}

export async function recordAdClick(
  adId: string,
  impressionId: string,
  req: NextRequest,
  videoId?: string,
): Promise<void> {
  try {
    await dbConnect()

    // Get client info
    const { ip, userAgent, country, device, referrer } = getClientInfo(req)

    // Get user from request (if logged in)
    const user = await getUserFromRequest(req)

    // Create click record
    const click = new AdClick({
      adId,
      impressionId,
      userId: user?.id,
      videoId,
      timestamp: new Date(),
      ip,
      userAgent,
      country,
      device,
      referrer,
    })

    await click.save()

    // Update click count
    await Ad.updateOne({ _id: adId }, { $inc: { clicks: 1 } })
  } catch (error) {
    console.error("Error recording ad click:", error)
  }
}

export async function getAdPerformance(adId: string): Promise<any> {
  await dbConnect()

  // Get the ad
  const ad = await Ad.findById(adId)
  if (!ad) {
    throw new Error("Ad not found")
  }

  // Calculate performance metrics
  const impressions = ad.impressions
  const clicks = ad.clicks
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

  // In a real implementation, you would calculate spend based on
  // the pricing model (CPM, CPC, etc.)
  const cpm = 5.0 // Example CPM rate ($5 per 1000 impressions)
  const spend = (impressions / 1000) * cpm

  const cpc = clicks > 0 ? spend / clicks : 0

  return {
    impressions,
    clicks,
    ctr,
    spend,
    cpm,
    cpc,
  }
}

