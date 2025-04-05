import { type NextRequest, NextResponse } from "next/server"
import { getAdPerformance } from "@/lib/ad-engine"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface Params {
  adId: string
}

export async function GET(req: NextRequest, props: { params: Promise<Params> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const performance = await getAdPerformance(params.adId)

    return NextResponse.json({ performance })
  } catch (error) {
    console.error("Error fetching ad performance:", error)
    return NextResponse.json({ error: "Failed to fetch ad performance" }, { status: 500 })
  }
}

