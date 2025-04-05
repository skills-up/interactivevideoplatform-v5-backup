"use client"

import { useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface InteractionData {
  _id: string
  type: string
  title: string
  metric: string
  updatedAt: string
}

export function RecentInteractions() {
  const [interactions, setInteractions] = useState<InteractionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentInteractions() {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/interactions/recent');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setInteractions([
            {
              _id: "1",
              type: "Quiz",
              title: "Quiz Completion Rate",
              metric: "75% completion",
              updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            },
            {
              _id: "2",
              type: "Hotspot",
              title: "Hotspot Click Rate",
              metric: "32% click rate",
              updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              _id: "3",
              type: "Decision",
              title: "Decision Point Analysis",
              metric: "45% engagement",
              updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching recent interactions:", error)
        setLoading(false)
      }
    }

    fetchRecentInteractions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (interactions.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-sm text-muted-foreground">No recent interactions found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div key={interaction._id} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">{interaction.title}</h4>
            <p className="text-xs text-muted-foreground">
              {interaction.metric} • Updated {formatDistanceToNow(new Date(interaction.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

