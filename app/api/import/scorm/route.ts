import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import JSZip from "jszip"
import { parseStringPromise } from "xml2js"

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

    // Extract metadata.json if it exists
    let elements = []

    if (zip.files["metadata.json"]) {
      const metadataJson = await zip.files["metadata.json"].async("string")
      const metadata = JSON.parse(metadataJson)

      if (metadata.elements && Array.isArray(metadata.elements)) {
        elements = metadata.elements
      }
    } else {
      // Try to parse imsmanifest.xml
      if (zip.files["imsmanifest.xml"]) {
        const manifestXml = await zip.files["imsmanifest.xml"].async("string")
        const manifest = await parseStringPromise(manifestXml)

        // Extract information from manifest
        // This is a simplified example - real implementation would be more complex
        const title = manifest?.manifest?.organizations?.[0]?.organization?.[0]?.title?.[0] || "Imported SCORM"

        // Create a placeholder element
        elements = [
          {
            id: `imported-${Date.now()}`,
            type: "quiz",
            title: "Imported SCORM Quiz",
            description: "This quiz was imported from a SCORM package",
            timestamp: 5,
            duration: 30,
            options: [
              {
                text: "Option 1",
                isCorrect: true,
              },
              {
                text: "Option 2",
                isCorrect: false,
              },
            ],
          },
        ]
      }
    }

    // Add videoId to each element
    elements = elements.map((element) => ({
      ...element,
      videoId,
    }))

    return NextResponse.json({ elements })
  } catch (error) {
    console.error("Error importing SCORM package:", error)
    return NextResponse.json({ error: "Failed to import SCORM package" }, { status: 500 })
  }
}

