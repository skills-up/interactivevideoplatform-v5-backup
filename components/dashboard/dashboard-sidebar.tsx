"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Film, Grid, ListVideo, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      icon: Grid,
      label: "Dashboard",
      exact: true,
    },
    {
      href: "/dashboard/videos",
      icon: ListVideo,
      label: "Videos",
    },
    {
      href: "/dashboard/series",
      icon: Film,
      label: "Series",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    {
      href: "/dashboard/audience",
      icon: Users,
      label: "Audience",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  return (
    <aside className="w-full md:w-64">
      <nav className="grid gap-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                isActive ? "bg-muted text-primary" : "hover:bg-muted",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

