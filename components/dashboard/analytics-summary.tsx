"use client"

import { useEffect, useState } from "react"
import { BarChart3, Clock, ListVideo, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsSummaryData {
  totalViews: number
  watchTime: number
  subscribers: number
  interactions: number
  viewsChange: number
  watchTimeChange: number
  subscribersChange: number
  interactionsChange: number
}

export function AnalyticsSummary() {
  const [data, setData] = useState<AnalyticsSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/analytics/summary');
        // const data = await response.json();

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setData({
            totalViews: 45200,
            watchTime: 1245,
            subscribers: 2350,
            interactions: 8765,
            viewsChange: 12,
            watchTimeChange: 5,
            subscribersChange: 18,
            interactionsChange: 25,
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  function formatNumber(num: number): string {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString()
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="mt-1 h-4 w-32" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p>Failed to load analytics data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <ListVideo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalViews)}</div>
          <p className="text-xs text-muted-foreground">
            {data.viewsChange >= 0 ? "+" : ""}
            {data.viewsChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.watchTime} hrs</div>
          <p className="text-xs text-muted-foreground">
            {data.watchTimeChange >= 0 ? "+" : ""}
            {data.watchTimeChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.subscribers)}</div>
          <p className="text-xs text-muted-foreground">
            {data.subscribersChange >= 0 ? "+" : ""}
            {data.subscribersChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Interactions</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.interactions)}</div>
          <p className="text-xs text-muted-foreground">
            {data.interactionsChange >= 0 ? "+" : ""}
            {data.interactionsChange}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

