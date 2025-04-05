"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EarningsPeriod } from "@/types/payout"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface EarningsSummaryProps {
  periods: EarningsPeriod[]
  availableBalance: number
}

export function EarningsSummary({ periods, availableBalance }: EarningsSummaryProps) {
  // Calculate total earnings
  const totalEarnings = periods.reduce((sum, period) => sum + period.totalAmount, 0)

  // Calculate earnings for the current month
  const now = new Date()
  const currentMonthEarnings = periods
    .filter((period) => {
      const periodDate = new Date(period.endDate)
      return periodDate.getMonth() === now.getMonth() && periodDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, period) => sum + period.totalAmount, 0)

  // Calculate earnings for the previous month
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1)
  const previousMonthEarnings = periods
    .filter((period) => {
      const periodDate = new Date(period.endDate)
      return periodDate.getMonth() === prevMonth.getMonth() && periodDate.getFullYear() === prevMonth.getFullYear()
    })
    .reduce((sum, period) => sum + period.totalAmount, 0)

  // Prepare chart data
  const chartData = prepareChartData(periods)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
          <p className="text-xs text-muted-foreground">Lifetime earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
          <p className="text-xs text-muted-foreground">Available for payout</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentMonthEarnings)}</div>
          <p className="text-xs text-muted-foreground">{formatMonthYear(now)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Previous Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(previousMonthEarnings)}</div>
          <p className="text-xs text-muted-foreground">{formatMonthYear(prevMonth)}</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
          <CardDescription>Your earnings over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value as number), "Earnings"]} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function prepareChartData(periods: EarningsPeriod[]) {
  const monthMap: Record<string, number> = {}

  // Get last 6 months
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    monthMap[key] = 0
  }

  // Sum earnings by month
  periods.forEach((period) => {
    const date = new Date(period.endDate)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (key in monthMap) {
      monthMap[key] += period.totalAmount
    }
  })

  // Convert to chart data format
  return Object.entries(monthMap)
    .map(([key, amount]) => {
      const [year, month] = key.split("-").map(Number)
      return {
        name: formatMonthYear(new Date(year, month - 1, 1)),
        amount,
      }
    })
    .reverse()
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

