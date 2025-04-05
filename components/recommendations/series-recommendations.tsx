"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface SeriesData {
  _id: string
  title: string
  thumbnail: string
  price: number
  creator: {
    name: string
  }
}

interface SeriesRecommendationsProps {
  limit?: number
  title?: string
}

export function SeriesRecommendations({ limit = 2, title = "Recommended Series" }: SeriesRecommendationsProps) {
  const [series, setSeries] = useState<SeriesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch(`/api/recommendations/series?limit=${limit}`)

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }

        const data = await response.json()
        setSeries(data)
      } catch (error) {
        console.error("Error fetching series recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [limit])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold">{title}</h2>
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-28 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (series.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-semibold">{title}</h2>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">No recommendations available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="space-y-4">
        {series.map((item) => (
          <div key={item._id} className="rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="h-16 w-28 overflow-hidden rounded-md">
                <img
                  src={item.thumbnail || "/placeholder.svg?height=64&width=112"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.creator.name}</p>
                <div className="mt-2">
                  <Link href={`/series/${item._id}`}>
                    <Button size="sm" variant="outline">
                      View Series
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

