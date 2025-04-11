import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { siteConfig } from "@/config/site"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex w-full flex-col overflow-hidden">{children}</main>
    </div>
  )
}

