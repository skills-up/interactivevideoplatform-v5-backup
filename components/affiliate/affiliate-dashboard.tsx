"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AffiliateSummary } from "./affiliate-summary"
import { AffiliateReferrals } from "./affiliate-referrals"
import { AffiliateCommissions } from "./affiliate-commissions"
import { AffiliatePayouts } from "./affiliate-payouts"
import { AffiliateSettings } from "./affiliate-settings"
import type { AffiliateUser, AffiliateProgram, AffiliateReferral, AffiliateCommission } from "@/types/affiliate"
import { fetchAffiliateDashboard } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface AffiliateDashboardProps {
  userId: string
}

export function AffiliateDashboard({ userId }: AffiliateDashboardProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
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
  } | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchAffiliateDashboard()
        setDashboardData(data)
      } catch (error) {
        console.error("Error loading affiliate dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load affiliate dashboard. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { user, program, referrals, commissions, stats } = dashboardData

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user.unpaidCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available for payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Users referred</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{program.commissionRate * 100}%</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <AffiliateSummary
            user={user}
            program={program}
            referrals={referrals}
            commissions={commissions}
            stats={stats}
          />
        </TabsContent>
        <TabsContent value="referrals">
          <AffiliateReferrals initialReferrals={referrals} />
        </TabsContent>
        <TabsContent value="commissions">
          <AffiliateCommissions initialCommissions={commissions} />
        </TabsContent>
        <TabsContent value="payouts">
          <AffiliatePayouts user={user} program={program} />
        </TabsContent>
        <TabsContent value="settings">
          <AffiliateSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

