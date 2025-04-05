import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EarningsDashboard } from "@/components/creator/earnings/earnings-dashboard"
import dbConnect from "@/lib/dbConnect"
import PayoutAccount from "@/models/PayoutAccount"
import EarningsPeriod from "@/models/EarningsPeriod"
import PayoutTransaction from "@/models/PayoutTransaction"
import PayoutSettings from "@/models/PayoutSettings"
import { getAvailableBalance } from "@/lib/earnings-calculator"

export const metadata: Metadata = {
  title: "Creator Earnings | Interactive Video Platform",
  description: "View and manage your earnings as a content creator.",
}

export default async function EarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/creator/earnings")
  }

  await dbConnect()

  // Get payout accounts
  const accounts = await PayoutAccount.find({ userId: session.user.id })

  // Get earnings periods
  const periods = await EarningsPeriod.find({ userId: session.user.id }).sort({ startDate: -1 }).limit(10)

  // Get payout transactions
  const transactions = await PayoutTransaction.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(10)

  // Get payout settings
  let settings = await PayoutSettings.findOne({ userId: session.user.id })

  if (!settings) {
    settings = new PayoutSettings({
      userId: session.user.id,
      minimumPayout: 50,
      payoutFrequency: "monthly",
      automaticPayouts: true,
      payoutDay: 1,
    })

    await settings.save()
  }

  // Get available balance
  const availableBalance = await getAvailableBalance(session.user.id)

  return (
    <div className="container py-10">
      <EarningsDashboard
        accounts={JSON.parse(JSON.stringify(accounts))}
        periods={JSON.parse(JSON.stringify(periods))}
        transactions={JSON.parse(JSON.stringify(transactions))}
        settings={JSON.parse(JSON.stringify(settings))}
        availableBalance={availableBalance}
      />
    </div>
  )
}

