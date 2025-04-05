import { type NextRequest, NextResponse } from "next/server"
import { parse } from "json2csv"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format. Expected JSON array." }, { status: 400 })
    }

    // Convert JSON to CSV
    const csv = parse(data)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
      },
    })
  } catch (error) {
    console.error("Error converting JSON to CSV:", error)
    return NextResponse.json({ error: "Failed to convert JSON to CSV" }, { status: 500 })
  }
}

