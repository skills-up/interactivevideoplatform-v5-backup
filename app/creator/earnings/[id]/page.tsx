import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EarningsDetail } from "@/components/creator/earnings/earnings-detail"
import dbConnect from "@/lib/dbConnect"
import EarningsPeriod from "@/models/EarningsPeriod"
import { getEarningsBreakdown } from "@/lib/earnings-calculator"

interface EarningsDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EarningsDetailPageProps): Promise<Metadata> {
  return {
    title: "Earnings Detail | Interactive Video Platform",
    description: "View detailed breakdown of your earnings for this period.",
  }
}

export default async function EarningsDetailPage(props: EarningsDetailPageProps) {
  const params = await props.params;
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/creator/earnings/" + params.id)
  }

  await dbConnect()

  // Get earnings period
  const period = await EarningsPeriod.findOne({
    _id: params.id,
    userId: session.user.id,
  })

  if (!period) {
    redirect("/creator/earnings")
  }

  // Get earnings breakdown
  const breakdown = await getEarningsBreakdown(period)

  return (
    <div className="container py-10">
      <EarningsDetail period={JSON.parse(JSON.stringify(period))} breakdown={JSON.parse(JSON.stringify(breakdown))} />
    </div>
  )
}

