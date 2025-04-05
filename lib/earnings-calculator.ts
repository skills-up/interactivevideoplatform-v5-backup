import type { EarningsBreakdown } from "@/types/payout"
import Video from "@/models/Video"
import VideoView from "@/models/VideoView"
import VideoEngagement from "@/models/VideoEngagement"
import Subscription from "@/models/Subscription"
import AdImpression from "@/models/AdImpression"
import AdClick from "@/models/AdClick"
import PayoutRate from "@/models/PayoutRate"
import PayoutSettings from "@/models/PayoutSettings"
import EarningsPeriodModel from "@/models/EarningsPeriod"
import PayoutTransaction from "@/models/PayoutTransaction"
import PayoutAccount from "@/models/PayoutAccount"
import dbConnect from "@/lib/dbConnect"
import { nanoid } from "nanoid"
import { processPayoutRequest } from "./payout-processor"

// Get current payout rates
export async function getCurrentRates(): Promise<Record<string, number>> {
  await dbConnect()

  const rates = await PayoutRate.find({ isActive: true })
  const rateMap: Record<string, number> = {}

  rates.forEach((rate) => {
    rateMap[rate.type] = rate.rate
  })

  // Default rates if not found
  if (!rateMap["view"]) rateMap["view"] = 0.001 // $0.001 per view
  if (!rateMap["engagement"]) rateMap["engagement"] = 0.01 // $0.01 per engagement
  if (!rateMap["subscription"]) rateMap["subscription"] = 0.7 // 70% of subscription revenue
  if (!rateMap["ad_impression"]) rateMap["ad_impression"] = 0.001 // $0.001 per ad impression
  if (!rateMap["ad_click"]) rateMap["ad_click"] = 0.1 // $0.1 per ad click

  return rateMap
}

