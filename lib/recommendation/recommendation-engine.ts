import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import User from "@/models/User"
import { Series } from "@/models/Series"
import Interaction from "@/models/Interaction"

interface RecommendationOptions {
  limit?: number
  excludeIds?: string[]
  includeSubscribedOnly?: boolean
}

export async function getRecommendedVideos(userId: string | null, options: RecommendationOptions = {}) {
  const { limit = 10, excludeIds = [], includeSubscribedOnly = false } = options

  await dbConnect()

  // If user is not logged in, return trending videos
  if (!userId) {
    return getTrendingVideos(limit, excludeIds)
  }

  try {
    // Get user data
    const user = await User.findById(userId)
    if (!user) {
      return getTrendingVideos(limit, excludeIds)
    }

    // Get user's viewing history (last 20 videos)
    const viewingHistory = await Interaction.find({ user: userId }).sort({ createdAt: -1 }).limit(20).distinct("video")

    // If user has no viewing history, return trending videos
    if (viewingHistory.length === 0) {
      return getTrendingVideos(limit, excludeIds)
    }

    // Get videos similar to those in viewing history
    const historyVideos = await Video.find({ _id: { $in: viewingHistory } })

    // Extract tags from viewing history
    const tagCounts = new Map<string, number>()
    historyVideos.forEach((video) => {
      video.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    // Sort tags by frequency
    const sortedTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, 5) // Top 5 tags

    // Build query
    const query: any = {
      _id: { $nin: [...excludeIds, ...viewingHistory] },
      visibility: "public",
    }

    // If includeSubscribedOnly is true, only include videos from subscribed series
    if (includeSubscribedOnly && user.subscribedSeries.length > 0) {
      // Get all seasons from subscribed series
      const seasons = await Series.find({
        _id: { $in: user.subscribedSeries },
      }).distinct("seasons")

      query.seasons = { $in: seasons }
    }

    // If we have tags, use them for recommendations
    if (sortedTags.length > 0) {
      query.tags = { $in: sortedTags }
    }

    // Get recommendations
    let recommendations = await Video.find(query).populate("creator", "name avatar").sort({ views: -1 }).limit(limit)

    // If we don't have enough recommendations, fill with trending videos
    if (recommendations.length < limit) {
      const trendingVideos = await getTrendingVideos(limit - recommendations.length, [
        ...excludeIds,
        ...viewingHistory,
        ...recommendations.map((v) => v._id),
      ])

      recommendations = [...recommendations, ...trendingVideos]
    }

    return recommendations
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return getTrendingVideos(limit, excludeIds)
  }
}

export async function getTrendingVideos(limit = 10, excludeIds: string[] = []) {
  await dbConnect()

  try {
    // Get trending videos (most views in the last 7 days)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return await Video.find({
      _id: { $nin: excludeIds },
      visibility: "public",
      updatedAt: { $gte: oneWeekAgo },
    })
      .populate("creator", "name avatar")
      .sort({ views: -1 })
      .limit(limit)
  } catch (error) {
    console.error("Error getting trending videos:", error)
    return []
  }
}

export async function getSimilarVideos(videoId: string, limit = 5) {
  await dbConnect()

  try {
    // Get the video
    const video = await Video.findById(videoId)
    if (!video) {
      return []
    }

    // Get videos with similar tags
    return await Video.find({
      _id: { $ne: videoId },
      visibility: "public",
      tags: { $in: video.tags },
    })
      .populate("creator", "name avatar")
      .sort({ views: -1 })
      .limit(limit)
  } catch (error) {
    console.error("Error getting similar videos:", error)
    return []
  }
}

export async function getRecommendedSeries(userId: string | null, limit = 3) {
  await dbConnect()

  // If user is not logged in, return trending series
  if (!userId) {
    return getTrendingSeries(limit)
  }

  try {
    // Get user data
    const user = await User.findById(userId)
    if (!user) {
      return getTrendingSeries(limit)
    }

    // Get user's viewing history
    const viewingHistory = await Interaction.find({ user: userId }).sort({ createdAt: -1 }).limit(20).distinct("video")

    // If user has no viewing history, return trending series
    if (viewingHistory.length === 0) {
      return getTrendingSeries(limit)
    }

    // Get videos from viewing history
    const historyVideos = await Video.find({ _id: { $in: viewingHistory } })

    // Get series IDs from these videos
    const seriesIds = await Video.find({ _id: { $in: viewingHistory } })
      .distinct("seasons")
      .then((seasonIds) => Series.find({ seasons: { $in: seasonIds } }).distinct("_id"))

    // Extract creators from viewing history
    const creatorIds = [...new Set(historyVideos.map((video) => video.creator.toString()))]

    // Get series from the same creators, excluding already watched series
    const recommendations = await Series.find({
      _id: { $nin: [...seriesIds, ...user.subscribedSeries] },
      creator: { $in: creatorIds },
      isActive: true,
    })
      .populate("creator", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit)

    // If we don't have enough recommendations, fill with trending series
    if (recommendations.length < limit) {
      const trendingSeries = await getTrendingSeries(limit - recommendations.length, [
        ...seriesIds,
        ...user.subscribedSeries,
        ...recommendations.map((s) => s._id),
      ])

      return [...recommendations, ...trendingSeries]
    }

    return recommendations
  } catch (error) {
    console.error("Error getting recommended series:", error)
    return getTrendingSeries(limit)
  }
}

export async function getTrendingSeries(limit = 3, excludeIds: string[] = []) {
  await dbConnect()

  try {
    // Get trending series (most subscribers)
    return await Series.find({
      _id: { $nin: excludeIds },
      isActive: true,
    })
      .populate("creator", "name avatar")
      .sort({ subscribers: -1 })
      .limit(limit)
  } catch (error) {
    console.error("Error getting trending series:", error)
    return []
  }
}

