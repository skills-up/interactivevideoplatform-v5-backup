"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AffiliateUser, AffiliateProgram, AffiliateReferral, AffiliateCommission } from "@/types/affiliate"
import { formatDate } from "@/lib/utils"
import { Copy, CheckCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface AffiliateSummaryProps {
  user: AffiliateUser
  program: AffiliateProgram
  referrals: AffiliateReferral[]
  commissions: AffiliateCommission[]
  stats: {
    pendingAmount: number
    approvedAmount: number
    paidAmount: number
    totalAmount: number
  }
}

export function AffiliateSummary({ user, program, referrals, commissions, stats }: AffiliateSummaryProps) {
  const [copied, setCopied] = useState(false)

  const referralUrl = `${window.location.origin}?ref=${user.referralCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  // Prepare data for charts
  const commissionsByType = prepareCommissionsByType(commissions)
  const recentActivity = prepareRecentActivity(referrals, commissions)

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to earn commissions when people sign up or make purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input value={referralUrl} readOnly className="font-mono text-sm" />
            <Button variant="outline" onClick={handleCopyLink}>
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown</CardTitle>
            <CardDescription>Earnings by commission type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Referrals and commissions over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="referrals" stroke="#8884d8" name="Referrals" />
                <Line type="monotone" dataKey="commissions" stroke="#82ca9d" name="Commissions ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.slice(0, 5).map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{formatDate(referral.createdAt)}</TableCell>
                      <TableCell>{referral.status}</TableCell>
                    </TableRow>
                  ))}

                  {referrals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        No referrals yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.slice(0, 5).map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{formatDate(commission.createdAt)}</TableCell>
                      <TableCell>{commission.type}</TableCell>
                      <TableCell>${commission.amount.toFixed(2)}</TableCell>
                      <TableCell>{commission.status}</TableCell>
                    </TableRow>
                  ))}

                  {commissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No commissions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Commission Rate</h3>
              <p className="text-xl font-bold">{program.commissionRate * 100}%</p>
              <p className="text-xs text-muted-foreground">
                Earn {program.commissionRate * 100}% on all qualifying purchases
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Cookie Duration</h3>
              <p className="text-xl font-bold">{program.cookieDuration} days</p>
              <p className="text-xs text-muted-foreground">Referrals are tracked for {program.cookieDuration} days</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Minimum Payout</h3>
              <p className="text-xl font-bold">${program.minPayout}</p>
              <p className="text-xs text-muted-foreground">Minimum balance required for payout</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function prepareCommissionsByType(commissions: AffiliateCommission[]) {
  const typeMap: Record<string, number> = {
    signup: 0,
    subscription: 0,
    purchase: 0,
    view: 0,
  }

  commissions.forEach((commission) => {
    typeMap[commission.type] += commission.amount
  })

  return Object.entries(typeMap)
    .map(([name, amount]) => ({ name, amount }))
    .filter((item) => item.amount > 0)
}

function prepareRecentActivity(referrals: AffiliateReferral[], commissions: AffiliateCommission[]) {
  const dateMap: Record<string, { date: string; referrals: number; commissions: number }> = {}

  // Get dates from last 30 days
  const now = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    dateMap[dateStr] = { date: dateStr, referrals: 0, commissions: 0 }
  }

  // Count referrals by date
  referrals.forEach((referral) => {
    const dateStr = new Date(referral.createdAt).toISOString().split("T")[0]
    if (dateMap[dateStr]) {
      dateMap[dateStr].referrals += 1
    }
  })

  // Sum commissions by date
  commissions.forEach((commission) => {
    const dateStr = new Date(commission.createdAt).toISOString().split("T")[0]
    if (dateMap[dateStr]) {
      dateMap[dateStr].commissions += commission.amount
    }
  })

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date))
}

