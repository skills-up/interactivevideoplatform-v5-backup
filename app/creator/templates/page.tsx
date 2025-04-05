import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TemplateManager } from "@/components/creator/templates/template-manager"
import dbConnect from "@/lib/dbConnect"
import InteractionTemplate from "@/models/InteractionTemplate"

export const metadata: Metadata = {
  title: "Interaction Templates | Interactive Video Platform",
  description: "Manage your interaction templates for interactive videos.",
}

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/creator/templates")
  }

  await dbConnect()

  // Get templates created by the user or global templates
  const templates = await InteractionTemplate.find({
    $or: [{ userId: session.user.id }, { isGlobal: true }],
  })

  return (
    <div className="container py-10">
      <TemplateManager
        initialTemplates={JSON.parse(JSON.stringify(templates))}
        isAdmin={session.user.role === "admin"}
      />
    </div>
  )
}

