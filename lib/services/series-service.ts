import { cache } from "react"

export interface SeriesData {
  _id: string
  title: string
  description: string
  creator: {
    _id: string
    name: string
    avatar?: string
  }
  thumbnail: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  seasons?: SeasonData[]
}

export interface SeasonData {
  _id: string
  title: string
  description?: string
  series: string
  order: number
  episodes: Array<{
    _id: string
    title: string
    thumbnail: string
    duration: number
    views: number
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

export const getTrendingSeries = cache(async (limit = 3) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series?limit=${limit}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch trending series")
    }

    const data = await res.json()
    return data.series as SeriesData[]
  } catch (error) {
    console.error("Error fetching trending series:", error)
    return []
  }
})

export const getSeriesById = cache(async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series/${id}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch series")
    }

    const data = await res.json()
    return data as SeriesData
  } catch (error) {
    console.error(`Error fetching series ${id}:`, error)
    return null
  }
})

export const getRelatedSeries = cache(async (creatorId: string, seriesId: string, limit = 2) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/series?creator=${creatorId}&limit=${limit}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!res.ok) {
      throw new Error("Failed to fetch related series")
    }

    const data = await res.json()
    return data.series.filter((series: SeriesData) => series._id !== seriesId) as SeriesData[]
  } catch (error) {
    console.error("Error fetching related series:", error)
    return []
  }
})

