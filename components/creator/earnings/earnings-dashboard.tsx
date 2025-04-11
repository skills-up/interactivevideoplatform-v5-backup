"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EarningsSummary } from "./earnings-summary"
import { EarningsHistory } from "./earnings-history"
import { PayoutAccounts } from "./payout-accounts"
import { PayoutHistory } from "./payout-history"
// import { PayoutSettings } from "./payout-settings"
import type {
  PayoutAccount,
  PayoutTransaction,
  EarningsPeriod,
  PayoutSettings as PayoutSettingsType,
} from "@/types/payout"

interface EarningsDashboardProps {
  accounts: PayoutAccount[]
  periods: EarningsPeriod[]
  transactions: PayoutTransaction[]
  settings: PayoutSettingsType
  availableBalance: number
}

export function EarningsDashboard({
  accounts: initialAccounts,
  periods: initialPeriods,
  transactions: initialTransactions,
  settings: initialSettings,
  availableBalance,
}: EarningsDashboardProps) {
  const [accounts, setAccounts] = useState<PayoutAccount[]>(initialAccounts)
  const [periods, setPeriods] = useState<EarningsPeriod[]>(initialPeriods)
  const [transactions, setTransactions] = useState<PayoutTransaction[]>(initialTransactions)
  const [settings, setSettings] = useState<PayoutSettingsType>(initialSettings)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Creator Earnings</h1>
        <p className="text-muted-foreground">View and manage your earnings as a content creator</p>
      </div>

      <EarningsSummary periods={periods} availableBalance={availableBalance} />

      <Tabs defaultValue="earnings">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-6">
          <EarningsHistory periods={periods} onPeriodsChange={setPeriods} />
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <PayoutHistory
            transactions={transactions}
            accounts={accounts}
            availableBalance={availableBalance}
            onTransactionsChange={setTransactions}
          />
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <PayoutAccounts accounts={accounts} onAccountsChange={setAccounts} />
        </TabsContent>

        {/* <TabsContent value="settings" className="mt-6">
          <PayoutSettings settings={settings} onSettingsChange={setSettings} />
        </TabsContent> */}
      </Tabs>
    </div>
  )
}

