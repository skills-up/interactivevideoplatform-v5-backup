import { type NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

export async function POST(req: NextRequest) {
  try {
    const csvData = await req.text()

    if (!csvData) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 })
    }

    // Convert CSV to JSON
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error converting CSV to JSON:", error)
    return NextResponse.json({ error: "Failed to convert CSV to JSON" }, { status: 500 })
  }
}

