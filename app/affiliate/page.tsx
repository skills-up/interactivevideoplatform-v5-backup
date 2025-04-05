import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AffiliateDashboard } from "@/components/affiliate/affiliate-dashboard"
import { AffiliateJoin } from "@/components/affiliate/affiliate-join"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
import AffiliateProgram from "@/models/AffiliateProgram"

export const metadata: Metadata = {
  title: "Affiliate Program | Interactive Video Platform",
  description: "Join our affiliate program and earn commissions by referring new users",
}

export default async function AffiliatePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/affiliate")
  }

  await dbConnect()

  // Check if user is already an affiliate
  const affiliateUser = await AffiliateUser.findOne({ userId: session.user.id })

  // Get program details
  const program = await AffiliateProgram.findOne({ status: "active" })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Affiliate Program</h1>

      {affiliateUser ? <AffiliateDashboard userId={session.user.id} /> : <AffiliateJoin program={program} />}
    </div>
  )
}

