"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { BarChart, LineChart } from "@/components/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Permission } from "@/lib/auth/permissions"
import { useEffect, useState } from "react"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  // Mock data for charts
  const [viewsData, setViewsData] = useState<any>(null)
  const [watchTimeData, setWatchTimeData] = useState<any>(null)
  const [interactionsData, setInteractionsData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [topVideos, setTopVideos] = useState<any[]>([])
  const [topSeries, setTopSeries] = useState<any[]>([])

  useEffect(() => {
    // In a real app, you would fetch analytics data from your API based on the selected time range
    // Simulate API call with mock data
    setLoading(true)

    setTimeout(() => {
      // Generate mock data based on time range
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

      // Views data
      const viewsLabels = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1) + i)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      })

      const viewsValues = Array.from({ length: days }, () => Math.floor(Math.random() * 500) + 100)

      setViewsData({
        labels: viewsLabels,
        datasets: [
          {
            label: "Views",
            data: viewsValues,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            tension: 0.3,
          },
        ],
      })

      // Watch time data
      setWatchTimeData({
        labels: viewsLabels,
        datasets: [
          {
            label: "Watch Time (hours)",
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10),
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.5)",
            tension: 0.3,
          },
        ],
      })

      // Interactions data
      setInteractionsData({
        labels: ["Quiz", "Decision", "Hotspot", "Poll"],
        datasets: [
          {
            label: "Interactions",
            data: [
              Math.floor(Math.random() * 1000) + 500,
              Math.floor(Math.random() * 800) + 300,
              Math.floor(Math.random() * 600) + 200,
              Math.floor(Math.random() * 400) + 100,
            ],
            backgroundColor: [
              "rgba(99, 102, 241, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
              "rgba(239, 68, 68, 0.7)",
            ],
          },
        ],
      })

      // Revenue data
      setRevenueData({
        labels: viewsLabels,
        datasets: [
          {
            label: "Revenue ($)",
            data: Array.from({ length: days }, () => Math.floor(Math.random() * 200) + 50),
            borderColor: "rgb(245, 158, 11)",
            backgroundColor: "rgba(245, 158, 11, 0.5)",
            tension: 0.3,
          },
        ],
      })

      // Top videos
      setTopVideos([
        {
          title: "Introduction to Interactive Videos",
          views: 1240,
          watchTime: 124,
          interactions: 320,
        },
        {
          title: "Advanced Interaction Techniques",
          views: 980,
          watchTime: 98,
          interactions: 245,
        },
        {
          title: "Creating Engaging Content",
          views: 750,
          watchTime: 75,
          interactions: 180,
        },
        {
          title: "Interactive Quiz Tutorial",
          views: 1500,
          watchTime: 150,
          interactions: 420,
        },
        {
          title: "Decision Points in Videos",
          views: 620,
          watchTime: 62,
          interactions: 155,
        },
      ])

      // Top series
      setTopSeries([
        {
          title: "Learn React from Scratch",
          subscribers: 245,
          revenue: 2450,
        },
        {
          title: "Advanced Cooking Techniques",
          subscribers: 120,
          revenue: 960,
        },
        {
          title: "Web Development Masterclass",
          subscribers: 310,
          revenue: 4030,
        },
      ])

      setLoading(false)
    }, 1000)
  }, [timeRange])

  return (
    <RequireAuth permission={Permission.VIEW_ANALYTICS}>
      <main className="flex-1">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {viewsData?.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {watchTimeData?.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString()}{" "}
                  hrs
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {interactionsData?.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  ${revenueData?.datasets[0].data.reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Views Over Time</CardTitle>
                  <CardDescription>Total video views for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="aspect-[2/1] w-full rounded-lg bg-muted animate-pulse" />
                  ) : (
                    <LineChart data={viewsData} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Watch Time</CardTitle>
                  <CardDescription>Total watch time in hours for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="aspect-[2/1] w-full rounded-lg bg-muted animate-pulse" />
                  ) : (
                    <LineChart data={watchTimeData} />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Total revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="aspect-[2/1] w-full rounded-lg bg-muted animate-pulse" />
                  ) : (
                    <LineChart data={revenueData} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interaction Types</CardTitle>
                  <CardDescription>Distribution of interaction types</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="aspect-[2/1] w-full rounded-lg bg-muted animate-pulse" />
                  ) : (
                    <BarChart data={interactionsData} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>Videos with the highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                      <div>Title</div>
                      <div className="text-right">Views</div>
                      <div className="text-right">Watch Time (hrs)</div>
                      <div className="text-right">Interactions</div>
                    </div>
                    <div className="divide-y">
                      {topVideos.map((video, index) => (
                        <div key={index} className="grid grid-cols-4 gap-4 p-4">
                          <div className="truncate">{video.title}</div>
                          <div className="text-right">{video.views.toLocaleString()}</div>
                          <div className="text-right">{video.watchTime}</div>
                          <div className="text-right">{video.interactions}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="series" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Series</CardTitle>
                <CardDescription>Series with the highest revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 gap-4 p-4 font-medium">
                      <div>Title</div>
                      <div className="text-right">Subscribers</div>
                      <div className="text-right">Revenue ($)</div>
                    </div>
                    <div className="divide-y">
                      {topSeries.map((series, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 p-4">
                          <div className="truncate">{series.title}</div>
                          <div className="text-right">{series.subscribers}</div>
                          <div className="text-right">${series.revenue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interaction Performance</CardTitle>
                <CardDescription>Detailed breakdown of interaction types and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="aspect-[2/1] w-full rounded-lg bg-muted animate-pulse" />
                ) : (
                  <BarChart data={interactionsData} />
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Completion Rate</CardTitle>
                  <CardDescription>Percentage of viewers who complete quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold">76%</div>
                    <p className="text-sm text-muted-foreground">Average completion rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Decision Point Engagement</CardTitle>
                  <CardDescription>Percentage of viewers who interact with decision points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold">82%</div>
                    <p className="text-sm text-muted-foreground">Average engagement rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </RequireAuth>
  )
}

