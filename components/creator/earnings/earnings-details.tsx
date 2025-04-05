"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { EarningsPeriod, EarningsBreakdown } from "@/types/payout"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EarningsDetailsProps {
  period: EarningsPeriod
  breakdown: EarningsBreakdown[]
}

export function EarningsDetails({ period, breakdown }: EarningsDetailsProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleDownloadCSV = () => {
    // Convert breakdown to CSV
    const headers = [
      "Video Title",
      "Views",
      "View Earnings",
      "Engagements",
      "Engagement Earnings",
      "Subscriptions",
      "Subscription Earnings",
      "Ad Impressions",
      "Ad Clicks",
      "Ad Earnings",
      "Total Earnings",
    ]

    const rows = breakdown.map((item) => [
      item.videoTitle,
      item.views,
      item.viewEarnings.toFixed(2),
      item.engagements,
      item.engagementEarnings.toFixed(2),
      item.subscriptions,
      item.subscriptionEarnings.toFixed(2),
      item.adImpressions,
      item.adClicks,
      item.adEarnings.toFixed(2),
      item.totalEarnings.toFixed(2),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `earnings-${formatDate(period.startDate)}-to-${formatDate(period.endDate)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Prepare data for chart
  const chartData = breakdown
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 10)
    .map((item) => ({
      name: truncateTitle(item.videoTitle, 20),
      viewEarnings: item.viewEarnings,
      engagementEarnings: item.engagementEarnings,
      subscriptionEarnings: item.subscriptionEarnings,
      adEarnings: item.adEarnings,
    }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earnings
        </Button>
        <Button variant="outline" onClick={handleDownloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Period</CardTitle>
          <CardDescription>
            {formatDate(period.startDate)} to {formatDate(period.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Earnings</h3>
              <p className="text-2xl font-bold">${period.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">View Earnings</h3>
              <p className="text-2xl font-bold">${period.viewEarnings.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Engagement Earnings</h3>
              <p className="text-2xl font-bold">${period.engagementEarnings.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Subscription Earnings</h3>
              <p className="text-2xl font-bold">${period.subscriptionEarnings.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Ad Earnings</h3>
              <p className="text-2xl font-bold">${period.adEarnings.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Videos</CardTitle>
          <CardDescription>Earnings breakdown by video for this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => [`$${value}`, "Earnings"]} />
                <Bar dataKey="viewEarnings" stackId="a" fill="#8884d8" name="Views" />
                <Bar dataKey="engagementEarnings" stackId="a" fill="#82ca9d" name="Engagements" />
                <Bar dataKey="subscriptionEarnings" stackId="a" fill="#ffc658" name="Subscriptions" />
                <Bar dataKey="adEarnings" stackId="a" fill="#ff8042" name="Ads" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video Title</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>View Earnings</TableHead>
                  <TableHead>Engagements</TableHead>
                  <TableHead>Engagement Earnings</TableHead>
                  <TableHead>Ad Earnings</TableHead>
                  <TableHead>Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.videoId}>
                    <TableCell className="font-medium">{item.videoTitle}</TableCell>
                    <TableCell>{item.views}</TableCell>
                    <TableCell>${item.viewEarnings.toFixed(2)}</TableCell>
                    <TableCell>{item.engagements}</TableCell>
                    <TableCell>${item.engagementEarnings.toFixed(2)}</TableCell>
                    <TableCell>${item.adEarnings.toFixed(2)}</TableCell>
                    <TableCell className="font-bold">${item.totalEarnings.toFixed(2)}</TableCell>
                  </TableRow>
                ))}

                {breakdown.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No earnings data available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title
  return title.substring(0, maxLength) + "..."
}