export async function calculateCurrentEarnings(userId: string): Promise<any> {
  await dbConnect()

  // Find the last finalized period
  const lastPeriod = await EarningsPeriodModel.findOne({
    userId,
    status: "finalized",
  }).sort({ endDate: -1 })

  // Set start date to day after last period, or 30 days ago if no last period
  const startDate = lastPeriod
    ? new Date(lastPeriod.endDate.getTime() + 86400000) // Add one day
    : new Date(Date.now() - 30 * 86400000) // 30 days ago

  const endDate = new Date() // Now

  // Get current rates
  const rates = await getCurrentRates()

  // Get the database connection
  const { db } = await dbConnect()

  // Calculate views earnings
  const viewsData = await VideoView.aggregate([
    {
      $match: {
        creatorId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ])

  const viewsCount = viewsData.length > 0 ? viewsData[0].count : 0
  const viewsAmount = viewsCount * rates.view

  // Calculate engagement earnings
  const engagementsData = await VideoEngagement.aggregate([
    {
      $match: {
        creatorId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ])

  const engagementsCount = engagementsData.length > 0 ? engagementsData[0].count : 0
  const engagementsAmount = engagementsCount * rates.engagement

  // Calculate subscription earnings
  const subscriptionsData = await Subscription.aggregate([
    {
      $match: {
        creatorId: userId,
        status: "active",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ])

  const subscriptionsAmount = subscriptionsData.length > 0 ? subscriptionsData[0].total * rates.subscription : 0

  // Calculate ad earnings
  const adImpressionsData = await AdImpression.aggregate([
    {
      $match: {
        creatorId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ])

  const adImpressionsCount = adImpressionsData.length > 0 ? adImpressionsData[0].count : 0
  const adImpressionsAmount = adImpressionsCount * rates.ad_impression

  const adClicksData = await AdClick.aggregate([
    {
      $match: {
        creatorId: userId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ])

  const adClicksCount = adClicksData.length > 0 ? adClicksData[0].count : 0
  const adClicksAmount = adClicksCount * rates.ad_click

  const adAmount = adImpressionsAmount + adClicksAmount

  // Calculate total earnings
  const totalAmount = viewsAmount + engagementsAmount + subscriptionsAmount + adAmount

  return {
    startDate,
    endDate,
    viewsCount,
    viewsAmount,
    engagementsCount,
    engagementsAmount,
    subscriptionsAmount,
    adImpressionsCount,
    adImpressionsAmount,
    adClicksCount,
    adClicksAmount,
    totalAmount,
  }
}

export async function getEarningsBreakdown(period: any): Promise<EarningsBreakdown[]> {
  await dbConnect()

  // Get all videos by the creator
  const videos = await Video.find({ userId: period.userId })
  const videoIds = videos.map((video) => video._id.toString())

  // Get current rates
  const rates = await getCurrentRates()

  // Initialize breakdown for each video
  const breakdownMap: Record<string, EarningsBreakdown> = {}

  for (const video of videos) {
    breakdownMap[video._id.toString()] = {
      videoId: video._id.toString(),
      videoTitle: video.title,
      views: 0,
      viewEarnings: 0,
      engagements: 0,
      engagementEarnings: 0,
      subscriptions: 0,
      subscriptionEarnings: 0,
      adImpressions: 0,
      adClicks: 0,
      adEarnings: 0,
      totalEarnings: 0,
    }
  }

  // Calculate view earnings
  const views = await VideoView.aggregate([
    {
      $match: {
        videoId: { $in: videoIds },
        createdAt: { $gte: period.startDate, $lte: period.endDate },
      },
    },
    {
      $group: {
        _id: "$videoId",
        count: { $sum: 1 },
      },
    },
  ])

  for (const view of views) {
    const videoId = view._id.toString()
    if (breakdownMap[videoId]) {
      breakdownMap[videoId].views = view.count
      breakdownMap[videoId].viewEarnings = view.count * rates.view
    }
  }

  // Calculate engagement earnings
  const engagements = await VideoEngagement.aggregate([
    {
      $match: {
        videoId: { $in: videoIds },
        createdAt: { $gte: period.startDate, $lte: period.endDate },
      },
    },
    {
      $group: {
        _id: "$videoId",
        count: { $sum: 1 },
      },
    },
  ])

  for (const engagement of engagements) {
    const videoId = engagement._id.toString()
    if (breakdownMap[videoId]) {
      breakdownMap[videoId].engagements = engagement.count
      breakdownMap[videoId].engagementEarnings = engagement.count * rates.engagement
    }
  }

  // Calculate subscription earnings
  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        creatorId: period.userId,
        createdAt: { $gte: period.startDate, $lte: period.endDate },
        referredByVideoId: { $in: videoIds },
      },
    },
    {
      $group: {
        _id: "$referredByVideoId",
        count: { $sum: 1 },
        revenue: { $sum: "$amount" },
      },
    },
  ])

  for (const subscription of subscriptions) {
    const videoId = subscription._id.toString()
    if (breakdownMap[videoId]) {
      breakdownMap[videoId].subscriptions = subscription.count
      breakdownMap[videoId].subscriptionEarnings = subscription.revenue * rates.subscription
    }
  }

  // Calculate ad earnings
  const adImpressions = await AdImpression.aggregate([
    {
      $match: {
        videoId: { $in: videoIds },
        createdAt: { $gte: period.startDate, $lte: period.endDate },
      },
    },
    {
      $group: {
        _id: "$videoId",
        count: { $sum: 1 },
      },
    },
  ])

  for (const impression of adImpressions) {
    const videoId = impression._id.toString()
    if (breakdownMap[videoId]) {
      breakdownMap[videoId].adImpressions = impression.count
      breakdownMap[videoId].adEarnings += impression.count * rates.ad_impression
    }
  }

  const adClicks = await AdClick.aggregate([
    {
      $match: {
        videoId: { $in: videoIds },
        createdAt: { $gte: period.startDate, $lte: period.endDate },
      },
    },
    {
      $group: {
        _id: "$videoId",
        count: { $sum: 1 },
      },
    },
  ])

  for (const click of adClicks) {
    const videoId = click._id.toString()
    if (breakdownMap[videoId]) {
      breakdownMap[videoId].adClicks = click.count
      breakdownMap[videoId].adEarnings += click.count * rates.ad_click
    }
  }

  // Calculate total earnings for each video
  for (const videoId in breakdownMap) {
    const breakdown = breakdownMap[videoId]
    breakdown.totalEarnings =
      breakdown.viewEarnings + breakdown.engagementEarnings + breakdown.subscriptionEarnings + breakdown.adEarnings
  }

  return Object.values(breakdownMap)
}

export async function finalizeEarningsPeriod(periodId: string): Promise<boolean> {
  try {
    await dbConnect()

    const period = await EarningsPeriodModel.findById(periodId)
    if (!period || period.status === "finalized") {
      return false
    }

    // Update status
    period.status = "finalized"
    period.finalizedAt = new Date()
    await period.save()

    // Check if automatic payout should be triggered
    const settings = await PayoutSettings.findOne({ userId: period.userId })
    if (settings?.automaticPayouts) {
      await triggerAutomaticPayout(period.userId)
    }

    return true
  } catch (error) {
    console.error("Error finalizing earnings period:", error)
    return false
  }
}

export async function createEarningsPeriod(userId: string, startDate: Date, endDate: Date): Promise<any> {
  try {
    await dbConnect()

    // Get current rates
    const rates = await getCurrentRates()

    // Calculate views earnings
    const viewsData = await VideoView.aggregate([
      {
        $match: {
          creatorId: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ])

    const viewsCount = viewsData.length > 0 ? viewsData[0].count : 0
    const viewsAmount = viewsCount * rates.view

    // Calculate engagement earnings
    const engagementsData = await VideoEngagement.aggregate([
      {
        $match: {
          creatorId: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ])

    const engagementsCount = engagementsData.length > 0 ? engagementsData[0].count : 0
    const engagementsAmount = engagementsCount * rates.engagement

    // Calculate subscription earnings
    const subscriptionsData = await Subscription.aggregate([
      {
        $match: {
          creatorId: userId,
          status: "active",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    const subscriptionsAmount = subscriptionsData.length > 0 ? subscriptionsData[0].total * rates.subscription : 0

    // Calculate ad earnings
    const adImpressionsData = await AdImpression.aggregate([
      {
        $match: {
          creatorId: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ])

    const adImpressionsCount = adImpressionsData.length > 0 ? adImpressionsData[0].count : 0
    const adImpressionsAmount = adImpressionsCount * rates.ad_impression

    const adClicksData = await AdClick.aggregate([
      {
        $match: {
          creatorId: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ])

    const adClicksCount = adClicksData.length > 0 ? adClicksData[0].count : 0
    const adClicksAmount = adClicksCount * rates.ad_click

    const adAmount = adImpressionsAmount + adClicksAmount

    // Calculate total earnings
    const totalAmount = viewsAmount + engagementsAmount + subscriptionsAmount + adAmount

    // Create earnings period
    const period = new EarningsPeriodModel({
      userId,
      startDate,
      endDate,
      status: "pending",
      totalAmount,
      viewsAmount,
      subscriptionsAmount,
      tipsAmount: 0, // Not calculated in this example
      salesAmount: 0, // Not calculated in this example
      otherAmount: engagementsAmount + adAmount,
    })

    await period.save()

    return period
  } catch (error) {
    console.error("Error creating earnings period:", error)
    throw error
  }
}

export async function getAvailableBalance(userId: string): Promise<number> {
  try {
    await dbConnect()

    // Get total from finalized earnings periods
    const earningsData = await EarningsPeriodModel.aggregate([
      {
        $match: {
          userId,
          status: "finalized",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ])

    const totalEarnings = earningsData.length > 0 ? earningsData[0].total : 0

    // Get total from processed payouts
    const payoutsData = await PayoutTransaction.aggregate([
      {
        $match: {
          userId,
          status: { $in: ["completed", "processing"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    const totalPayouts = payoutsData.length > 0 ? payoutsData[0].total : 0

    // Calculate available balance
    return Math.max(0, totalEarnings - totalPayouts)
  } catch (error) {
    console.error("Error calculating available balance:", error)
    return 0
  }
}

export async function triggerAutomaticPayout(userId: string): Promise<boolean> {
  try {
    await dbConnect()

    // Get user's payout settings
    const settings = await PayoutSettings.findOne({ userId })
    if (!settings || !settings.automaticPayouts) {
      return false
    }

    // Get available balance
    const availableBalance = await getAvailableBalance(userId)

    // Check if balance meets minimum payout threshold
    if (availableBalance < settings.minimumPayout) {
      return false
    }

    // Get default payout account
    const account = await PayoutAccount.findOne({
      userId,
      isDefault: true,
      status: "verified",
    })

    if (!account) {
      return false
    }

    // Create payout transaction
    const transaction = new PayoutTransaction({
      userId,
      payoutAccountId: account._id,
      amount: availableBalance,
      currency: "USD",
      status: "pending",
      reference: `AUTO-${nanoid(10)}`,
      description: "Automatic payout",
    })

    await transaction.save()

    // Process the payout
    try {
      await processPayoutRequest(transaction)
      return true
    } catch (error) {
      console.error("Error processing automatic payout:", error)
      return false
    }
  } catch (error) {
    console.error("Error triggering automatic payout:", error)
    return false
  }
}

// Schedule earnings periods and payouts
export async function scheduleEarningsPeriods(): Promise<void> {
  try {
    await dbConnect()

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Get all creators
    const creators = await Video.distinct("userId")

    for (const userId of creators) {
      // Check if period already exists
      const existingPeriod = await EarningsPeriodModel.findOne({
        userId,
        startDate: { $gte: startOfLastMonth },
        endDate: { $lte: endOfLastMonth },
      })

      if (!existingPeriod) {
        // Create new period
        await createEarningsPeriod(userId, startOfLastMonth, endOfLastMonth)
      }
    }
  } catch (error) {
    console.error("Error scheduling earnings periods:", error)
  }
}

// Run scheduled payouts based on user settings
export async function runScheduledPayouts(): Promise<void> {
  try {
    await dbConnect()

    const now = new Date()
    const today = now.getDate() // Day of month (1-31)
    const dayOfWeek = now.getDay() // Day of week (0-6, 0 is Sunday)

    // Get users with automatic payouts enabled
    const settings = await PayoutSettings.find({ automaticPayouts: true })

    for (const setting of settings) {
      let shouldPayout = false

      // Check if today is the payout day based on frequency
      switch (setting.payoutFrequency) {
        case "monthly":
          shouldPayout = today === setting.payoutDay
          break
        case "biweekly":
          // Every other Monday (assuming payoutDay = 1 means Monday)
          const weekNumber = Math.floor(now.getDate() / 7) + 1
          shouldPayout = dayOfWeek === setting.payoutDay && weekNumber % 2 === 0
          break
        case "weekly":
          // Every week on the specified day
          shouldPayout = dayOfWeek === setting.payoutDay
          break
      }

      if (shouldPayout) {
        await triggerAutomaticPayout(setting.userId)
      }
    }
  } catch (error) {
    console.error("Error running scheduled payouts:", error)
  }
}

