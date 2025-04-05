import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Video from "@/models/Video"
import { OpenAI } from "openai"
import { z } from "zod"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Schema for generate interactions request
const generateInteractionsSchema = z.object({
  videoId: z.string(),
  prompt: z.string(),
  transcript: z.string().optional(),
  type: z.enum(["auto", "quiz", "poll", "hotspot", "branching"]).default("auto"),
  count: z.number().min(1).max(10).default(3),
  density: z.number().min(10).max(100).default(50),
  settings: z
    .object({
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      style: z.enum(["educational", "entertaining", "professional", "casual"]).default("educational"),
      language: z.string().default("english"),
      audience: z.string().default("general"),
    })
    .optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = generateInteractionsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 })
    }

    const data = validation.data

    await dbConnect()

    // Get video data
    const video = await Video.findOne({
      _id: data.videoId,
      userId: session.user.id,
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 })
    }

    // Prepare video metadata for AI
    const videoMetadata = {
      title: video.title,
      description: video.description,
      duration: video.duration,
      tags: video.tags,
    }

    // Generate interactions using AI
    const interactions = await generateInteractionsWithAI(
      data.prompt,
      data.transcript || "",
      videoMetadata,
      data.type,
      data.count,
      data.density,
      data.settings,
    )

    return NextResponse.json({ interactions })
  } catch (error) {
    console.error("Error generating interactions:", error)
    return NextResponse.json({ error: "Failed to generate interactions" }, { status: 500 })
  }
}

async function generateInteractionsWithAI(
  prompt: string,
  transcript: string,
  videoMetadata: any,
  type: string,
  count: number,
  density: number,
  settings: any,
) {
  // Prepare the system message
  const systemMessage = `You are an expert in creating interactive video elements. Your task is to generate ${count} interactive elements for a video based on the provided information. 
  
Video details:
- Title: ${videoMetadata.title}
- Description: ${videoMetadata.description || "Not provided"}
- Duration: ${videoMetadata.duration || "Unknown"} seconds
- Tags: ${videoMetadata.tags?.join(", ") || "None"}

Settings:
- Interaction type: ${type === "auto" ? "Mixed (choose appropriate types)" : type}
- Difficulty level: ${settings?.difficulty || "medium"}
- Style: ${settings?.style || "educational"}
- Target audience: ${settings?.audience || "general"}
- Language: ${settings?.language || "english"}

The interactive elements should be spaced according to a density of ${density}% (higher means more clustered, lower means more spread out).

For each interaction, provide:
1. type (quiz, poll, hotspot, branching)
2. title
3. startTime (in seconds)
4. endTime (in seconds, optional)
5. Content specific to the type:
   - For quiz: question and options array with isCorrect property
   - For poll: question and options array
   - For hotspot: hotspots array with positions
   - For branching: question and options array with nextAction

Return the interactions as a valid JSON array that can be parsed directly.`

  // Prepare user message
  let userMessage = prompt

  // Add transcript if available
  if (transcript) {
    userMessage += `\n\nVideo transcript:\n${transcript}`
  }

  // Call OpenAI API
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  })

  // Parse the response
  try {
    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("Empty response from AI")
    }

    const parsedResponse = JSON.parse(content)
    return parsedResponse.interactions || []
  } catch (error) {
    console.error("Error parsing AI response:", error)
    throw new Error("Failed to parse AI-generated interactions")
  }
}

