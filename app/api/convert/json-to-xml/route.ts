import { type NextRequest, NextResponse } from "next/server"
import { create } from "xmlbuilder2"

export async function POST(req: NextRequest) {
  try {
    const { data, rootElement = "root" } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 })
    }

    // Create XML document
    const doc = create({ version: "1.0", encoding: "UTF-8" })
    const root = doc.ele(rootElement)

    // Helper function to convert JSON to XML elements
    const jsonToXml = (parent: any, data: any) => {
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const element = parent.ele("item")
          element.att("index", index.toString())

          if (typeof item === "object" && item !== null) {
            Object.entries(item).forEach(([key, value]) => {
              if (typeof value === "object" && value !== null) {
                jsonToXml(element.ele(key), value)
              } else {
                element.ele(key).txt(value?.toString() || "")
              }
            })
          } else {
            element.txt(item?.toString() || "")
          }
        })
      } else if (typeof data === "object" && data !== null) {
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            jsonToXml(parent.ele(key), value)
          } else {
            parent.ele(key).txt(value?.toString() || "")
          }
        })
      } else {
        parent.txt(data?.toString() || "")
      }
    }

    // Convert JSON to XML
    jsonToXml(root, data)

    // Convert to string
    const xml = doc.end({ prettyPrint: true })

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    })
  } catch (error) {
    console.error("Error converting JSON to XML:", error)
    return NextResponse.json({ error: "Failed to convert JSON to XML" }, { status: 500 })
  }
}

