import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import dbConnect from "@/lib/dbConnect"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { videoId } = params

    const { db } = await dbConnect()

    // Get the video
    const video = await db.collection("videos").findOne({
      _id: new ObjectId(videoId),
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if the user is the creator
    if (video.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all interactions for the video
    const interactions = await db.collection("interactions").find({ videoId }).toArray()

    // Get all interaction responses
    const responses = await db.collection("interactionResponses").find({ videoId }).toArray()

    // Group interactions by type
    const interactionsByType = interactions.reduce((acc: Record<string, any[]>, interaction) => {
      if (!acc[interaction.type]) {
        acc[interaction.type] = []
      }

      acc[interaction.type].push(interaction)
      return acc
    }, {})

    // Calculate metrics for each interaction
    const interactionMetrics = interactions.map((interaction) => {
      const interactionResponses = responses.filter((response) => response.interactionId === interaction._id.toString())

      const totalResponses = interactionResponses.length

      let correctResponses = 0
      let incorrectResponses = 0

      if (interaction.type === "quiz") {
        correctResponses = interactionResponses.filter((response) => response.isCorrect).length

        incorrectResponses = totalResponses - correctResponses
      }

      // Calculate response distribution for polls
      let responseDistribution: Record<string, number> = {}

      if (interaction.type === "poll" && interaction.options) {
        responseDistribution = interaction.options.reduce((acc: Record<string, number>, option: any, index: number) => {
          acc[option.text] = interactionResponses.filter((response) => response.optionIndex === index).length

          return acc
        }, {})
      }

      return {
        id: interaction._id.toString(),
        type: interaction.type,
        title: interaction.title,
        timestamp: interaction.timestamp,
        totalResponses,
        correctResponses,
        incorrectResponses,
        responseRate: totalResponses / video.views || 0,
        responseDistribution,
      }
    })

    // Calculate overall metrics
    const totalInteractions = interactions.length
    const totalResponses = responses.length
    const averageResponseRate = totalResponses / (totalInteractions * video.views) || 0

    // Calculate metrics by interaction type
    const metricsByType = Object.entries(interactionsByType).reduce(
      (acc: Record<string, any>, [type, typeInteractions]) => {
        const typeResponses = responses.filter((response) =>
          typeInteractions.some((interaction) => interaction._id.toString() === response.interactionId),
        )

        acc[type] = {
          count: typeInteractions.length,
          responses: typeResponses.length,
          responseRate: typeResponses.length / (typeInteractions.length * video.views) || 0,
        }

        return acc
      },
      {},
    )

    return NextResponse.json({
      totalInteractions,
      totalResponses,
      averageResponseRate,
      metricsByType,
      interactionMetrics,
    })
  } catch (error) {
    console.error("Error fetching interaction analytics:", error)
    return NextResponse.json({ error: "Failed to fetch interaction analytics" }, { status: 500 })
  }
}

