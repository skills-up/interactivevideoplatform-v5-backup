import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { generateUserDataExport } from "@/lib/security-utils"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Generate the data export
    const dataExport = await generateUserDataExport(session.user.id)

    // Set headers for file download
    const headers = new Headers()
    headers.set("Content-Type", "application/json")
    headers.set("Content-Disposition", `attachment; filename="data-export-${session.user.id}.json"`)

    // Return the data as a downloadable file
    return new NextResponse(JSON.stringify(dataExport, null, 2), {
      headers,
    })
  } catch (error) {
    console.error("Error generating data export:", error)
    return NextResponse.json({ error: "Failed to generate data export" }, { status: 500 })
  }
}

