"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EarningsPeriod, EarningsBreakdown } from "@/types/payout"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, CheckCircle, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface EarningsDetailProps {
  period: EarningsPeriod
  breakdown: EarningsBreakdown[]
}

export function EarningsDetail({ period, breakdown }: EarningsDetailProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBack = () => {
    router.push("/creator/earnings")
  }

  const handleFinalize = async () => {
    if (period.status === "finalized") return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/creator/earnings/${period.id}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to finalize earnings period")
      }

      // Update the period status in the local state
      period.status = "finalized"
      period.finalizedAt = new Date()

      toast({
        title: "Earnings Finalized",
        description: "Your earnings period has been finalized successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Video ID",
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
      item.videoId,
      item.videoTitle,
      item.views,
      item.viewEarnings,
      item.engagements,
      item.engagementEarnings,
      item.subscriptions,
      item.subscriptionEarnings,
      item.adImpressions,
      item.adClicks,
      item.adEarnings,
      item.totalEarnings,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `earnings-${formatDate(period.startDate)}-to  url);
    link.setAttribute('download', \`earnings-${formatDate(period.startDate)}-to-${formatDate(period.endDate)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate totals for the pie chart
  const pieData = [
    { name: "Views", value: period.viewsAmount },
    { name: "Subscriptions", value: period.subscriptionsAmount },
    { name: "Other", value: period.otherAmount },
  ].filter((item) => item.value > 0)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Earnings
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          {period.status === "pending" && (
            <Button onClick={handleFinalize} disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-1">⟳</span> Processing
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" /> Finalize Period
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Earnings Detail</h1>
        <p className="text-muted-foreground">
          {formatDate(period.startDate)} to {formatDate(period.endDate)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Period Summary</CardTitle>
            <CardDescription>Overview of earnings for this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={period.status === "finalized" ? "default" : "secondary"}>{period.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Views Earnings:</span>
                <span className="font-medium">{formatCurrency(period.viewsAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subscription Earnings:</span>
                <span className="font-medium">{formatCurrency(period.subscriptionsAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Earnings:</span>
                <span className="font-medium">{formatCurrency(period.otherAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Total Earnings:</span>
                <span className="font-bold">{formatCurrency(period.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Distribution</CardTitle>
            <CardDescription>Breakdown of earnings by source</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Breakdown</CardTitle>
          <CardDescription>Earnings breakdown by video</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>View Earnings</TableHead>
                  <TableHead>Engagements</TableHead>
                  <TableHead>Engagement Earnings</TableHead>
                  <TableHead>Subscriptions</TableHead>
                  <TableHead>Subscription Earnings</TableHead>
                  <TableHead>Ad Earnings</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.videoId}>
                    <TableCell className="font-medium">{item.videoTitle}</TableCell>
                    <TableCell>{item.views}</TableCell>
                    <TableCell>{formatCurrency(item.viewEarnings)}</TableCell>
                    <TableCell>{item.engagements}</TableCell>
                    <TableCell>{formatCurrency(item.engagementEarnings)}</TableCell>
                    <TableCell>{item.subscriptions}</TableCell>
                    <TableCell>{formatCurrency(item.subscriptionEarnings)}</TableCell>
                    <TableCell>{formatCurrency(item.adEarnings)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(item.totalEarnings)}</TableCell>
                  </TableRow>
                ))}

                {breakdown.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No video data available for this period
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

