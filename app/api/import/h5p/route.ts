import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import JSZip from "jszip"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const videoId = formData.get("videoId") as string

    if (!file || !videoId) {
      return NextResponse.json({ error: "Missing file or videoId" }, { status: 400 })
    }

    // Read the zip file
    const fileBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(fileBuffer)

    // Extract content.json
    let elements = []

    if (zip.files["content/content.json"]) {
      const contentJson = await zip.files["content/content.json"].async("string")
      const content = JSON.parse(contentJson)

      // Extract interactions from H5P content
      if (content.interactiveVideo?.assets?.interactions) {
        elements = content.interactiveVideo.assets.interactions.map((interaction: any) => {
          // Base element properties
          const element: any = {
            id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: interaction.label || "Imported Interaction",
            timestamp: interaction.duration?.from || 0,
            duration: (interaction.duration?.to || 10) - (interaction.duration?.from || 0),
            position: {
              x: Math.round(interaction.x * 100),
              y: Math.round(interaction.y * 100),
            },
            pauseVideo: interaction.pause || false,
          }

          // Determine type and extract specific properties based on library
          if (interaction.action?.library) {
            if (interaction.action.library.startsWith("H5P.MultiChoice")) {
              element.type = "quiz"
              element.description = interaction.action.params.question || ""
              element.options = interaction.action.params.answers.map((answer: any) => ({
                text: answer.text,
                isCorrect: answer.correct || false,
              }))

              // Extract feedback if available
              if (interaction.action.params.answers.some((a: any) => a.tipsAndFeedback?.chosenFeedback)) {
                element.feedback = {
                  correct:
                    interaction.action.params.answers.find((a: any) => a.correct)?.tipsAndFeedback?.chosenFeedback ||
                    "",
                  incorrect:
                    interaction.action.params.answers.find((a: any) => !a.correct)?.tipsAndFeedback?.chosenFeedback ||
                    "",
                }
              }
            } else if (interaction.action.library.startsWith("H5P.SingleChoiceSet")) {
              element.type = "poll"
              element.options = interaction.action.params.choices.map((choice: any) => ({
                text: choice.answers[0].text,
              }))
            } else if (interaction.action.library.startsWith("H5P.ImageHotspot")) {
              element.type = "hotspot"
              element.description = interaction.action.params.hotspots?.[0]?.content || ""
            } else {
              // Default to generic interaction
              element.type = "info"
              element.description = interaction.action.params.text || ""
            }
          } else {
            // Default type if library not specified
            element.type = "info"
          }

          return element
        })
      }
    }

    // Add videoId to each element
    elements = elements.map((element) => ({
      ...element,
      videoId,
    }))

    return NextResponse.json({ elements })
  } catch (error) {
    console.error("Error importing H5P package:", error)
    return NextResponse.json({ error: "Failed to import H5P package" }, { status: 500 })
  }
}

