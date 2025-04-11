import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Interaction from "@/models/Interaction"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const query: any = { video: params.id }

    if (userId) {
      query.user = userId
    }

    const interactions = await Interaction.find(query).sort({ timestamp: 1 })

    // Group interactions by type
    const groupedInteractions = interactions.reduce(
      (acc, interaction) => {
        const type = interaction.type
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(interaction)
        return acc
      },
      {} as Record<string, any[]>,
    )

    return NextResponse.json(groupedInteractions)
  } catch (error) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 })
  }
}

