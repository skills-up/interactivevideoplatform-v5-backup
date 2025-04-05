import { type NextRequest, NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"

export async function POST(req: NextRequest) {
  try {
    const xmlData = await req.text()

    if (!xmlData) {
      return NextResponse.json({ error: "No XML data provided" }, { status: 400 })
    }

    // Parse XML to JSON
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
    })

    const result = parser.parse(xmlData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error converting XML to JSON:", error)
    return NextResponse.json({ error: "Failed to convert XML to JSON" }, { status: 500 })
  }
}

